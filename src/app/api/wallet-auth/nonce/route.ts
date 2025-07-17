import { NextResponse } from 'next/server';
import crypto from 'crypto';

const hashNonce = (nonce: string, secret: string): string => {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(nonce);
  return hmac.digest('hex');
};

export async function GET() {
  try {
    // Get secret from environment variable
    const HMAC_SECRET_KEY = process.env.HMAC_SECRET_KEY;
    
    if (!HMAC_SECRET_KEY) {
      throw new Error('HMAC_SECRET_KEY not found in environment variables');
    }
    
    // Generate nonce
    const nonce = crypto.randomUUID().replace(/-/g, '');
    const signedNonce = hashNonce(nonce, HMAC_SECRET_KEY);
    
    return NextResponse.json({
      nonce,
      signedNonce,
    });
  } catch (error) {
    console.error('Nonce generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate nonce' },
      { status: 500 }
    );
  }
}