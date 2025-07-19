import React, { useState, useEffect } from 'react';
import { Shield, Mail, Lock, Globe, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

const defaultSupabaseUrl = '';
const defaultSupabaseAnonKey = '';

const REQUIRED_TABLES = [
  'profiles',
  'settings',
  'cities',
  'categories',
  'jobs',
  'documents',
];

const TABLE_SQL = `
-- USERS / PROFILES
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  password text not null,
  role text, -- 'buyer', 'provider', 'admin', etc.
  company_name text,
  company_description text,
  company_phone text,
  company_address text,
  company_website text,
  banner_url text,
  profile_url text,
  is_super_admin boolean default false,
  is_active boolean default true,
  is_verified boolean default false,
  metadata jsonb, -- for future extensibility (e.g., social links, preferences)
  created_at timestamp default now(),
  updated_at timestamp default now(),
  deleted_at timestamp
);

-- SETTINGS
create table if not exists settings (
  id serial primary key,
  site_name text not null,
  site_description text,
  contact_email text not null,
  smtp_host text,
  smtp_port integer,
  smtp_user text,
  smtp_pass text,
  from_email text,
  favicon_url text,
  extra jsonb, -- for future settings
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- CITIES
create table if not exists cities (
  id serial primary key,
  name text not null,
  name_en text,
  region text,
  is_active boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- CATEGORIES
create table if not exists categories (
  id serial primary key,
  name text not null,
  name_en text,
  parent_id integer references categories(id),
  is_active boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- JOBS
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category_id integer references categories(id),
  city_id integer references cities(id),
  budget text,
  contact_name text,
  contact_phone text,
  contact_email text,
  status text, -- 'pending', 'approved', 'active', 'completed', 'cancelled'
  scheduled_at timestamp, -- for future job scheduling
  assigned_to uuid references profiles(id),
  metadata jsonb, -- for extra fields (e.g., attachments, tags)
  created_at timestamp default now(),
  updated_at timestamp default now(),
  deleted_at timestamp
);

-- DOCUMENTS
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  type text,
  file_name text,
  file_url text,
  status text, -- 'pending', 'approved', 'rejected'
  uploaded_at timestamp default now(),
  reviewed_at timestamp,
  reviewed_by uuid references profiles(id),
  expires_at timestamp,
  rejection_reason text,
  metadata jsonb,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  deleted_at timestamp
);

-- MESSAGES (for in-site messaging)
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references profiles(id),
  receiver_id uuid references profiles(id),
  job_id uuid references jobs(id),
  content text,
  is_read boolean default false,
  sent_at timestamp default now(),
  metadata jsonb
);

-- NOTIFICATIONS (for alerts, price drops, etc.)
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  type text, -- 'price_drop', 'job_update', etc.
  content text,
  is_read boolean default false,
  created_at timestamp default now(),
  metadata jsonb
);

-- SCHEDULER (for job time, reminders, etc.)
create table if not exists schedules (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id),
  user_id uuid references profiles(id),
  scheduled_for timestamp,
  status text, -- 'pending', 'confirmed', 'cancelled'
  created_at timestamp default now(),
  updated_at timestamp default now(),
  metadata jsonb
);

-- ACTIVITY LOG (for auditing, admin actions, etc.)
create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  action text,
  details text,
  ip_address text,
  created_at timestamp default now(),
  metadata jsonb
);
`;

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

// Use the hardcoded key for all encryption/decryption
const ENCRYPTION_KEY = 'a1FxB+uQT1QRbel3+SkMw2PiI6rtoa2ivJjLq2eVEz4=';

// Separate static data
const STATIC_CITIES = [
  { name: 'Lefkoşa', name_en: 'Nicosia' },
  { name: 'Girne', name_en: 'Kyrenia' },
  { name: 'Gazimağusa', name_en: 'Famagusta' },
  { name: 'İskele', name_en: 'Iskele' },
  { name: 'Güzelyurt', name_en: 'Guzelyurt' },
  { name: 'Lefke', name_en: 'Lefka' },
];
const STATIC_CATEGORIES = [
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
];

const InstallPage: React.FC = () => {
  const [step, setStep] = useState(() => {
    if (localStorage.getItem('setupComplete') === 'true') return 3;
    if (localStorage.getItem('encryptionKeyConfirmed') === 'true') return 3;
    return 1;
  });
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem('supabaseUrl') || defaultSupabaseUrl);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => localStorage.getItem('supabaseAnonKey') || defaultSupabaseAnonKey);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [missingTables, setMissingTables] = useState<string[]>([]);
  const [checkingSchema, setCheckingSchema] = useState(false);
  const [schemaReady, setSchemaReady] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);
  const [admin, setAdmin] = useState({ name: '', email: '', password: '' });
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'KiProTek',
    siteDescription: "Kıbrıs'ın Profesyonel Teknoloji İş Gücü Platformu",
    contactEmail: 'iletisim@kiprotek.com',
  });
  const [smtpSettings, setSmtpSettings] = useState({
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPass: '',
    fromEmail: '',
  });
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [keyCopySuccess, setKeyCopySuccess] = useState(false);
  const [showConnectionSaved, setShowConnectionSaved] = useState(false);

  // Add stepper UI
  const steps = [
    { label: 'Bağlantı', key: 1 },
    { label: 'Süper Admin', key: 3 },
    { label: 'Ayarlar', key: 4 },
    { label: 'Demo Veriler', key: 5 },
    { label: 'Bitti', key: 6 },
  ];

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnectionStatus('testing');
    setConnectionError(null);
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const testClient = createClient(supabaseUrl, supabaseAnonKey);
      const { error } = await testClient.from('profiles').select('*').limit(1);
      if (error) {
        setConnectionStatus('error');
        setConnectionError('Bağlantı kurulamadı: ' + (error.message || error.toString()));
        return;
      }
      // Save connection info to localStorage
      localStorage.setItem('supabaseUrl', supabaseUrl);
      localStorage.setItem('supabaseAnonKey', supabaseAnonKey);
      setShowConnectionSaved(true);
      setConnectionStatus('success');
      setTimeout(() => { setShowConnectionSaved(false); setStep(3); }, 1500);
    } catch (err: any) {
      setConnectionStatus('error');
      setConnectionError('Bağlantı kurulamadı: ' + (err.message || err.toString()));
    }
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(TABLE_SQL);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setAdminSuccess(false);
    setCreatingAdmin(true);
    try {
      if (!supabase) throw new Error('Bağlantı yok');
      const { error } = await supabase.from('profiles').insert({
        name: admin.name,
        email: admin.email,
        role: 'admin',
        is_super_admin: true,
        password: admin.password,
      });
      if (error) throw error;
      setAdminSuccess(true);
      setTimeout(() => setStep(4), 1000);
    } catch (err: any) {
      setAdminError('Admin hesabı oluşturulamadı: ' + (err.message || err));
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleSeedDemo = async () => {
    if (!supabase) return;
    setSeeding(true);
    setSeedError(null);
    try {
      // Insert real Cyprus cities
      await supabase.from('cities').insert(CYPRUS_CITIES);
      // Insert real categories
      await supabase.from('categories').insert(REAL_CATEGORIES);
      setSeeded(true);
      setStep(5); // Proceed to next step
    } catch (err: any) {
      setSeedError('Demo verileri eklenemedi: ' + (err.message || err));
    } finally {
      setSeeding(false);
    }
  };

  // Save settings to Supabase
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError(null);
    setSettingsSuccess(false);
    setSavingSettings(true);
    try {
      if (!supabase) throw new Error('Bağlantı yok');
      const { error } = await supabase.from('settings').upsert({
        id: 1,
        site_name: siteSettings.siteName,
        site_description: siteSettings.siteDescription,
        contact_email: siteSettings.contactEmail,
        smtp_host: smtpSettings.smtpHost,
        smtp_port: smtpSettings.smtpPort,
        smtp_user: smtpSettings.smtpUser,
        smtp_pass: smtpSettings.smtpPass,
        from_email: smtpSettings.fromEmail,
      });
      if (error) throw error;
      setSettingsSuccess(true);
      setTimeout(() => setStep(5), 1000);
    } catch (err: any) {
      setSettingsError('Ayarlar kaydedilemedi: ' + (err.message || err));
    } finally {
      setSavingSettings(false);
    }
  };

  // After demo data step, set setup_complete flag in settings and localStorage, then redirect
  const handleFinishInstall = async () => {
    if (!supabase) return;
    await supabase.from('settings').upsert({ id: 1, setup_complete: true });
    localStorage.setItem('setupComplete', 'true');
    setTimeout(() => { window.location.href = '/auth'; }, 1500);
  };

  // On mount, if setupComplete in localStorage or DB, redirect to homepage/login only if not already there
  useEffect(() => {
    async function checkDbSetup() {
      const { data, error } = await supabase.from('settings').select('setup_complete').single();
      const isComplete = (data && data.setup_complete) || localStorage.getItem('setupComplete') === 'true';
      const isOnAuth = window.location.pathname === '/auth';
      const isOnHome = window.location.pathname === '/';
      if (isComplete && !isOnAuth && !isOnHome) {
        window.location.href = '/auth';
      }
    }
    checkDbSetup();
  }, []);

  // Always insert static data if missing
  const ensureStaticData = async () => {
    if (!supabase) return;
    // Cities
    const { data: cities } = await supabase.from('cities').select('name');
    if (!cities || cities.length === 0) {
      await supabase.from('cities').insert(STATIC_CITIES);
    }
    // Categories
    const { data: categories } = await supabase.from('categories').select('name');
    if (!categories || categories.length === 0) {
      await supabase.from('categories').insert(STATIC_CATEGORIES);
    }
  };

  // Add navigation logic
  const isStepValid = () => {
    if (step === 1) return connectionStatus === 'success';
    if (step === 3) return admin.name && admin.email && admin.password && !creatingAdmin;
    if (step === 4) return siteSettings.siteName && siteSettings.siteDescription && siteSettings.contactEmail && smtpSettings.smtpHost && smtpSettings.smtpPort && smtpSettings.smtpUser && smtpSettings.smtpPass && smtpSettings.fromEmail && !savingSettings;
    if (step === 5) return true; // Demo data is optional
    return true;
  };
  const handleNext = async () => {
    if (step === 1 && connectionStatus === 'success') setStep(3);
    else if (step === 3 && isStepValid()) setStep(4);
    else if (step === 4 && isStepValid()) setStep(5);
    else if (step === 5) setStep(6);
  };
  const handleBack = () => {
    if (step === 3) setStep(1);
    else if (step === 4) setStep(3);
    else if (step === 5) setStep(4);
  };

  useEffect(() => {
    // On mount, if on step 1 and localStorage has values, re-test connection
    if (step === 1) {
      const storedUrl = localStorage.getItem('supabaseUrl');
      const storedKey = localStorage.getItem('supabaseAnonKey');
      if (storedUrl && storedKey) {
        setSupabaseUrl(storedUrl);
        setSupabaseAnonKey(storedKey);
        // Only test if not already successful
        if (connectionStatus !== 'success') {
          (async () => {
            setConnectionStatus('testing');
            try {
              const { createClient } = await import('@supabase/supabase-js');
              const testClient = createClient(storedUrl, storedKey);
              const { error } = await testClient.from('profiles').select('*').limit(1);
              if (error) {
                setConnectionStatus('error');
                setConnectionError('Bağlantı kurulamadı: ' + (error.message || error.toString()));
              } else {
                setConnectionStatus('success');
              }
            } catch (err: any) {
              setConnectionStatus('error');
              setConnectionError('Bağlantı kurulamadı: ' + (err.message || err.toString()));
            }
          })();
        }
      } else {
        setConnectionStatus('idle');
        setSupabaseUrl('');
        setSupabaseAnonKey('');
      }
    }
  }, [step]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 to-sky-500 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-8 flex flex-col items-center">
        {/* Stepper UI */}
        <div className="flex items-center justify-center mb-8 w-full">
          {steps.map((s, idx) => {
            const isCompleted = step > s.key || (s.key === 1 && connectionStatus === 'success');
            const isActive = step === s.key;
            return (
              <React.Fragment key={s.key}>
                <div className={`flex flex-col items-center ${isActive ? 'text-red-600 font-bold' : isCompleted ? 'text-green-600 font-bold' : 'text-gray-400'}`}> 
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isActive ? 'border-red-600 bg-red-100' : isCompleted ? 'border-green-600 bg-green-100' : 'border-gray-300 bg-gray-100'}`}>
                    {isCompleted ? <CheckCircle className="w-5 h-5 text-green-600" /> : idx + 1}
                  </div>
                  <span className="text-xs mt-1">{s.label}</span>
                </div>
                {idx < steps.length - 1 && <div className="flex-1 h-0.5 bg-gray-200 mx-2" />}
              </React.Fragment>
            );
          })}
        </div>
        <Shield className="w-16 h-16 text-red-600 mb-4" />
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">UstaKıbrıs Kurulum Sihirbazı</h1>
        <p className="mb-6 text-gray-600 dark:text-gray-300 text-center">
          Adım 1: Supabase bağlantınızı kurun.<br />
          Projenizin URL ve anon anahtarını girin, bağlantıyı test edin.
        </p>
        {step === 1 && (
          <>
            <form className="w-full space-y-6" onSubmit={e => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium mb-1">Supabase URL</label>
                <input type="text" value={supabaseUrl} onChange={e => setSupabaseUrl(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2" required placeholder="https://xxxx.supabase.co" />
                <label className="block text-sm font-medium mb-1">Supabase Anon Key</label>
                <input type="text" value={supabaseAnonKey} onChange={e => setSupabaseAnonKey(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" required placeholder="Anon anahtarınızı girin" />
              </div>
              <div className="w-full mb-4">
                <label htmlFor="schema-sql" className="block text-sm font-medium mb-1">SQL Kodunu Kopyala ve Supabase SQL Editor'da Çalıştır:</label>
                <div className="relative">
                  <textarea
                    id="schema-sql"
                    readOnly
                    value={TABLE_SQL}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono bg-gray-50 dark:bg-gray-800 dark:text-white resize-y min-h-[300px]"
                    rows={16}
                    title="Supabase tablo oluşturma SQL kodu"
                  />
                  <button
                    onClick={handleCopySQL}
                    type="button"
                    className="absolute top-2 right-2 bg-sky-500 text-white px-3 py-1 rounded-lg font-semibold hover:bg-sky-600 transition-colors text-xs"
                  >
                    {copySuccess ? 'Kopyalandı!' : 'Kopyala'}
                  </button>
                </div>
              </div>
              <div className="flex w-full mt-2 gap-2 flex-col sm:flex-row">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  className="flex-1 bg-sky-500 text-white py-2 rounded-lg font-semibold hover:bg-sky-600 transition-colors"
                  disabled={connectionStatus === 'testing'}
                >
                  {connectionStatus === 'testing' ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />} Bağlantıyı Test Et
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className={`flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors ${!isStepValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  İleri
                </button>
              </div>
            </form>
            {connectionStatus === 'success' && (
              <div className="bg-green-100 text-green-700 p-2 rounded mt-4 text-center flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Bağlantı başarılı! Sonraki adıma geçebilirsiniz.</div>
            )}
            {connectionStatus === 'error' && (
              <div className="bg-red-100 text-red-700 p-2 rounded mt-4 text-center flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {connectionError}</div>
            )}
            {showConnectionSaved && (
              <div className="bg-yellow-100 text-yellow-800 p-2 rounded mt-4 text-center text-sm">
                Supabase bağlantı bilgileriniz tarayıcıda güvenli şekilde kaydedildi. <strong>Lütfen bu bilgileri ayrıca bir yere not edin!</strong>
              </div>
            )}
          </>
        )}
        {step === 3 && (
          <>
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-600 to-sky-500 dark:from-gray-900 dark:to-gray-800 p-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-8 flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Süper Admin Hesabı Oluştur</h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300 text-center">Platformu yönetmek için ilk süper admin hesabını oluşturun.</p>
                {adminError && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center">{adminError}</div>}
                {adminSuccess && <div className="bg-green-100 text-green-700 p-2 rounded mb-4 text-center">Süper admin hesabı başarıyla oluşturuldu!</div>}
                <form className="w-full space-y-4" onSubmit={handleCreateAdmin}>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ad Soyad</label>
                    <input type="text" value={admin.name} onChange={e => setAdmin({ ...admin, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required placeholder="Ad Soyad" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">E-posta</label>
                    <input type="email" value={admin.email} onChange={e => setAdmin({ ...admin, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required placeholder="E-posta" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Şifre</label>
                    <input type="password" value={admin.password} onChange={e => setAdmin({ ...admin, password: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required placeholder="Şifre" />
                  </div>
                  <div className="w-full my-6">
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-lg mb-2">
                      <strong>Şifreleme Anahtarı:</strong>
                      <div className="flex items-center gap-2 mt-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs select-all">{ENCRYPTION_KEY}</code>
                        <button
                          type="button"
                          onClick={() => { navigator.clipboard.writeText(ENCRYPTION_KEY); setKeyCopySuccess(true); setTimeout(() => setKeyCopySuccess(false), 2000); }}
                          className="bg-sky-500 text-white px-2 py-1 rounded text-xs font-semibold hover:bg-sky-600 transition-colors"
                        >
                          {keyCopySuccess ? 'Kopyalandı!' : 'Kopyala'}
                        </button>
                      </div>
                      <div className="text-xs text-yellow-700 mt-2">Bu anahtarı güvenli bir yere kaydedin. Sadece bu adımda görüntülenir ve platformdaki tüm hassas verilerin şifrelenmesi için gereklidir. Kaybolursa, şifreli veriler geri alınamaz.</div>
                    </div>
                  </div>
                  <div className="flex w-full mt-6 gap-2 flex-col sm:flex-row">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                    >
                      Geri
                    </button>
                    <button
                      type="submit"
                      disabled={!admin.name || !admin.email || !admin.password || creatingAdmin}
                      className={`flex-1 bg-sky-500 text-white py-2 rounded-lg font-semibold hover:bg-sky-600 transition-colors ${(!admin.name || !admin.email || !admin.password || creatingAdmin) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {creatingAdmin ? <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" /> : null}
                      İleri
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
        {step === 4 && (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-600 to-sky-500 dark:from-gray-900 dark:to-gray-800 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-8 flex flex-col items-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Site ve SMTP Ayarları</h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300 text-center">Site adı, açıklaması, iletişim e-posta ve SMTP ayarlarını girin. Bu bilgiler platformun çalışması için gereklidir.</p>
              {settingsError && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center">{settingsError}</div>}
              {settingsSuccess && <div className="bg-green-100 text-green-700 p-2 rounded mb-4 text-center">Ayarlar kaydedildi!</div>}
              <form className="w-full space-y-4" onSubmit={handleSaveSettings}>
                <div>
                  <label className="block text-sm font-medium mb-1">Site Adı</label>
                  <input type="text" value={siteSettings.siteName} onChange={e => setSiteSettings({ ...siteSettings, siteName: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required placeholder="Site adı" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Site Açıklaması</label>
                  <textarea value={siteSettings.siteDescription} onChange={e => setSiteSettings({ ...siteSettings, siteDescription: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required placeholder="Site açıklaması" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">İletişim E-posta</label>
                  <input type="email" value={siteSettings.contactEmail} onChange={e => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required placeholder="E-posta" />
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 my-4" />
                <div className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">SMTP Ayarları</div>
                <div>
                  <label className="block text-sm font-medium mb-1">SMTP Sunucu</label>
                  <input type="text" value={smtpSettings.smtpHost} onChange={e => setSmtpSettings({ ...smtpSettings, smtpHost: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required placeholder="SMTP sunucu" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Port</label>
                    <input type="text" value={smtpSettings.smtpPort} onChange={e => setSmtpSettings({ ...smtpSettings, smtpPort: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required placeholder="Port" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Kullanıcı Adı</label>
                    <input type="text" value={smtpSettings.smtpUser} onChange={e => setSmtpSettings({ ...smtpSettings, smtpUser: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required placeholder="Kullanıcı adı" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Şifre</label>
                  <input type="password" value={smtpSettings.smtpPass} onChange={e => setSmtpSettings({ ...smtpSettings, smtpPass: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required placeholder="Şifre" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gönderen E-posta</label>
                  <input type="email" value={smtpSettings.fromEmail} onChange={e => setSmtpSettings({ ...smtpSettings, fromEmail: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" required placeholder="Gönderen e-posta" />
                </div>
                <div className="flex w-full mt-6 gap-2 flex-col sm:flex-row">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                  >
                    Geri
                  </button>
                  <button
                    type="submit"
                    disabled={savingSettings || !siteSettings.siteName || !siteSettings.siteDescription || !siteSettings.contactEmail || !smtpSettings.smtpHost || !smtpSettings.smtpPort || !smtpSettings.smtpUser || !smtpSettings.smtpPass || !smtpSettings.fromEmail}
                    className={`flex-1 bg-sky-500 text-white py-2 rounded-lg font-semibold hover:bg-sky-600 transition-colors ${(savingSettings || !siteSettings.siteName || !siteSettings.siteDescription || !siteSettings.contactEmail || !smtpSettings.smtpHost || !smtpSettings.smtpPort || !smtpSettings.smtpUser || !smtpSettings.smtpPass || !smtpSettings.fromEmail) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {savingSettings ? <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" /> : null}
                    İleri
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {step === 5 && (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-600 to-sky-500 dark:from-gray-900 dark:to-gray-800 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-8 flex flex-col items-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Kurulum Tamamlandı!</h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300 text-center">Tebrikler, platform kurulumu başarıyla tamamlandı. Giriş yapmak için ana sayfaya yönlendiriliyorsunuz...</p>
              <button
                type="button"
                onClick={handleFinishInstall}
                className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors mt-4"
              >
                Ana Sayfaya Git
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallPage; 