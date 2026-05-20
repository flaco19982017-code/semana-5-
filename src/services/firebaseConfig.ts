// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDataConnect } from "firebase/data-connect";
import {  getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCgN7Wa1J_iByFjQlJxUT2I9QHqtjLJKWk",
  authDomain: "species-47df3.firebaseapp.com",
  projectId: "species-47df3",
  storageBucket: "species-47df3.firebasestorage.app",
  messagingSenderId: "463947095962",
  appId: "1:463947095962:web:a9394092807526f7b26423",
  databaseURL: "https://species-47df3-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const storage = getStorage (app);