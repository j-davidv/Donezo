import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
  // Replace these with your Firebase config values
  apiKey: "AIzaSyDvBBP4BDfY_ZCt-8MPkQCIeccRA1xzWIo",
  authDomain: "donezo-530ac.firebaseapp.com",
  projectId: "donezo-530ac",
  storageBucket: "donezo-530ac.firebasestorage.app",
  messagingSenderId: "820763087623",
  appId: "1:820763087623:web:db0d74b260267843b52ba2"
  measurementId: "G-FNXTPZX18Q"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app); 