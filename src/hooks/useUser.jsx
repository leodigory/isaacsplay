import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { fetchUserData } from '../components/auth'; // Importa a função para buscar dados do Firestore

export const useUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useEffect do useUser executado');

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Usuário autenticado:', firebaseUser);

      if (firebaseUser) {
        // 1. Retorna os dados básicos do Firebase Authentication
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        };

        // 2. Busca dados adicionais no Firestore
        try {
          const additionalData = await fetchUserData(firebaseUser.uid);
          console.log('Dados adicionais do Firestore:', additionalData);

          if (additionalData) {
            // Combina os dados do Firebase Authentication com os dados do Firestore
            const combinedData = { ...userData, ...additionalData };
            setUser(combinedData);
            localStorage.setItem('user', JSON.stringify(combinedData));
            console.log('Dados armazenados no localStorage:', JSON.stringify(combinedData));
          } else {
            // Usa apenas os dados do Firebase Authentication
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            console.log('Dados armazenados no localStorage:', JSON.stringify(userData));
          }
        } catch (error) {
          console.error('Erro ao buscar dados do Firestore:', error);
          setUser(userData); // Usa apenas os dados do Firebase Authentication em caso de erro
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } else {
        setUser(null); // Usuário não autenticado
        localStorage.removeItem('user'); // Remove dados do localStorage
        console.log('Usuário não autenticado. Dados removidos do localStorage.');
      }
      setLoading(false); // Finaliza o carregamento
    });

    return () => unsubscribe(); // Limpa o observador ao desmontar
  }, []);

  console.log('Estado do usuário atualizado:', user);
  return { user, loading };
};