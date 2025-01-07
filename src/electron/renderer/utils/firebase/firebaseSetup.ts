import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration with environment variables
// const firebaseConfig = {
//   apiKey: "AIzaSyCSd1I0S9EcpjRfXQkIMRvzZvXLtJepRfY",
//   authDomain: "adftable-water.firebaseapp.com",
//   projectId: "adftable-water",
//   storageBucket: "adftable-water.appspot.com",
//   messagingSenderId: "33497998063",
//   appId: "1:33497998063:web:13ca39c32c1c1e7c3f311a",
//   measurementId: "G-98BS5LJ3C6",
// };

// the new database
const firebaseConfig = {
  apiKey: "AIzaSyBBKCSWUYMg9ldWrG9isz_YZl1ddWVwuaY",
  authDomain: "adf-table-water.firebaseapp.com",
  projectId: "adf-table-water",
  storageBucket: "adf-table-water.appspot.com",
  messagingSenderId: "616493639914",
  appId: "1:616493639914:web:cf5fcc98e89ce1ae8d0f93",
  measurementId: "G-YGYLNZQH0L",
};
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();


export const firestore = getFirestore(app); // Firestore service
export const auth = getAuth(app); // Authentication service
// export const analytics = getAnalytics(app); // Analytics (optional)
