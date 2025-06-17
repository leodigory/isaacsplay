import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';

const firebaseConfig = {
  // Suas configurações do Firebase aqui
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Funções para gerenciar conteúdo
export const getContentById = async (id) => {
  try {
    const docRef = doc(db, 'content', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar conteúdo:', error);
    throw error;
  }
};

export const getContentByCategory = async (category, limit = 20) => {
  try {
    const q = query(
      collection(db, 'content'),
      where('category', '==', category),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erro ao buscar conteúdo por categoria:', error);
    throw error;
  }
};

export const getFeaturedContent = async (limit = 10) => {
  try {
    const q = query(
      collection(db, 'content'),
      where('isFeatured', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erro ao buscar conteúdo em destaque:', error);
    throw error;
  }
};

export const getSimilarContent = async (contentId, category, limit = 6) => {
  try {
    const q = query(
      collection(db, 'content'),
      where('category', '==', category),
      where('id', '!=', contentId),
      orderBy('id'),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erro ao buscar conteúdo similar:', error);
    throw error;
  }
};

export const addContent = async (content) => {
  try {
    const docRef = await addDoc(collection(db, 'content'), {
      ...content,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao adicionar conteúdo:', error);
    throw error;
  }
};

export const updateContent = async (id, content) => {
  try {
    const docRef = doc(db, 'content', id);
    await updateDoc(docRef, {
      ...content,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Erro ao atualizar conteúdo:', error);
    throw error;
  }
};

export const deleteContent = async (id) => {
  try {
    const docRef = doc(db, 'content', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erro ao deletar conteúdo:', error);
    throw error;
  }
};

// Funções para gerenciar categorias
export const getCategories = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'categories'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    throw error;
  }
};

export const addCategory = async (category) => {
  try {
    const docRef = await addDoc(collection(db, 'categories'), {
      ...category,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao adicionar categoria:', error);
    throw error;
  }
};

export const updateCategory = async (id, category) => {
  try {
    const docRef = doc(db, 'categories', id);
    await updateDoc(docRef, {
      ...category,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const docRef = doc(db, 'categories', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    throw error;
  }
};

// Funções para gerenciar usuários
export const getUserById = async (id) => {
  try {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const docRef = doc(db, 'users', id);
    await updateDoc(docRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
};

export default {
  getContentById,
  getContentByCategory,
  getFeaturedContent,
  getSimilarContent,
  addContent,
  updateContent,
  deleteContent,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getUserById,
  updateUser
};

