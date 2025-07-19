import React, { useState } from 'react';
import { Users, MapPin, Calendar } from 'lucide-react';
import StarRating from '../components/StarRating';
import ReviewModal from '../components/ReviewModal';
import JobHistoryCard from '../components/JobHistoryCard';
import toast from 'react-hot-toast';
import { decryptAES } from '../utils/encryption';
import { useAuth } from '../contexts/AuthContext';

function maskPhone(phone: string) {
  // Mask all but last 4 digits
  if (!phone) return '';
  return phone.replace(/(\d{3})\s?(\d{3})\s?(\d{2})\s?(\d{2})$/, '+90 XXX XXX XX $4');
}

const Craftsmen = () => {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedCraftsman, setSelectedCraftsman] = useState<any>(null);
  const { user } = useAuth();
  const [craftsmen, setCraftsmen] = useState<any[]>([]);

  const cities = [
    'Lefkoşa', 'Girne', 'Gazimağusa', 'İskele', 'Güzelyurt', 'Lefke'
  ];

  const categories = [
    'Elektrikçi', 'Tesisatçı', 'Boyacı', 'Marangoz', 'Kaportacı', 
    'Temizlik', 'Bahçıvan', 'Klimacı', 'İnşaat', 'Cam Ustası'
  ];

  React.useEffect(() => {
    // Fetch encrypted craftsmen from Supabase
    async function fetchCraftsmen() {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL || '',
        import.meta.env.VITE_SUPABASE_ANON_KEY || ''
      );
      const { data } = await supabase.from('profiles').select('*').eq('role', 'provider');
      let encryptionKey = localStorage.getItem('encryptionKey');
      if (!encryptionKey && user && (user.user_metadata?.role === 'admin' || user.user_metadata?.isSuperAdmin)) {
        const { data: settings } = await supabase.from('settings').select('x_secret').single();
        if (settings && settings.x_secret) encryptionKey = settings.x_secret;
      }
      const decrypted = await Promise.all((data || []).map(async (c: any) => {
        let phone = '';
        let email = '';
        let companyName = '';
        let companyDescription = '';
        let companyPhone = '';
        let companyAddress = '';
        let companyWebsite = '';
        if (encryptionKey && (user && (user.user_metadata?.role === 'admin' || user.user_metadata?.isSuperAdmin || user.id === c.id))) {
          phone = c.phone ? await decryptAES(c.phone, encryptionKey) : '';
          email = c.email;
          companyName = c.company_name ? await decryptAES(c.company_name, encryptionKey) : '';
          companyDescription = c.company_description ? await decryptAES(c.company_description, encryptionKey) : '';
          companyPhone = c.company_phone ? await decryptAES(c.company_phone, encryptionKey) : '';
          companyAddress = c.company_address ? await decryptAES(c.company_address, encryptionKey) : '';
          companyWebsite = c.company_website ? await decryptAES(c.company_website, encryptionKey) : '';
        } else {
          phone = c.phone ? maskPhone(c.phone) : '';
        }
        return {
          ...c,
          phone,
          email,
          companyName,
          companyDescription,
          companyPhone,
          companyAddress,
          companyWebsite,
        };
      }));
      setCraftsmen(decrypted);
    }
    fetchCraftsmen();
  }, [user]);

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
            <label htmlFor="city-select" className="sr-only">Şehir</label>
            <select 
              id="city-select"
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
            <label htmlFor="category-select" className="sr-only">Kategori</label>
            <select 
              id="category-select"
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
              {craftsman.phone && !craftsman.phone.includes('XXX') ? (
                <>
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
                </>
              ) : (
                <span className="flex-1 text-gray-400 text-center">Gizli</span>
              )}
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