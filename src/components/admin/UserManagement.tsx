import React, { useState } from 'react';
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

interface UserManagementProps {
  users: User[];
  onBanUser: (userId: string, banLevel: string, reason: string, duration?: number) => void;
  onUnbanUser: (userId: string) => void;
  onDeleteUserJobs: (userId: string) => void;
  onViewUserActivity: (userId: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({
  users,
  onBanUser,
  onUnbanUser,
  onDeleteUserJobs,
  onViewUserActivity
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banLevel, setBanLevel] = useState<'warning' | 'temporary' | 'permanent'>('warning');
  const [banDuration, setBanDuration] = useState(7);

  const handleBanSubmit = () => {
    if (!selectedUser || !banReason.trim()) {
      toast.error('Lütfen ban sebebini belirtin');
      return;
    }

    onBanUser(
      selectedUser.id, 
      banLevel, 
      banReason.trim(), 
      banLevel === 'temporary' ? banDuration : undefined
    );
    
    setBanModalOpen(false);
    setSelectedUser(null);
    setBanReason('');
    toast.success('Kullanıcı işlemi başarıyla uygulandı');
  };

  const getBanLevelColor = (level: string) => {
    switch (level) {
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'temporary':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'permanent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  const getBanLevelText = (level: string) => {
    switch (level) {
      case 'warning':
        return 'Uyarı';
      case 'temporary':
        return 'Geçici Ban';
      case 'permanent':
        return 'Kalıcı Ban';
      default:
        return 'Aktif';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6" />
            Kullanıcı Yönetimi
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Kullanıcı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  İletişim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Konum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Son Giriş
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.category}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{user.phone}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {user.city}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getBanLevelColor(user.banLevel)}`}>
                      {getBanLevelText(user.banLevel)}
                    </span>
                    {user.banLevel === 'temporary' && user.banExpiresAt && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(user.banExpiresAt).toLocaleDateString('tr-TR')} tarihine kadar
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.lastLoginAt 
                      ? new Date(user.lastLoginAt).toLocaleDateString('tr-TR')
                      : 'Hiç giriş yapmamış'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onViewUserActivity(user.id)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Aktivite Geçmişi"
                      >
                        <Activity className="w-4 h-4" />
                      </button>
                      
                      {user.banLevel === 'none' ? (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setBanModalOpen(true);
                          }}
                          className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                          title="Kullanıcıyı Banla"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onUnbanUser(user.id)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Ban Kaldır"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          if (confirm('Bu kullanıcının tüm iş ilanlarını silmek istediğinizden emin misiniz?')) {
                            onDeleteUserJobs(user.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Kullanıcının İlanlarını Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ban Modal */}
      {banModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Kullanıcı İşlemi: {selectedUser.name}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  İşlem Türü
                </label>
                <select
                  value={banLevel}
                  onChange={(e) => setBanLevel(e.target.value as any)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="warning">Uyarı Ver</option>
                  <option value="temporary">Geçici Ban</option>
                  <option value="permanent">Kalıcı Ban</option>
                </select>
              </div>

              {banLevel === 'temporary' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ban Süresi (Gün)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={banDuration}
                    onChange={(e) => setBanDuration(parseInt(e.target.value))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sebep *
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  rows={3}
                  placeholder="İşlem sebebini detaylı olarak açıklayın..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => setBanModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleBanSubmit}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Uygula
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;