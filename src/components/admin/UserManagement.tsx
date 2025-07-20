import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Ban, 
  AlertTriangle, 
  Clock, 
  Shield, 
  Eye, 
  Trash2,
  FileText,
  Activity
} from 'lucide-react';
import { User, AdminAction } from '../../types';
import toast from 'react-hot-toast';
import { decryptAES } from '../../utils/security';
import { useAuth } from '../../contexts/AuthContext';

interface UserManagementProps {
  users: User[];
  onDeleteUser: (userId: string) => void;
  onViewUser: (userId: string) => void;
}

function maskPhone(phone: string) {
  if (!phone) return '';
  return phone.replace(/(\d{3})\s?(\d{3})\s?(\d{2})\s?(\d{2})$/, '+90 XXX XXX XX $4');
}

const UserManagement: React.FC<UserManagementProps> = ({
  users,
  onDeleteUser,
  onViewUser
}) => {
  const { user } = useAuth();
  const [decryptedUsers, setDecryptedUsers] = useState<any[]>([]);

  useEffect(() => {
    async function decryptUsers() {
      let encryptionKey = localStorage.getItem('encryptionKey');
      if (!encryptionKey && user && (user.user_metadata?.role === 'admin' || user.user_metadata?.isSuperAdmin)) {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          import.meta.env.VITE_SUPABASE_URL || '',
          import.meta.env.VITE_SUPABASE_ANON_KEY || ''
        );
        const { data: settings } = await supabase.from('settings').select('x_secret').single();
        if (settings && settings.x_secret) encryptionKey = settings.x_secret;
      }
      const result = await Promise.all(users.map(async (u) => {
        let phone = u.phone;
        let companyName = u.companyName;
        if (encryptionKey && (user && (user.user_metadata?.role === 'admin' || user.user_metadata?.isSuperAdmin))) {
          phone = u.phone ? await decryptAES(u.phone, encryptionKey) : '';
          companyName = u.companyName ? await decryptAES(u.companyName, encryptionKey) : '';
        } else {
          phone = u.phone ? maskPhone(u.phone) : '';
        }
        return { ...u, phone, companyName };
      }));
      setDecryptedUsers(result);
    }
    decryptUsers();
  }, [users, user]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            Kullanıcı Yönetimi
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ad Soyad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">E-posta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Telefon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Şirket</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {decryptedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.companyName}</td>
                  <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                    <button onClick={() => onViewUser(user.id)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">Görüntüle</button>
                    <button onClick={() => onDeleteUser(user.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Sil</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;