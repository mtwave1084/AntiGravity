import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// In a real app, this should be in .env. For this local MVP, we'll use a fixed key derived from a string.
// If .env has SECRET_KEY, use it, otherwise fallback.
const SECRET_KEY = process.env.AUTH_SECRET || 'default-secret-key-for-local-dev-only-32chars';
const IV_LENGTH = 16;

function getKey() {
    return crypto.createHash('sha256').update(String(SECRET_KEY)).digest('base64').substr(0, 32);
}

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(getKey()), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(getKey()), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
