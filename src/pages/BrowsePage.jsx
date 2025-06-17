import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  getFeaturedContent, 
  getContentByCategory, 
  getCategories 
} from '../services/firestore';
import ContentCarousel from '../components/common/ContentCarousel';
import ContinueWatching from '../components/common/ContinueWatching';
import { Button } from '@/components/ui/button';
import { Search, User } from 'lucide-react';

const BrowsePage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [featuredContent, setFeaturedContent] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryContent, setCategoryContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        
        // Carregar conteúdo em destaque
        const featured = await getFeaturedContent();
        setFeaturedContent(featured);
        
        // Carregar categorias
        const cats = await getCategories();
        setCategories(cats);
        
        // Carregar conteúdo por categoria
        const contentByCategory = {};
        for (const category of cats) {
          const content = await getContentByCategory(category.id);
          contentByCategory[category.id] = content;
        }
        setCategoryContent(contentByCategory);
      } catch (err) {
        console.error('Erro ao carregar conteúdo:', err);
        setError('Erro ao carregar conteúdo. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  const handleContentSelect = (content) => {
    setSelectedContent(content);
    navigate(`/details/${content.id}`);
  };

  const handleSearch = () => {
    navigate('/search');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600" />
        <span className="ml-4 text-white">Carregando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 text-xl mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black to-transparent p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-red-600">IsaacPlay</h1>
          
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleSearch}
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <Search className="h-6 w-6" />
            </Button>
            
            <Button
              onClick={handleProfile}
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <User className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {featuredContent.length > 0 && (
        <div className="relative h-screen">
          <div className="absolute inset-0">
            <img
              src={featuredContent[0].backdropUrl}
              alt={featuredContent[0].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>

          <div className="relative z-10 container mx-auto px-4 h-full flex items-end pb-32">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-bold mb-4">{featuredContent[0].title}</h2>
              <p className="text-lg text-gray-300 mb-8">{featuredContent[0].description}</p>
              <div className="flex space-x-4">
                <Button
                  onClick={() => handleContentSelect(featuredContent[0])}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700"
                >
                  Assistir
                </Button>
                <Button
                  onClick={() => handleContentSelect(featuredContent[0])}
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/20"
                >
                  Mais Informações
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Continue Watching */}
      <div className="container mx-auto px-4 py-8">
        <ContinueWatching onContentSelect={handleContentSelect} />
      </div>

      {/* Categories */}
      <div className="container mx-auto px-4 py-8">
        {categories.map(category => (
          <div key={category.id} className="mb-8">
            <ContentCarousel
              title={category.name}
              items={categoryContent[category.id] || []}
              onItemSelect={handleContentSelect}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowsePage;

