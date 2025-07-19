import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-white mt-16 transition-colors">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">UstaKıbrıs</h3>
            <p className="text-gray-300 dark:text-gray-400">
              KKTC'nin en güvenilir usta ve iş bulma platformu. Kaliteli hizmet, güvenli iletişim.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2 text-gray-300 dark:text-gray-400">
              <li>
                <Link to="/hakkimizda" className="hover:text-white dark:hover:text-gray-200 transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link to="/iletisim" className="hover:text-white dark:hover:text-gray-200 transition-colors">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">İletişim</h3>
            <div className="text-gray-300 dark:text-gray-400 space-y-2">
              <p className="flex items-center">
                <Mail className="mr-2 w-4 h-4" />
                info@ustakibris.com
              </p>
              <p className="flex items-center">
                <Phone className="mr-2 w-4 h-4" />
                +90 392 XXX XX XX
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-600 dark:border-gray-700 mt-8 pt-8 text-center text-gray-300 dark:text-gray-400">
          <p>&copy; 2025 UstaKıbrıs. Tüm hakları saklıdır. | KVKK uyumlu | Versiyon: 1.0.0</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;