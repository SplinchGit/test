import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

// Cache the secret to avoid repeated AWS calls
let cachedSecret: string | null = null;

async function getHmacSecret(): Promise<string> {
  // Return cached value if available
  if (cachedSecret) return cachedSecret;
  
  try {
    const client = new SecretsManagerClient({ region: "eu-west-2" });
    const response = await client.send(
      new GetSecretValueCommand({ 
        SecretId: "HMAC_SECRET_KEY" 
      })
    );
    
    if (!response.SecretString) {
      throw new Error('Secret value is empty');
    }
    
    // Parse the JSON to get the actual key value
    const secretData = JSON.parse(response.SecretString);
    cachedSecret = secretData.HMAC_SECRET_KEY;
    
    if (!cachedSecret) {
      throw new Error('HMAC_SECRET_KEY not found in secret');
    }
    
    return cachedSecret;
  } catch (error) {
    console.error('Failed to retrieve secret from AWS:', error);
    throw new Error('Failed to retrieve secret');
  }
}

const hashNonce = (nonce: string, secret: string): string => {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(nonce);
  return hmac.digest('hex');
};

export async function GET() {
  try {
    // Get secret from AWS Secrets Manager
    const HMAC_SECRET_KEY = await getHmacSecret();
    
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