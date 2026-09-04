// import crypto from 'crypto';
// import config from '../config';

// const getKey = (): Buffer => {
//   if (!config.profileCardSecret) {
//     throw new Error('Profile card secret is not configured');
//   }
//   return crypto.createHash('sha256').update(config.profileCardSecret).digest();
// };

// export const encryptProfileCard = (payload: object): string => {
//   const key = getKey();
//   const iv = crypto.randomBytes(12); // GCM uses 12-byte IV
//   const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

//   const jsonPayload = JSON.stringify(payload);
//   const encrypted = Buffer.concat([
//     cipher.update(jsonPayload, 'utf8'),
//     cipher.final(),
//   ]);

//   const authTag = cipher.getAuthTag(); // GCM authentication tag

//   // Format: iv:authTag:encryptedData (all hex)
//   return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
// };

// export const decryptProfileCard = (encryptedString: string): object => {
//   try {
//     const [ivHex, authTagHex, encryptedDataHex] = encryptedString.split(':');

//     if (!ivHex || !authTagHex || !encryptedDataHex) {
//       throw new Error('Invalid format');
//     }

//     const key = getKey();
//     const iv = Buffer.from(ivHex, 'hex');
//     const authTag = Buffer.from(authTagHex, 'hex');
//     const encryptedData = Buffer.from(encryptedDataHex, 'hex');

//     const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
//     decipher.setAuthTag(authTag); // GCM verifies authenticity automatically

//     const decrypted = Buffer.concat([
//       decipher.update(encryptedData),
//       decipher.final(), // throws if tampered
//     ]);

//     return JSON.parse(decrypted.toString('utf8')) as object;
//   } catch {
//     throw new Error('Invalid or corrupted profile card data');
//   }
// };
