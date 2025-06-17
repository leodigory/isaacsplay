import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Plus, 
  Check, 
  Info, 
  Star,
  Clock,
  Calendar
} from 'lucide-react';

export const ContentCard = ({ 
  content, 
  size = 'medium', 
  showPreview = true,
  onFocus,
  onBlur,
  isFocused = false,
  onSelect,
  isSelected
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showPreviewVideo, setShowPreviewVideo] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isInMyList, setIsInMyList] = useState(false);
  
  const hoverTimeoutRef = useRef(null);
  const previewTimeoutRef = useRef(null);
  const cardRef = useRef(null);
  
  const { currentProfile, addToFavorites, removeFromFavorites, user, addToMyList, removeFromMyList } = useAuth();
  const navigate = useNavigate();

  const sizeClasses = {
    small: 'w-48 h-72',
    medium: 'w-64 h-96',
    large: 'w-80 h-120'
  };

  const cardClass = sizeClasses[size] || sizeClasses.medium;

  useEffect(() => {
    if (currentProfile?.favorites) {
      setIsFavorite(currentProfile.favorites.some(fav => fav.contentId === content.id));
    }
  }, [currentProfile?.favorites, content.id]);

  useEffect(() => {
    if (user?.myList?.includes(content.id)) {
      setIsInMyList(true);
    }
  }, [user?.myList, content.id]);

  useEffect(() => {
    if (isFocused && cardRef.current) {
      cardRef.current.focus();
    }
  }, [isFocused]);

  useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [isSelected]);

  useKeyboardNavigation({
    onEnter: () => {
      if (isSelected) {
        onSelect?.(content);
      }
    }
  });

  const handleMouseEnter = () => {
    setIsHovered(true);
    onFocus?.(content);
    
    if (showPreview && content.trailerUrl) {
      hoverTimeoutRef.current = setTimeout(() => {
        setShowPreviewVideo(true);
      }, 500); // Mostrar preview após 0.5 segundos
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowPreviewVideo(false);
    onBlur?.();
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }
  };

  const handlePlay = (e) => {
    e.stopPropagation();
    if (content.type === 'series') {
      navigate(`/series/${content.id}`);
    } else {
      navigate(`/watch/${content.id}`);
    }
  };

  const handleAddToFavorites = async (e) => {
    e.stopPropagation();
    try {
      const wasAdded = await addToFavorites(content.id, content);
      setIsFavorite(wasAdded);
    } catch (error) {
      console.error('Erro ao atualizar favoritos:', error);
    }
  };

  const handleRemoveFromFavorites = async (e) => {
    e.stopPropagation();
    try {
      await removeFromFavorites(content.id);
      setIsFavorite(false);
    } catch (error) {
      console.error('Erro ao remover favoritos:', error);
    }
  };

  const handleMoreInfo = (e) => {
    e.stopPropagation();
    navigate(`/details/${content.id}`);
  };

  const toggleMyList = async (e) => {
    e.stopPropagation();
    try {
      if (isInMyList) {
        await removeFromMyList(content.id);
        setIsInMyList(false);
      } else {
        await addToMyList(content.id);
        setIsInMyList(true);
      }
    } catch (error) {
      console.error('Erro ao atualizar lista:', error);
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatYear = (date) => {
    if (!date) return '';
    return new Date(date).getFullYear();
  };

  const getPlaceholderImage = (content) => {
    if (!content) {
      return `https://placehold.co/640x360/1a1a1a/666666?text=Sem+Imagem`;
    }
    return content.backdropUrl || content.thumbnailUrl || `https://placehold.co/640x360/1a1a1a/666666?text=${encodeURIComponent(content.title || 'Sem Imagem')}`;
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative group cursor-pointer transition-all duration-300 transform ${
        isSelected ? 'scale-110 z-10' : 'scale-100'
      } ${isHovered ? 'z-20' : 'z-0'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={() => {
        onFocus?.(content);
        setIsHovered(true);
      }}
      onBlur={() => setIsHovered(false)}
      tabIndex={0}
      role="button"
      aria-label={content.title}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className={`relative ${cardClass} overflow-hidden rounded-lg shadow-lg`}>
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
            <div className="text-gray-600">Carregando...</div>
          </div>
        )}
        
        <img
          src={getPlaceholderImage(content)}
          alt={content.title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-90'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />

        {/* Preview Video */}
        {showPreviewVideo && content.trailerUrl && (
          <div className="absolute inset-0 bg-black">
            <video
              src={content.trailerUrl}
              autoPlay
              muted
              loop
              className="w-full h-full object-cover"
              onError={() => setShowPreviewVideo(false)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        )}

        {/* Overlay com informações */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${
          isHovered || isSelected ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white text-lg font-semibold truncate">{content.title}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              {content.year && <span>{formatYear(content.year)}</span>}
              {content.rating && (
                <span className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  {content.rating}
                </span>
              )}
              {content.duration && (
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDuration(content.duration)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Indicador de foco */}
        {isSelected && (
          <div className="absolute inset-0 border-2 border-white rounded-lg pointer-events-none" />
        )}

        {/* Botões de ação */}
        <div className={`absolute inset-0 flex items-center justify-center space-x-2 transition-opacity duration-300 ${
          isHovered || isSelected ? 'opacity-100' : 'opacity-0'
        }`}>
          <Button
            onClick={handlePlay}
            size="sm"
            className="bg-white text-black hover:bg-gray-200 px-4 py-2 text-sm font-semibold"
          >
            <Play className="h-4 w-4 mr-1 fill-current" />
            {content.type === 'series' ? 'Ver Episódios' : 'Assistir'}
          </Button>
          
          <Button
            onClick={toggleMyList}
            size="sm"
            variant="outline"
            className="border-white text-white hover:bg-white/20 p-2"
          >
            {isInMyList ? (
              <Check className="h-5 w-5 text-green-400" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex space-x-2">
          {content.quality && (
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded font-semibold">
              {content.quality}
            </span>
          )}
          {content.type && (
            <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">
              {content.type === 'movie' ? 'Filme' : content.type === 'series' ? 'Série' : 'TV'}
            </span>
          )}
        </div>

        {/* Barra de progresso */}
        {content.progress && content.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
            <div 
              className="h-full bg-red-600 transition-all duration-300"
              style={{ width: `${Math.min(content.progress, 100)}%` }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ContentCard;

