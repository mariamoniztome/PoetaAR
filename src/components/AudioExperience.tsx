import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface AudioExperienceProps {
  backgroundUrl: string;
  narrationUrl: string;
  autoPlay?: boolean;
}

export function AudioExperience({ 
  backgroundUrl, 
  narrationUrl, 
  autoPlay = true 
}: AudioExperienceProps) {
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const narrationAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [narrationStarted, setNarrationStarted] = useState(false);

  useEffect(() => {
    // 1. Initialize Background Audio
    const bgAudio = new Audio(backgroundUrl);
    bgAudio.loop = true;
    bgAudio.volume = 0.4;
    bgAudioRef.current = bgAudio;

    // 2. Initialize Narration Audio
    const narrationAudio = new Audio(narrationUrl);
    narrationAudio.loop = false;
    narrationAudio.volume = 1.0;
    narrationAudioRef.current = narrationAudio;

    // Handle narration end to restore volume
    narrationAudio.onended = () => {
      if (bgAudioRef.current) {
        bgAudioRef.current.volume = 0.4;
      }
    };

    if (autoPlay) {
      const startExperience = () => {
        // Start background sound
        bgAudio.play()
          .then(() => {
            setIsPlaying(true);
            
            // Wait 5 seconds before starting narration
            setTimeout(() => {
              if (narrationAudioRef.current && !isMuted) {
                // Lower background volume
                bgAudio.volume = 0.15;
                
                // Start narration
                narrationAudio.play()
                  .then(() => setNarrationStarted(true))
                  .catch(err => console.error("Narration failed:", err));
              }
            }, 5000);
          })
          .catch(() => {
            console.log("Autoplay blocked. Waiting for interaction.");
            setIsPlaying(false);
          });
      };

      // Try immediately
      startExperience();

      // Also on first click
      window.addEventListener('click', startExperience, { once: true });
      return () => {
        window.removeEventListener('click', startExperience);
        bgAudio.pause();
        narrationAudio.pause();
        bgAudio.src = "";
        narrationAudio.src = "";
      };
    }

    return () => {
      bgAudio.pause();
      narrationAudio.pause();
    };
  }, [backgroundUrl, narrationUrl, autoPlay]);

  const toggleMute = () => {
    if (!bgAudioRef.current || !narrationAudioRef.current) return;
    
    if (isMuted) {
      // Unmute
      bgAudioRef.current.muted = false;
      narrationAudioRef.current.muted = false;
      setIsMuted(false);
    } else {
      // Mute
      bgAudioRef.current.muted = true;
      narrationAudioRef.current.muted = true;
      setIsMuted(true);
    }
  };

  return (
    <div className="absolute top-6 right-6 z-30">
      <button 
        onClick={toggleMute}
        className="p-3 bg-black/20 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center"
        title={isMuted ? "Ativar Som" : "Mudar para Mudo"}
      >
        {!isMuted ? <Volume2 size={20} /> : <VolumeX size={20} className="text-red-400" />}
      </button>
    </div>
  );
}
