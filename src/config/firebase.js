//firebase.js

import { initializeApp } from 'firebase/app';
import { signInWithEmailAndPassword, onAuthStateChanged, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, doc } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

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
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const db = getFirestore(app);

// Listen for changes in auth state and store the user token in AsyncStorage
onAuthStateChanged(auth, (user) => {
  if (user) {
    ReactNativeAsyncStorage.setItem('userToken', user.uid);
  } else {
    ReactNativeAsyncStorage.removeItem('userToken');
  }
});

export { auth, db, signInWithEmailAndPassword, doc, getReactNativePersistence };
export default app;