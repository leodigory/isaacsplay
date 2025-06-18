import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA2WL1y3hRd1YLHjXPUG7bQzJ6s8pH4Ob8",
  authDomain: "isaacplay-a0452.firebaseapp.com",
  projectId: "isaacplay-a0452",
  storageBucket: "isaacplay-a0452.appspot.com",
  messagingSenderId: "631970859391",
  appId: "1:631970859391:web:c9b1526fa6495a2d3c324a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); 