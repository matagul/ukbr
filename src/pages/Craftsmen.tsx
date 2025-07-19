import React, { useState } from 'react';
import { Users, MapPin, Calendar } from 'lucide-react';
import StarRating from '../components/StarRating';
import ReviewModal from '../components/ReviewModal';
import JobHistoryCard from '../components/JobHistoryCard';
import toast from 'react-hot-toast';

const Craftsmen = () => {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedCraftsman, setSelectedCraftsman] = useState<any>(null);

  const cities = [
    'Lefkoşa', 'Girne', 'Gazimağusa', 'İskele', 'Güzelyurt', 'Lefke'
  ];

  const categories = [
    'Elektrikçi', 'Tesisatçı', 'Boyacı', 'Marangoz', 'Kaportacı', 
    'Temizlik', 'Bahçıvan', 'Klimacı', 'İnşaat', 'Cam Ustası'
  ];

  const craftsmen = [
    {
      id: 1,
      name: "Mehmet Öztürk",
      category: "Elektrikçi",
      city: "Lefkoşa",
      experience: 15,
      description: "15 yıllık deneyimim ile elektrik tesisatı, aydınlatma ve pano işleri yapıyorum. Kaliteli iş garantisi.",
      phone: "+90 392 555 01 01",
      email: "mehmet@example.com",
      averageRating: 4.8,
      totalReviews: 23,
      completedJobs: 156,
      successRate: 98
    },
    {
      id: 2,
      name: "Ali Kaya",
      category: "Tesisatçı",
      city: "Girne",
      experience: 10,
      description: "Su tesisatı, kalorifer ve klima montajı konularında uzmanım. 7/24 acil servis.",
      phone: "+90 392 555 05 05",
      averageRating: 4.6,
      totalReviews: 18,
      completedJobs: 89,
      successRate: 95
    },
    {
      id: 3,
      name: "Hasan Demir",
      category: "Boyacı",
      city: "Gazimağusa",
      experience: 8,
      description: "İç ve dış cephe boyası, dekoratif boyama işleri yapıyorum. Malzeme dahil hizmet.",
      phone: "+90 392 555 06 06",
      averageRating: 4.9,
      totalReviews: 31,
      completedJobs: 124,
      successRate: 97
    },
    {
      id: 4,
      name: "Fatma Yılmaz",
      category: "Temizlik",
      city: "Lefkoşa",
      experience: 5,
      description: "Ev ve ofis temizliği, cam silme, halı yıkama hizmetleri veriyorum.",
      phone: "+90 392 555 07 07",
      averageRating: 4.7,
      totalReviews: 42,
      completedJobs: 203,
      successRate: 99
    },
    {
      id: 5,
      name: "Osman Çelik",
      category: "Marangoz",
      city: "Girne",
      experience: 20,
      description: "Mobilya yapımı, tadilat ve onarım işleri. Özel tasarım mobilyalar.",
      phone: "+90 392 555 08 08",
      averageRating: 4.5,
      totalReviews: 15,
      completedJobs: 67,
      successRate: 94
    },
    {
      id: 6,
      name: "Ayşe Kara",
      category: "Bahçıvan",
      city: "İskele",
      experience: 7,
      description: "Bahçe düzenleme, peyzaj, bitki bakımı ve sulama sistemleri.",
      phone: "+90 392 555 09 09",
      averageRating: 4.4,
      totalReviews: 12,
      completedJobs: 45,
      successRate: 91
    }
  ];

  const filteredCraftsmen = craftsmen.filter(craftsman => {
    return (selectedCity === '' || craftsman.city === selectedCity) &&
           (selectedCategory === '' || craftsman.category === selectedCategory);
  });

  const handleReviewSubmit = async (review: { rating: number; comment: string }) => {
    // Implementation would save review to backend
    console.log('Review submitted:', review);
    toast.success('Değerlendirmeniz kaydedildi!');
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <div className="Toaster" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Ustalar</h1>
        <p className="text-gray-600 dark:text-gray-400">KKTC'nin en iyi ustalarını keşfedin</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Filtrele</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-48">
            <select 
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
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
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
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
            className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            Temizle
          </button>
        </div>
      </div>

      {/* Craftsmen Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCraftsmen.map((craftsman) => (
          <div key={craftsman.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="bg-red-600 dark:bg-red-700 text-white w-12 h-12 rounded-full flex items-center justify-center mr-3">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{craftsman.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{craftsman.category}</p>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-3">{craftsman.description}</p>
            
            {/* Rating and Stats */}
            <div className="mb-4 space-y-2">
              <StarRating rating={craftsman.averageRating} readonly size="sm" />
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{craftsman.completedJobs} tamamlanan iş</span>
                <span>%{craftsman.successRate} başarı oranı</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {craftsman.city}
              </span>
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {craftsman.experience} yıl
              </span>
            </div>
            
            <div className="flex gap-2 mb-3">
              <a 
                href={`tel:${craftsman.phone}`}
                className="flex-1 bg-gray-800 dark:bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors text-center"
              >
                Ara
              </a>
              <a 
                href={`https://wa.me/${craftsman.phone.replace(/\s/g, '').replace('+', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors text-center"
              >
                WhatsApp
              </a>
            </div>
            
            <button
              onClick={() => {
                setSelectedCraftsman(craftsman);
                setReviewModalOpen(true);
              }}
              className="w-full bg-red-600 dark:bg-red-700 text-white px-4 py-2 rounded hover:bg-red-700 dark:hover:bg-red-800 transition-colors text-center text-sm"
            >
              Değerlendir
            </button>
          </div>
        ))}
      </div>

      {filteredCraftsmen.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">Usta Bulunamadı</h3>
          <p className="text-gray-500 dark:text-gray-500">Aradığınız kriterlere uygun usta bulunmamaktadır.</p>
        </div>
      )}
      
      {/* Review Modal */}
      {reviewModalOpen && selectedCraftsman && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          craftsmanName={selectedCraftsman.name}
          craftsmanId={selectedCraftsman.id}
          jobId="sample-job-id"
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
};

export default Craftsmen;