import firebase from "firebase/app"
import "firebase/firestore"
import "firebase/auth"

class FirebaseConfig {
  constructor() {
    const env = (typeof window !== 'undefined' ? window.__ENV : process.env) || {}
    this.config = {
      apiKey: env.FIREBASE_API_KEY,
      authDomain: env.FIREBASE_AUTH_DOMAIN,
      projectId: env.FIREBASE_PROJECT_ID,
      storageBucket: env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
      appId: env.FIREBASE_APP_ID,
    }

    this.initializeFirebase()
  }

  initializeFirebase() {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(this.config)
      }
      this.db = firebase.firestore()
      this.auth = firebase.auth()

      console.log("[v0] Firebase initialized successfully")
      return true
    } catch (error) {
      console.error("[v0] Firebase initialization error:", error)
      return false
    }
  }

  getFirestore() {
    return this.db
  }

  getAuth() {
    return this.auth
  }

  getConfig() {
    return this.config
  }

  async testConnection() {
    try {
      if (this.db) {
        // Try to read from a test collection to verify connection
        await this.db.collection("test").limit(1).get()
        console.log("[v0] Firebase connection test successful")
        return true
      }
      return false
    } catch (error) {
      console.error("[v0] Firebase connection test failed:", error)
      return false
    }
  }
}

if (typeof window !== "undefined") {
  window.firebaseApp = new FirebaseConfig()
  window.db = window.firebaseApp.getFirestore()
  window.auth = window.firebaseApp.getAuth()
}

export default FirebaseConfig
