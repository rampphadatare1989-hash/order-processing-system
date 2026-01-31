#!/usr/bin/env node

/**
 * Firebase Service Account Setup Helper
 * This script helps you convert your Firebase credentials to the service account format
 * 
 * Usage:
 *   node scripts/setup-service-account.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n');
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║        Firebase Service Account Setup Helper                   ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('\n');

console.log('This tool will help you create the service account JSON file needed for seeding.\n');

console.log('To get your service account credentials:\n');
console.log('1. Go to: https://console.firebase.google.com');
console.log('2. Select project: order-processing-system-619b4');
console.log('3. Click: ⚙️ Settings (top-left) > Service Accounts tab');
console.log('4. Click: "Generate New Private Key" button');
console.log('5. A JSON file will download\n');

console.log('Paste the complete JSON content below and press Enter twice when done:\n');

let input = '';

rl.on('line', (line) => {
  if (line === '') {
    if (input.trim() !== '') {
      rl.close();
    }
  } else {
    input += line + '\n';
  }
});

rl.on('close', () => {
  if (!input.trim()) {
    console.log('\n❌ No input provided. Aborting.');
    process.exit(1);
  }
  
  try {
    const serviceAccount = JSON.parse(input);
    
    // Validate required fields
    const requiredFields = ['type', 'project_id', 'private_key', 'client_email', 'client_id'];
    const missingFields = requiredFields.filter(field => !serviceAccount[field]);
    
    if (missingFields.length > 0) {
      console.log('\n❌ Invalid service account JSON. Missing fields:', missingFields.join(', '));
      process.exit(1);
    }
    
    // Write to file
    const filePath = path.join(__dirname, '../src/app/config/service-account.json');
    const dir = path.dirname(filePath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, JSON.stringify(serviceAccount, null, 2));
    
    console.log('\n✅ Service account saved to: src/app/config/service-account.json');
    console.log('\n📋 Configuration Details:');
    console.log('   Project ID:', serviceAccount.project_id);
    console.log('   Service Account:', serviceAccount.client_email);
    
    // Add to .gitignore
    const gitignorePath = path.join(__dirname, '../.gitignore');
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    
    if (!gitignoreContent.includes('service-account.json')) {
      fs.appendFileSync(gitignorePath, '\n# Firebase Credentials (SECURITY: NEVER commit)\nsrc/app/config/service-account.json\n');
      console.log('\n✅ Added to .gitignore');
    } else {
      console.log('\n✅ Already in .gitignore');
    }
    
    console.log('\n✨ Setup complete! You can now run: npm run seed\n');
    
  } catch (error) {
    console.log('\n❌ Invalid JSON:', error.message);
    console.log('\nMake sure you copy the ENTIRE content from the downloaded Firebase JSON file.');
    process.exit(1);
  }
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Setup cancelled.');
  process.exit(0);
});
