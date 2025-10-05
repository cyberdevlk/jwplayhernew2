import { useEffect, useRef, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { AlertCircle, RotateCcw, Home, Info, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

declare global {
  interface Window {
    jwplayer: any;
  }
}

type StretchingMode = "fill" | "uniform" | "exactfit" | "none";

export default function Player() {
  const [, params] = useRoute("/Play/*");
  const [, downloadParams] = useRoute("/Down/*");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [stretchingMode, setStretchingMode] = useState<StretchingMode>(() => {
    const saved = localStorage.getItem('jwplayer-stretching-mode');
    return (saved as StretchingMode) || 'fill';
  });
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const [, setLocation] = useLocation();

  const isDownloadMode = downloadParams !== null;
  const routeParams = isDownloadMode ? downloadParams : params;
  const videoUrl: string = (routeParams && typeof routeParams === 'object' && '*' in routeParams)
    ? (routeParams['*'] as string)
    : '';

  useEffect(() => {
    // Load JW Player script with fallback CDN URLs
    const loadJWPlayer = () => {
      if (window.jwplayer) {
        initPlayer();
        return;
      }

      const cdnUrls = [
        'https://cdn.jwplayer.com/libraries/KB5zFt7A.js',
        'https://cdn.jwplayer.com/libraries/jwplayer-8.min.js',
        'https://ssl.p.jwpcdn.com/player/v/8.31.1/jwplayer.js'
      ];

      let attemptIndex = 0;

      const tryLoadScript = () => {
        if (attemptIndex >= cdnUrls.length) {
          setError('Failed to load JW Player from all available sources. This may be due to network restrictions, ad blockers, or browser security settings. Please check your network connection and browser extensions.');
          return;
        }

        const script = document.createElement('script');
        script.src = cdnUrls[attemptIndex];

        script.onload = () => {
          console.log(`Successfully loaded JW Player from: ${cdnUrls[attemptIndex]}`);
          initPlayer();
        };

        script.onerror = () => {
          console.warn(`Failed to load JW Player from: ${cdnUrls[attemptIndex]}`);
          attemptIndex++;
          script.remove();
          tryLoadScript();
        };

        document.head.appendChild(script);
      };

      tryLoadScript();

      // Load CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jwplayer.com/libraries/jwplayer-8.min.css';
      document.head.appendChild(link);
    };

    if (videoUrl) {
      if (isDownloadMode) {
        // Handle download mode
        window.location.href = `/api/download?url=${encodeURIComponent(videoUrl)}`;
        return;
      }
      loadJWPlayer();
    } else {
      setError('No video URL provided');
      setIsLoading(false);
    }

    return () => {
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.remove();
        } catch (e) {
          console.error('Error removing player:', e);
        }
      }
    };
  }, [videoUrl, isDownloadMode, stretchingMode]);

  const initPlayer = () => {
    if (!window.jwplayer || !playerRef.current || !videoUrl) return;

    try {
      // Set JW Player license key
      window.jwplayer.key = "64HPbvSQorQcd52B8XFuhMtEoitbvY/EXJmMBfKcXZQU2Rnn";

      // Decode the video URL
      const decodedVideoUrl = decodeURIComponent(videoUrl);

      // Initialize player with FIXED configuration
      const player = window.jwplayer(playerRef.current).setup({
        file: decodedVideoUrl,
        width: "100%",
        height: "100vh",
        aspectratio: "16:9",
        preload: "auto",
        
        // Stretching mode - user can toggle between modes
        stretching: stretchingMode,
        
        // FIXED: Removed semi-transparent black background and simplified skin config
        skin: {
          name: "custom",
          active: "#e50914", // Primary red color for active elements
          inactive: "#ffffff" // White for inactive elements
          // REMOVED: background: "rgba(0, 0, 0, 0.5)" - This was causing the dark overlay
        },
        
        controls: true,
        displaytitle: false,
        displaydescription: false,
        hlshtml: true,
        primary: "html5",
        renderCaptionsNatively: false,
        cast: {},
        related: {
          displayMode: "none"
        }
      });

      playerInstanceRef.current = player;

      // Player event handlers
      player.on('ready', () => {
        setIsLoading(false);
        console.log('✅ JW Player initialized with fixed settings');
        console.log(`✅ Stretching mode: ${stretchingMode}`);
        console.log('✅ Dark background removed');

        // Add custom skip buttons
        player.addButton(
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8zm-1.1 11h-.85v-3.26l-1.01.31v-.69l1.77-.63h.09V16zm4.28-1.76c0 .32-.03.6-.1.82s-.17.42-.29.57-.28.26-.45.33-.37.1-.59.1-.41-.03-.59-.1-.33-.18-.46-.33-.23-.34-.3-.57-.11-.5-.11-.82v-.74c0-.32.03-.6.1-.82s.17-.42.29-.57.28-.26.45-.33.37-.1.59-.1.41.03.59.1.33.18.46.33.23.34.3.57.11.5.11.82v.74zm-.85-.86c0-.19-.01-.35-.04-.48s-.07-.23-.12-.31-.11-.14-.19-.17-.16-.05-.25-.05-.18.02-.25.05-.14.09-.19.17-.09.18-.12.31-.04.29-.04.48v.97c0 .19.01.35.04.48s.07.24.12.32.11.14.19.17.16.05.25.05.18-.02.25-.05.14-.09.19-.17.09-.19.12-.32.04-.29.04-.48v-.97z"/></svg>',
          'Skip Back 10s',
          () => {
            const currentPosition = player.getPosition();
            player.seek(Math.max(0, currentPosition - 10));
          },
          'skip-back-10'
        );

        player.addButton(
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8zm-1.1 11h-.85v-3.26l-1.01.31v-.69l1.77-.63h.09V16zm4.28-1.76c0 .32-.03.6-.1.82s-.17.42-.29.57-.28.26-.45.33-.37.1-.59.1-.41-.03-.59-.1-.33-.18-.46-.33-.23-.34-.3-.57-.11-.5-.11-.82v-.74c0-.32.03-.6.1-.82s.17-.42.29-.57.28-.26.45.33.37-.1.59-.1.41.03.59.1.33.18.46.33.23.34.3.57.11.5.11.82v.74zm-.85-.86c0-.19-.01-.35-.04-.48s-.07-.23-.12-.31-.11-.14-.19-.17-.16-.05-.25-.05-.18.02-.25.05-.14.09-.19.17-.09.18-.12.31-.04.29-.04.48v.97c0 .19.01.35.04.48s.07.24.12.32.11.14.19.17.16.05.25.05.18-.02.25-.05.14-.09.19-.17.09-.19.12-.32.04-.29.04-.48v-.97z"/></svg>',
          'Skip Forward 10s',
          () => {
            const currentPosition = player.getPosition();
            const duration = player.getDuration();
            player.seek(Math.min(duration, currentPosition + 10));
          },
          'skip-forward-10'
        );
      });

      player.on('error', (error: any) => {
        console.error('JW Player Error:', error);
        setIsLoading(false);
        setError(error.message || 'Failed to load video. Please check the video URL and try again.');
      });

      player.on('buffer', () => {
        console.log('Buffering...');
      });

      player.on('bufferFull', () => {
        console.log('Buffer full - smooth playback');
      });

      // Keyboard shortcuts
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!player) return;
        if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return;

        switch(e.key) {
          case ' ':
            e.preventDefault();
            player.getState() === 'playing' ? player.pause() : player.play();
            break;
          case 'ArrowLeft':
            e.preventDefault();
            player.seek(Math.max(0, player.getPosition() - 10));
            break;
          case 'ArrowRight':
            e.preventDefault();
            const duration = player.getDuration();
            player.seek(Math.min(duration, player.getPosition() + 10));
            break;
          case 'ArrowUp':
            e.preventDefault();
            player.setVolume(Math.min(100, player.getVolume() + 10));
            break;
          case 'ArrowDown':
            e.preventDefault();
            player.setVolume(Math.max(0, player.getVolume() - 10));
            break;
          case 'f':
            e.preventDefault();
            player.setFullscreen(!player.getFullscreen());
            break;
          case 'm':
            e.preventDefault();
            player.setMute(!player.getMute());
            break;
          case '?':
            e.preventDefault();
            setShowInfo(!showInfo);
            break;
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };

    } catch (err) {
      console.error('Error initializing player:', err);
      setError('Failed to initialize video player');
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);

    // Clean up existing player instance
    if (playerInstanceRef.current) {
      try {
        playerInstanceRef.current.remove();
        playerInstanceRef.current = null;
      } catch (e) {
        console.error('Error removing player for retry:', e);
      }
    }

    // Remove all JW Player scripts and try to reload
    const scripts = document.querySelectorAll('script[src*="jwplayer"], script[src*="jwpcdn"], script[src*="jwplatform"]');
    scripts.forEach(script => script.remove());

    // Clear window.jwplayer to force fresh load
    if (window.jwplayer) {
      delete (window as any).jwplayer;
    }

    // Trigger reload
    window.location.reload();
  };

  const handleGoHome = () => {
    setLocation('/');
  };

  const handleStretchingModeChange = (mode: StretchingMode) => {
    setStretchingMode(mode);
    localStorage.setItem('jwplayer-stretching-mode', mode);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" data-testid="error-overlay">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="w-16 h-16 text-primary mx-auto mb-4" data-testid="icon-error" />
          <h2 className="text-2xl font-bold mb-2" data-testid="text-error-title">Playback Error</h2>
          <p className="text-muted-foreground mb-6" data-testid="text-error-message">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleRetry} className="flex items-center gap-2" data-testid="button-retry">
              <RotateCcw className="w-4 h-4" />
              Retry
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="flex items-center gap-2" data-testid="button-home">
              <Home className="w-4 h-4" />
              Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black relative" data-testid="player-container">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background flex items-center justify-center z-50" data-testid="loading-overlay">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4" data-testid="loading-spinner"></div>
            <p className="text-foreground text-lg mb-2" data-testid="text-loading">Loading video player...</p>
            <p className="text-muted-foreground text-sm" data-testid="text-loading-details">Initializing with optimized settings</p>
          </div>
        </div>
      )}

      {/* Info Banner */}
      {showInfo && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-6 py-3 rounded-lg z-40 max-w-md text-center text-sm" data-testid="info-banner">
          Player initialized with fixed settings - No dark background!
        </div>
      )}

      {/* Top Controls */}
      <div className="absolute top-4 left-4 z-40 flex items-center gap-3">
        <Button
          onClick={handleGoHome}
          variant="secondary"
          size="sm"
          className="flex items-center gap-2"
          data-testid="button-back-home"
        >
          <Home className="w-4 h-4" />
          Home
        </Button>

        {/* Stretching Mode Selector */}
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5">
          <Maximize className="w-4 h-4 text-muted-foreground" />
          <Select value={stretchingMode} onValueChange={handleStretchingModeChange}>
            <SelectTrigger className="w-[130px] h-8 text-sm border-0 focus:ring-0 shadow-none" data-testid="select-stretching-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fill" data-testid="stretching-fill">Fill (No Bars)</SelectItem>
              <SelectItem value="uniform" data-testid="stretching-uniform">Uniform (Fit)</SelectItem>
              <SelectItem value="exactfit" data-testid="stretching-exactfit">Exact Fit</SelectItem>
              <SelectItem value="none" data-testid="stretching-none">None (Original)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="absolute bottom-4 right-4 z-40">
        <Button
          onClick={() => setShowInfo(!showInfo)}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          data-testid="button-toggle-info"
        >
          <Info className="w-4 h-4" />
          Info
        </Button>
      </div>

      {showInfo && (
        <div className="absolute bottom-16 right-4 bg-card border border-border rounded-lg p-4 z-40 max-w-xs" data-testid="shortcuts-help">
          <h3 className="font-semibold mb-3 text-primary">Keyboard Shortcuts</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Play/Pause</span>
              <kbd className="bg-muted px-2 py-1 rounded text-xs">Space</kbd>
            </div>
            <div className="flex justify-between">
              <span>Skip Back</span>
              <kbd className="bg-muted px-2 py-1 rounded text-xs">←</kbd>
            </div>
            <div className="flex justify-between">
              <span>Skip Forward</span>
              <kbd className="bg-muted px-2 py-1 rounded text-xs">→</kbd>
            </div>
            <div className="flex justify-between">
              <span>Volume Up</span>
              <kbd className="bg-muted px-2 py-1 rounded text-xs">↑</kbd>
            </div>
            <div className="flex justify-between">
              <span>Volume Down</span>
              <kbd className="bg-muted px-2 py-1 rounded text-xs">↓</kbd>
            </div>
            <div className="flex justify-between">
              <span>Fullscreen</span>
              <kbd className="bg-muted px-2 py-1 rounded text-xs">F</kbd>
            </div>
            <div className="flex justify-between">
              <span>Mute</span>
              <kbd className="bg-muted px-2 py-1 rounded text-xs">M</kbd>
            </div>
          </div>
        </div>
      )}

      {/* Player Container */}
      <div className="w-full h-full">
        <div ref={playerRef} className="w-full h-full" data-testid="jwplayer-container" />
      </div>
    </div>
  );
}
