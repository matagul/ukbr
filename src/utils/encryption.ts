// AES-GCM encryption/decryption using Web Crypto API

// Helper to decode base64 to Uint8Array
function base64ToBytes(b64: string) {
  const binary = atob(b64);
  return Uint8Array.from([...binary].map(char => char.charCodeAt(0)));
}

export async function encryptAES(plainText: string, key: string): Promise<string> {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw', base64ToBytes(key), { name: 'AES-GCM' }, false, ['encrypt']
  );
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, cryptoKey, enc.encode(plainText)
  );
  return `${btoa(String.fromCharCode(...iv))}:${btoa(String.fromCharCode(...new Uint8Array(encrypted)))}`;
}

export async function decryptAES(cipherText: string, key: string): Promise<string> {
  if (!cipherText || !key) return '';
  const [ivB64, dataB64] = cipherText.split(':');
  const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
  const data = Uint8Array.from(atob(dataB64), c => c.charCodeAt(0));
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw', base64ToBytes(key), { name: 'AES-GCM' }, false, ['decrypt']
  );
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv }, cryptoKey, data
  );
  return new TextDecoder().decode(decrypted);
} 