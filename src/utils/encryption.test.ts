// Jest test file for encryption utilities
// To run: npm install --save-dev jest @types/jest ts-jest
// Add to package.json: "test": "jest"
import { encryptAES, decryptAES } from './encryption';
import { describe, it, expect } from '@jest/globals';

describe('AES Encryption Utility', () => {
  const key = btoa('12345678901234567890123456789012'); // 32 bytes

  it('should encrypt and decrypt a string', async () => {
    const plain = 'hello world';
    const encrypted = await encryptAES(plain, key);
    const decrypted = await decryptAES(encrypted, key);
    expect(decrypted).toBe(plain);
  });

  it('should fail to decrypt with wrong key', async () => {
    const plain = 'secret';
    const encrypted = await encryptAES(plain, key);
    await expect(decryptAES(encrypted, btoa('wrongkeywrongkeywrongkeywrongkey'))).rejects.toThrow();
  });

  it('should handle empty string', async () => {
    const encrypted = await encryptAES('', key);
    const decrypted = await decryptAES(encrypted, key);
    expect(decrypted).toBe('');
  });

  it('should handle unicode', async () => {
    const plain = 'şçöğüİı漢字';
    const encrypted = await encryptAES(plain, key);
    const decrypted = await decryptAES(encrypted, key);
    expect(decrypted).toBe(plain);
  });

  it('should throw on malformed data', async () => {
    await expect(decryptAES('not:base64', key)).rejects.toThrow();
  });
}); 