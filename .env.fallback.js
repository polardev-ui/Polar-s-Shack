// Fallback client-side configuration.
// This file provides defaults when env.js is missing. For production, generate env.js from .env via `node build.js`.
// Avoid adding true secrets here; Firebase web config is not a secret.

window.__ENV = window.__ENV || {
  // Firebase (public identifiers)
  FIREBASE_API_KEY: "AIzaSyBYyJuTAkVPB_65NqSeca6IueMoMO1iPzs",
  FIREBASE_AUTH_DOMAIN: "polars-shack.firebaseapp.com",
  FIREBASE_PROJECT_ID: "polars-shack",
  FIREBASE_STORAGE_BUCKET: "polars-shack.firebasestorage.app",
  FIREBASE_MESSAGING_SENDER_ID: "205388124682",
  FIREBASE_APP_ID: "1:205388124682:web:2b0b1605517e0c6c53c5f3",
  FIREBASE_DATABASE_URL: "https://polars-shack-default-rtdb.firebaseio.com",

  // Services
  PROXY_SERVER_URL: "https://render-proxy-6x2v.onrender.com",

  // Leave these blank by default to avoid exposing third-party keys client-side
  JSONBIN_API_URL: "",
  JSONBIN_MASTER_KEY: "",

  // Misc
  ADMIN_PASSWORD_HASH: "50172b3e278ccc1f2caaac89e2911df21304024b98578c4642af9d340fc73b71",
  GOOGLE_ADSENSE_PUBLISHER_ID: "pub-9156548662984796",
  GOOGLE_ADSENSE_HEADER_SLOT: "",
  GOOGLE_ADSENSE_SIDEBAR_SLOT: "",
  GOOGLE_ADSENSE_FOOTER_SLOT: ""
};
