import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyCp4FOcmY1wzh2vrkGmrfQIBHcnNmRgRQ8",
  authDomain: "anaelle-25eef.firebaseapp.com",
  projectId: "anaelle-25eef",
  storageBucket: "anaelle-25eef.firebasestorage.app",
  messagingSenderId: "997189141013",
  appId: "1:997189141013:web:193eabfc60b36b6b9d841c",
  measurementId: "G-TKCMKC1GQ2"
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
