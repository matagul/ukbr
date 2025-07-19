import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminDashboard from './components/admin/AdminDashboard';
import Home from './pages/Home';
import Craftsmen from './pages/Craftsmen';
import Jobs from './pages/Jobs';
import CraftsmanRegister from './pages/CraftsmanRegister';
import JobCreate from './pages/JobCreate';
import About from './pages/About';
import Contact from './pages/Contact';
import { User, Document, AdminAction } from './types';

function App() {
  // Mock data for admin dashboard
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'Mehmet Öztürk',
      email: 'mehmet@example.com',
      phone: '+90 392 555 01 01',
      city: 'Lefkoşa',
      category: 'Elektrikçi',
      isActive: true,
      isBanned: false,
      banLevel: 'none',
      createdAt: new Date('2024-01-15'),
      lastLoginAt: new Date('2025-01-10'),
      activityHistory: [],
      documents: []
    }
  ];

  const mockDocuments: Document[] = [
    {
      id: '1',
      userId: '1',
      type: 'license',
      fileName: 'elektrikci_lisansi.pdf',
      fileUrl: '/documents/elektrikci_lisansi.pdf',
      status: 'pending',
      uploadedAt: new Date('2025-01-10'),
      expiresAt: new Date('2026-01-10')
    }
  ];

  const mockAdminActions: AdminAction[] = [
    {
      id: '1',
      adminId: 'admin1',
      action: 'Kullanıcı onaylandı',
      targetType: 'user',
      targetId: '1',
      details: 'Mehmet Öztürk kullanıcısı onaylandı',
      timestamp: new Date(),
      ipAddress: '192.168.1.1'
    }
  ];

  return (
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
                <Route path="/usta-kayit" element={<CraftsmanRegister />} />
                <Route path="/is-ilan-ver" element={<JobCreate />} />
                <Route path="/hakkimizda" element={<About />} />
                <Route path="/iletisim" element={<Contact />} />
                <Route 
                  path="/admin" 
                  element={
                    <AdminDashboard 
                      users={mockUsers}
                      documents={mockDocuments}
                      adminActions={mockAdminActions}
                    />
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
  );
}

export default App;