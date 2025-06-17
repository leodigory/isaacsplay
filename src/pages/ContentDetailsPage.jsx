import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getContentById } from '../services/firestore';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Plus, 
  Check, 
  Share2, 
  ThumbsUp, 
  MessageSquare,
  ArrowLeft
} from 'lucide-react';
import VideoPlayer from '../components/common/VideoPlayer';
import BackgroundTrailer from '../components/common/BackgroundTrailer';

const ContentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInMyList, setIsInMyList] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const contentData = await getContentById(id);
        if (contentData) {
          setContent(contentData);
          // Verificar se o conteúdo está na lista do usuário
          if (user?.myList?.includes(id)) {
            setIsInMyList(true);
          }
        } else {
          setError('Conteúdo não encontrado');
        }
      } catch (err) {
        setError('Erro ao carregar conteúdo');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [id, user]);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handleClose = () => {
    setIsPlaying(false);
  };

  const toggleMyList = async () => {
    try {
      // Implementar lógica para adicionar/remover da lista
      setIsInMyList(!isInMyList);
    } catch (err) {
      console.error('Erro ao atualizar lista:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 text-xl mb-4">{error}</p>
        <Button onClick={() => navigate(-1)} variant="outline">
          Voltar
        </Button>
      </div>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {isPlaying ? (
        <div className="fixed inset-0 z-50 bg-black">
          <VideoPlayer content={content} onClose={handleClose} />
        </div>
      ) : (
        <>
          <BackgroundTrailer content={content} isPlaying={!isPlaying} />
          
          {/* Overlay de Gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

          {/* Conteúdo */}
          <div className="relative z-10 container mx-auto px-4 pt-32 pb-8">
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              className="text-white hover:bg-white/20 mb-8"
            >
              <ArrowLeft className="h-6 w-6 mr-2" />
              Voltar
            </Button>

            <div className="max-w-4xl">
              <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
              
              <div className="flex items-center space-x-4 text-sm text-gray-300 mb-6">
                <span>{content.year}</span>
                <span>•</span>
                <span>{content.duration}</span>
                <span>•</span>
                <span>{content.rating}</span>
              </div>

              <p className="text-lg text-gray-300 mb-8">{content.description}</p>

              <div className="flex items-center space-x-4">
                <Button
                  onClick={handlePlay}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Play className="h-6 w-6 mr-2" />
                  Assistir
                </Button>

                <Button
                  onClick={toggleMyList}
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/20"
                >
                  {isInMyList ? (
                    <>
                      <Check className="h-6 w-6 mr-2" />
                      Na Minha Lista
                    </>
                  ) : (
                    <>
                      <Plus className="h-6 w-6 mr-2" />
                      Minha Lista
                    </>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  className="text-white hover:bg-white/20"
                >
                  <Share2 className="h-6 w-6" />
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  className="text-white hover:bg-white/20"
                >
                  <ThumbsUp className="h-6 w-6" />
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  className="text-white hover:bg-white/20"
                >
                  <MessageSquare className="h-6 w-6" />
                </Button>
              </div>

              {/* Informações Adicionais */}
              <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-gray-300">
                <div>
                  <p><span className="text-gray-500">Elenco:</span> {content.cast?.join(', ')}</p>
                  <p><span className="text-gray-500">Gêneros:</span> {content.genres?.join(', ')}</p>
                </div>
                <div>
                  <p><span className="text-gray-500">Diretor:</span> {content.director}</p>
                  <p><span className="text-gray-500">País:</span> {content.country}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ContentDetailsPage;

