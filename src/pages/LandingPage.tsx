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

        <div className="grid grid-cols-1 gap-4">
          <Link 
            to="/scene/sea"
            className="group relative flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-blue-500/20 hover:border-blue-500/50 transition-all duration-500"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Ship size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Alto Mar</h3>
                <p className="text-xs text-neutral-500">Oceano profundo e barcos</p>
              </div>
            </div>
            <div className="text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Entrar</div>
          </Link>

          <Link 
            to="/scene/field"
            className="group relative flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all duration-500"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Flower size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Campo de Flores</h3>
                <p className="text-xs text-neutral-500">Vento e flores selvagens</p>
              </div>
            </div>
            <div className="text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Entrar</div>
          </Link>

          <Link 
            to="/scene/sky"
            className="group relative flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-sky-500/20 hover:border-sky-500/50 transition-all duration-500"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-sky-500/20 rounded-xl group-hover:bg-sky-500 group-hover:text-white transition-colors">
                <Cloud size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Céu Aberto</h3>
                <p className="text-xs text-neutral-500">Nuvens e bando de pássaros</p>
              </div>
            </div>
            <div className="text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Entrar</div>
          </Link>
        </div>

        <div className="pt-8 flex flex-col gap-4">
          <button 
            onClick={() => setShowScanner(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-neutral-200 transition-colors"
          >
            <Camera size={18} />
            Digitalizar QR Code
          </button>
          
          <Link 
            to="/qrcodes"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white rounded-full font-medium hover:bg-white/20 transition-colors"
          >
            <QrCode size={18} />
            Gerar QR Codes
          </Link>
        </div>
      </div>
    </div>
  );
}
