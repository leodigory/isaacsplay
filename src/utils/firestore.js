import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Coleções
const COLLECTIONS = {
  ANIMES: 'animes',
  FILMES: 'filmes',
  SERIES: 'series',
  TV: 'tv',
  CATEGORIES: 'categories',
  MOVIES: 'movies',
  PROFILES: 'profiles',
  SYSTEM: 'system',
  USERS: 'users'
};

// Funções genéricas para CRUD
export const createDocument = async (collectionName, data, id = null) => {
  try {
    if (id) {
      await setDoc(doc(db, collectionName, id), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return id;
    } else {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    }
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw error;
  }
};

export const getDocument = async (collectionName, id) => {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
};

export const updateDocument = async (collectionName, id, data) => {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
};

export const deleteDocument = async (collectionName, id) => {
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
};

export const getDocuments = async (collectionName, conditions = []) => {
  try {
    let q = collection(db, collectionName);
    if (conditions.length > 0) {
      q = query(q, ...conditions.map(condition => where(condition.field, condition.operator, condition.value)));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
  }
};

// Funções específicas para cada coleção
export const createMovie = async (movieData) => {
  return createDocument(COLLECTIONS.MOVIES, movieData);
};

export const getMovie = async (movieId) => {
  return getDocument(COLLECTIONS.MOVIES, movieId);
};

export const updateMovie = async (movieId, movieData) => {
  return updateDocument(COLLECTIONS.MOVIES, movieId, movieData);
};

export const deleteMovie = async (movieId) => {
  return deleteDocument(COLLECTIONS.MOVIES, movieId);
};

export const getMoviesByCategory = async (category) => {
  return getDocuments(COLLECTIONS.MOVIES, [
    { field: 'category', operator: '==', value: category }
  ]);
};

// Exportar constantes
export { COLLECTIONS }; 