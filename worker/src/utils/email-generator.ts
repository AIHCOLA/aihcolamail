const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((byte) => CHARS[byte % CHARS.length])
    .join('');
}

export function generateEmailAddress(domain: string): string {
  const prefix = generateRandomString(12);
  return `${prefix}@${domain}`;
}
