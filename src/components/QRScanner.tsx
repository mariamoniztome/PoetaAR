import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

interface QRScannerProps {
  onClose: () => void;
}

export default function QRScanner({ onClose }: QRScannerProps) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      /* verbose= */ false
    );

    const onScanSuccess = (decodedText: string) => {
      // Check if the URL belongs to our app
      if (decodedText.includes('/scene/')) {
        const path = decodedText.split(window.location.origin)[1] || decodedText;
        scanner.clear();
        navigate(path);
        onClose();
      } else {
        setError("QR Code inválido para esta aplicação.");
      }
    };

    const onScanFailure = (error: any) => {
      // Silent failure for continuous scanning
    };

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch(err => console.error("Failed to clear scanner", err));
    };
  }, [navigate, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
      >
        <X size={24} />
      </button>

      <div className="w-full max-w-md space-y-6 text-center">
        <h2 className="text-2xl font-light tracking-widest uppercase text-white">Digitalizar QR Code</h2>
        
        <div id="reader" className="overflow-hidden rounded-3xl border-2 border-white/20 bg-neutral-900"></div>
        
        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 p-3 rounded-xl border border-red-400/20">
            {error}
          </p>
        )}

        <p className="text-neutral-500 text-xs uppercase tracking-widest">
          Aponta a câmara para um dos QR Codes gerados na aplicação.
        </p>
      </div>
    </div>
  );
}
