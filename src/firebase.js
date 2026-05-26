import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAueJ4eTKLS6qrWd2284IolMjJpTYEuYPg",
  authDomain: "eelu-seniors.firebaseapp.com",
  projectId: "eelu-seniors",
  storageBucket: "eelu-seniors.firebasestorage.app",
  messagingSenderId: "142710977399",
  appId: "1:142710977399:web:91cd6c4c4c50d889e0e772"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
