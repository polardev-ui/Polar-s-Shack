require('dotenv').config(); // Load .env first
const fs = require('fs');
const path = require('path');

const config = {
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
  GOOGLE_ADSENSE_PUBLISHER_ID: process.env.GOOGLE_ADSENSE_PUBLISHER_ID,
  GOOGLE_ADSENSE_HEADER_SLOT: process.env.GOOGLE_ADSENSE_HEADER_SLOT,
  GOOGLE_ADSENSE_SIDEBAR_SLOT: process.env.GOOGLE_ADSENSE_SIDEBAR_SLOT,
  GOOGLE_ADSENSE_FOOTER_SLOT: process.env.GOOGLE_ADSENSE_FOOTER_SLOT
};

const htmlPath = path.join(__dirname, 'soon', 'chat.html');
let html = fs.readFileSync(htmlPath, 'utf8');

Object.keys(config).forEach((key) => {
  const regex = new RegExp(`process\\.env\\.${key}`, 'g');
  const safeValue = JSON.stringify(config[key] || '');
  html = html.replace(regex, safeValue);
});

fs.writeFileSync(htmlPath, html);
console.log('✅ Environment variables injected into chat.html');
