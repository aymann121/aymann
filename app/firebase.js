// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDO2iWn3lREtbhazguIa4_oWKdJfHG4wKo",
  authDomain: "friendlychat-753b0.firebaseapp.com",
  projectId: "friendlychat-753b0",
  storageBucket: "friendlychat-753b0.appspot.com",
  messagingSenderId: "401870786389",
  appId: "1:401870786389:web:c4b344327324dd338de9dc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)