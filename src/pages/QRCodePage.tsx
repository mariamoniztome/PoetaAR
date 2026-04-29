import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Printer } from 'lucide-react';
import type { AppTexts } from '../types/content';

const TARGET_IMAGES = [
  '/targets/target1.jpg',
  '/targets/target2.jpg',
  '/targets/target3.jpg',
];

export default function QRCodePage() {
  const [texts, setTexts] = useState<AppTexts | null>(null);
  const baseUrl = window.location.origin;

  useEffect(() => {
    fetch('/data/texts.json')
      .then(res => res.json())
      .then(setTexts)
      .catch(err => console.error('Error loading texts:', err));
  }, []);

  if (!texts) return null;

  return (
    <div className="overflow-hidden w-full min-h-screen bg-[#f5f5f0] text-black flex flex-col items-center font-sans selection:bg-black selection:text-white">
      <div className="max-w-5xl w-full px-6 space-y-16">
        {/* Header */}
        <header className="pt-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity mb-4"
            >
              <ArrowLeft size={14} />
              Voltar à Timeline
            </Link>
            <h1 className="text-6xl font-serif tracking-tighter leading-none">
              {texts.markersPage.title}
            </h1>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-3 px-6 py-3 border border-black/10 hover:bg-black hover:text-white transition-all font-serif italic text-lg group"
          >
            <Printer size={18} />
            {texts.markersPage.printButton}
          </button>
        </header>

        {/* Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-2">
            <span className="font-mono text-[10px] opacity-30 uppercase tracking-widest">Passo 01</span>
            <p className="text-sm leading-relaxed">{texts.markersPage.instructionLine1}</p>
          </div>
          <div className="space-y-2">
            <span className="font-mono text-[10px] opacity-30 uppercase tracking-widest">Passo 02</span>
            <p className="text-sm leading-relaxed">{texts.markersPage.instructionLine2}</p>
          </div>
          <div className="space-y-2">
            <span className="font-mono text-[10px] opacity-30 uppercase tracking-widest">Passo 03</span>
            <p className="text-sm leading-relaxed">{texts.markersPage.instructionLine3}</p>
          </div>
        </div>

        {/* Markers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {texts.poems.map((poem, index) => (
            <div
              key={poem.id}
              className="flex flex-col items-center bg-white border border-black/5 shadow-sm print:shadow-none print:border-black/20 overflow-hidden"
            >
              {/* Trigger Image */}
              <div className="w-full aspect-square overflow-hidden relative">
                <img
                  src={TARGET_IMAGES[index]}
                  alt={poem.marker.label}
                  className="w-full h-full object-cover"
                />
                {/* Roman numeral overlay */}
                <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-black/40 to-transparent">
                  <span className="font-serif italic text-white text-5xl opacity-80 leading-none">
                    {poem.marker.roman}
                  </span>
                </div>
              </div>

              {/* Label */}
              <div className="w-full px-5 pt-4 pb-2 text-center">
                <h3 className="font-serif italic text-lg">{poem.marker.label}</h3>
                <p className="text-[10px] font-mono uppercase tracking-widest opacity-30 mt-1">
                  Aponta a câmara para esta imagem
                </p>
              </div>

              {/* Divider */}
              <div className="w-full px-5 py-3 flex items-center gap-3">
                <div className="flex-1 h-px bg-black/5" />
                <span className="text-[9px] font-mono uppercase tracking-widest opacity-20">
                  ou QR Code
                </span>
                <div className="flex-1 h-px bg-black/5" />
              </div>

              {/* QR Code */}
              <div className="pb-5 px-5">
                <div className="p-4 bg-white border border-black/5 rounded-sm shadow-inner">
                  <QRCodeSVG
                    value={`${baseUrl}${poem.marker.qrCode}`}
                    size={140}
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center opacity-20 pb-12">
          <p className="text-[10px] font-mono uppercase tracking-[0.5em]">
            {texts.markersPage.footer}
          </p>
        </footer>
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white; }
          button { display: none; }
          a { display: none; }
          .grid { display: block; }
          .grid > div { margin-bottom: 40px; page-break-inside: avoid; }
        }
      `}} />
    </div>
  );
}
