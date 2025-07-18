const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const fs = require('fs');
const path = require('path');

async function loadSecrets() {
  // Skip in local development
  if (!process.env.Mafioso_Secret) {
    console.log('Using local .env.local file');
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
    
    // Create env string
    const envContent = Object.entries(secrets)
      .map(([key, value]) => `${key}="${value}"`)
      .join('\n');

    fs.writeFileSync('.env.production.local', envContent);
    console.log('✅ Secrets loaded from AWS!');
    
  } catch (error) {
    console.error('Failed to load secrets:', error.message);
  }
}

loadSecrets();