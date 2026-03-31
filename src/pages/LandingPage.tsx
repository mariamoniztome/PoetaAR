import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, X } from 'lucide-react';
import QRScanner from '../components/QRScanner';
import TimelineScreen from '../components/timeline/TimelineScreen';
import type { AppTexts, PoemData } from '../types/content';

export default function LandingPage() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [content, setContent] = useState<{ texts: AppTexts; poems: PoemData[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/data/texts.json');
        if (!response.ok) throw new Error('Failed to fetch texts.json');
        const data = await response.json();
        setContent({
          texts: data,
          poems: data.poems
        });
      } catch (error) {
        console.error('Error loading content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (isLoading || !content) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-2 border-black/10 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Main Timeline Screen */}
      <TimelineScreen 
        texts={content.texts} 
        poems={content.poems} 
        onEnterAr={() => setIsScannerOpen(true)} 
      />

      {/* QR Scanner Overlay */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col">
          <div className="p-6 flex justify-between items-center text-white z-10">
            <div className="flex items-center gap-3">
              <QrCode className="w-6 h-6" />
              <span className="font-mono text-xs uppercase tracking-widest">Digitalizar Marcador</span>
            </div>
            <button 
              onClick={() => setIsScannerOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex-1 relative">
            <QRScanner onClose={() => setIsScannerOpen(false)} />
          </div>

          <div className="p-8 text-center text-white/40 text-[10px] uppercase tracking-[0.3em] font-mono z-10">
            Aponta a câmara para um QR Code do Poeta
          </div>
        </div>
      )}

      {/* Markers Link (Hidden but accessible for testing/printing) */}
      <Link 
        to="/markers" 
        className="fixed bottom-6 right-6 z-[150] p-3 bg-white/80 backdrop-blur-sm border border-black/10 rounded-full opacity-20 hover:opacity-100 transition-opacity"
        title="Ver Marcadores"
      >
        <QrCode className="w-5 h-5" />
      </Link>
    </main>
  );
}
