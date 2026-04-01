import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Printer } from 'lucide-react';
import type { AppTexts } from '../types/content';

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
      <div className="max-w-5xl w-full space-y-16">
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
            {/* <p className="text-sm font-mono uppercase tracking-[0.2em] opacity-40">
              {texts.markersPage.subtitle}
            </p> */}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-black/10">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {texts.poems.map((poem, index) => (
            <div 
              key={poem.id}
              className="flex flex-col items-center p-6 bg-white border border-black/5 shadow-sm space-y-4 print:shadow-none print:border-black/20"
            >
              <div className="text-center space-y-1">
                <span className="font-serif italic text-4xl opacity-20">{poem.marker.roman}</span>
                {/* <h3 className="font-serif text-2xl italic">{poem.marker.label}</h3> */}
              </div>
              
              <div className="p-6 bg-white border border-black/5 rounded-sm shadow-inner">
                <QRCodeSVG 
                  value={`${baseUrl}${poem.marker.qrCode}`} 
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center opacity-20">
          <p className="text-[10px] font-mono uppercase tracking-[0.5em]">
            {texts.markersPage.footer}
          </p>
        </footer>
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white; }
          .no-print { display: none; }
          button { display: none; }
          a { display: none; }
          .grid { display: block; }
          .grid > div { margin-bottom: 40px; page-break-inside: avoid; }
        }
      `}} />
    </div>
  );
}
