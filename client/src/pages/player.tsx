import { useEffect, useRef, useState } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    jwplayer: any;
  }
}

export default function Player() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);

  // Get video URL from current window location
  const getVideoUrl = () => {
    const path = window.location.pathname;
    
    // Check for /Play/ or /Down/ routes
    const playMatch = path.match(/\/Play\/(.+)/);
    const downMatch = path.match(/\/Down\/(.+)/);
    
    if (downMatch) {
      // Handle download mode
      const url = decodeURIComponent(downMatch[1]);
      window.location.href = `/api/download?url=${encodeURIComponent(url)}`;
      return null;
    }
    
    if (playMatch) {
      return decodeURIComponent(playMatch[1]);
    }
    
    return null;
  };

  const videoUrl = getVideoUrl();

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
  }, [videoUrl]);

  const initPlayer = () => {
    if (!window.jwplayer || !playerRef.current || !videoUrl) return;

    try {
      // Set JW Player license key
      window.jwplayer.key = "64HPbvSQorQcd52B8XFuhMtEoitbvY/EXJmMBfKcXZQU2Rnn";

      // Decode the video URL
      const decodedVideoUrl = decodeURIComponent(videoUrl);

      // Initialize player with uniform stretching mode
      const player = window.jwplayer(playerRef.current).setup({
        file: decodedVideoUrl,
        width: "100%",
        height: "100%",
        aspectratio: "16:9",
        preload: "auto",
        
        // Fixed to uniform (fit) mode
        stretching: "uniform",
        
        skin: {
          name: "custom",
          active: "#e50914",
          inactive: "#ffffff"
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
        console.log('✅ JW Player initialized with uniform fit mode');

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
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8zm-1.1 11h-.85v-3.26l-1.01.31v-.69l1.77-.63h.09V16zm4.28-1.76c0 .32-.03.6-.1.82s-.17.42-.29.57-.28.26-.45.33-.37.1-.59.1-.41-.03-.59-.1-.33-.18-.46-.33-.23-.34-.3-.57-.11-.5-.11-.82v-.74c0-.32.03-.6.1-.82s.17-.42.29-.57.28-.26.45-.33.37-.1.59-.1.41.03.59.1.33.18.46.33.23.34.3.57.11.5.11.82v.74zm-.85-.86c0-.19-.01-.35-.04-.48s-.07-.23-.12-.31-.11-.14-.19-.17-.16-.05-.25-.05-.18.02-.25.05-.14.09-.19.17-.09.18-.12.31-.04.29-.04.48v.97c0 .19.01.35.04.48s.07.24.12.32.11.14.19.17.16.05.25.05.18-.02.25-.05.14-.09.19-.17.09-.19.12-.32.04-.29.04-.48v-.97z"/></svg>',
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

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-white">Playback Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={handleRetry} className="flex items-center gap-2 mx-auto bg-red-600 hover:bg-red-700">
            <RotateCcw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-black overflow-hidden">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-800 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg mb-2">Loading video player...</p>
            <p className="text-gray-400 text-sm">Initializing with uniform fit mode</p>
          </div>
        </div>
      )}

      {/* Player Container - Full viewport, no scrollbars */}
      <div className="w-full h-full">
        <div ref={playerRef} className="w-full h-full" />
      </div>
    </div>
  );
}
