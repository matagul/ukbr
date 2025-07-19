import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const Contact = () => {
  return (
    <div className="container mx-auto px-4 py-8 dark:bg-gray-900 min-h-screen transition-colors">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 dark:bg-gray-800">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 dark:text-white">İletişim</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-white">Bize Ulaşın</h2>
              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <MapPin className="text-red-600 mr-3 mt-1 w-5 h-5 dark:text-sky-400" />
                  <div>
                    <p className="font-semibold dark:text-white">Adres</p>
                    <p className="text-gray-600 dark:text-gray-400">Lefkoşa, KKTC</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="text-red-600 mr-3 mt-1 w-5 h-5 dark:text-sky-400" />
                  <div>
                    <p className="font-semibold dark:text-white">Telefon</p>
                    <p className="text-gray-600 dark:text-gray-400">+90 392 XXX XX XX</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="text-red-600 mr-3 mt-1 w-5 h-5 dark:text-sky-400" />
                  <div>
                    <p className="font-semibold dark:text-white">E-posta</p>
                    <p className="text-gray-600 dark:text-gray-400">info@ustakibris.com</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="text-red-600 mr-3 mt-1 w-5 h-5 dark:text-sky-400" />
                  <div>
                    <p className="font-semibold dark:text-white">Çalışma Saatleri</p>
                    <p className="text-gray-600 dark:text-gray-400">Pazartesi - Cuma: 09:00 - 18:00</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-sky-400 text-white p-4 rounded-lg dark:bg-sky-600">
                <h3 className="font-semibold mb-2 dark:text-white">Hızlı Destek</h3>
                <p className="text-sm mb-3 dark:text-gray-200">Acil durumlar için WhatsApp üzerinden 7/24 destek</p>
                <a 
                  href="https://wa.me/90392XXXXXXX" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors inline-block dark:bg-green-600 dark:hover:bg-green-700"
                >
                  WhatsApp Destek
                </a>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-white">Sık Sorulan Sorular</h2>
              
              <div className="space-y-4">
                <div className="border-l-4 border-red-600 pl-4 dark:border-sky-400">
                  <h3 className="font-semibold text-gray-800 dark:text-white">Usta kaydı ücretsiz mi?</h3>
                  <p className="text-gray-600 text-sm dark:text-gray-400">Evet, usta kaydı tamamen ücretsizdir. İlan verme de ücretsizdir.</p>
                </div>
                
                <div className="border-l-4 border-red-600 pl-4 dark:border-sky-400">
                  <h3 className="font-semibold text-gray-800 dark:text-white">İş ilanım ne zaman yayınlanır?</h3>
                  <p className="text-gray-600 text-sm dark:text-gray-400">İlanınız admin kontrolünden geçtikten sonra 24 saat içinde yayınlanır.</p>
                </div>
                
                <div className="border-l-4 border-red-600 pl-4 dark:border-sky-400">
                  <h3 className="font-semibold text-gray-800 dark:text-white">İletişim bilgilerim güvende mi?</h3>
                  <p className="text-gray-600 text-sm dark:text-gray-400">Evet, tüm kişisel verileriniz KVKK kapsamında korunmaktadır.</p>
                </div>
                
                <div className="border-l-4 border-red-600 pl-4 dark:border-sky-400">
                  <h3 className="font-semibold text-gray-800 dark:text-white">Platformda komisyon var mı?</h3>
                  <p className="text-gray-600 text-sm dark:text-gray-400">Şu anda herhangi bir komisyon alınmamaktadır. Platform tamamen ücretsizdir.</p>
                </div>
              </div>
              
              <div className="mt-8 bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                <h3 className="font-semibold text-gray-800 mb-2 dark:text-white">Öneriniz var mı?</h3>
                <p className="text-gray-600 text-sm mb-3 dark:text-gray-400">Platform geliştirme önerilerinizi bizimle paylaşın!</p>
                <a 
                  href="mailto:info@ustakibris.com" 
                  className="text-red-600 hover:text-red-700 transition-colors inline-flex items-center dark:text-sky-400 dark:hover:text-sky-500"
                >
                  <Mail className="mr-2 w-4 h-4" />
                  Öneri Gönder
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;