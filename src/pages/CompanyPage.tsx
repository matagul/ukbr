import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Briefcase, Mail, Phone, MapPin, Globe, Image } from 'lucide-react';
import { decryptAES } from '../utils/encryption';
import { useAuth } from '../contexts/AuthContext';

function maskPhone(phone: string) {
  if (!phone) return '';
  return phone.replace(/(\d{3})\s?(\d{3})\s?(\d{2})\s?(\d{2})$/, '+90 XXX XXX XX $4');
}

const CompanyPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    async function fetchCompany() {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL || '',
        import.meta.env.VITE_SUPABASE_ANON_KEY || ''
      );
      const { data } = await supabase.from('profiles').select('*').eq('company_slug', slug).single();
      let encryptionKey = localStorage.getItem('encryptionKey');
      if (!encryptionKey && user && (user.user_metadata?.role === 'admin' || user.user_metadata?.isSuperAdmin)) {
        const { data: settings } = await supabase.from('settings').select('x_secret').single();
        if (settings && settings.x_secret) encryptionKey = settings.x_secret;
      }
      let phone = '';
      let email = '';
      let address = '';
      let website = '';
      let description = '';
      if (data) {
        if (encryptionKey && (user && (user.user_metadata?.role === 'admin' || user.user_metadata?.isSuperAdmin || user.id === data.id))) {
          phone = data.company_phone ? await decryptAES(data.company_phone, encryptionKey) : '';
          email = data.email;
          address = data.company_address ? await decryptAES(data.company_address, encryptionKey) : '';
          website = data.company_website ? await decryptAES(data.company_website, encryptionKey) : '';
          description = data.company_description ? await decryptAES(data.company_description, encryptionKey) : '';
        } else {
          phone = data.company_phone ? maskPhone(data.company_phone) : '';
        }
        setCompany({
          name: data.company_name,
          bannerUrl: data.banner_url,
          logoUrl: data.profile_url,
          phone,
          email,
          address,
          website,
          description,
        });
      } else {
        setCompany(null);
      }
      setLoading(false);
    }
    fetchCompany();
  }, [slug, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-700 dark:text-gray-200">Yükleniyor...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-700 dark:text-gray-200">Şirket bulunamadı.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Banner */}
        <div className="relative h-48 bg-gradient-to-r from-red-600 to-sky-500 dark:from-gray-800 dark:to-gray-900">
          {company.bannerUrl && (
            <img src={company.bannerUrl} alt="Banner" className="object-cover w-full h-full" />
          )}
          <div className="absolute bottom-0 left-0 px-8 -mb-12 flex items-end gap-4">
            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-800 overflow-hidden flex items-center justify-center">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt="Logo" className="object-cover w-full h-full" />
              ) : (
                <Briefcase className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <div className="text-white drop-shadow-lg">
              <h2 className="text-2xl font-bold">{company.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4" />
                <span>{company.address && !company.phone.includes('XXX') ? company.address : 'Gizli'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="pt-16 pb-8 px-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Briefcase className="w-5 h-5" /> Şirket Bilgileri
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-500" />
                <span>{company.phone && !company.phone.includes('XXX') ? company.phone : 'Gizli'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-500" />
                <span>{company.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-500" />
                {company.website && !company.phone.includes('XXX') ? (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline dark:text-sky-400">{company.website}</a>
                ) : (
                  <span>Gizli</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-500" />
                <span>{company.address && !company.phone.includes('XXX') ? company.address : 'Gizli'}</span>
              </div>
            </div>
          </div>
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Açıklama</h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{company.description}</p>
          </div>
          {/* Optionally, jobs or reviews can be shown here */}
        </div>
      </div>
    </div>
  );
};

export default CompanyPage; 