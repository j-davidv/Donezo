import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Debug: Check if environment variables are loaded
console.log('Firebase Config Check:');
console.log('API Key exists:', !!firebaseConfig.apiKey);
console.log('Auth Domain exists:', !!firebaseConfig.authDomain);
console.log('Project ID exists:', !!firebaseConfig.projectId);
console.log('Storage Bucket exists:', !!firebaseConfig.storageBucket);
console.log('Messaging Sender ID exists:', !!firebaseConfig.messagingSenderId);
console.log('App ID exists:', !!firebaseConfig.appId);
console.log('Measurement ID exists:', !!firebaseConfig.measurementId);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 