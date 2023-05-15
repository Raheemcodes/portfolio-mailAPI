import crypto from 'crypto';
import { EncryptedData } from '../middleware/mail';

const { ALGO, SECRET_KEY } = process.env;

const key = Buffer.alloc(32); // Create a new 32-byte buffer
key.write(SECRET_KEY!);

export const encrypt = (text: string): EncryptedData => {
  const iv = crypto.randomBytes(16); // Generate a random initialization vector (IV) of 16 bytes
  const cipher = crypto.createCipheriv(ALGO!, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), encryptedToken: encrypted };
};

export const decrypt = (encryptedToken: string, iv: string): string => {
  const decipher = crypto.createDecipheriv(ALGO!, key, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encryptedToken, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
