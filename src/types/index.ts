export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: 'buyer' | 'provider' | 'admin';
  companyName?: string;
  companyDescription?: string;
  companyPhone?: string;
  companyAddress?: string;
  companyWebsite?: string;
  bannerUrl?: string;
  profileUrl?: string;
  isSuperAdmin?: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: Date;
}

export interface Document {
  id: string;
  userId: string;
  type: 'license' | 'certification' | 'id' | 'other';
  fileName: string;
  fileUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  expiresAt?: Date;
  rejectionReason?: string;
}

export interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  jobId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  isVerified: boolean;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  budget: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
  assignedTo?: string;
  reviews: Review[];
}

export interface Craftsman {
  id: string;
  name: string;
  phone: string;
  email?: string;
  description: string;
  experienceYears: number;
  city: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
  completedJobs: number;
  successRate: number;
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
  jobHistory: Job[];
}

export interface AdminAction {
  id: string;
  adminId: string;
  action: string;
  targetType: 'user' | 'job' | 'review' | 'document';
  targetId: string;
  details: string;
  timestamp: Date;
  ipAddress: string;
}