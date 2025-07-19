import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, User, Briefcase, Facebook, Mail, Lock, Image, Globe, Phone, MapPin, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { encryptAES } from '../utils/encryption';

const initialProviderFields = {
  companyName: '',
  companyDescription: '',
  companyPhone: '',
  companyAddress: '',
  companyWebsite: '',
  bannerUrl: '',
  profileUrl: '',
};

const AuthPage: React.FC = () => {
  const { login, register, loginWithProvider, loading, user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'register' | 'reset'>('login');
  const [role, setRole] = useState<'buyer' | 'provider'>('buyer');
  const [form, setForm] = useState<any>({
    name: '',
    email: '',
    phone: '',
    password: '',
    ...initialProviderFields,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (newRole: 'buyer' | 'provider') => {
    setRole(newRole);
    setForm({ ...form, ...initialProviderFields });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await login(form.email, form.password);
    if (error) setError(error);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    let encryptionKey = localStorage.getItem('encryptionKey');
    // Try to fetch from settings if not in localStorage (optional, can be improved)
    if (!encryptionKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          import.meta.env.VITE_SUPABASE_URL || '',
          import.meta.env.VITE_SUPABASE_ANON_KEY || ''
        );
        const { data } = await supabase.from('settings').select('x_secret').single();
        if (data && data.x_secret) encryptionKey = data.x_secret;
      } catch {}
    }
    if (!encryptionKey) {
      setError('Şifreleme anahtarı bulunamadı. Lütfen yöneticinize başvurun.');
      return;
    }
    let encryptedPassword = form.password;
    let encryptedPhone = form.phone;
    let encryptedCompanyName = form.companyName;
    let encryptedCompanyDescription = form.companyDescription;
    let encryptedCompanyPhone = form.companyPhone;
    let encryptedCompanyAddress = form.companyAddress;
    let encryptedCompanyWebsite = form.companyWebsite;
    try {
      encryptedPassword = await encryptAES(form.password, encryptionKey);
      encryptedPhone = form.phone ? await encryptAES(form.phone, encryptionKey) : '';
      if (role === 'provider') {
        encryptedCompanyName = form.companyName ? await encryptAES(form.companyName, encryptionKey) : '';
        encryptedCompanyDescription = form.companyDescription ? await encryptAES(form.companyDescription, encryptionKey) : '';
        encryptedCompanyPhone = form.companyPhone ? await encryptAES(form.companyPhone, encryptionKey) : '';
        encryptedCompanyAddress = form.companyAddress ? await encryptAES(form.companyAddress, encryptionKey) : '';
        encryptedCompanyWebsite = form.companyWebsite ? await encryptAES(form.companyWebsite, encryptionKey) : '';
      }
    } catch (err) {
      setError('Şifreleme sırasında hata oluştu.');
      return;
    }
    const extra = role === 'provider' ? {
      name: form.name,
      phone: encryptedPhone,
      companyName: encryptedCompanyName,
      companyDescription: encryptedCompanyDescription,
      companyPhone: encryptedCompanyPhone,
      companyAddress: encryptedCompanyAddress,
      companyWebsite: encryptedCompanyWebsite,
      bannerUrl: form.bannerUrl,
      profileUrl: form.profileUrl,
    } : {
      name: form.name,
      phone: encryptedPhone,
    };
    const { error } = await register(form.email, encryptedPassword, role, extra);
    if (error) setError(error);
    else setSuccess('Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın.');
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch('https://nkkpgdzknpuznqwxbvct.supabase.co/auth/v1/recover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ra3BnZHprbnB1em5xd3hidmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MzI0NDcsImV4cCI6MjA2ODUwODQ0N30.o1uwKXD-wQ_WiPtWXP_lHzICpxNTeFZtVXq7Q4iqJuI' },
      body: JSON.stringify({ email: form.email })
    });
    if (!res.ok) setError('Şifre sıfırlama başarısız.');
    else setSuccess('Şifre sıfırlama e-postası gönderildi!');
  };

  if (user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 to-sky-500 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Banner */}
        <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-sky-400 to-red-500 dark:from-gray-800 dark:to-gray-900 p-8 w-1/2">
          <img src="/vite.svg" alt="Logo" className="w-20 h-20 mb-4 rounded-full shadow-lg" />
          <h2 className="text-2xl font-bold text-white mb-2">UstaKıbrıs</h2>
          <p className="text-white text-center">KKTC'nin en güvenilir usta ve iş bulma platformu</p>
        </div>
        {/* Auth Form */}
        <div className="flex-1 p-8">
          <div className="flex justify-center mb-6 gap-2">
            <button
              className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${tab === 'login' ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}
              onClick={() => { setTab('login'); setError(null); setSuccess(null); }}
            >Giriş Yap</button>
            <button
              className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${tab === 'register' ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}
              onClick={() => { setTab('register'); setError(null); setSuccess(null); }}
            >Kayıt Ol</button>
            <button
              className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${tab === 'reset' ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}
              onClick={() => { setTab('reset'); setError(null); setSuccess(null); }}
            >Şifremi Unuttum</button>
          </div>

          {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center">{error}</div>}
          {success && <div className="bg-green-100 text-green-700 p-2 rounded mb-4 text-center">{success}</div>}

          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="email">E-posta</label>
                <input type="email" id="email" name="email" value={form.email} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="password">Şifre</label>
                <input type="password" id="password" name="password" value={form.password} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-white" />
              </div>
              <button type="submit" className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors" disabled={loading}>Giriş Yap</button>
              <div className="flex items-center my-4">
                <div className="flex-1 h-px bg-gray-300" />
                <span className="mx-2 text-gray-400 text-xs">veya</span>
                <div className="flex-1 h-px bg-gray-300" />
              </div>
              <button type="button" onClick={() => loginWithProvider('google')} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg py-2 font-semibold hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" /> Google ile Giriş Yap
              </button>
              <button type="button" onClick={() => loginWithProvider('facebook')} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-2 font-semibold hover:bg-blue-700">
                <Facebook className="w-5 h-5" /> Facebook ile Giriş Yap
              </button>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold border ${role === 'buyer' ? 'bg-sky-500 text-white border-sky-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700'}`}
                  onClick={() => handleRoleChange('buyer')}
                >
                  <User className="inline w-4 h-4 mr-1" /> Alıcı
                </button>
                <button
                  type="button"
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold border ${role === 'provider' ? 'bg-red-600 text-white border-red-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700'}`}
                  onClick={() => handleRoleChange('provider')}
                >
                  <Briefcase className="inline w-4 h-4 mr-1" /> Usta/Şirket
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="name">Ad Soyad</label>
                <input type="text" id="name" name="name" value={form.name} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="email">E-posta</label>
                <input type="email" id="email" name="email" value={form.email} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="phone">Telefon</label>
                <input type="tel" id="phone" name="phone" value={form.phone} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="password">Şifre</label>
                <input type="password" id="password" name="password" value={form.password} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-white" />
              </div>
              {role === 'provider' && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-4" />
                  <div className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2"><Briefcase className="w-5 h-5" /> Şirket Bilgileri</div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="companyName">Şirket Adı</label>
                    <input type="text" id="companyName" name="companyName" value={form.companyName} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="companyDescription">Açıklama</label>
                    <textarea id="companyDescription" name="companyDescription" value={form.companyDescription} onChange={handleChange} rows={3} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="companyPhone">Şirket Telefonu</label>
                    <input type="tel" id="companyPhone" name="companyPhone" value={form.companyPhone} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="companyAddress">Adres</label>
                    <input type="text" id="companyAddress" name="companyAddress" value={form.companyAddress} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="companyWebsite">Web Sitesi</label>
                    <input type="url" id="companyWebsite" name="companyWebsite" value={form.companyWebsite} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="bannerUrl">Banner Görseli (URL)</label>
                    <input type="url" id="bannerUrl" name="bannerUrl" value={form.bannerUrl} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="profileUrl">Profil Fotoğrafı (URL)</label>
                    <input type="url" id="profileUrl" name="profileUrl" value={form.profileUrl} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-white" />
                  </div>
                </>
              )}
              <button type="submit" className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors" disabled={loading}>Kayıt Ol</button>
            </form>
          )}

          {tab === 'reset' && (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="email">E-posta</label>
                <input type="email" id="email" name="email" value={form.email} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-white" />
              </div>
              <button type="submit" className="w-full bg-sky-500 text-white py-2 rounded-lg font-semibold hover:bg-sky-600 transition-colors" disabled={loading}>Şifre Sıfırla</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 