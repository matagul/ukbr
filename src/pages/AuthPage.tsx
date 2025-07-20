import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, User, Briefcase, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { APP_CONFIG, ROUTES } from '../config/constants';
import { securityManager } from '../utils/security';
import toast from 'react-hot-toast';

const AuthPage: React.FC = () => {
  const { login, register, loading, user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'register' | 'reset'>('login');
  const [role, setRole] = useState<'buyer' | 'provider'>('buyer');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Provider fields
    companyName: '',
    companyDescription: '',
    companyPhone: '',
    companyAddress: '',
    companyWebsite: '',
    bannerUrl: '',
    profileUrl: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate(ROUTES.HOME);
  }, [user, navigate]);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const result = await login(loginForm.email, loginForm.password);
    
    if (result.success) {
      toast.success('Giriş başarılı!');
      navigate(ROUTES.HOME);
    } else {
      setError(result.error || 'Giriş başarısız');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate passwords match
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }
    
    // Validate password strength
    const passwordValidation = securityManager.validatePasswordStrength(registerForm.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0]);
      return;
    }
    
    // Prepare user data
    const userData = {
      email: registerForm.email,
      password: registerForm.password,
      name: registerForm.name,
      phone: registerForm.phone,
      role: role,
      metadata: role === 'provider' ? {
        company_name: registerForm.companyName,
        company_description: registerForm.companyDescription,
        company_phone: registerForm.companyPhone,
        company_address: registerForm.companyAddress,
        company_website: registerForm.companyWebsite,
        banner_url: registerForm.bannerUrl,
        profile_url: registerForm.profileUrl,
      } : {}
    };
    
    const result = await register(userData);
    
    if (result.success) {
      setSuccess('Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın.');
      toast.success('Kayıt başarılı!');
    } else {
      setError(result.error || 'Kayıt başarısız');
    }
  };

  if (user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Banner */}
        <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-gray-800 dark:to-gray-900 p-8 w-1/2">
          <img src="/vite.svg" alt="Logo" className="w-20 h-20 mb-4 rounded-full shadow-lg" />
          <h2 className="text-2xl font-bold text-white mb-2">{APP_CONFIG.name}</h2>
          <p className="text-white text-center">{APP_CONFIG.description}</p>
        </div>
        {/* Auth Form */}
        <div className="flex-1 p-8">
          <div className="flex justify-center mb-6 gap-2">
            <button
              className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${tab === 'login' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}
              onClick={() => { setTab('login'); setError(null); setSuccess(null); }}
            >Giriş Yap</button>
            <button
              className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${tab === 'register' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}
              onClick={() => { setTab('register'); setError(null); setSuccess(null); }}
            >Kayıt Ol</button>
          </div>

          {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center">{error}</div>}
          {success && <div className="bg-green-100 text-green-700 p-2 rounded mb-4 text-center">{success}</div>}

          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="email">E-posta</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={loginForm.email} 
                  onChange={handleLoginChange} 
                  required 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="password">Şifre</label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    id="password" 
                    name="password" 
                    value={loginForm.password} 
                    onChange={handleLoginChange} 
                    required 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50" 
                disabled={loading}
              >
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </button>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold border ${role === 'buyer' ? 'bg-green-500 text-white border-green-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700'}`}
                  onClick={() => setRole('buyer')}
                >
                  <User className="inline w-4 h-4 mr-1" /> Alıcı
                </button>
                <button
                  type="button"
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold border ${role === 'provider' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700'}`}
                  onClick={() => setRole('provider')}
                >
                  <Briefcase className="inline w-4 h-4 mr-1" /> Usta/Şirket
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="name">Ad Soyad</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={registerForm.name} 
                  onChange={handleRegisterChange} 
                  required 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="email">E-posta</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={registerForm.email} 
                  onChange={handleRegisterChange} 
                  required 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="phone">Telefon</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  value={registerForm.phone} 
                  onChange={handleRegisterChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="password">Şifre</label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    id="password" 
                    name="password" 
                    value={registerForm.password} 
                    onChange={handleRegisterChange} 
                    required 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="confirmPassword">Şifre Tekrarı</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    value={registerForm.confirmPassword} 
                    onChange={handleRegisterChange} 
                    required 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {role === 'provider' && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-4" />
                  <div className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2"><Briefcase className="w-5 h-5" /> Şirket Bilgileri</div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="companyName">Şirket Adı</label>
                    <input type="text" id="companyName" name="companyName" value={registerForm.companyName} onChange={handleRegisterChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="companyDescription">Açıklama</label>
                    <textarea id="companyDescription" name="companyDescription" value={registerForm.companyDescription} onChange={handleRegisterChange} rows={3} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="companyPhone">Şirket Telefonu</label>
                    <input type="tel" id="companyPhone" name="companyPhone" value={registerForm.companyPhone} onChange={handleRegisterChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="companyAddress">Adres</label>
                    <input type="text" id="companyAddress" name="companyAddress" value={registerForm.companyAddress} onChange={handleRegisterChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="companyWebsite">Web Sitesi</label>
                    <input type="url" id="companyWebsite" name="companyWebsite" value={registerForm.companyWebsite} onChange={handleRegisterChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="bannerUrl">Banner Görseli (URL)</label>
                    <input type="url" id="bannerUrl" name="bannerUrl" value={registerForm.bannerUrl} onChange={handleRegisterChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="profileUrl">Profil Fotoğrafı (URL)</label>
                    <input type="url" id="profileUrl" name="profileUrl" value={registerForm.profileUrl} onChange={handleRegisterChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600" />
                  </div>
                </>
              )}
              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50" 
                disabled={loading}
              >
                {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 