import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD2aNcer6QDENRQPcbqOKRmUDRPQr5JNbE",
    authDomain: "adhd-mindful-mate.firebaseapp.com",
    projectId: "adhd-mindful-mate",
    storageBucket: "adhd-mindful-mate.appspot.com",
    messagingSenderId: "23266398951",
    appId: "1:23266398951:web:daa18362c53499fab10842"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  
  export { auth, db, signInWithEmailAndPassword };
  export default app;