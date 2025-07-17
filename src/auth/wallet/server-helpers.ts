'use server';
import crypto from 'crypto';

// Move the hashNonce function here - MUST be async with 'use server'
export const hashNonce = async ({ nonce }: { nonce: string }) => {
  const HMAC_SECRET_KEY = process.env.HMAC_SECRET_KEY;
  
  if (!HMAC_SECRET_KEY) {
    throw new Error('HMAC_SECRET_KEY not found in environment variables');
  }
  
  const hmac = crypto.createHmac('sha256', HMAC_SECRET_KEY);
  hmac.update(nonce);
  return hmac.digest('hex');
};

export const getNewNonces = async () => {
  const nonce = crypto.randomUUID().replace(/-/g, '');
  const signedNonce = await hashNonce({ nonce }); // Now await since it's async
  return {
    nonce,
    signedNonce,
  };
};