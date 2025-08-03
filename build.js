const fs = require('fs');
const path = require('path');

const config = {
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH
};

let configFile = fs.readFileSync('firebase-config.js', 'utf8');

Object.keys(config).forEach(key => {
  const placeholder = `process.env.${key}`;
  const value = `"${config[key]}"`;
  configFile = configFile.replace(new RegExp(placeholder, 'g'), value);
});

fs.writeFileSync('firebase-config.js', configFile);
console.log('Environment variables injected successfully!');