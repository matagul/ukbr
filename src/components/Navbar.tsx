import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Wrench, ChevronDown, LogOut, User as UserIcon, Shield } from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';
import LanguageToggle from './LanguageToggle';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth ? useAuth() : { user: null, logout: async () => {} };
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="bg-red-600 dark:bg-red-700 shadow-lg transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white text-2xl font-bold flex items-center hover:text-gray-200 transition-colors">
              <Wrench className="mr-2" />
              UstaKıbrıs
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-white hover:text-gray-200 transition-colors">
              Ana Sayfa
            </Link>
            <Link to="/ustalar" className="text-white hover:text-gray-200 transition-colors">
              Usta Ara
            </Link>
            <Link to="/is-ilanlari" className="text-white hover:text-gray-200 transition-colors">
              İş İlanları
            </Link>
            <Link 
              to="/is-ilan-ver" 
              className="bg-sky-400 dark:bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-500 dark:hover:bg-sky-600 transition-colors"
            >
              İş İlanı Ver
            </Link>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <DarkModeToggle />
            </div>
            {!user ? (
              <>
                <Link to="/auth" className="text-white hover:text-gray-200 transition-colors font-semibold">Giriş Yap</Link>
                <Link to="/auth" className="ml-2 bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">Kayıt Ol</Link>
              </>
            ) : (
              <div className="ml-4 relative">
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 focus:outline-none"
                  aria-label="Kullanıcı menüsü"
                >
                  {user.user_metadata?.profileUrl ? (
                    <img src={user.user_metadata.profileUrl} alt="Profil" className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-700 object-cover" />
                  ) : (
                    <UserIcon className="w-8 h-8 text-white bg-gray-400 rounded-full p-1" />
                  )}
                  <ChevronDown className="w-4 h-4 text-white" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-700">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <UserIcon className="w-4 h-4 inline mr-2" /> Profilim
                    </Link>
                    {user && (user.user_metadata?.role === 'admin' || user.user_metadata?.isSuperAdmin) && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Shield className="w-4 h-4 inline mr-2" /> Admin Paneli
                      </Link>
                    )}
                    <button
                      onClick={async () => { setDropdownOpen(false); await logout(); }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-white"
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>
      
      {isOpen && (
        <div className="md:hidden bg-red-600 dark:bg-red-700 border-t border-red-700 dark:border-red-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              className="text-white block px-3 py-2 hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Ana Sayfa
            </Link>
            <Link 
              to="/ustalar" 
              className="text-white block px-3 py-2 hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Usta Ara
            </Link>
            <Link 
              to="/is-ilanlari" 
              className="text-white block px-3 py-2 hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              İş İlanları
            </Link>
            <Link 
              to="/is-ilan-ver" 
              className="text-white block px-3 py-2 hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              İş İlanı Ver
            </Link>
            <div className="flex items-center gap-2 px-3 py-2">
              <LanguageToggle />
              <DarkModeToggle />
            </div>
            {!user ? (
              <>
                <Link to="/auth" className="block text-white px-3 py-2 font-semibold hover:bg-red-700 dark:hover:bg-red-800 transition-colors">Giriş Yap</Link>
                <Link to="/auth" className="block bg-white text-red-600 px-3 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors mt-2">Kayıt Ol</Link>
              </>
            ) : (
              <div className="mt-2 relative">
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 focus:outline-none"
                  aria-label="Kullanıcı menüsü"
                >
                  {user.user_metadata?.profileUrl ? (
                    <img src={user.user_metadata.profileUrl} alt="Profil" className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-700 object-cover" />
                  ) : (
                    <UserIcon className="w-8 h-8 text-white bg-gray-400 rounded-full p-1" />
                  )}
                  <ChevronDown className="w-4 h-4 text-white" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-700">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <UserIcon className="w-4 h-4 inline mr-2" /> Profilim
                    </Link>
                    {user && (user.user_metadata?.role === 'admin' || user.user_metadata?.isSuperAdmin) && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Shield className="w-4 h-4 inline mr-2" /> Admin Paneli
                      </Link>
                    )}
                    <button
                      onClick={async () => { setDropdownOpen(false); await logout(); }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;