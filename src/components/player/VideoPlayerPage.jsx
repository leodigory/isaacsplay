import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import ReactPlayer from 'react-player';
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
  ArrowLeft,
  Settings,
  Subtitles,
  RotateCcw
} from 'lucide-react';

export const VideoPlayerPage = () => {
  const { id } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Player state
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffering, setBuffering] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState('auto');
  const [subtitles, setSubtitles] = useState(false);
  
  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [focusedControl, setFocusedControl] = useState(0);
  const [controlsTimeout, setControlsTimeout] = useState(null);

  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const { currentProfile, updateContinueWatching } = useAuth();
  const navigate = useNavigate();

  const controls = ['play', 'backward', 'forward', 'volume', 'settings', 'fullscreen', 'back'];

  useKeyboardNavigation({
    onArrowLeft: () => {
      if (showSettings) return;
      setFocusedControl(prev => Math.max(0, prev - 1));
      showControlsTemporarily();
    },
    onArrowRight: () => {
      if (showSettings) return;
      setFocusedControl(prev => Math.min(controls.length - 1, prev + 1));
      showControlsTemporarily();
    },
    onArrowUp: () => {
      if (showSettings) return;
      setVolume(prev => Math.min(1, prev + 0.1));
      showControlsTemporarily();
    },
    onArrowDown: () => {
      if (showSettings) return;
      setVolume(prev => Math.max(0, prev - 0.1));
      showControlsTemporarily();
    },
    onEnter: () => {
      if (showSettings) return;
      handleKeyboardAction();
      showControlsTemporarily();
    },
    onEscape: () => {
      if (showSettings) {
        setShowSettings(false);
      } else if (fullscreen) {
        exitFullscreen();
      } else {
        handleBack();
      }
    },
    enabled: true
  });

  const handleKeyboardAction = () => {
    switch (controls[focusedControl]) {
      case 'play':
        setPlaying(!playing);
        break;
      case 'backward':
        seekTo(Math.max(0, played - 10 / duration));
        break;
      case 'forward':
        seekTo(Math.min(1, played + 10 / duration));
        break;
      case 'volume':
        setMuted(!muted);
        break;
      case 'settings':
        setShowSettings(!showSettings);
        break;
      case 'fullscreen':
        toggleFullscreen();
        break;
      case 'back':
        handleBack();
        break;
    }
  };

  useEffect(() => {
    loadContent();
    
    // Keyboard shortcuts
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT') return;
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          setPlaying(!playing);
          break;
        case 'm':
          setMuted(!muted);
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekTo(Math.max(0, played - 10 / duration));
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekTo(Math.min(1, played + 10 / duration));
          break;
      }
      showControlsTemporarily();
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [playing, muted, played, duration]);

  useEffect(() => {
    // Auto-hide controls
    if (playing && showControls) {
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      setControlsTimeout(timeout);
      
      return () => clearTimeout(timeout);
    }
  }, [playing, showControls]);

  const loadContent = async () => {
    try {
      setLoading(true);
      
      // Sample content with video URL
      const sampleContent = {
        id: id,
        title: 'Filme de Ação Épico',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        subtitleUrl: '',
        type: 'movie',
        duration: 120,
        currentTime: 0 // Resume from where user left off
      };

      setContent(sampleContent);
      
      // Resume from last position if available
      if (currentProfile?.continueWatching) {
        const continueItem = currentProfile.continueWatching.find(item => item.contentId === id);
        if (continueItem) {
          setPlayed(continueItem.currentTime / continueItem.duration);
        }
      }
    } catch (error) {
      console.error('Error loading content:', error);
      setError('Erro ao carregar vídeo.');
    } finally {
      setLoading(false);
    }
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
  };

  const seekTo = (fraction) => {
    if (playerRef.current) {
      playerRef.current.seekTo(fraction);
      setPlayed(fraction);
    }
  };

  const handleProgress = (state) => {
    setPlayed(state.played);
    
    // Update continue watching every 30 seconds
    if (content && state.playedSeconds % 30 < 1) {
      updateContinueWatching(
        content.id,
        content,
        state.playedSeconds,
        duration
      );
    }
  };

  const handleDuration = (duration) => {
    setDuration(duration);
  };

  const toggleFullscreen = () => {
    if (!fullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const handleBack = () => {
    // Save current progress before leaving
    if (content && duration > 0) {
      updateContinueWatching(
        content.id,
        content,
        played * duration,
        duration
      );
    }
    navigate(-1);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando vídeo...</div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Erro ao carregar vídeo</div>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={() => navigate(-1)} className="bg-red-600 hover:bg-red-700">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black ${fullscreen ? 'h-screen' : 'min-h-screen'}`}
      onMouseMove={showControlsTemporarily}
      onClick={showControlsTemporarily}
    >
      {/* Video Player */}
      <div className="relative w-full h-full flex items-center justify-center">
        <ReactPlayer
          ref={playerRef}
          url={content.videoUrl}
          playing={playing}
          volume={volume}
          muted={muted}
          playbackRate={playbackRate}
          width="100%"
          height={fullscreen ? "100%" : "100vh"}
          onProgress={handleProgress}
          onDuration={handleDuration}
          onBuffer={() => setBuffering(true)}
          onBufferEnd={() => setBuffering(false)}
          onEnded={() => {
            setPlaying(false);
            // Mark as completed and navigate back
            updateContinueWatching(content.id, content, duration, duration);
            navigate(-1);
          }}
          config={{
            file: {
              attributes: {
                crossOrigin: 'anonymous'
              }
            }
          }}
        />

        {/* Buffering Indicator */}
        {buffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Controls Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}>
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-6">
            <div className="flex items-center justify-between">
              <Button
                onClick={handleBack}
                variant="ghost"
                className="text-white hover:bg-white/20"
                data-focus-index="6"
              >
                <ArrowLeft className="h-6 w-6 mr-2" />
                Voltar
              </Button>
              
              <h1 className="text-white text-xl font-semibold">{content.title}</h1>
              
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setSubtitles(!subtitles)}
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <Subtitles className="h-6 w-6" />
                </Button>
                
                <Button
                  onClick={() => setShowSettings(!showSettings)}
                  variant="ghost"
                  className={`text-white hover:bg-white/20 ${
                    focusedControl === 4 ? 'ring-2 ring-red-600' : ''
                  }`}
                  data-focus-index="4"
                >
                  <Settings className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>

          {/* Center Play Button */}
          {!playing && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                onClick={() => setPlaying(true)}
                className="bg-white/20 hover:bg-white/30 text-white rounded-full p-6"
              >
                <Play className="h-12 w-12 fill-current" />
              </Button>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="relative">
                <div className="w-full h-1 bg-gray-600 rounded-full">
                  <div 
                    className="h-full bg-red-600 rounded-full transition-all duration-200"
                    style={{ width: `${played * 100}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.001}
                  value={played}
                  onChange={(e) => seekTo(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-4 opacity-0 cursor-pointer"
                />
              </div>
              
              <div className="flex justify-between text-white text-sm mt-2">
                <span>{formatTime(played * duration)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Play/Pause */}
                <Button
                  onClick={() => setPlaying(!playing)}
                  variant="ghost"
                  className={`text-white hover:bg-white/20 ${
                    focusedControl === 0 ? 'ring-2 ring-red-600' : ''
                  }`}
                  data-focus-index="0"
                >
                  {playing ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 fill-current" />}
                </Button>

                {/* Skip Backward */}
                <Button
                  onClick={() => seekTo(Math.max(0, played - 10 / duration))}
                  variant="ghost"
                  className={`text-white hover:bg-white/20 ${
                    focusedControl === 1 ? 'ring-2 ring-red-600' : ''
                  }`}
                  data-focus-index="1"
                >
                  <SkipBack className="h-6 w-6" />
                </Button>

                {/* Skip Forward */}
                <Button
                  onClick={() => seekTo(Math.min(1, played + 10 / duration))}
                  variant="ghost"
                  className={`text-white hover:bg-white/20 ${
                    focusedControl === 2 ? 'ring-2 ring-red-600' : ''
                  }`}
                  data-focus-index="2"
                >
                  <SkipForward className="h-6 w-6" />
                </Button>

                {/* Volume */}
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setMuted(!muted)}
                    variant="ghost"
                    className={`text-white hover:bg-white/20 ${
                      focusedControl === 3 ? 'ring-2 ring-red-600' : ''
                    }`}
                    data-focus-index="3"
                  >
                    {muted || volume === 0 ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                  </Button>
                  
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={muted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      setMuted(false);
                    }}
                    className="w-20 h-1 bg-gray-600 rounded-full appearance-none slider"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Playback Rate */}
                <select
                  value={playbackRate}
                  onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                  className="bg-transparent text-white border border-gray-600 rounded px-2 py-1 text-sm"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>

                {/* Fullscreen */}
                <Button
                  onClick={toggleFullscreen}
                  variant="ghost"
                  className={`text-white hover:bg-white/20 ${
                    focusedControl === 5 ? 'ring-2 ring-red-600' : ''
                  }`}
                  data-focus-index="5"
                >
                  {fullscreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute top-20 right-6 bg-black/90 rounded-lg p-6 min-w-64">
            <h3 className="text-white font-semibold mb-4">Configurações</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-gray-300 text-sm">Qualidade</label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 mt-1"
                >
                  <option value="auto">Automática</option>
                  <option value="1080p">1080p</option>
                  <option value="720p">720p</option>
                  <option value="480p">480p</option>
                </select>
              </div>
              
              <div>
                <label className="text-gray-300 text-sm">Velocidade</label>
                <select
                  value={playbackRate}
                  onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 mt-1"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>Normal</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Keyboard Instructions */}
        {showControls && (
          <div className="absolute bottom-20 left-6 bg-black/80 text-gray-400 text-sm px-4 py-2 rounded-lg">
            <div>Espaço: Play/Pause • ←→: Pular 10s • ↑↓: Volume • F: Tela cheia • M: Mudo</div>
          </div>
        )}
      </div>
    </div>
  );
};

