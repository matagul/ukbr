import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Tag, Plus } from 'lucide-react';

const Jobs = () => {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const cities = [
    'Lefkoşa', 'Girne', 'Gazimağusa', 'İskele', 'Güzelyurt', 'Lefke'
  ];

  const categories = [
    'Elektrikçi', 'Tesisatçı', 'Boyacı', 'Marangoz', 'Kaportacı', 
    'Temizlik', 'Bahçıvan', 'Klimacı', 'İnşaat', 'Cam Ustası'
  ];

  const jobs = [
    {
      id: 1,
      title: "Ev Elektrik Tesisatı Tamiratı",
      description: "Evimizde elektrik kesintisi sorunu yaşıyoruz. Pano kontrolü ve gerekli tamiratin yapılması gerekiyor. Acil müdahale bekliyoruz.",
      contactName: "Ayşe Kaya",
      contactPhone: "+90 392 555 02 02",
      contactEmail: "ayse@example.com",
      budget: "500-1000 TL",
      city: "Lefkoşa",
      category: "Elektrikçi",
      createdAt: "2025-01-10"
    },
    {
      id: 2,
      title: "Banyo Tesisatı Tamiri",
      description: "Banyo lavabosunda sızıntı var. Su basıncı düşük. Acil müdahale gerekiyor. Malzeme temin edilecek.",
      contactName: "Mehmet Yılmaz",
      contactPhone: "+90 392 555 03 03",
      budget: "300-500 TL",
      city: "Girne",
      category: "Tesisatçı",
      createdAt: "2025-01-09"
    },
    {
      id: 3,
      title: "Ev Boyası İşi",
      description: "2+1 daire iç cephe boyası yapılacak. Malzeme dahil fiyat istiyoruz. Kaliteli iş arıyoruz.",
      contactName: "Fatma Demir",
      contactPhone: "+90 392 555 04 04",
      budget: "1500-2000 TL",
      city: "Gazimağusa",
      category: "Boyacı",
      createdAt: "2025-01-08"
    },
    {
      id: 4,
      title: "Ofis Temizliği",
      description: "Haftalık ofis temizliği için temizlik görevlisi arıyoruz. Düzenli iş imkanı.",
      contactName: "Ali Özkan",
      contactPhone: "+90 392 555 10 10",
      budget: "800 TL/ay",
      city: "Lefkoşa",
      category: "Temizlik",
      createdAt: "2025-01-07"
    },
    {
      id: 5,
      title: "Mutfak Dolabı Yapımı",
      description: "Mutfak için özel ölçü dolap yapımı. Tasarım ve montaj dahil. Kaliteli malzeme kullanılacak.",
      contactName: "Zeynep Kara",
      contactPhone: "+90 392 555 11 11",
      budget: "3000-4000 TL",
      city: "İskele",
      category: "Marangoz",
      createdAt: "2025-01-06"
    },
    {
      id: 6,
      title: "Bahçe Düzenleme",
      description: "Villa bahçesi peyzaj düzenlemesi. Çim ekimi, ağaç dikimi ve sulama sistemi kurulumu.",
      contactName: "Hasan Çelik",
      contactPhone: "+90 392 555 12 12",
      budget: "2000-3000 TL",
      city: "Girne",
      category: "Bahçıvan",
      createdAt: "2025-01-05"
    }
  ];

  const filteredJobs = jobs.filter(job => {
    return (selectedCity === '' || job.city === selectedCity) &&
           (selectedCategory === '' || job.category === selectedCategory);
  });

  return (
    <div className="container mx-auto px-4 py-8 dark:bg-gray-900 min-h-screen transition-colors">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 dark:text-white">İş İlanları</h1>
        <p className="text-gray-600 dark:text-gray-400">KKTC'deki güncel iş ilanlarını keşfedin</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 dark:bg-gray-800 dark:border-gray-700 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Filtrele</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-48">
            <select 
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="">Tüm Şehirler</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-48">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={() => {
              setSelectedCity('');
              setSelectedCategory('');
            }}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            Temizle
          </button>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <div key={job.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-2 dark:text-white">{job.title}</h3>
            <p className="text-gray-600 mb-3 dark:text-gray-400">{job.description.substring(0, 100)}...</p>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4 dark:text-gray-400">
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {job.city}
              </span>
              <span className="flex items-center">
                <Tag className="w-4 h-4 mr-1" />
                {job.category}
              </span>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-red-600 font-semibold dark:text-sky-400">{job.budget}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{job.createdAt}</span>
            </div>
            
            <div className="flex gap-2">
              <a 
                href={`tel:${job.contactPhone}`}
                className="flex-1 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors text-center dark:bg-sky-600 dark:hover:bg-sky-700"
              >
                Ara
              </a>
              <a 
                href={`https://wa.me/${job.contactPhone.replace(/\s/g, '').replace('+', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors text-center dark:bg-green-600 dark:hover:bg-green-700"
              >
                WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4 dark:text-gray-700" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2 dark:text-gray-400">İş İlanı Bulunamadı</h3>
          <p className="text-gray-500 dark:text-gray-500">Aradığınız kriterlere uygun iş ilanı bulunmamaktadır.</p>
        </div>
      )}

      {/* CTA */}
      <div className="mt-8 text-center">
        <Link 
          to="/is-ilan-ver" 
          className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center dark:bg-sky-600 dark:hover:bg-sky-700"
        >
          <Plus className="mr-2 w-5 h-5" />
          İş İlanı Ver
        </Link>
      </div>
    </div>
  );
};

export default Jobs;