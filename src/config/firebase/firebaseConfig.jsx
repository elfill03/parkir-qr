// firebaseConfig.js
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBn2nUS3Gl26amWmNfBWhJpd4O1GiKDCl4",
  authDomain: "parkir-qr-storage.firebaseapp.com",
  projectId: "parkir-qr-storage",
  storageBucket: "parkir-qr-storage.appspot.com",
  messagingSenderId: "706849165129",
  appId: "1:706849165129:web:311baee9480d1181ea5498",
  measurementId: "G-BGTFSK7ZGH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);

export { app, storage };
