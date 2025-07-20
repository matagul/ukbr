import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { APP_CONFIG } from '../config/constants';
import { securityManager } from '../utils/security';

// Enhanced Supabase service with proper error handling and security
class SupabaseService {
  private static instance: SupabaseService;
  private client: SupabaseClient;
  private isInitialized: boolean = false;

  private constructor() {
    this.client = createClient(
      APP_CONFIG.supabase.url,
      APP_CONFIG.supabase.anonKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
        db: {
          schema: 'public',
        },
        global: {
          headers: {
            'X-Client-Info': `${APP_CONFIG.name}/${APP_CONFIG.version}`,
          },
        },
      }
    );
  }

  static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  // Initialize service and check connection
  async initialize(): Promise<boolean> {
    try {
      const { data, error } = await this.client
        .from('settings')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('Supabase connection failed:', error);
        return false;
      }
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Supabase initialization failed:', error);
      return false;
    }
  }

  // Check if setup is complete
  async isSetupComplete(): Promise<boolean> {
    try {
      const { data, error } = await this.client
        .from('settings')
        .select('setup_complete')
        .single();
      
      if (error) return false;
      return data?.setup_complete === true;
    } catch (error) {
      return false;
    }
  }

  // Get encryption key from settings (admin only)
  async getEncryptionKey(): Promise<string | null> {
    try {
      const { data, error } = await this.client
        .from('settings')
        .select('x_secret')
        .single();
      
      if (error || !data?.x_secret) return null;
      return data.x_secret;
    } catch (error) {
      console.error('Failed to get encryption key:', error);
      return null;
    }
  }

  // Save encryption key to settings
  async saveEncryptionKey(key: string): Promise<boolean> {
    try {
      const { error } = await this.client
        .from('settings')
        .upsert({ id: 1, x_secret: key });
      
      return !error;
    } catch (error) {
      console.error('Failed to save encryption key:', error);
      return false;
    }
  }

  // Enhanced user registration with proper password hashing
  async registerUser(userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: string;
    metadata?: any;
  }): Promise<{ success: boolean; error?: string; user?: any }> {
    try {
      // Hash password
      const { hash, salt } = await securityManager.hashPassword(userData.password);
      
      // Encrypt sensitive data if available
      let encryptedPhone = userData.phone;
      if (userData.phone) {
        try {
          encryptedPhone = await securityManager.encrypt(userData.phone);
        } catch (error) {
          console.warn('Phone encryption failed, storing as plain text');
        }
      }

      // Register with Supabase Auth
      const { data: authData, error: authError } = await this.client.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role,
            ...userData.metadata,
          },
        },
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      // Create profile record with encrypted data
      if (authData.user) {
        const { error: profileError } = await this.client
          .from('profiles')
          .insert({
            id: authData.user.id,
            name: userData.name,
            email: userData.email,
            phone: encryptedPhone,
            password_hash: hash,
            password_salt: salt,
            role: userData.role,
            ...userData.metadata,
          });

        if (profileError) {
          console.error('Profile creation failed:', profileError);
          // Note: Auth user is created but profile failed
          return { success: false, error: 'Profile oluşturulamadı' };
        }
      }

      return { success: true, user: authData.user };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: 'Kayıt işlemi başarısız' };
    }
  }

  // Enhanced login with proper password verification
  async loginUser(email: string, password: string): Promise<{ success: boolean; error?: string; user?: any }> {
    try {
      // First get user profile to verify password
      const { data: profile, error: profileError } = await this.client
        .from('profiles')
        .select('password_hash, password_salt, is_active')
        .eq('email', email)
        .single();

      if (profileError || !profile) {
        return { success: false, error: 'Kullanıcı bulunamadı' };
      }

      if (!profile.is_active) {
        return { success: false, error: 'Hesabınız deaktif durumda' };
      }

      // Verify password
      const isValidPassword = await securityManager.verifyPassword(
        password,
        profile.password_hash,
        profile.password_salt
      );

      if (!isValidPassword) {
        return { success: false, error: 'Geçersiz şifre' };
      }

      // Login with Supabase Auth
      const { data: authData, error: authError } = await this.client.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      return { success: true, user: authData.user };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Giriş işlemi başarısız' };
    }
  }

  // Get user profile with decrypted sensitive data
  async getUserProfile(userId: string): Promise<any> {
    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) return null;

      // Decrypt sensitive fields
      const decryptedData = { ...data };
      
      try {
        if (data.phone) {
          decryptedData.phone = await securityManager.decrypt(data.phone);
        }
        if (data.company_phone) {
          decryptedData.company_phone = await securityManager.decrypt(data.company_phone);
        }
        if (data.company_address) {
          decryptedData.company_address = await securityManager.decrypt(data.company_address);
        }
        // Add other encrypted fields as needed
      } catch (decryptError) {
        console.warn('Some fields could not be decrypted:', decryptError);
      }

      return decryptedData;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }

  // Update user profile with encryption
  async updateUserProfile(userId: string, updates: any): Promise<boolean> {
    try {
      const encryptedUpdates = { ...updates };
      
      // Encrypt sensitive fields
      if (updates.phone) {
        encryptedUpdates.phone = await securityManager.encrypt(updates.phone);
      }
      if (updates.company_phone) {
        encryptedUpdates.company_phone = await securityManager.encrypt(updates.company_phone);
      }
      if (updates.company_address) {
        encryptedUpdates.company_address = await securityManager.encrypt(updates.company_address);
      }

      const { error } = await this.client
        .from('profiles')
        .update(encryptedUpdates)
        .eq('id', userId);

      return !error;
    } catch (error) {
      console.error('Profile update failed:', error);
      return false;
    }
  }

  // Get settings with decrypted SMTP data
  async getSettings(): Promise<any> {
    try {
      const { data, error } = await this.client
        .from('settings')
        .select('*')
        .single();

      if (error || !data) return null;

      const decryptedData = { ...data };
      
      try {
        if (data.smtp_pass) {
          decryptedData.smtp_pass = await securityManager.decrypt(data.smtp_pass);
        }
      } catch (decryptError) {
        console.warn('SMTP password could not be decrypted');
      }

      return decryptedData;
    } catch (error) {
      console.error('Failed to get settings:', error);
      return null;
    }
  }

  // Update settings with encryption
  async updateSettings(settings: any): Promise<boolean> {
    try {
      const encryptedSettings = { ...settings };
      
      // Encrypt SMTP password
      if (settings.smtp_pass) {
        encryptedSettings.smtp_pass = await securityManager.encrypt(settings.smtp_pass);
      }

      const { error } = await this.client
        .from('settings')
        .upsert(encryptedSettings);

      return !error;
    } catch (error) {
      console.error('Settings update failed:', error);
      return false;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await this.client
        .from('settings')
        .select('id')
        .limit(1);
      
      return !error;
    } catch (error) {
      return false;
    }
  }
}

export const supabaseService = SupabaseService.getInstance();
export const supabase = supabaseService.getClient();