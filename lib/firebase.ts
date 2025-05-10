// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBSnHZeHH0DMRxe8_ldsS9Mh1gwNp0fa-k",
  authDomain: "zalamagn-1f057.firebaseapp.com",
  projectId: "zalamagn-1f057",
  storageBucket: "zalamagn-1f057.firebasestorage.app",
  messagingSenderId: "753763623478",
  appId: "1:753763623478:web:a11f093c649593b2d02e97"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db }; 