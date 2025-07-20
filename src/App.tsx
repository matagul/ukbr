import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminDashboard from './components/admin/AdminDashboard';
import SetupWizard from './pages/SetupWizard';
import Home from './pages/Home';
import Craftsmen from './pages/Craftsmen';
import Jobs from './pages/Jobs';
import JobCreate from './pages/JobCreate';
import About from './pages/About';
import Contact from './pages/Contact';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/Profile';
import CompanyPage from './pages/CompanyPage';
import { supabaseService } from './services/supabaseService';
import { securityManager } from './utils/security';
import { APP_CONFIG, ROUTES } from './config/constants';
import { Helmet, HelmetProvider } from 'react-helmet-async';

// Protected route wrapper for admin access
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  if (!user || !(user.user_metadata?.role === 'admin' || user.user_metadata?.is_super_admin)) {
    return <Navigate to={ROUTES.AUTH} replace />;
  }
  
  return <>{children}</>;
}

// Main app content component
function AppContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [siteConfig, setSiteConfig] = useState({
    siteName: APP_CONFIG.name,
    siteDescription: APP_CONFIG.description,
    faviconUrl: '/vite.svg',
  });

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize Supabase connection
      const isConnected = await supabaseService.initialize();
      
      if (!isConnected) {
        setNeedsSetup(true);
        setLoading(false);
        return;
      }

      // Check if setup is complete
      const isSetupComplete = await supabaseService.isSetupComplete();
      
      if (!isSetupComplete) {
        setNeedsSetup(true);
        setLoading(false);
        return;
      }

      // Load encryption key for admin users
      if (user && (user.user_metadata?.role === 'admin' || user.user_metadata?.is_super_admin)) {
        const encryptionKey = await supabaseService.getEncryptionKey();
        if (encryptionKey) {
          securityManager.setEncryptionKey(encryptionKey);
        }
      }

      // Load site configuration
      const settings = await supabaseService.getSettings();
      if (settings) {
        setSiteConfig({
          siteName: settings.site_name || APP_CONFIG.name,
          siteDescription: settings.site_description || APP_CONFIG.description,
          faviconUrl: settings.favicon_url || '/vite.svg',
        });
      }

    } catch (error) {
      console.error('App initialization failed:', error);
      setNeedsSetup(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 dark:text-gray-200">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (needsSetup) {
    return <SetupWizard />;
  }

  return (
    <>
      <Helmet>
        <title>{siteConfig.siteName}</title>
        <meta name="description" content={siteConfig.siteDescription} />
        <link rel="icon" type="image/svg+xml" href={siteConfig.faviconUrl} />
        <meta property="og:title" content={siteConfig.siteName} />
        <meta property="og:description" content={siteConfig.siteDescription} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={siteConfig.siteName} />
        <meta name="twitter:description" content={siteConfig.siteDescription} />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path={ROUTES.HOME} element={<Home />} />
            <Route path={ROUTES.CRAFTSMEN} element={<Craftsmen />} />
            <Route path={ROUTES.JOBS} element={<Jobs />} />
            <Route path="/usta-kayit" element={<Navigate to={`${ROUTES.AUTH}?tab=register&role=provider`} replace />} />
            <Route path={ROUTES.JOB_CREATE} element={<JobCreate />} />
            <Route path={ROUTES.ABOUT} element={<About />} />
            <Route path={ROUTES.CONTACT} element={<Contact />} />
            <Route path={ROUTES.AUTH} element={<AuthPage />} />
            <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
            <Route path="/company/:slug" element={<CompanyPage />} />
            <Route 
              path={ROUTES.ADMIN} 
              element={
                <AdminRoute>
                  <AdminDashboard 
                    users={[]}
                    documents={[]}
                    adminActions={[]}
                    currentUser={user}
                  />
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
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <Router>
              <AppContent />
            </Router>
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;