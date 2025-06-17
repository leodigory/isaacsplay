const API_KEY = 'cadb9d5f412133802363ac8b2efc9210';
const BASE_URL = 'https://api.themoviedb.org/3';

export const fetchMovieDetails = async (title) => {
  try {
    const searchResponse = await fetch(
      `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(title)}&language=pt-BR`
    );
    const searchData = await searchResponse.json();

    if (searchData.results.length > 0) {
      const movie = searchData.results[0];
      return {
        id: movie.id,
        title: movie.title || movie.name,
        overview: movie.overview,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
      };
    } else {
      console.warn(`Nenhum resultado encontrado para o título: ${title}`);
      return null;
    }
  } catch (error) {
    console.error('Erro ao buscar detalhes do filme:', error);
    return null;
  }
};