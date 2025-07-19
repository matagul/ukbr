import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminDashboard from './components/admin/AdminDashboard';
import Home from './pages/Home';
import Craftsmen from './pages/Craftsmen';
import Jobs from './pages/Jobs';
import JobCreate from './pages/JobCreate';
import About from './pages/About';
import Contact from './pages/Contact';
import AuthPage from './pages/AuthPage';
import { User, Document, AdminAction } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProfilePage from './pages/Profile';
import CompanyPage from './pages/CompanyPage';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import InstallPage from './pages/InstallPage';
import { supabase } from './utils/supabaseClient';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user || !(user.user_metadata?.role === 'admin' || user.user_metadata?.isSuperAdmin)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function App() {
  const [profiles, setProfiles] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [siteConfig, setSiteConfig] = useState({
    siteName: 'UstaKıbrıs',
    siteDescription: 'KKTC Usta ve İş İlanları Platformu',
    faviconUrl: '/vite.svg',
  });
  const [needsInstall, setNeedsInstall] = useState(false);

  useEffect(() => {
    const checkInstall = async () => {
      setLoading(true);
      // Check for super admin
      const { data: profilesData } = await supabase.from('profiles').select('*');
      const hasSuperAdmin = profilesData && profilesData.some((u: any) => u.is_super_admin);
      // Check for settings.setup_complete
      const { data: settingsData } = await supabase.from('settings').select('*');
      let setupComplete = false;
      if (settingsData) {
        if (Array.isArray(settingsData)) {
          setupComplete = (settingsData as any[]).some((s) => (s as any).setup_complete === true);
        } else {
          setupComplete = !!(settingsData as any).setup_complete;
        }
      }
      setProfiles(profilesData || []);
      setNeedsInstall(!hasSuperAdmin || !setupComplete);
      setLoading(false);
    };
    checkInstall();
  }, []);

  useEffect(() => {
    if (needsInstall) return;
    // Fetch site config from Supabase settings
    const fetchSettings = async () => {
      const { data, error } = await supabase.from('settings').select('*').single();
      if (data) {
        setSiteConfig({
          siteName: data.site_name || 'UstaKıbrıs',
          siteDescription: data.site_description || 'KKTC Usta ve İş İlanları Platformu',
          faviconUrl: data.favicon_url || '/vite.svg',
        });
      }
    };
    fetchSettings();
  }, [needsInstall]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-lg text-gray-700 dark:text-gray-200">Yükleniyor...</div>;
  }
  if (needsInstall) {
    return <InstallPage />;
  }

  return (
    <HelmetProvider>
      <>
        <Helmet>
          <title>{siteConfig.siteName}</title>
          <meta name="description" content={siteConfig.siteDescription} />
          <link rel="icon" type="image/svg+xml" href={siteConfig.faviconUrl} />
          {/* Open Graph */}
          <meta property="og:title" content={siteConfig.siteName} />
          <meta property="og:description" content={siteConfig.siteDescription} />
          <meta property="og:type" content="website" />
          <meta property="og:image" content={siteConfig.faviconUrl} />
          {/* Twitter Card */}
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content={siteConfig.siteName} />
          <meta name="twitter:description" content={siteConfig.siteDescription} />
          <meta name="twitter:image" content={siteConfig.faviconUrl} />
        </Helmet>
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              <Router>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors">
                  <Navbar />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/ustalar" element={<Craftsmen />} />
                      <Route path="/is-ilanlari" element={<Jobs />} />
                      <Route path="/usta-kayit" element={<Navigate to="/auth?tab=register&role=provider" replace />} />
                      <Route path="/is-ilan-ver" element={<JobCreate />} />
                      <Route path="/hakkimizda" element={<About />} />
                      <Route path="/iletisim" element={<Contact />} />
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/company/:slug" element={<CompanyPage />} />
                      <Route 
                        path="/admin" 
                        element={
                          <AdminRoute>
                            {loading ? (
                              <div className="flex justify-center items-center h-96 text-lg text-gray-600 dark:text-gray-300">Yükleniyor...</div>
                            ) : (
                              <AdminDashboard 
                                users={profiles}
                                documents={[]}
                                adminActions={[]}
                                currentUser={profiles.find(u => u.email === 'mehmet.emin.atagul@gmail.com')}
                              />
                            )}
                          </AdminRoute>
                        }
                      />
                    </Routes>
                  </main>
                  <Footer />
                  <Toaster 
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: 'var(--toast-bg)',
                        color: 'var(--toast-color)',
                      },
                    }}
                  />
                </div>
              </Router>
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </>
    </HelmetProvider>
  );
}

export default App;