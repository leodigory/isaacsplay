// Firestore Security Rules
export const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Função auxiliar para verificar se o usuário está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Função auxiliar para verificar se o usuário é o dono do documento
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Regras para a coleção de usuários
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId);
      
      // Regras para subcoleções de usuários
      match /profiles/{profileId} {
        allow read: if isAuthenticated();
        allow write: if isOwner(userId);
      }
      
      match /favorites/{favoriteId} {
        allow read: if isAuthenticated();
        allow write: if isOwner(userId);
      }
    }

    // Regras para a coleção de conteúdo
    match /content/{contentId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.token.admin == true;
      
      // Regras para subcoleções de conteúdo
      match /episodes/{episodeId} {
        allow read: if isAuthenticated();
        allow write: if isAuthenticated() && request.auth.token.admin == true;
      }
    }

    // Regras para a coleção de categorias
    match /categories/{categoryId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.token.admin == true;
    }
  }
}
`;

// Estrutura das coleções do Firestore
export const collections = {
  users: {
    fields: {
      email: 'string',
      displayName: 'string',
      photoURL: 'string',
      createdAt: 'timestamp',
      lastLogin: 'timestamp',
      isAdmin: 'boolean'
    },
    subcollections: {
      profiles: {
        fields: {
          name: 'string',
          avatar: 'string',
          isChild: 'boolean',
          pin: 'string',
          preferences: 'map'
        }
      },
      favorites: {
        fields: {
          contentId: 'string',
          contentType: 'string',
          addedAt: 'timestamp'
        }
      }
    }
  },
  content: {
    fields: {
      title: 'string',
      description: 'string',
      type: 'string', // 'movie', 'series', 'documentary'
      genre: 'array',
      releaseYear: 'number',
      duration: 'number',
      rating: 'number',
      posterUrl: 'string',
      thumbnailUrl: 'string',
      trailerUrl: 'string',
      videoUrl: 'string',
      categoryId: 'string',
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    },
    subcollections: {
      episodes: {
        fields: {
          title: 'string',
          description: 'string',
          season: 'number',
          episode: 'number',
          duration: 'number',
          videoUrl: 'string',
          thumbnailUrl: 'string'
        }
      }
    }
  },
  categories: {
    fields: {
      name: 'string',
      description: 'string',
      order: 'number',
      isActive: 'boolean'
    }
  }
}; 