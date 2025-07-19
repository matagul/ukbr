import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  AlertTriangle
} from 'lucide-react';
import { Document } from '../../types';
import toast from 'react-hot-toast';

interface DocumentManagementProps {
  documents: Document[];
  onApproveDocument: (documentId: string) => void;
  onRejectDocument: (documentId: string, reason: string) => void;
  onViewDocument: (documentId: string) => void;
}

const DocumentManagement: React.FC<DocumentManagementProps> = ({
  documents,
  onApproveDocument,
  onRejectDocument,
  onViewDocument
}) => {
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  const getDocumentTypeText = (type: string) => {
    switch (type) {
      case 'license':
        return 'Lisans';
      case 'certification':
        return 'Sertifika';
      case 'id':
        return 'Kimlik';
      default:
        return 'Diğer';
    }
  };

  const isExpiringSoon = (expiresAt?: Date) => {
    if (!expiresAt) return false;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiresAt?: Date) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const handleRejectSubmit = () => {
    if (!selectedDocument || !rejectionReason.trim()) {
      toast.error('Lütfen red sebebini belirtin');
      return;
    }

    onRejectDocument(selectedDocument.id, rejectionReason.trim());
    setRejectModalOpen(false);
    setSelectedDocument(null);
    setRejectionReason('');
    toast.success('Belge reddedildi');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Belge Yönetimi
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Belge
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Kullanıcı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Yükleme Tarihi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Son Geçerlilik
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {documents.map((document) => (
                <tr key={document.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {getDocumentTypeText(document.type)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {document.fileName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    Kullanıcı #{document.userId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(document.status)}
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(document.status)}`}>
                        {document.status === 'approved' ? 'Onaylı' : 
                         document.status === 'rejected' ? 'Reddedildi' : 'Bekliyor'}
                      </span>
                    </div>
                    {document.status === 'rejected' && document.rejectionReason && (
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {document.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(document.uploadedAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {document.expiresAt ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {new Date(document.expiresAt).toLocaleDateString('tr-TR')}
                        </span>
                        {isExpired(document.expiresAt) && (
                          <span title="Süresi dolmuş">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          </span>
                        )}
                        {isExpiringSoon(document.expiresAt) && !isExpired(document.expiresAt) && (
                          <span title="Süresi yakında dolacak">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">Süresiz</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onViewDocument(document.id)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Belgeyi Görüntüle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {document.status === 'pending' && (
                        <>
                          <button
                            onClick={() => onApproveDocument(document.id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Onayla"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDocument(document);
                              setRejectModalOpen(true);
                            }}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Reddet"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectModalOpen && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Belgeyi Reddet
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <strong>{getDocumentTypeText(selectedDocument.type)}</strong> belgesini neden reddediyorsunuz?
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  placeholder="Red sebebini detaylı olarak açıklayın..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleRejectSubmit}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Reddet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;