// firebase-config.js
// Using the compat version — works directly in plain HTML files

const firebaseConfig = {
  apiKey: "AIzaSyDTtVVh0CBve5rXoR606EwoQWl2o08LAFQ",
  authDomain: "village-prime.firebaseapp.com",
  projectId: "village-prime",
  storageBucket: "village-prime.firebasestorage.app",
  messagingSenderId: "454045630573",
  appId: "1:454045630573:web:9f0bf47a448af9a0c1ff64"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Make auth and database available to all pages
const auth = firebase.auth();
const db = firebase.firestore();