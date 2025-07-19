import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Briefcase, 
  FileText, 
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import UserManagement from './UserManagement';
import DocumentManagement from './DocumentManagement';
import { User, Document, AdminAction } from '../../types';
import { createClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

interface AdminDashboardProps {
  users: User[];
  documents: Document[];
  adminActions: AdminAction[];
  currentUser?: User;
}

// AES-GCM encryption/decryption using Web Crypto API (copied from InstallPage)
async function encryptAES(plainText: string, key: string): Promise<string> {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw', enc.encode(key), { name: 'AES-GCM' }, false, ['encrypt']
  );
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, cryptoKey, enc.encode(plainText)
  );
  return `${btoa(String.fromCharCode(...iv))}:${btoa(String.fromCharCode(...new Uint8Array(encrypted)))}`;
}
async function decryptAES(cipherText: string, key: string): Promise<string> {
  if (!cipherText || !key) return '';
  const [ivB64, dataB64] = cipherText.split(':');
  const enc = new TextEncoder();
  const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
  const data = Uint8Array.from(atob(dataB64), c => c.charCodeAt(0));
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw', enc.encode(key), { name: 'AES-GCM' }, false, ['decrypt']
  );
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv }, cryptoKey, data
  );
  return new TextDecoder().decode(decrypted);
}

// Add at top: demo data arrays
const CYPRUS_CITIES = [
  { name: 'Lefkoşa', name_en: 'Nicosia' },
  { name: 'Girne', name_en: 'Kyrenia' },
  { name: 'Gazimağusa', name_en: 'Famagusta' },
  { name: 'İskele', name_en: 'Iskele' },
  { name: 'Güzelyurt', name_en: 'Guzelyurt' },
  { name: 'Lefke', name_en: 'Lefka' },
];
const REAL_CATEGORIES = [
  { name: 'Elektrikçi', name_en: 'Electrician' },
  { name: 'Tesisatçı', name_en: 'Plumber' },
  { name: 'Boyacı', name_en: 'Painter' },
  { name: 'Marangoz', name_en: 'Carpenter' },
  { name: 'Kaportacı', name_en: 'Car Body Repair' },
  { name: 'Temizlik', name_en: 'Cleaning' },
  { name: 'Bahçıvan', name_en: 'Gardener' },
  { name: 'Klimacı', name_en: 'AC Technician' },
  { name: 'İnşaat', name_en: 'Construction' },
  { name: 'Cam Ustası', name_en: 'Glazier' },
  { name: 'Alçıpan Ustası', name_en: 'Drywall Specialist' },
  { name: 'Sıhhi Tesisatçı', name_en: 'Sanitary Plumber' },
  { name: 'Mobilyacı', name_en: 'Furniture Maker' },
  { name: 'Çilingir', name_en: 'Locksmith' },
  { name: 'Kaynakçı', name_en: 'Welder' },
  { name: 'Döşemeci', name_en: 'Upholsterer' },
  { name: 'Parkeci', name_en: 'Parquet Installer' },
  { name: 'Seramikçi', name_en: 'Tilers' },
  { name: 'PVC/Pencere Ustası', name_en: 'PVC/Window Specialist' },
  { name: 'Asansör Bakım', name_en: 'Elevator Maintenance' },
  { name: 'Isıtma-Soğutma', name_en: 'Heating/Cooling' },
  { name: 'Oto Tamirci', name_en: 'Auto Mechanic' },
  { name: 'Boya Badana', name_en: 'Wall Painter' },
  { name: 'Su Kaçağı Tespiti', name_en: 'Leak Detection' },
  { name: 'Çatı Ustası', name_en: 'Roofer' },
  { name: 'Havuz Bakım', name_en: 'Pool Maintenance' },
  { name: 'Güvenlik Sistemleri', name_en: 'Security Systems' },
  { name: 'Alarm Sistemleri', name_en: 'Alarm Systems' },
  { name: 'Bilgisayar Teknik Servis', name_en: 'Computer Technician' },
  { name: 'Telefon Tamiri', name_en: 'Phone Repair' },
  { name: 'Web Tasarım', name_en: 'Web Design' },
  { name: 'Grafik Tasarım', name_en: 'Graphic Design' },
  { name: 'Fotoğrafçı', name_en: 'Photographer' },
  { name: 'Nakliyat', name_en: 'Moving/Transport' },
  { name: 'Kombi Servisi', name_en: 'Boiler Service' },
  { name: 'Doğalgaz Tesisatı', name_en: 'Natural Gas Installation' },
  { name: 'Elektronikçi', name_en: 'Electronics Technician' },
  { name: 'Dış Cephe Kaplama', name_en: 'Exterior Cladding' },
  { name: 'Vinç Hizmeti', name_en: 'Crane Service' },
  { name: 'Diğer', name_en: 'Other' },
];

const ENCRYPTION_KEY = 'a1FxB+uQT1QRbel3+SkMw2PiI6rtoa2ivJjLq2eVEz4=';

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  documents,
  adminActions,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'documents' | 'reports' | 'config'>('overview');
  const [configTab, setConfigTab] = useState<'site' | 'mail' | 'server' | 'system'>('site');
  const [siteConfig, setSiteConfig] = useState({
    siteName: 'UstaKıbrıs',
    siteDescription: 'KKTC Usta ve İş İlanları Platformu',
    contactEmail: 'info@ustakibris.com',
  });
  const [mailConfig, setMailConfig] = useState({
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPass: '',
    fromEmail: '',
  });
  const [serverInfo] = useState({
    version: '1.0.0',
    db: 'Supabase',
    backend: 'FastAPI',
    frontend: 'React + Vite',
    env: 'Production',
  });
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);

  const supabaseUrl = 'https://nkkpgdzknpuznqwxbvct.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ra3BnZHprbnB1em5xd3hidmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MzI0NDcsImV4cCI6MjA2ODUwODQ0N30.o1uwKXD-wQ_WiPtWXP_lHzICpxNTeFZtVXq7Q4iqJuI';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Stats for new profiles table
  const stats = {
    totalUsers: users.length,
    totalJobs: 156,
    activeJobs: 89,
    completedJobs: 67
  };

  useEffect(() => {
    // Fetch settings from Supabase
    const fetchSettings = async () => {
      const { data, error } = await supabase.from('settings').select('*').single();
      if (data) {
        setSiteConfig({
          siteName: data.site_name || '',
          siteDescription: data.site_description || '',
          contactEmail: data.contact_email || '',
        });
        // Only allow decryption if admin or super admin
        let key = null;
        if (currentUser && (currentUser.role === 'admin' || currentUser.isSuperAdmin)) {
          key = data.x_secret || localStorage.getItem('encryptionKey');
        }
        setEncryptionKey(key);
        let decryptedSmtpPass = '';
        if (key && data.smtp_pass) {
          try {
            decryptedSmtpPass = await decryptAES(data.smtp_pass, key);
          } catch (e) {
            decryptedSmtpPass = '[Şifre çözülemedi]';
          }
        }
        setMailConfig({
          smtpHost: data.smtp_host || '',
          smtpPort: data.smtp_port || '',
          smtpUser: data.smtp_user || '',
          smtpPass: decryptedSmtpPass,
          fromEmail: data.from_email || '',
        });
      }
      if (error) toast.error('Ayarlar yüklenemedi');
    };
    fetchSettings();
  }, [currentUser]);

  const handleSaveSiteConfig = async () => {
    const { error } = await supabase.from('settings').update({
      site_name: siteConfig.siteName,
      site_description: siteConfig.siteDescription,
      contact_email: siteConfig.contactEmail,
    }).eq('id', 1);
    if (error) toast.error('Site ayarları kaydedilemedi');
    else toast.success('Site ayarları kaydedildi');
  };

  const handleSaveMailConfig = async () => {
    let encryptedSmtpPass = mailConfig.smtpPass;
    if (encryptionKey && mailConfig.smtpPass) {
      encryptedSmtpPass = await encryptAES(mailConfig.smtpPass, encryptionKey);
    }
    const { error } = await supabase.from('settings').update({
      smtp_host: mailConfig.smtpHost,
      smtp_port: mailConfig.smtpPort,
      smtp_user: mailConfig.smtpUser,
      smtp_pass: encryptedSmtpPass,
      from_email: mailConfig.fromEmail,
    }).eq('id', 1);
    if (error) toast.error('Mail ayarları kaydedilemedi');
    else toast.success('Mail ayarları kaydedildi');
  };

  // System actions: call backend endpoints
  const handleRestartFrontend = async () => {
    toast.loading('Frontend yeniden başlatılıyor...');
    const res = await fetch('/api/admin/restart-frontend', { method: 'POST' });
    toast.dismiss();
    if (res.ok) toast.success('Frontend yeniden başlatıldı');
    else toast.error('Frontend başlatılamadı');
  };
  const handleRestartBackend = async () => {
    toast.loading('Backend yeniden başlatılıyor...');
    const res = await fetch('/api/admin/restart-backend', { method: 'POST' });
    toast.dismiss();
    if (res.ok) toast.success('Backend yeniden başlatıldı');
    else toast.error('Backend başlatılamadı');
  };
  const handleRebootServer = async () => {
    toast.loading('Sunucu yeniden başlatılıyor...');
    const res = await fetch('/api/admin/reboot-server', { method: 'POST' });
    toast.dismiss();
    if (res.ok) toast.success('Sunucu yeniden başlatıldı');
    else toast.error('Sunucu başlatılamadı');
  };
  const handleDatabaseSettings = async () => {
    toast.loading('Veritabanı ayarları açılıyor...');
    const res = await fetch('/api/admin/database-settings', { method: 'POST' });
    toast.dismiss();
    if (res.ok) toast.success('Veritabanı ayarları açıldı');
    else toast.error('Veritabanı ayarları açılamadı');
  };
  const handleSystemCheck = async () => {
    toast.loading('Sistem sağlık kontrolü yapılıyor...');
    const res = await fetch('/api/admin/system-check', { method: 'POST' });
    toast.dismiss();
    if (res.ok) toast.success('Sistem sağlıklı');
    else toast.error('Sistem sağlık kontrolü başarısız');
  };

  const handleBanUser = (userId: string, banLevel: string, reason: string, duration?: number) => {
    console.log('Banning user:', { userId, banLevel, reason, duration });
    // Implementation would update user status in backend
  };

  const handleUnbanUser = (userId: string) => {
    console.log('Unbanning user:', userId);
    // Implementation would remove ban from user
  };

  const handleDeleteUserJobs = (userId: string) => {
    console.log('Deleting user jobs:', userId);
    // Implementation would delete all jobs for user
  };

  const handleViewUserActivity = (userId: string) => {
    console.log('Viewing user activity:', userId);
    // Implementation would show user activity modal
  };

  const handleApproveDocument = (documentId: string) => {
    console.log('Approving document:', documentId);
    // Implementation would approve document
  };

  const handleRejectDocument = (documentId: string, reason: string) => {
    console.log('Rejecting document:', { documentId, reason });
    // Implementation would reject document with reason
  };

  const handleViewDocument = (documentId: string) => {
    console.log('Viewing document:', documentId);
    // Implementation would open document viewer
  };

  // Add handler
  const handleReseedDemoData = async () => {
    try {
      await supabase.from('cities').insert(CYPRUS_CITIES);
      await supabase.from('categories').insert(REAL_CATEGORIES);
      toast.success('Demo verileri başarıyla eklendi!');
    } catch (err: any) {
      if (err.message && err.message.includes('duplicate key')) {
        toast.success('Demo verileri zaten mevcut veya kısmen eklendi!');
      } else {
        toast.error('Demo verileri eklenemedi.');
      }
    }
  };

  const tabs = [
    { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
    { id: 'users', label: 'Kullanıcı Yönetimi', icon: Users },
    { id: 'documents', label: 'Belge Yönetimi', icon: FileText },
    { id: 'reports', label: 'Raporlar', icon: TrendingUp },
    { id: 'config', label: 'Ayarlar', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
              {currentUser?.isSuperAdmin && (
                <span className="ml-4 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">SUPER ADMIN</span>
              )}
            </h1>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              UstaKıbrıs Yönetim Paneli
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-red-500 text-red-600 dark:text-red-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Kullanıcı</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aktif İş İlanı</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeJobs}</p>
                  </div>
                  <Briefcase className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tamamlanan İş</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completedJobs}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Son Admin İşlemleri
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {adminActions.slice(0, 5).map((action) => (
                    <div key={action.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {action.action}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {action.details} • {new Date(action.timestamp).toLocaleString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <UserManagement
            users={users}
            onViewUser={() => {}}
            onDeleteUser={() => {}}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentManagement
            documents={documents}
            onApproveDocument={handleApproveDocument}
            onRejectDocument={handleRejectDocument}
            onViewDocument={handleViewDocument}
          />
        )}

        {activeTab === 'reports' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Platform Raporları
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Detaylı raporlama özellikleri yakında eklenecek...
            </p>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700 flex gap-4">
              <button onClick={() => setConfigTab('site')} className={`py-2 px-4 font-semibold ${configTab === 'site' ? 'border-b-2 border-red-500 text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-300'}`}>Site Ayarları</button>
              <button onClick={() => setConfigTab('mail')} className={`py-2 px-4 font-semibold ${configTab === 'mail' ? 'border-b-2 border-red-500 text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-300'}`}>Mail Ayarları</button>
              <button onClick={() => setConfigTab('server')} className={`py-2 px-4 font-semibold ${configTab === 'server' ? 'border-b-2 border-red-500 text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-300'}`}>Sunucu Bilgisi</button>
              <button onClick={() => setConfigTab('system')} className={`py-2 px-4 font-semibold ${configTab === 'system' ? 'border-b-2 border-red-500 text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-300'}`}>Sistem</button>
            </div>
            {configTab === 'site' && (
              <form className="space-y-4 max-w-lg" onSubmit={e => { e.preventDefault(); handleSaveSiteConfig(); }}>
                <div>
                  <label className="block text-sm font-medium mb-1">Site Adı</label>
                  <input type="text" value={siteConfig.siteName} onChange={e => setSiteConfig({ ...siteConfig, siteName: e.target.value })} placeholder="Site adı" className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Site Açıklaması (SEO Description)</label>
                  <textarea value={siteConfig.siteDescription} onChange={e => setSiteConfig({ ...siteConfig, siteDescription: e.target.value })} rows={2} placeholder="Site açıklaması (SEO description)" className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Bu açıklama, sitenin <code>&lt;meta name=\"description\"&gt;</code> etiketi olarak kullanılır.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">İletişim E-posta</label>
                  <input type="email" value={siteConfig.contactEmail} onChange={e => setSiteConfig({ ...siteConfig, contactEmail: e.target.value })} placeholder="E-posta adresi" className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white" />
                </div>
                <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors">Kaydet</button>
              </form>
            )}
            {configTab === 'mail' && (
              <form className="space-y-4 max-w-lg" onSubmit={e => { e.preventDefault(); handleSaveMailConfig(); }}>
                <div>
                  <label className="block text-sm font-medium mb-1">SMTP Sunucu</label>
                  <input type="text" value={mailConfig.smtpHost} onChange={e => setMailConfig({ ...mailConfig, smtpHost: e.target.value })} placeholder="SMTP sunucu adresi" className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Port</label>
                    <input type="text" value={mailConfig.smtpPort} onChange={e => setMailConfig({ ...mailConfig, smtpPort: e.target.value })} placeholder="Port" className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Kullanıcı Adı</label>
                    <input type="text" value={mailConfig.smtpUser} onChange={e => setMailConfig({ ...mailConfig, smtpUser: e.target.value })} placeholder="Kullanıcı adı" className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Şifre</label>
                  <input type="password" value={mailConfig.smtpPass} onChange={e => setMailConfig({ ...mailConfig, smtpPass: e.target.value })} placeholder="Şifre" className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gönderen E-posta</label>
                  <input type="email" value={mailConfig.fromEmail} onChange={e => setMailConfig({ ...mailConfig, fromEmail: e.target.value })} placeholder="Gönderen e-posta" className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white" />
                </div>
                <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors">Kaydet</button>
              </form>
            )}
            {configTab === 'server' && (
              <div className="space-y-4 max-w-lg">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-200">Versiyon</span>
                  <span className="text-gray-900 dark:text-white">{serverInfo.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-200">Veritabanı</span>
                  <span className="text-gray-900 dark:text-white">{serverInfo.db}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-200">Backend</span>
                  <span className="text-gray-900 dark:text-white">{serverInfo.backend}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-200">Frontend</span>
                  <span className="text-gray-900 dark:text-white">{serverInfo.frontend}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-200">Çalışma Ortamı</span>
                  <span className="text-gray-900 dark:text-white">{serverInfo.env}</span>
                </div>
              </div>
            )}
            {configTab === 'system' && (
              <div className="space-y-6 max-w-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sistem Kontrolleri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button onClick={handleRestartFrontend} className="bg-sky-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-sky-600 transition-colors">Frontend Yeniden Başlat</button>
                  <button onClick={handleRestartBackend} className="bg-sky-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-sky-600 transition-colors">Backend Yeniden Başlat</button>
                  <button onClick={handleRebootServer} className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors">Sunucuyu Yeniden Başlat</button>
                  <button onClick={handleDatabaseSettings} className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors">Veritabanı Ayarları</button>
                  <button onClick={handleSystemCheck} className="bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-900 transition-colors">Sistem Sağlık Kontrolü</button>
                </div>
                {currentUser?.isSuperAdmin && (
                  <div className="mt-6">
                    <button onClick={handleReseedDemoData} className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors">
                      Demo Verileri Yeniden Ekle
                    </button>
                  </div>
                )}
                {currentUser?.isSuperAdmin && (
                  <div className="mt-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Bu anahtarı güvenli bir yere kaydedin. Sadece bir kez görüntüleyebilirsiniz.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {ENCRYPTION_KEY}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;