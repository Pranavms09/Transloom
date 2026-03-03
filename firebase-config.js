// Paste your Firebase Config Object Here
// For Hackathon judging, ensure you've registered a web app in your Firebase Console and enabled:
// 1. Email/Password Authentication
// 2. Google Authentication

const firebaseConfig = {
  apiKey: "AIzaSyA4axiff2ZOTPllP4wzwf7G4IRBvZka6EA",
  authDomain: "transloom-dec35.firebaseapp.com",
  projectId: "transloom-dec35",
  storageBucket: "transloom-dec35.firebasestorage.app",
  messagingSenderId: "997801282488",
  appId: "1:997801282488:web:944e429e0eb12ef69d5d4d",
  measurementId: "G-11BMER81LM",
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
  onAuthStateChanged,
  signOut,
  updateProfile,
};
