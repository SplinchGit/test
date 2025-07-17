import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

// Cache the secret to avoid repeated AWS calls
let cachedSecret: string | null = null;

async function getHmacSecret(): Promise<string> {
  // Return cached value if available
  if (cachedSecret) return cachedSecret;
  
  try {
    // First, try to get from AWS Secrets Manager
    console.log('Attempting to retrieve secret from AWS Secrets Manager...');
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
    
    console.log('Successfully retrieved secret from AWS Secrets Manager');
    return cachedSecret;
  } catch (awsError) {
    console.warn('Failed to retrieve secret from AWS:', awsError);
    console.log('Falling back to environment variable...');
    
    // Fallback to environment variable
    const envSecret = process.env.HMAC_SECRET_KEY;
    if (!envSecret) {
      throw new Error('HMAC_SECRET_KEY not found in AWS Secrets Manager or environment variables');
    }
    
    cachedSecret = envSecret;
    console.log('Using HMAC secret from environment variable');
    return cachedSecret;
  }
}

const hashNonce = (nonce: string, secret: string): string => {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(nonce);
  return hmac.digest('hex');
};

export async function GET() {
  try {
    // Get secret using hybrid approach
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