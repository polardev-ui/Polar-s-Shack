import firebase from "firebase/app"
import "firebase/firestore"
import "firebase/auth"

class FirebaseConfig {
  constructor() {
    this.config = {
      apiKey: "AIzaSyBYyJuTAkVPB_65NqSeca6IueMoMO1iPzs",
      authDomain: "polars-shack.firebaseapp.com",
      projectId: "polars-shack",
      storageBucket: "polars-shack.firebasestorage.app",
      messagingSenderId: "205388124682",
      appId: "1:205388124682:web:2b0b1605517e0c6c53c5f3",
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
