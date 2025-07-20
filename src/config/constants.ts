// Application constants and configuration
export const APP_CONFIG = {
  name: 'KiProTek',
  fullName: 'Kıbrıs Profesyonel Teknoloji İş Gücü Platformu',
  domain: 'kiprotek.com',
  email: 'info@kiprotek.com',
  version: '2.0.0',
  description: 'KKTC\'nin en güvenilir profesyonel teknoloji iş gücü platformu',
  
  // Database
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  
  // Security
  security: {
    sessionTimeout: parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '3600000'),
    encryptionKeyId: import.meta.env.VITE_ENCRYPTION_KEY_ID || 'kiprotek_2025',
    passwordMinLength: 8,
    maxLoginAttempts: 5,
    lockoutDuration: 900000, // 15 minutes
  },
  
  // SMTP (values will be encrypted in database)
  smtp: {
    host: import.meta.env.VITE_SMTP_HOST,
    port: parseInt(import.meta.env.VITE_SMTP_PORT || '465'),
    secure: import.meta.env.VITE_SMTP_SECURE === 'true',
  },
  
  // UI
  ui: {
    itemsPerPage: 12,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  
  // Features
  features: {
    enableRegistration: true,
    enableSocialLogin: true,
    enableEmailVerification: true,
    enableTwoFactor: false,
    enableFileUploads: true,
  }
} as const;

export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  PROFILE: '/profile',
  ADMIN: '/admin',
  SETUP: '/setup',
  CRAFTSMEN: '/ustalar',
  JOBS: '/is-ilanlari',
  JOB_CREATE: '/is-ilan-ver',
  ABOUT: '/hakkimizda',
  CONTACT: '/iletisim',
  COMPANY: '/company',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
  },
  USERS: {
    PROFILE: '/api/users/profile',
    UPDATE: '/api/users/update',
    DELETE: '/api/users/delete',
  },
  ADMIN: {
    USERS: '/api/admin/users',
    SETTINGS: '/api/admin/settings',
    STATS: '/api/admin/stats',
  },
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Ağ bağlantısı hatası. Lütfen tekrar deneyin.',
  UNAUTHORIZED: 'Bu işlem için yetkiniz bulunmamaktadır.',
  VALIDATION_ERROR: 'Girilen bilgiler geçersiz.',
  SERVER_ERROR: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
  NOT_FOUND: 'Aradığınız sayfa bulunamadı.',
  SETUP_REQUIRED: 'Sistem kurulumu gerekli.',
} as const;

export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profil bilgileriniz başarıyla güncellendi.',
  PASSWORD_CHANGED: 'Şifreniz başarıyla değiştirildi.',
  EMAIL_SENT: 'E-posta başarıyla gönderildi.',
  SETUP_COMPLETE: 'Sistem kurulumu başarıyla tamamlandı.',
} as const;