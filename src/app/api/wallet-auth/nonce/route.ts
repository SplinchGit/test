import { NextResponse } from 'next/server';
import crypto from 'crypto';

const hashNonce = ({ nonce }: { nonce: string }) => {
  const hmac = crypto.createHmac('sha256', process.env.HMAC_SECRET_KEY!);
  hmac.update(nonce);
  return hmac.digest('hex');
};

export async function GET() {
  try {
    // Check if HMAC_SECRET_KEY exists
    if (!process.env.HMAC_SECRET_KEY) {
      console.error('HMAC_SECRET_KEY is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const nonce = crypto.randomUUID().replace(/-/g, '');
    const signedNonce = hashNonce({ nonce });
    
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