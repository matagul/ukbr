import { APP_CONFIG } from '../config/constants';

// Enhanced encryption utilities with proper key management
class SecurityManager {
  private static instance: SecurityManager;
  private encryptionKey: string | null = null;
  private keyVersion: string = APP_CONFIG.security.encryptionKeyId;

  private constructor() {}

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  // Generate a secure encryption key
  async generateEncryptionKey(): Promise<string> {
    const key = new Uint8Array(32);
    window.crypto.getRandomValues(key);
    return btoa(String.fromCharCode(...key));
  }

  // Set encryption key (only for admin/setup)
  setEncryptionKey(key: string): void {
    this.encryptionKey = key;
    // Store in secure session storage for current session only
    sessionStorage.setItem(`enc_key_${this.keyVersion}`, key);
  }

  // Get encryption key
  private getEncryptionKey(): string {
    if (this.encryptionKey) return this.encryptionKey;
    
    const storedKey = sessionStorage.getItem(`enc_key_${this.keyVersion}`);
    if (storedKey) {
      this.encryptionKey = storedKey;
      return storedKey;
    }
    
    throw new Error('Encryption key not available');
  }

  // Enhanced AES-GCM encryption
  async encrypt(plainText: string): Promise<string> {
    if (!plainText) return '';
    
    try {
      const key = this.getEncryptionKey();
      const enc = new TextEncoder();
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        Uint8Array.from(atob(key), c => c.charCodeAt(0)),
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );
      
      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        enc.encode(plainText)
      );
      
      // Include version info for future key rotation
      const result = {
        v: this.keyVersion,
        iv: btoa(String.fromCharCode(...iv)),
        data: btoa(String.fromCharCode(...new Uint8Array(encrypted)))
      };
      
      return btoa(JSON.stringify(result));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Encryption failed');
    }
  }

  // Enhanced AES-GCM decryption
  async decrypt(cipherText: string): Promise<string> {
    if (!cipherText) return '';
    
    try {
      const key = this.getEncryptionKey();
      
      // Handle legacy format (backward compatibility)
      if (cipherText.includes(':')) {
        return this.decryptLegacy(cipherText, key);
      }
      
      const encryptedData = JSON.parse(atob(cipherText));
      const iv = Uint8Array.from(atob(encryptedData.iv), c => c.charCodeAt(0));
      const data = Uint8Array.from(atob(encryptedData.data), c => c.charCodeAt(0));
      
      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        Uint8Array.from(atob(key), c => c.charCodeAt(0)),
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );
      
      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        data
      );
      
      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Decryption failed');
    }
  }

  // Legacy decryption for backward compatibility
  private async decryptLegacy(cipherText: string, key: string): Promise<string> {
    const [ivB64, dataB64] = cipherText.split(':');
    const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
    const data = Uint8Array.from(atob(dataB64), c => c.charCodeAt(0));
    
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      Uint8Array.from(atob(key), c => c.charCodeAt(0)),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      data
    );
    
    return new TextDecoder().decode(decrypted);
  }

  // Hash password using Web Crypto API (PBKDF2)
  async hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
    const encoder = new TextEncoder();
    const saltBytes = salt ? 
      Uint8Array.from(atob(salt), c => c.charCodeAt(0)) : 
      window.crypto.getRandomValues(new Uint8Array(16));
    
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    
    const hashBuffer = await window.crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBytes,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );
    
    return {
      hash: btoa(String.fromCharCode(...new Uint8Array(hashBuffer))),
      salt: btoa(String.fromCharCode(...saltBytes))
    };
  }

  // Verify password
  async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    try {
      const { hash: newHash } = await this.hashPassword(password, salt);
      return newHash === hash;
    } catch (error) {
      console.error('Password verification failed:', error);
      return false;
    }
  }

  // Generate secure random token
  generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/[+/]/g, '')
      .substring(0, length);
  }

  // Validate password strength
  validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < APP_CONFIG.security.passwordMinLength) {
      errors.push(`Şifre en az ${APP_CONFIG.security.passwordMinLength} karakter olmalıdır`);
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Şifre en az bir büyük harf içermelidir');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Şifre en az bir küçük harf içermelidir');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Şifre en az bir rakam içermelidir');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Şifre en az bir özel karakter içermelidir');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Clear sensitive data from memory
  clearSensitiveData(): void {
    this.encryptionKey = null;
    sessionStorage.removeItem(`enc_key_${this.keyVersion}`);
  }
}

export const securityManager = SecurityManager.getInstance();

// Utility functions for backward compatibility
export const encryptAES = (plainText: string): Promise<string> => 
  securityManager.encrypt(plainText);

export const decryptAES = (cipherText: string): Promise<string> => 
  securityManager.decrypt(cipherText);

export const hashPassword = (password: string, salt?: string) => 
  securityManager.hashPassword(password, salt);

export const verifyPassword = (password: string, hash: string, salt: string) => 
  securityManager.verifyPassword(password, hash, salt);