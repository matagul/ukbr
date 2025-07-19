import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Wrench } from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';
import LanguageToggle from './LanguageToggle';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

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
            <Link to="/usta-kayit" className="text-white hover:text-gray-200 transition-colors">
              Usta Kayıt
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
              to="/usta-kayit" 
              className="text-white block px-3 py-2 hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Usta Kayıt
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
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;