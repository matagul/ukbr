import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Briefcase, Mail, Phone, MapPin, Image, Globe, Edit2, Save, X } from 'lucide-react';
import { encryptAES } from '../utils/security';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  // Assume user metadata is in user.user_metadata
  const meta = user?.user_metadata || {};
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<any>({
    name: meta.name || '',
    phone: meta.phone || '',
    city: meta.city || '',
    category: meta.category || '',
    profileUrl: meta.profileUrl || '',
    bannerUrl: meta.bannerUrl || '',
    // Provider fields
    companyName: meta.companyName || '',
    companyDescription: meta.companyDescription || '',
    companyPhone: meta.companyPhone || '',
    companyAddress: meta.companyAddress || '',
    companyWebsite: meta.companyWebsite || '',
  });
  const role = meta.role || 'buyer';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    let encryptionKey = localStorage.getItem('encryptionKey');
    if (!encryptionKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          import.meta.env.VITE_SUPABASE_URL || '',
          import.meta.env.VITE_SUPABASE_ANON_KEY || ''
        );
        const { data } = await supabase.from('settings').select('x_secret').single();
        if (data && data.x_secret) encryptionKey = data.x_secret;
      } catch {}
    }
    if (!encryptionKey) {
      alert('Şifreleme anahtarı bulunamadı. Lütfen yöneticinize başvurun.');
      setEditMode(false);
      return;
    }
    let encryptedPhone = form.phone;
    let encryptedCompanyName = form.companyName;
    let encryptedCompanyDescription = form.companyDescription;
    let encryptedCompanyPhone = form.companyPhone;
    let encryptedCompanyAddress = form.companyAddress;
    let encryptedCompanyWebsite = form.companyWebsite;
    try {
      encryptedPhone = form.phone ? await encryptAES(form.phone, encryptionKey) : '';
      if (role === 'provider') {
        encryptedCompanyName = form.companyName ? await encryptAES(form.companyName, encryptionKey) : '';
        encryptedCompanyDescription = form.companyDescription ? await encryptAES(form.companyDescription, encryptionKey) : '';
        encryptedCompanyPhone = form.companyPhone ? await encryptAES(form.companyPhone, encryptionKey) : '';
        encryptedCompanyAddress = form.companyAddress ? await encryptAES(form.companyAddress, encryptionKey) : '';
        encryptedCompanyWebsite = form.companyWebsite ? await encryptAES(form.companyWebsite, encryptionKey) : '';
      }
    } catch (err) {
      alert('Şifreleme sırasında hata oluştu.');
      setEditMode(false);
      return;
    }
    // TODO: Save encrypted fields to Supabase (update user metadata)
    // Example:
    // await supabase.auth.updateUser({
    //   data: {
    //     ...form,
    //     phone: encryptedPhone,
    //     companyName: encryptedCompanyName,
    //     companyDescription: encryptedCompanyDescription,
    //     companyPhone: encryptedCompanyPhone,
    //     companyAddress: encryptedCompanyAddress,
    //     companyWebsite: encryptedCompanyWebsite,
    //   }
    // });
    setEditMode(false);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Profil</h2>
        <p>Profil bilgilerinizi görüntülemek için giriş yapmalısınız.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Banner */}
        <div className="relative h-48 bg-gradient-to-r from-red-600 to-sky-500 dark:from-gray-800 dark:to-gray-900">
          {form.bannerUrl && (
            <img src={form.bannerUrl} alt="Banner" className="object-cover w-full h-full" />
          )}
          <div className="absolute bottom-0 left-0 px-8 -mb-12 flex items-end gap-4">
            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-800 overflow-hidden flex items-center justify-center">
              {form.profileUrl ? (
                <img src={form.profileUrl} alt="Profil" className="object-cover w-full h-full" />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <div className="text-white drop-shadow-lg">
              <h2 className="text-2xl font-bold">{form.name}</h2>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="pt-16 pb-8 px-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Kişisel Bilgiler</h3>
            {!editMode ? (
              <button onClick={() => setEditMode(true)} className="flex items-center gap-1 text-sky-500 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 font-semibold">
                <Edit2 className="w-4 h-4" /> Düzenle
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditMode(false)} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-semibold">
                  <X className="w-4 h-4" /> İptal
                </button>
                <button onClick={handleSave} className="flex items-center gap-1 text-green-600 hover:text-green-800 font-semibold">
                  <Save className="w-4 h-4" /> Kaydet
                </button>
              </div>
            )}
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Ad Soyad</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} disabled={!editMode} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telefon</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} disabled={!editMode} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Şehir</label>
                <input type="text" name="city" value={form.city} onChange={handleChange} disabled={!editMode} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kategori</label>
                <input type="text" name="category" value={form.category} onChange={handleChange} disabled={!editMode} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Profil Fotoğrafı (URL)</label>
                <input type="url" name="profileUrl" value={form.profileUrl} onChange={handleChange} disabled={!editMode} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Banner (URL)</label>
                <input type="url" name="bannerUrl" value={form.bannerUrl} onChange={handleChange} disabled={!editMode} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:text-white" />
              </div>
            </div>
            {role === 'provider' && (
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5" /> Şirket Bilgileri</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Şirket Adı</label>
                    <input type="text" name="companyName" value={form.companyName} onChange={handleChange} disabled={!editMode} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Şirket Telefonu</label>
                    <input type="tel" name="companyPhone" value={form.companyPhone} onChange={handleChange} disabled={!editMode} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Adres</label>
                    <input type="text" name="companyAddress" value={form.companyAddress} onChange={handleChange} disabled={!editMode} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Web Sitesi</label>
                    <input type="url" name="companyWebsite" value={form.companyWebsite} onChange={handleChange} disabled={!editMode} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:text-white" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Açıklama</label>
                    <textarea name="companyDescription" value={form.companyDescription} onChange={handleChange} disabled={!editMode} rows={3} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-gray-700 dark:text-white" />
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 