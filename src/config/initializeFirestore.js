import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

// Dados iniciais para as categorias
const initialCategories = [
  {
    name: "Filmes",
    description: "Filmes populares",
    order: 1,
    isActive: true
  },
  {
    name: "Séries",
    description: "Séries em destaque",
    order: 2,
    isActive: true
  },
  {
    name: "Animes",
    description: "Animações japonesas",
    order: 3,
    isActive: true
  },
  {
    name: "TV",
    description: "Canais de TV",
    order: 4,
    isActive: true
  }
];

// Dados iniciais para o conteúdo
const initialContent = [
  {
    title: "O Conde de Monte Cristo",
    description: "Um homem é injustamente preso e busca vingança após sua fuga.",
    type: "movie",
    genre: ["Aventura", "Drama"],
    releaseYear: 2002,
    duration: 131,
    rating: 4.5,
    posterUrl: "https://play-lh.googleusercontent.com/pAdEMwuP-lLbi4aEJHJcHKVl9dD5bMJhxeygLaoyS2w-Yvlp3sKVQkAcYJD8dOxZgI8",
    thumbnailUrl: "https://play-lh.googleusercontent.com/pAdEMwuP-lLbi4aEJHJcHKVl9dD5bMJhxeygLaoyS2w-Yvlp3sKVQkAcYJD8dOxZgI8",
    trailerUrl: "V9enBZDNCto",
    videoUrl: "https://nextplaybr.online/movie/129142421/734752400/1729754.mp4",
    categoryId: "filmes",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "Duro de Matar",
    description: "Um policial tenta salvar sua esposa e outros reféns durante um ataque terrorista.",
    type: "movie",
    genre: ["Ação", "Suspense"],
    releaseYear: 1988,
    duration: 132,
    rating: 4.7,
    posterUrl: "https://play-lh.googleusercontent.com/pAdEMwuP-lLbi4aEJHJcHKVl9dD5bMJhxeygLaoyS2w-Yvlp3sKVQkAcYJD8dOxZgI8",
    thumbnailUrl: "https://play-lh.googleusercontent.com/pAdEMwuP-lLbi4aEJHJcHKVl9dD5bMJhxeygLaoyS2w-Yvlp3sKVQkAcYJD8dOxZgI8",
    trailerUrl: "JaGdVqXmUwM",
    videoUrl: "https://nextplaybr.online/movie/129142421/734752400/1729754.mp4",
    categoryId: "filmes",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

// Função para criar usuário admin
const createAdminUser = async () => {
  const auth = getAuth();
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      'admin@isaacplay.com',
      'admin123'
    );
    
    const userRef = doc(db, 'users', userCredential.user.uid);
    await setDoc(userRef, {
      email: 'admin@isaacplay.com',
      displayName: 'Administrador',
      isAdmin: true,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });
    
    console.log('Usuário admin criado com sucesso!');
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Usuário admin já existe.');
    } else {
      console.error('Erro ao criar usuário admin:', error);
    }
  }
};

// Função para verificar se uma coleção já existe
const collectionExists = async (collectionName) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return !querySnapshot.empty;
};

// Função para inicializar as categorias
const initializeCategories = async () => {
  const categoriesRef = collection(db, 'categories');
  
  for (const category of initialCategories) {
    const categoryId = category.name.toLowerCase().replace(/\s+/g, '-');
    const categoryRef = doc(categoriesRef, categoryId);
    
    try {
      await setDoc(categoryRef, {
        ...category,
        id: categoryId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`Categoria "${category.name}" criada com sucesso!`);
    } catch (error) {
      console.error(`Erro ao criar categoria "${category.name}":`, error);
    }
  }
};

// Função para inicializar o conteúdo
const initializeContent = async () => {
  const contentCollectionRef = collection(db, 'content');
  
  for (const content of initialContent) {
    const contentId = content.title.toLowerCase().replace(/\s+/g, '-');
    const contentDocRef = doc(contentCollectionRef, contentId);
    
    try {
      await setDoc(contentDocRef, {
        ...content,
        id: contentId
      });
      console.log(`Conteúdo "${content.title}" criado com sucesso!`);
    } catch (error) {
      console.error(`Erro ao criar conteúdo "${content.title}":`, error);
    }
  }
};

// Função principal de inicialização
export const initializeFirestore = async () => {
  try {
    // Criar usuário admin
    await createAdminUser();

    // Verificar e criar categorias se necessário
    const categoriesExist = await collectionExists('categories');
    if (!categoriesExist) {
      console.log('Inicializando categorias...');
      await initializeCategories();
    }

    // Verificar e criar conteúdo se necessário
    const contentExists = await collectionExists('content');
    if (!contentExists) {
      console.log('Inicializando conteúdo...');
      await initializeContent();
    }

    console.log('Inicialização do Firestore concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a inicialização do Firestore:', error);
  }
}; 