import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface MusicPlayerProps {
  url: string;
  autoPlay?: boolean;
}

export function MusicPlayer({ url, autoPlay = true }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;

    if (autoPlay) {
      const playAudio = () => {
        audio.play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            console.log("Autoplay blocked by browser. User must interact first.");
            setIsPlaying(false);
          });
      };

      // Try to play immediately
      playAudio();

      // Also try on first click anywhere if blocked
      window.addEventListener('click', playAudio, { once: true });
      return () => window.removeEventListener('click', playAudio);
    }

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [url, autoPlay]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setError(true));
    }
  };

  return (
    <div className="absolute top-6 right-6 z-30">
      <button 
        onClick={togglePlay}
        className="p-3 bg-black/20 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center"
        title={isPlaying ? "Mudar para Mudo" : "Tocar Música"}
      >
        {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} className="text-red-400" />}
      </button>
    </div>
  );
}
