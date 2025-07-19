import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="container mx-auto px-4 py-8 dark:bg-gray-900 min-h-screen transition-colors">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 dark:bg-gray-800">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 dark:text-white">Hakkımızda</h1>
          
          <div className="prose max-w-none">
            <p className="text-lg text-gray-600 mb-6 dark:text-gray-400">
              UstaKıbrıs, Kuzey Kıbrıs Türk Cumhuriyeti'nde faaliyet gösteren ustalar ve iş sahiplerini 
              bir araya getiren güvenilir bir platformdur.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 dark:text-white">Misyonumuz</h2>
            <p className="text-gray-600 mb-6 dark:text-gray-400">
              Kaliteli hizmet arayan müşteriler ile deneyimli ustalar arasında güvenli ve hızlı bir 
              köprü kurmak. KKTC'deki iş gücü potansiyelini dijital platformda buluşturarak 
              ekonomiye katkı sağlamak.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 dark:text-white">Neden UstaKıbrıs?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                <h3 className="font-semibold text-red-600 mb-2 dark:text-sky-400">Güvenilir Platform</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tüm ilanlar admin kontrolünden geçer</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                <h3 className="font-semibold text-red-600 mb-2 dark:text-sky-400">Hızlı Eşleşme</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Konum ve kategori bazlı akıllı filtreleme</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                <h3 className="font-semibold text-red-600 mb-2 dark:text-sky-400">Yerel Odak</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">KKTC'ye özel tasarım ve içerik</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-700">
                <h3 className="font-semibold text-red-600 mb-2 dark:text-sky-400">Kolay İletişim</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">WhatsApp entegrasyonu ile anında iletişim</p>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 dark:text-white">Vizyonumuz</h2>
            <p className="text-gray-600 mb-6 dark:text-gray-400">
              KKTC'nin dijital iş gücü platformu olarak, tüm meslek dallarında en kapsamlı ve 
              güvenilir hizmet sağlayıcı olmak. Gelecekte yapay zeka desteğiyle daha akıllı 
              eşleştirmeler sunmak.
            </p>
            
            <div className="bg-red-600 text-white p-6 rounded-lg text-center dark:bg-sky-500 dark:text-white">
              <h3 className="text-xl font-semibold mb-2">Bizimle İletişime Geçin</h3>
              <p className="mb-4">Sorularınız için her zaman buradayız!</p>
              <Link 
                to="/iletisim" 
                className="bg-white text-red-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors inline-block dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
              >
                İletişim Sayfası
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;