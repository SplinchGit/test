const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

async function loadSecrets() {
  // Skip in local development
  if (!process.env.Mafioso_Secret) {
    console.log('📍 Using local .env.local file');
    return;
  }

  const client = new SecretsManagerClient({
    region: process.env.REGION || "eu-west-2",
  });

  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: process.env.Mafioso_Secret,
      })
    );

    const secrets = JSON.parse(response.SecretString);
    
    // Only load HMAC_SECRET_KEY from Secrets Manager
    // AUTH_SECRET comes from Amplify env vars
    if (secrets.HMAC_SECRET_KEY) {
      process.env.HMAC_SECRET_KEY = secrets.HMAC_SECRET_KEY;
      console.log('✅ HMAC_SECRET_KEY loaded from AWS Secrets Manager');
    }
    
  } catch (error) {
    console.error('❌ Failed to load secrets:', error.message);
    // Don't fail the build - use Amplify env vars as fallback
  }
}

loadSecrets();