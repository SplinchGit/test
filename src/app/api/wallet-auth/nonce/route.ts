import { NextResponse } from 'next/server';
import crypto from 'crypto';

const hashNonce = ({ nonce }: { nonce: string }) => {
  const hmac = crypto.createHmac('sha256', process.env.HMAC_SECRET_KEY!);
  hmac.update(nonce);
  return hmac.digest('hex');
};

export async function POST() {
  const nonce = crypto.randomUUID().replace(/-/g, '');
  const signedNonce = hashNonce({ nonce });
  
  return NextResponse.json({
    nonce,
    signedNonce,
  });
}