import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { createDocument, getDocument, updateDocument } from './firestore';
import { COLLECTIONS } from './firestore';

// Função para registrar um novo usuário
export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Atualizar o perfil do usuário
    await updateProfile(user, { displayName });

    // Criar documento do usuário no Firestore
    await createDocument(COLLECTIONS.USERS, {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      photoURL: user.photoURL,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Função para fazer login
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Função para fazer logout
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

// Função para redefinir senha
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// Função para atualizar perfil do usuário
export const updateUserProfile = async (user, data) => {
  try {
    // Atualizar perfil no Auth
    await updateProfile(user, data);

    // Atualizar documento no Firestore
    await updateDocument(COLLECTIONS.USERS, user.uid, {
      ...data,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Função para obter dados do usuário atual
export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        try {
          const userData = await getDocument(COLLECTIONS.USERS, user.uid);
          resolve(userData);
        } catch (error) {
          reject(error);
        }
      } else {
        resolve(null);
      }
    }, reject);
  });
}; 