import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBvNK8F8NqS36xuslCD-WpPBHpSUfIwfbI",
  authDomain: "itqan-learning.firebaseapp.com",
  projectId: "itqan-learning",
  storageBucket: "itqan-learning.firebasestorage.app",
  messagingSenderId: "593098275706",
  appId: "1:593098275706:web:2cb743a57dbc6c6827f4c3",
  measurementId: "G-WMRTTYCH2X",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);