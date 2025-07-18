const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const fs = require('fs');
const path = require('path');

async function loadSecrets() {
  // Skip in local development
  if (!process.env.Mafioso_Secret) {
    console.log('📍 Running in local development mode');
    console.log('ℹ️  Using environment variables from shell or .env.local');
    return;
  }

  const client = new SecretsManagerClient({
    region: process.env.REGION || "eu-west-2",
  });

  try {
    console.log('🔐 Fetching secrets from AWS Secrets Manager...');
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: process.env.Mafioso_Secret,
      })
    );

    const secrets = JSON.parse(response.SecretString);
    
    // Write HMAC_SECRET_KEY to .env.production
    if (secrets.HMAC_SECRET_KEY) {
      const envPath = path.join(process.cwd(), '.env.production');
      
      // Append HMAC_SECRET_KEY to .env.production
      fs.appendFileSync(envPath, `\nHMAC_SECRET_KEY=${secrets.HMAC_SECRET_KEY}\n`);
      
      // Also set it in process.env for immediate use
      process.env.HMAC_SECRET_KEY = secrets.HMAC_SECRET_KEY;
      
      console.log('✅ HMAC_SECRET_KEY loaded from AWS Secrets Manager and written to .env.production');
    }
    
  } catch (error) {
    console.error('❌ Failed to load secrets:', error.message);
    // Don't fail the build - use Amplify env vars as fallback
    console.log('⚠️  Falling back to Amplify environment variables');
  }
}

// Run the loader
loadSecrets().catch(console.error);