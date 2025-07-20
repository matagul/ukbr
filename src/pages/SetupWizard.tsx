import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Database, 
  Settings, 
  User, 
  Mail, 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { securityManager } from '../utils/security';
import { APP_CONFIG, ROUTES } from '../config/constants';
import toast from 'react-hot-toast';

interface SetupStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  completed: boolean;
}

interface AdminData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface CompanySettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
}

const SetupWizard: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [encryptionKey, setEncryptionKey] = useState<string>('');
  const [showEncryptionKey, setShowEncryptionKey] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);
  const [adminData, setAdminData] = useState<AdminData>({
    name: '',
    email: APP_CONFIG.email,
    password: '',
    confirmPassword: ''
  });
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    siteName: APP_CONFIG.name,
    siteDescription: APP_CONFIG.description,
    contactEmail: APP_CONFIG.email,
    smtpHost: APP_CONFIG.smtp.host || '',
    smtpPort: APP_CONFIG.smtp.port.toString(),
    smtpUser: '',
    smtpPass: '',
    fromEmail: APP_CONFIG.email
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps: SetupStep[] = [
    {
      id: 1,
      title: 'Veritabanı Bağlantısı',
      description: 'Supabase bağlantısını test edin',
      icon: Database,
      completed: connectionStatus === 'success'
    },
    {
      id: 2,
      title: 'Güvenlik Kurulumu',
      description: 'Şifreleme anahtarı oluşturun',
      icon: Shield,
      completed: !!encryptionKey
    },
    {
      id: 3,
      title: 'Süper Admin',
      description: 'İlk yönetici hesabını oluşturun',
      icon: User,
      completed: false
    },
    {
      id: 4,
      title: 'Şirket Ayarları',
      description: 'Site ve e-posta ayarlarını yapılandırın',
      icon: Settings,
      completed: false
    },
    {
      id: 5,
      title: 'Tamamlandı',
      description: 'Kurulum başarıyla tamamlandı',
      icon: CheckCircle,
      completed: false
    }
  ];

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    const isComplete = await supabaseService.isSetupComplete();
    if (isComplete) {
      navigate(ROUTES.HOME);
    }
  };

  const testDatabaseConnection = async () => {
    setConnectionStatus('testing');
    setErrors({});
    
    try {
      const isConnected = await supabaseService.initialize();
      if (isConnected) {
        setConnectionStatus('success');
        toast.success('Veritabanı bağlantısı başarılı!');
      } else {
        setConnectionStatus('error');
        setErrors({ connection: 'Veritabanı bağlantısı kurulamadı' });
      }
    } catch (error) {
      setConnectionStatus('error');
      setErrors({ connection: 'Bağlantı testi başarısız' });
    }
  };

  const generateEncryptionKey = async () => {
    setLoading(true);
    try {
      const key = await securityManager.generateEncryptionKey();
      setEncryptionKey(key);
      securityManager.setEncryptionKey(key);
      
      // Save to database
      await supabaseService.saveEncryptionKey(key);
      
      toast.success('Şifreleme anahtarı oluşturuldu!');
    } catch (error) {
      toast.error('Şifreleme anahtarı oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  const copyEncryptionKey = async () => {
    try {
      await navigator.clipboard.writeText(encryptionKey);
      setKeyCopied(true);
      toast.success('Anahtar kopyalandı!');
      setTimeout(() => setKeyCopied(false), 2000);
    } catch (error) {
      toast.error('Kopyalama başarısız');
    }
  };

  const validateAdminData = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!adminData.name.trim()) {
      newErrors.name = 'Ad soyad gerekli';
    }

    if (!adminData.email.trim()) {
      newErrors.email = 'E-posta gerekli';
    } else if (!/\S+@\S+\.\S+/.test(adminData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }

    const passwordValidation = securityManager.validatePasswordStrength(adminData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0];
    }

    if (adminData.password !== adminData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createSuperAdmin = async () => {
    if (!validateAdminData()) return;

    setLoading(true);
    try {
      const result = await supabaseService.registerUser({
        email: adminData.email,
        password: adminData.password,
        name: adminData.name,
        role: 'admin',
        metadata: {
          is_super_admin: true,
          created_via_setup: true
        }
      });

      if (result.success) {
        toast.success('Süper admin hesabı oluşturuldu!');
        setCurrentStep(4);
      } else {
        setErrors({ admin: result.error || 'Admin hesabı oluşturulamadı' });
      }
    } catch (error) {
      setErrors({ admin: 'Admin hesabı oluşturulamadı' });
    } finally {
      setLoading(false);
    }
  };

  const validateCompanySettings = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!companySettings.siteName.trim()) {
      newErrors.siteName = 'Site adı gerekli';
    }

    if (!companySettings.contactEmail.trim()) {
      newErrors.contactEmail = 'İletişim e-postası gerekli';
    }

    if (!companySettings.smtpHost.trim()) {
      newErrors.smtpHost = 'SMTP sunucusu gerekli';
    }

    if (!companySettings.smtpPort.trim()) {
      newErrors.smtpPort = 'SMTP portu gerekli';
    }

    if (!companySettings.smtpUser.trim()) {
      newErrors.smtpUser = 'SMTP kullanıcı adı gerekli';
    }

    if (!companySettings.smtpPass.trim()) {
      newErrors.smtpPass = 'SMTP şifresi gerekli';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveCompanySettings = async () => {
    if (!validateCompanySettings()) return;

    setLoading(true);
    try {
      const settings = {
        id: 1,
        site_name: companySettings.siteName,
        site_description: companySettings.siteDescription,
        contact_email: companySettings.contactEmail,
        smtp_host: companySettings.smtpHost,
        smtp_port: parseInt(companySettings.smtpPort),
        smtp_user: companySettings.smtpUser,
        smtp_pass: companySettings.smtpPass,
        from_email: companySettings.fromEmail,
        setup_complete: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const success = await supabaseService.updateSettings(settings);
      
      if (success) {
        toast.success('Ayarlar kaydedildi!');
        setCurrentStep(5);
        
        // Complete setup after a short delay
        setTimeout(() => {
          navigate(ROUTES.AUTH);
        }, 2000);
      } else {
        setErrors({ settings: 'Ayarlar kaydedilemedi' });
      }
    } catch (error) {
      setErrors({ settings: 'Ayarlar kaydedilemedi' });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Database className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Veritabanı Bağlantısı</h2>
              <p className="text-gray-600">Supabase veritabanı bağlantısını test edin</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Bağlantı Bilgileri</h3>
              <div className="space-y-2 text-sm">
                <div><strong>URL:</strong> {APP_CONFIG.supabase.url}</div>
                <div><strong>Durum:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    connectionStatus === 'success' ? 'bg-green-100 text-green-800' :
                    connectionStatus === 'error' ? 'bg-red-100 text-red-800' :
                    connectionStatus === 'testing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {connectionStatus === 'success' ? 'Bağlı' :
                     connectionStatus === 'error' ? 'Hata' :
                     connectionStatus === 'testing' ? 'Test ediliyor...' :
                     'Test edilmedi'}
                  </span>
                </div>
              </div>
            </div>

            {errors.connection && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{errors.connection}</span>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={testDatabaseConnection}
                disabled={connectionStatus === 'testing'}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {connectionStatus === 'testing' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Database className="w-5 h-5" />
                )}
                Bağlantıyı Test Et
              </button>
              
              {connectionStatus === 'success' && (
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700"
                >
                  Devam Et
                </button>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Shield className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Güvenlik Kurulumu</h2>
              <p className="text-gray-600">Veri şifreleme için güvenli anahtar oluşturun</p>
            </div>

            {!encryptionKey ? (
              <div className="text-center">
                <button
                  onClick={generateEncryptionKey}
                  disabled={loading}
                  className="bg-green-600 text-white py-3 px-8 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Shield className="w-5 h-5" />
                  )}
                  Şifreleme Anahtarı Oluştur
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-yellow-800">Önemli Güvenlik Uyarısı</h3>
                      <p className="text-yellow-700 text-sm mt-1">
                        Bu anahtar tüm hassas verilerin şifrelenmesi için kullanılır. 
                        Güvenli bir yerde saklayın ve kaybetmeyin!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Şifreleme Anahtarı
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type={showEncryptionKey ? 'text' : 'password'}
                        value={encryptionKey}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white font-mono text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEncryptionKey(!showEncryptionKey)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showEncryptionKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      onClick={copyEncryptionKey}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                    >
                      {keyCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {keyCopied ? 'Kopyalandı' : 'Kopyala'}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentStep(3)}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700"
                >
                  Devam Et
                </button>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Süper Admin Hesabı</h2>
              <p className="text-gray-600">Platformu yönetmek için ilk yönetici hesabını oluşturun</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); createSuperAdmin(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  value={adminData.name}
                  onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Yönetici adı ve soyadı"
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta *
                </label>
                <input
                  type="email"
                  value={adminData.email}
                  onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="admin@kiprotek.com"
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Şifre *
                </label>
                <input
                  type="password"
                  value={adminData.password}
                  onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Güçlü bir şifre oluşturun"
                />
                {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Şifre Tekrarı *
                </label>
                <input
                  type="password"
                  value={adminData.confirmPassword}
                  onChange={(e) => setAdminData({ ...adminData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Şifreyi tekrar girin"
                />
                {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

              {errors.admin && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700">{errors.admin}</span>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400"
                >
                  Geri
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                  Admin Hesabı Oluştur
                </button>
              </div>
            </form>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Settings className="w-16 h-16 text-orange-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Şirket Ayarları</h2>
              <p className="text-gray-600">Site ve e-posta ayarlarını yapılandırın</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); saveCompanySettings(); }} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Site Bilgileri</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site Adı *
                  </label>
                  <input
                    type="text"
                    value={companySettings.siteName}
                    onChange={(e) => setCompanySettings({ ...companySettings, siteName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  {errors.siteName && <p className="text-red-600 text-sm mt-1">{errors.siteName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site Açıklaması
                  </label>
                  <textarea
                    value={companySettings.siteDescription}
                    onChange={(e) => setCompanySettings({ ...companySettings, siteDescription: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İletişim E-postası *
                  </label>
                  <input
                    type="email"
                    value={companySettings.contactEmail}
                    onChange={(e) => setCompanySettings({ ...companySettings, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  {errors.contactEmail && <p className="text-red-600 text-sm mt-1">{errors.contactEmail}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">SMTP Ayarları</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Sunucusu *
                    </label>
                    <input
                      type="text"
                      value={companySettings.smtpHost}
                      onChange={(e) => setCompanySettings({ ...companySettings, smtpHost: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    {errors.smtpHost && <p className="text-red-600 text-sm mt-1">{errors.smtpHost}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Port *
                    </label>
                    <input
                      type="number"
                      value={companySettings.smtpPort}
                      onChange={(e) => setCompanySettings({ ...companySettings, smtpPort: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    {errors.smtpPort && <p className="text-red-600 text-sm mt-1">{errors.smtpPort}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Kullanıcı Adı *
                  </label>
                  <input
                    type="text"
                    value={companySettings.smtpUser}
                    onChange={(e) => setCompanySettings({ ...companySettings, smtpUser: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  {errors.smtpUser && <p className="text-red-600 text-sm mt-1">{errors.smtpUser}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Şifresi *
                  </label>
                  <input
                    type="password"
                    value={companySettings.smtpPass}
                    onChange={(e) => setCompanySettings({ ...companySettings, smtpPass: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  {errors.smtpPass && <p className="text-red-600 text-sm mt-1">{errors.smtpPass}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gönderen E-postası
                  </label>
                  <input
                    type="email"
                    value={companySettings.fromEmail}
                    onChange={(e) => setCompanySettings({ ...companySettings, fromEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              {errors.settings && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700">{errors.settings}</span>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400"
                >
                  Geri
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Settings className="w-5 h-5" />
                  )}
                  Kurulumu Tamamla
                </button>
              </div>
            </form>
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-6">
            <CheckCircle className="w-24 h-24 text-green-600 mx-auto" />
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Kurulum Tamamlandı!</h2>
              <p className="text-gray-600 text-lg">
                {APP_CONFIG.name} platformu başarıyla kuruldu ve kullanıma hazır.
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-800 mb-2">Sonraki Adımlar</h3>
              <ul className="text-green-700 text-sm space-y-1 text-left">
                <li>• Giriş sayfasına yönlendiriliyorsunuz</li>
                <li>• Süper admin hesabınızla giriş yapabilirsiniz</li>
                <li>• Admin panelinden platform ayarlarını yönetebilirsiniz</li>
                <li>• Şifreleme anahtarınızı güvenli bir yerde saklayın</li>
              </ul>
            </div>

            <div className="text-sm text-gray-500">
              Giriş sayfasına otomatik olarak yönlendirileceksiniz...
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center gap-4">
            <Shield className="w-10 h-10" />
            <div>
              <h1 className="text-2xl font-bold">{APP_CONFIG.name} Kurulum Sihirbazı</h1>
              <p className="text-blue-100">Platformunuzu güvenli şekilde yapılandırın</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = step.completed || currentStep > step.id;
              
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      isCompleted ? 'bg-green-500 border-green-500 text-white' :
                      isActive ? 'bg-blue-500 border-blue-500 text-white' :
                      'bg-gray-200 border-gray-300 text-gray-500'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <div className={`text-xs font-medium ${
                        isActive ? 'text-blue-600' : 
                        isCompleted ? 'text-green-600' : 
                        'text-gray-500'
                      }`}>
                        {step.title}
                      </div>
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;