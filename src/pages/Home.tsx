import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Users, Clock, Shield } from 'lucide-react';

const Home = () => {
  const recentJobs = [
    {
      id: 1,
      title: "Ev Elektrik Tesisatı Tamiratı",
      description: "Evimizde elektrik kesintisi sorunu yaşıyoruz. Pano kontrolü ve gerekli tamiratin yapılması gerekiyor.",
      city: "Lefkoşa",
      category: "Elektrikçi",
      budget: "500-1000 TL",
      phone: "+90 392 555 02 02"
    },
    {
      id: 2,
      title: "Banyo Tesisatı Tamiri",
      description: "Banyo lavabosunda sızıntı var. Acil müdahale gerekiyor.",
      city: "Girne",
      category: "Tesisatçı",
      budget: "300-500 TL",
      phone: "+90 392 555 03 03"
    },
    {
      id: 3,
      title: "Ev Boyası İşi",
      description: "2+1 daire iç cephe boyası yapılacak. Malzeme dahil.",
      city: "Gazimağusa",
      category: "Boyacı",
      budget: "1500-2000 TL",
      phone: "+90 392 555 04 04"
    }
  ];

  const featuredCraftsmen = [
    {
      id: 1,
      name: "Mehmet Öztürk",
      category: "Elektrikçi",
      city: "Lefkoşa",
      experience: 15,
      description: "15 yıllık deneyimim ile elektrik tesisatı, aydınlatma ve pano işleri yapıyorum.",
      phone: "+90 392 555 01 01"
    },
    {
      id: 2,
      name: "Ali Kaya",
      category: "Tesisatçı",
      city: "Girne",
      experience: 10,
      description: "Su tesisatı, kalorifer ve klima montajı konularında uzmanım.",
      phone: "+90 392 555 05 05"
    },
    {
      id: 3,
      name: "Hasan Demir",
      category: "Boyacı",
      city: "Gazimağusa",
      experience: 8,
      description: "İç ve dış cephe boyası, dekoratif boyama işleri yapıyorum.",
      phone: "+90 392 555 06 06"
    }
  ];

  return (
    <div className="dark:bg-gray-900 min-h-screen transition-colors">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-red-600 to-red-700 text-white py-16 dark:from-gray-900 dark:to-gray-800 dark:text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            KKTC'nin En Güvenilir Usta Platformu
          </h1>
          <p className="text-xl mb-8">
            Kaliteli usta bul, güvenli iş al. Kıbrıs'ta işin doğru adresi!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/ustalar" 
              className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            >
              <Search className="mr-2 w-5 h-5" />
              Usta Ara
            </Link>
            <Link 
              to="/is-ilan-ver" 
              className="bg-sky-400 text-white px-8 py-3 rounded-lg font-semibold hover:bg-sky-500 transition-colors inline-flex items-center justify-center dark:bg-sky-600 dark:hover:bg-sky-700"
            >
              <Plus className="mr-2 w-5 h-5" />
              İş İlanı Ver
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-md p-6 text-center dark:bg-gray-800">
            <div className="bg-red-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-sky-500">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-white">Güvenilir Ustalar</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Deneyimli ve güvenilir ustalarla çalışın. Kalite garantili hizmet.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center dark:bg-gray-800">
            <div className="bg-sky-400 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-sky-600">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-white">Hızlı Eşleşme</h3>
            <p className="text-gray-600 dark:text-gray-400">
              İhtiyacınıza uygun ustayı hızlıca bulun. Zaman kaybetmeyin.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center dark:bg-gray-800">
            <div className="bg-gray-800 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-gray-900">
              <Shield className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-white">Güvenli İletişim</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Güvenli WhatsApp iletişimi. Kişisel verileriniz korunur.
            </p>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Son İş İlanları</h2>
            <Link to="/is-ilanlari" className="text-red-600 hover:text-red-700 transition-colors dark:text-sky-400 dark:hover:text-sky-500">
              Tümünü Gör →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow dark:bg-gray-800">
                <h3 className="text-lg font-semibold mb-2 dark:text-white">{job.title}</h3>
                <p className="text-gray-600 mb-3 dark:text-gray-400">{job.description.substring(0, 100)}...</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4 dark:text-gray-400">
                  <span>{job.city}</span>
                  <span>{job.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-red-600 font-semibold dark:text-sky-400">{job.budget}</span>
                  <a 
                    href={`https://wa.me/${job.phone.replace(/\s/g, '').replace('+', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors dark:bg-green-600 dark:hover:bg-green-700"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Craftsmen */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Öne Çıkan Ustalar</h2>
            <Link to="/ustalar" className="text-red-600 hover:text-red-700 transition-colors dark:text-sky-400 dark:hover:text-sky-500">
              Tümünü Gör →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCraftsmen.map((craftsman) => (
              <div key={craftsman.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow dark:bg-gray-800">
                <div className="flex items-center mb-4">
                  <div className="bg-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center mr-3 dark:bg-sky-500">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold dark:text-white">{craftsman.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{craftsman.category}</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-3 dark:text-gray-400">{craftsman.description.substring(0, 100)}...</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4 dark:text-gray-400">
                  <span>{craftsman.city}</span>
                  <span>{craftsman.experience} yıl</span>
                </div>
                <a 
                  href={`https://wa.me/${craftsman.phone.replace(/\s/g, '').replace('+', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors block text-center dark:bg-sky-500 dark:hover:bg-sky-600"
                >
                  İletişim
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-sky-400 to-sky-500 text-white py-12 rounded-lg dark:from-gray-800 dark:to-gray-900 dark:text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Hemen Başlayın!</h2>
            <p className="text-xl mb-6">
              Ustanızı bulun veya iş ilanı vererek doğru kişiye ulaşın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/usta-kayit" 
                className="bg-white text-sky-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
              >
                Usta Olarak Kayıt Ol
              </Link>
              <Link 
                to="/is-ilan-ver" 
                className="bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors dark:bg-sky-600 dark:hover:bg-sky-700"
              >
                İş İlanı Ver
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;