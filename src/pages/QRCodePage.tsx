import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Ship, Flower, Cloud, ArrowLeft } from 'lucide-react';

export default function QRCodePage() {
  const baseUrl = window.location.origin;

  const scenes = [
    { id: 'sea', name: 'Alto Mar', icon: <Ship size={24} />, color: '#3b82f6', url: `${baseUrl}/scene/sea` },
    { id: 'field', name: 'Campo de Flores', icon: <Flower size={24} />, color: '#10b981', url: `${baseUrl}/scene/field` },
    { id: 'sky', name: 'Céu Aberto', icon: <Cloud size={24} />, color: '#0ea5e9', url: `${baseUrl}/scene/sky` },
  ];

  return (
    <div className="w-full min-h-screen bg-neutral-950 text-white flex flex-col items-center p-6 font-sans">
      <div className="max-w-4xl w-full space-y-12">
        <div className="flex items-center justify-between">
          <Link 
            to="/"
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar
          </Link>
          <h1 className="text-3xl font-light tracking-widest uppercase">Gerar QR Codes</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {scenes.map((scene) => (
            <div 
              key={scene.id}
              className="flex flex-col items-center p-8 bg-white/5 border border-white/10 rounded-3xl space-y-6"
            >
              <div className="p-4 rounded-2xl" style={{ backgroundColor: `${scene.color}20`, color: scene.color }}>
                {scene.icon}
              </div>
              <h3 className="font-medium text-lg">{scene.name}</h3>
              
              <div className="p-4 bg-white rounded-2xl">
                <QRCodeSVG 
                  value={scene.url} 
                  size={180}
                  level="H"
                  includeMargin={false}
                />
              </div>
              
              <p className="text-xs text-neutral-500 text-center">
                Digitaliza este código com o teu telemóvel para entrares na cena em AR.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
