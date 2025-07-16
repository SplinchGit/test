import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { hashNonce } from '@/auth/wallet/client-helpers';

export async function POST() {
  const nonce = crypto.randomUUID().replace(/-/g, '');
  const signedNonce = hashNonce({ nonce });
  
  return NextResponse.json({
    nonce,
    signedNonce,
  });
}