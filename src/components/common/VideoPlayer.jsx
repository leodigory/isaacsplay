import React, { useState, useRef, useEffect } from 'react';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  SkipBack,
  SkipForward,
  Settings
} from 'lucide-react';

export const VideoPlayer = ({ content, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);

  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const seekTime = (e.nativeEvent.offsetX / e.target.offsetWidth) * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  useKeyboardNavigation({
    onSpace: togglePlay,
    onArrowLeft: () => {
      if (videoRef.current) {
        videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
      }
    },
    onArrowRight: () => {
      if (videoRef.current) {
        videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
      }
    },
    onArrowUp: () => {
      setVolume(Math.min(1, volume + 0.1));
    },
    onArrowDown: () => {
      setVolume(Math.max(0, volume - 0.1));
    },
    onKeyF: toggleFullscreen,
    onKeyM: toggleMute,
    onEscape: onClose,
    enabled: true
  });

  return (
    <div
      ref={playerRef}
      className="relative w-full max-w-7xl aspect-video bg-black"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }}
    >
      <video
        ref={videoRef}
        src={content.videoUrl}
        className="w-full h-full"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        autoPlay
      />

      {/* Overlay de Controles */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Barra de Progresso */}
        <div 
          className="absolute bottom-20 left-0 right-0 h-1 bg-gray-600 cursor-pointer"
          onClick={handleSeek}
        >
          <div 
            className="h-full bg-red-600"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>

        {/* Controles */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={togglePlay}
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>

            <Button
              onClick={toggleMute}
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              {isMuted ? (
                <VolumeX className="h-6 w-6" />
              ) : (
                <Volume2 className="h-6 w-6" />
              )}
            </Button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24"
            />

            <div className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setPlaybackRate(playbackRate === 1 ? 1.5 : 1)}
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              {playbackRate}x
            </Button>

            <Button
              onClick={toggleFullscreen}
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? (
                <Minimize className="h-6 w-6" />
              ) : (
                <Maximize className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer; 