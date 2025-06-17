import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Função para fazer login
export const login = async (email, password) => {
  try {
    console.log('Iniciando o processo de autenticação...');

    // 1. Autentica o usuário no Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('Usuário autenticado com sucesso:', user);

    // 2. Retorna os dados básicos do Firebase Authentication
    const userData = {
      uid: user.uid,
      email: user.email,
    };
    console.log('Dados do usuário:', userData);

    // 3. Busca dados adicionais no Firestore
    const additionalData = await fetchUserData(user.uid);
    console.log('Dados adicionais do Firestore recebidos:', additionalData);

    // 4. Combina os dados do Firebase Authentication com os dados do Firestore
    const combinedData = { ...userData, profiles: additionalData };
    localStorage.setItem('user', JSON.stringify(combinedData)); // Armazena no localStorage
    console.log('Dados combinados armazenados no localStorage:', combinedData);

    return combinedData; // Retorna os dados combinados
  } catch (error) {
    console.error('Erro durante o login:', error);
    throw error;
  }
};

// Função para buscar dados adicionais no Firestore
export const fetchUserData = async (uid) => {
  try {
    console.log(`Buscando dados do usuário no Firestore para UID: ${uid}`);

    // 1. Referência para o documento do usuário na coleção "users"
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    console.log('Documento do usuário:', userDoc);

    if (userDoc.exists()) {
      const data = userDoc.data();
      console.log('Dados do documento do usuário:', data);
      return data; // Retorna os dados do documento do usuário
    } else {
      console.log('Nenhum documento encontrado para o UID:', uid);
      return null; // Retorna null se nenhum documento for encontrado
    }
  } catch (error) {
    console.error('Erro ao buscar dados do Firestore:', error);
    throw error;
  }
};

// Função para fazer logout
export const logout = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('user'); // Remove os dados do usuário do localStorage
    console.log('Usuário deslogado e dados removidos do localStorage.');
  } catch (error) {
    console.error('Erro durante o logout:', error);
    throw error;
  }
};

// Função para obter os dados do usuário armazenados localmente
export const getLocalUser = () => {
  const user = localStorage.getItem('user');
  console.log('Recuperando dados do usuário do localStorage:', user);
  return user ? JSON.parse(user) : null;
};