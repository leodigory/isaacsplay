import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA2WL1y3hRd1YLHjXPUG7bQzJ6s8pH4Ob8",
  authDomain: "isaacplay-a0452.firebaseapp.com",
  projectId: "isaacplay-a0452",
  appId: "1:631970859391:web:c9b1526fa6495a2d3c324a"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app); 