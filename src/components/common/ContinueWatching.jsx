import React from 'react';
import { ContentCarousel } from './ContentCarousel';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const ContinueWatching = () => {
  const { currentProfile } = useAuth();
  const navigate = useNavigate();

  const handleContentSelect = (content) => {
    if (content.type === 'series') {
      navigate(`/series/${content.id}`);
    } else {
      navigate(`/watch/${content.id}`);
    }
  };

  if (!currentProfile?.watchHistory?.length) {
    return null;
  }

  // Ordenar histórico por data de visualização mais recente
  const sortedHistory = [...currentProfile.watchHistory].sort((a, b) => 
    new Date(b.lastWatched) - new Date(a.lastWatched)
  );

  return (
    <div className="mb-8">
      <ContentCarousel
        title="Continuar Assistindo"
        items={sortedHistory}
        onItemSelect={handleContentSelect}
        showPreview={true}
      />
    </div>
  );
};

export default ContinueWatching; 