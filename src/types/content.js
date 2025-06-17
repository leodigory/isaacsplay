// Tipos de conteúdo
export const CONTENT_TYPES = {
  MOVIE: 'movie',
  SERIES: 'series',
  ANIME: 'anime',
  TV: 'tv'
};

// Estrutura base para todo conteúdo
export const baseContentSchema = {
  title: '', // Título do conteúdo
  description: '', // Descrição
  posterUrl: '', // URL do poster
  backdropUrl: '', // URL do backdrop
  trailerUrl: '', // URL do trailer (YouTube ID)
  type: CONTENT_TYPES.MOVIE, // Tipo do conteúdo
  rating: 0, // Avaliação (0-10)
  year: 0, // Ano de lançamento
  duration: '', // Duração (ex: "2h 15min")
  genre: [], // Gêneros
  category: '', // Categoria principal
  createdAt: null, // Timestamp de criação
  updatedAt: null // Timestamp de atualização
};

// Estrutura específica para filmes
export const movieSchema = {
  ...baseContentSchema,
  type: CONTENT_TYPES.MOVIE,
  director: '', // Diretor
  cast: [], // Elenco
  country: '', // País de origem
  language: '', // Idioma
  ageRating: '', // Classificação etária
  releaseDate: '', // Data de lançamento
  studio: '', // Estúdio
  url: '' // URL do vídeo
};

// Estrutura específica para séries
export const seriesSchema = {
  ...baseContentSchema,
  type: CONTENT_TYPES.SERIES,
  seasons: [], // Array de temporadas
  episodes: [], // Array de episódios
  status: '', // Status (Em andamento, Finalizada, etc.)
  network: '', // Rede/Streaming
  creator: '' // Criador
};

// Estrutura específica para animes
export const animeSchema = {
  ...baseContentSchema,
  type: CONTENT_TYPES.ANIME,
  episodes: [], // Array de episódios
  status: '', // Status
  studio: '', // Estúdio de animação
  source: '', // Fonte (Manga, Light Novel, etc.)
  season: '', // Temporada de lançamento
  nextEpisode: null // Data do próximo episódio
};

// Estrutura específica para TV
export const tvSchema = {
  ...baseContentSchema,
  type: CONTENT_TYPES.TV,
  channel: '', // Canal
  schedule: [], // Programação
  live: false, // Se é ao vivo
  streamUrl: '' // URL do stream
}; 