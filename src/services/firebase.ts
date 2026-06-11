import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDw7iRCgzu_5XgE4TT2nKzYLgTka4tXpfM",
  authDomain: "conferencia-compras.firebaseapp.com",
  projectId: "conferencia-compras",
  storageBucket: "conferencia-compras.firebasestorage.app",
  messagingSenderId: "832755308399",
  appId: "1:832755308399:web:c4ae912eff8e4cc297ba9a",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);