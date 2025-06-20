import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA2WL1y3hRd1YLHjXPUG7bQzJ6s8pH4Ob8",
  authDomain: "isaacplay-a0452.firebaseapp.com",
  projectId: "isaacplay-a0452",
  storageBucket: "isaacplay-a0452.appspot.com",
  messagingSenderId: "631970859391",
  appId: "1:631970859391:web:c9b1526fa6495a2d3c324a"
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// Só inicializa o Firebase no cliente (browser)
if (typeof window !== 'undefined') {
  try {
    // Inicializa o app apenas se não existir
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    
    // Exporta as instâncias
    auth = getAuth(app);
    db = getFirestore(app);
    
  } catch (error) {
    console.error("Erro ao inicializar Firebase:", error);
    // Em caso de erro, cria uma instância vazia para evitar crashes
    app = null;
    auth = null;
    db = null;
  }
}

export { auth, db }; 