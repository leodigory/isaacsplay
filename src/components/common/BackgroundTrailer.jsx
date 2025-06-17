import React, { useEffect, useRef } from 'react';

const BackgroundTrailer = ({ content, isPlaying = true }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.play().catch(error => {
          console.error('Erro ao reproduzir vídeo:', error);
        });
      } else {
        video.pause();
      }
    }
  }, [isPlaying]);

  if (!content.trailerUrl) {
    return (
      <div className="absolute inset-0">
        <img
          src={content.backdropUrl || 'https://placehold.co/1920x1080/1a1a1a/ffffff?text=Sem+Imagem'}
          alt={content.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <video
        ref={videoRef}
        src={content.trailerUrl}
        className="w-full h-full object-cover"
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
    </div>
  );
};

export default BackgroundTrailer; 