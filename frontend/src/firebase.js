import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBr1uI2RVaMan2C86G7JqRxzzl-dPHuuvM",
  authDomain: "agrivision-ai-21.firebaseapp.com",
  projectId: "agrivision-ai-21",
  storageBucket: "agrivision-ai-21.firebasestorage.app",
  messagingSenderId: "1000738128659",
  appId: "1:1000738128659:web:d328f1c852daf8034510e6",
  measurementId: "G-5MW3PDR0F8"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);