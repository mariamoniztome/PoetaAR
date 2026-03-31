import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Ship, Flower, Cloud, QrCode, Camera } from 'lucide-react';
import QRScanner from '../components/QRScanner';

export default function LandingPage() {
  const [showScanner, setShowScanner] = useState(false);

  return (
    <div className="w-full h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 font-sans">
      {showScanner && <QRScanner onClose={() => setShowScanner(false)} />}

      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-light tracking-tighter uppercase">Imersão AR</h1>
          <p className="text-neutral-400 text-sm tracking-widest uppercase">Experiências Imersivas</p>
        </div>

        <div className="pt-8 flex flex-col gap-4">
          <button 
            onClick={() => setShowScanner(true)}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded-full font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all transform hover:scale-105"
          >
            <Camera size={20} />
            Digitalizar QR Code
          </button>
          
          <Link 
            to="/markers"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white rounded-full font-medium hover:bg-white/20 transition-colors"
          >
            <QrCode size={18} />
            Gerar QR Codes
          </Link>
        </div>

        <p className="text-neutral-500 text-[10px] uppercase tracking-[0.3em] pt-12">
          Acesso restrito via QR Code
        </p>
      </div>
    </div>
  );
}
