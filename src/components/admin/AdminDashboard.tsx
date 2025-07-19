import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  Briefcase, 
  FileText, 
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import UserManagement from './UserManagement';
import DocumentManagement from './DocumentManagement';
import { User, Document, AdminAction } from '../../types';

interface AdminDashboardProps {
  users: User[];
  documents: Document[];
  adminActions: AdminAction[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  documents,
  adminActions
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'documents' | 'reports'>('overview');

  // Mock data for demonstration
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    bannedUsers: users.filter(u => u.banLevel !== 'none').length,
    pendingDocuments: documents.filter(d => d.status === 'pending').length,
    approvedDocuments: documents.filter(d => d.status === 'approved').length,
    rejectedDocuments: documents.filter(d => d.status === 'rejected').length,
    totalJobs: 156,
    activeJobs: 89,
    completedJobs: 67
  };

  const handleBanUser = (userId: string, banLevel: string, reason: string, duration?: number) => {
    console.log('Banning user:', { userId, banLevel, reason, duration });
    // Implementation would update user status in backend
  };

  const handleUnbanUser = (userId: string) => {
    console.log('Unbanning user:', userId);
    // Implementation would remove ban from user
  };

  const handleDeleteUserJobs = (userId: string) => {
    console.log('Deleting user jobs:', userId);
    // Implementation would delete all jobs for user
  };

  const handleViewUserActivity = (userId: string) => {
    console.log('Viewing user activity:', userId);
    // Implementation would show user activity modal
  };

  const handleApproveDocument = (documentId: string) => {
    console.log('Approving document:', documentId);
    // Implementation would approve document
  };

  const handleRejectDocument = (documentId: string, reason: string) => {
    console.log('Rejecting document:', { documentId, reason });
    // Implementation would reject document with reason
  };

  const handleViewDocument = (documentId: string) => {
    console.log('Viewing document:', documentId);
    // Implementation would open document viewer
  };

  const tabs = [
    { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
    { id: 'users', label: 'Kullanıcı Yönetimi', icon: Users },
    { id: 'documents', label: 'Belge Yönetimi', icon: FileText },
    { id: 'reports', label: 'Raporlar', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              UstaKıbrıs Yönetim Paneli
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-red-500 text-red-600 dark:text-red-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Kullanıcı</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aktif İş İlanı</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeJobs}</p>
                  </div>
                  <Briefcase className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bekleyen Belge</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pendingDocuments}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Banlı Kullanıcı</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.bannedUsers}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Son Admin İşlemleri
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {adminActions.slice(0, 5).map((action) => (
                    <div key={action.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {action.action}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {action.details} • {new Date(action.timestamp).toLocaleString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <UserManagement
            users={users}
            onBanUser={handleBanUser}
            onUnbanUser={handleUnbanUser}
            onDeleteUserJobs={handleDeleteUserJobs}
            onViewUserActivity={handleViewUserActivity}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentManagement
            documents={documents}
            onApproveDocument={handleApproveDocument}
            onRejectDocument={handleRejectDocument}
            onViewDocument={handleViewDocument}
          />
        )}

        {activeTab === 'reports' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Platform Raporları
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Detaylı raporlama özellikleri yakında eklenecek...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;