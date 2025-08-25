import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

class FirebaseConfig {
    constructor() {
        this.config = {
            apiKey: process.env.FIREBASE_API_KEY || "AIzaSyBYyJuTAkVPB_65NqSeca6IueMoMO1iPzs",
            authDomain: process.env.FIREBASE_AUTH_DOMAIN || "polars-shack.firebaseapp.com",
            projectId: process.env.FIREBASE_PROJECT_ID || "polars-shack",
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "polars-shack.firebasestorage.app",
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "205388124682",
            appId: process.env.FIREBASE_APP_ID || "1:205388124682:web:2b0b1605517e0c6c53c5f3"
        };
        
        this.initializeFirebase();
    }

    initializeFirebase() {
        try {
            firebase.initializeApp(this.config);
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            
            console.log('Firebase initialized successfully');
            return true;
        } catch (error) {
            console.error('Firebase initialization error:', error);
            return false;
        }
    }

    getFirestore() {
        return this.db;
    }

    getAuth() {
        return this.auth;
    }

    getConfig() {
        return this.config;
    }
}

window.firebaseApp = new FirebaseConfig();
window.db = window.firebaseApp.getFirestore();
window.auth = window.firebaseApp.getAuth();
