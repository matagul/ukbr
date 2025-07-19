import React, { useState } from 'react';
import { Send } from 'lucide-react';

const JobCreate = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    city: '',
    category: '',
    budget: ''
  });

  const cities = [
    'Lefkoşa', 'Girne', 'Gazimağusa', 'İskele', 'Güzelyurt', 'Lefke'
  ];

  const categories = [
    'Elektrikçi', 'Tesisatçı', 'Boyacı', 'Marangoz', 'Kaportacı', 
    'Temizlik', 'Bahçıvan', 'Klimacı', 'İnşaat', 'Cam Ustası'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Job posted:', formData);
    alert('İş ilanınız başarıyla gönderildi! Admin onayından sonra yayınlanacaktır.');
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      city: '',
      category: '',
      budget: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">İş İlanı Ver</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                İş Başlığı *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                placeholder="Örn: Banyo Tamiratı, Boyacı Aranıyor..."
                value={formData.title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                İş Açıklaması *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                placeholder="İş detaylarını, beklentilerinizi ve özel notları yazın..."
                value={formData.description}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div>
              <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
                İletişim Kişisi *
              </label>
              <input
                type="text"
                id="contactName"
                name="contactName"
                required
                value={formData.contactName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                Telefon Numarası *
              </label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                required
                placeholder="+90 392 XXX XX XX"
                value={formData.contactPhone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                E-posta (Opsiyonel)
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                Şehir *
              </label>
              <select
                id="city"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Şehir Seçin</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Kategori *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Kategori Seçin</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                Bütçe (Opsiyonel)
              </label>
              <input
                type="text"
                id="budget"
                name="budget"
                placeholder="Örn: 1000-2000 TL, Görüşülür..."
                value={formData.budget}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Bilgi</h3>
              <p className="text-sm text-blue-700">
                İlanınız yayınlanmadan önce admin kontrolünden geçecektir. Onaylandıktan sonra aktif olacaktır.
              </p>
            </div>
            
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <Send className="mr-2 w-5 h-5" />
                İlan Ver
              </button>
              <button
                type="button"
                onClick={() => window.history.back()}
                className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobCreate;