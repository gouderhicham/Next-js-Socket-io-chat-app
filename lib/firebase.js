import { getApps } from "firebase/app";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
const firebaseConfig = {
  apiKey: "AIzaSyCpa9GMXtjsAmXeET2n4eksCdtKJreDCe4",
  authDomain: "socket-io-9353b.firebaseapp.com",
  projectId: "socket-io-9353b",
  storageBucket: "socket-io-9353b.appspot.com",
  messagingSenderId: "471113559347",
  appId: "1:471113559347:web:f5b2c5c828209692b92246",
  measurementId: "G-YM6DGZ41E6",
};
let app;
export const apps = getApps();
if (!apps.length) {
  app = initializeApp(firebaseConfig);
}
export const db = getFirestore(app);