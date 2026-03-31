import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';

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
            // Check if it's a valid scene URL
            if (decodedText.includes('/scene/')) {
              // Extract the path from the URL
              const url = new URL(decodedText, window.location.origin);
              const path = url.pathname;
              
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
    <div className="w-full h-full flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="relative overflow-hidden rounded-3xl border-2 border-white/20 bg-neutral-900 aspect-square shadow-2xl">
          <div id="reader" className="w-full h-full"></div>
          {!isScanning && !error && (
            <div className="absolute inset-0 flex items-center justify-center text-neutral-500">
              <Camera size={48} className="animate-pulse" />
            </div>
          )}
          
          {/* Scanning Overlay UI */}
          <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40">
            <div className="w-full h-full border border-white/30 rounded-xl" />
          </div>
        </div>
        
        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 p-3 rounded-xl border border-red-400/20">
            {error}
          </p>
        )}

        <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-mono">
          Posiciona o QR Code dentro do quadrado
        </p>
      </div>
    </div>
  );
}
