import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { searchContent } from '../services/firestore';
import ContentCard from '../components/common/ContentCard';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft } from 'lucide-react';

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (searchTerm) {
      performSearch();
    }
  }, [searchTerm]);

  const performSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const searchResults = await searchContent(searchTerm);
      setResults(searchResults);
    } catch (err) {
      console.error('Erro ao buscar conteúdo:', err);
      setError('Erro ao buscar conteúdo. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleContentSelect = (content) => {
    navigate(`/details/${content.id}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black to-transparent p-4">
        <div className="container mx-auto">
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleBack}
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>

            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar filmes, séries, canais..."
                  className="w-full bg-white/10 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                <Button
                  type="submit"
                  variant="ghost"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </header>

      {/* Results */}
      <div className="container mx-auto px-4 pt-24 pb-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600" />
            <span className="ml-4">Buscando...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <p className="text-red-600 text-xl mb-4">{error}</p>
            <Button onClick={performSearch} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        ) : results.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              Resultados para "{searchTerm}"
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {results.map((content) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  size="small"
                  onSelect={handleContentSelect}
                />
              ))}
            </div>
          </div>
        ) : searchTerm ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <p className="text-xl text-gray-400 mb-4">
              Nenhum resultado encontrado para "{searchTerm}"
            </p>
            <p className="text-gray-500">
              Tente buscar por outro termo ou verifique a ortografia
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <p className="text-xl text-gray-400">
              Digite algo para começar a buscar
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage; 