import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Tag, Plus } from 'lucide-react';
import { decryptAES } from '../utils/encryption';
import { useAuth } from '../contexts/AuthContext';

function maskPhone(phone: string) {
  if (!phone) return '';
  return phone.replace(/(\d{3})\s?(\d{3})\s?(\d{2})\s?(\d{2})$/, '+90 XXX XXX XX $4');
}

const Jobs = () => {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);

  const cities = [
    'Lefkoşa', 'Girne', 'Gazimağusa', 'İskele', 'Güzelyurt', 'Lefke'
  ];

  const categories = [
    'Elektrikçi', 'Tesisatçı', 'Boyacı', 'Marangoz', 'Kaportacı', 
    'Temizlik', 'Bahçıvan', 'Klimacı', 'İnşaat', 'Cam Ustası'
  ];

  React.useEffect(() => {
    // Fetch encrypted jobs from Supabase
    async function fetchJobs() {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL || '',
        import.meta.env.VITE_SUPABASE_ANON_KEY || ''
      );
      const { data } = await supabase.from('jobs').select('*');
      let encryptionKey = localStorage.getItem('encryptionKey');
      if (!encryptionKey && user && (user.user_metadata?.role === 'admin' || user.user_metadata?.isSuperAdmin)) {
        const { data: settings } = await supabase.from('settings').select('x_secret').single();
        if (settings && settings.x_secret) encryptionKey = settings.x_secret;
      }
      const decrypted = await Promise.all((data || []).map(async (j: any) => {
        let contactPhone = '';
        let contactEmail = '';
        if (encryptionKey && (user && (user.user_metadata?.role === 'admin' || user.user_metadata?.isSuperAdmin || user.id === j.created_by))) {
          contactPhone = j.contact_phone ? await decryptAES(j.contact_phone, encryptionKey) : '';
          contactEmail = j.contact_email ? await decryptAES(j.contact_email, encryptionKey) : '';
        } else {
          contactPhone = j.contact_phone ? maskPhone(j.contact_phone) : '';
        }
        return {
          ...j,
          contactPhone,
          contactEmail,
        };
      }));
      setJobs(decrypted);
    }
    fetchJobs();
  }, [user]);

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
            <label htmlFor="city-select" className="sr-only">Şehir</label>
            <select 
              id="city-select"
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
            <label htmlFor="category-select" className="sr-only">Kategori</label>
            <select 
              id="category-select"
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
              {job.contactPhone && !job.contactPhone.includes('XXX') ? (
                <>
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
                </>
              ) : (
                <span className="flex-1 text-gray-400 text-center">Gizli</span>
              )}
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