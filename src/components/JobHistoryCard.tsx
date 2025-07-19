import React from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Star } from 'lucide-react';
import { Job } from '../types';

interface JobHistoryCardProps {
  job: Job;
  showReviewButton?: boolean;
  onReview?: (jobId: string) => void;
}

const JobHistoryCard: React.FC<JobHistoryCardProps> = ({ 
  job, 
  showReviewButton = false, 
  onReview 
}) => {
  const getStatusIcon = () => {
    switch (job.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'active':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    switch (job.status) {
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      case 'active':
        return 'Devam Ediyor';
      case 'approved':
        return 'Onaylandı';
      default:
        return 'Bekliyor';
    }
  };

  const getStatusColor = () => {
    switch (job.status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {job.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
            {job.description.length > 100 
              ? `${job.description.substring(0, 100)}...` 
              : job.description
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>{new Date(job.createdAt).toLocaleDateString('tr-TR')}</span>
        </div>
        <div>
          <span className="font-medium">Bütçe: </span>
          {job.budget || 'Belirtilmemiş'}
        </div>
        <div>
          <span className="font-medium">Şehir: </span>
          {job.city}
        </div>
        <div>
          <span className="font-medium">Kategori: </span>
          {job.category}
        </div>
      </div>

      {job.reviews && job.reviews.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Değerlendirmeler ({job.reviews.length})
            </span>
          </div>
          {job.reviews.slice(0, 2).map((review) => (
            <div key={review.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${
                        star <= review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}

      {showReviewButton && job.status === 'completed' && onReview && (
        <button
          onClick={() => onReview(job.id)}
          className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
        >
          <Star className="w-4 h-4" />
          Değerlendir
        </button>
      )}
    </div>
  );
};

export default JobHistoryCard;
</parameter>