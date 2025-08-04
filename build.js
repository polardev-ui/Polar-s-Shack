const fs = require('fs');
const path = require('path');

const config = {
  FIREBASE_API_KEY: "AIzaSyBYyJuTAkVPB_65NqSeca6IueMoMO1iPzs",
  FIREBASE_AUTH_DOMAIN: "polars-shack.firebaseapp.com",
  FIREBASE_PROJECT_ID: "polars-shack",
  FIREBASE_STORAGE_BUCKET: "polars-shack.firebasestorage.app",
  FIREBASE_MESSAGING_SENDER_ID: "205388124682",
  FIREBASE_APP_ID: "1:205388124682:web:2b0b1605517e0c6c53c5f3",
  ADMIN_PASSWORD_HASH: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
  GOOGLE_ADSENSE_PUBLISHER_ID: "pub-9156548662984796",
  GOOGLE_ADSENSE_HEADER_SLOT: "your_header_ad_slot_id",
  GOOGLE_ADSENSE_SIDEBAR_SLOT: "your_sidebar_ad_slot_id",
  GOOGLE_ADSENSE_FOOTER_SLOT: "your_footer_ad_slot_id"
};

const targetFiles = [
  path.join(__dirname, 'soon', 'chat.html'),
  path.join(__dirname, 'soon', 'play.html'),
  path.join(__dirname, 'soon', 'games.html')
];

targetFiles.forEach((filePath) => {
  if (fs.existsSync(filePath)) {
    let html = fs.readFileSync(filePath, 'utf8');

    Object.keys(config).forEach((key) => {
      const regex = new RegExp(`process\\.env\\.${key}`, 'g');
      const safeValue = JSON.stringify(config[key]);
      html = html.replace(regex, safeValue);
    });

    fs.writeFileSync(filePath, html);
    console.log(`✅ Environment variables injected into ${path.basename(filePath)}`);
  } else {
    console.warn(`⚠️  File not found: ${filePath}`);
  }
});
