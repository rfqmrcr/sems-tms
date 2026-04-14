import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAAxqrLr8Zw33yT9MfanVX9_WIBGB1Q8A8",
  authDomain: "semstms.firebaseapp.com",
  projectId: "semstms",
  storageBucket: "semstms.firebasestorage.app",
  messagingSenderId: "54049192697",
  appId: "1:54049192697:web:5825d39ac6851be1d50028",
  measurementId: "G-CR8DX21GFY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
