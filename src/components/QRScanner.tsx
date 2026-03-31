import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { X, Camera } from 'lucide-react';

interface QRScannerProps {
  onClose: () => void;
}

export default function QRScanner({ onClose }: QRScannerProps) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        setIsScanning(true);
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            if (decodedText.includes('/scene/')) {
              const path = decodedText.split(window.location.origin)[1] || decodedText;
              stopScanner().then(() => {
                navigate(path);
                onClose();
              });
            } else {
              setError("QR Code inválido para esta aplicação.");
            }
          },
          (errorMessage) => {
            // Scanning...
          }
        );
      } catch (err) {
        console.error("Error starting scanner:", err);
        setError("Não foi possível aceder à câmara. Verifica as permissões.");
        setIsScanning(false);
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, [navigate, onClose]);

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

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
        
        <div className="relative overflow-hidden rounded-3xl border-2 border-white/20 bg-neutral-900 aspect-square">
          <div id="reader" className="w-full h-full"></div>
          {!isScanning && !error && (
            <div className="absolute inset-0 flex items-center justify-center text-neutral-500">
              <Camera size={48} className="animate-pulse" />
            </div>
          )}
        </div>
        
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
