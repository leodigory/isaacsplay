import { useState, useEffect, createContext, useContext } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove 
} from 'firebase/firestore';
import { db } from '../services/firestore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Buscar dados adicionais do usuário no Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUser({
            ...user,
            ...userDoc.data()
          });
        } else {
          setUser(user);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    try {
      setError(null);
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const signUp = async (email, password, displayName) => {
    try {
      setError(null);
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Atualizar o perfil do usuário
      await updateProfile(userCredential.user, { displayName });
      
      // Criar documento do usuário no Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        displayName,
        email,
        createdAt: new Date().toISOString(),
        myList: [],
        watchHistory: [],
        isAdmin: false
      });

      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const auth = getAuth();
      await firebaseSignOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const addToMyList = async (contentId) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        myList: arrayUnion(contentId)
      });

      setUser(prev => ({
        ...prev,
        myList: [...(prev.myList || []), contentId]
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeFromMyList = async (contentId) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        myList: arrayRemove(contentId)
      });

      setUser(prev => ({
        ...prev,
        myList: prev.myList.filter(id => id !== contentId)
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const addToWatchHistory = async (contentId, content) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');
      
      const userRef = doc(db, 'users', user.uid);
      const watchHistory = user.watchHistory || [];
      
      // Remover item existente se houver
      const filteredHistory = watchHistory.filter(item => item.contentId !== contentId);
      
      // Adicionar novo item no início
      const newHistory = [
        {
          contentId,
          content,
          watchedAt: new Date().toISOString()
        },
        ...filteredHistory
      ].slice(0, 50); // Manter apenas os últimos 50 itens

      await updateDoc(userRef, {
        watchHistory: newHistory
      });

      setUser(prev => ({
        ...prev,
        watchHistory: newHistory
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    addToMyList,
    removeFromMyList,
    addToWatchHistory
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export default useAuth; 