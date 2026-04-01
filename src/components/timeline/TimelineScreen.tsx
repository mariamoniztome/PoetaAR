import React from 'react';
import { motion } from 'motion/react';
import type { AppTexts, PoemData } from '../../types/content';
import TimelineEventCard from './TimelineEventCard';
import PoemOnePanel from '../poems/PoemOnePanel';
import PoemTwoPanel from '../poems/PoemTwoPanel';
import PoemThreePanel from '../poems/PoemThreePanel';

interface TimelineScreenProps {
  texts: AppTexts;
  poems: PoemData[];
  onEnterAr: () => void;
}

export default function TimelineScreen({ texts, poems, onEnterAr }: TimelineScreenProps) {
  return (
    <div id="screen-timeline" className="relative w-full overflow-x-hidden bg-brand-cream">
      {/* Section 1: Hero */}
      <header className="min-h-screen w-full flex flex-col px-8 py-8 relative overflow-hidden">
        {/* Logo Top Left */}
        <div className="flex items-start justify-start mb-20">
          <div className="border border-black p-2 flex flex-col items-center justify-center text-[8px] leading-tight font-sans uppercase tracking-[0.2em] w-[140px]">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 border border-black flex items-center justify-center">
                <span className="text-[6px]">LOGO</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold">JOAQUIM</span>
                <span>MOREIRA DA SILVA</span>
              </div>
            </div>
            <div className="w-full h-px bg-black my-1" />
            <span>POETA CARPINTEIRO</span>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col justify-center relative">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <h1 className="text-[10vw] font-serif leading-[0.9] tracking-tight text-black">
              O Poeta <span className="italic text-brand-red font-normal">Carpinteiro</span>
            </h1>
          </motion.div>

          {/* Hat & Bird Illustration Placeholder */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
            className="absolute bottom-10 right-10 md:right-20 flex flex-col items-center"
          >
            <div className="relative w-64 h-64 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-full h-full opacity-80">
                <path d="M40,140 Q40,110 100,110 Q160,110 160,140 L170,150 Q170,170 100,170 Q30,170 30,150 Z" fill="none" stroke="black" strokeWidth="1.5" />
                <path d="M110,110 Q110,80 140,80 Q150,80 150,110" fill="none" stroke="black" strokeWidth="1.5" />
                <circle cx="140" cy="80" r="10" fill="none" stroke="black" strokeWidth="1.5" />
                <path d="M145,75 L155,70" fill="none" stroke="black" strokeWidth="1.5" />
              </svg>
              <div className="absolute -right-10 top-1/2 flex flex-col items-start font-handwritten text-3xl leading-none">
                <span>nasci pra</span>
                <span className="ml-8">ser poeta</span>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Section 2: Portrait & Poem */}
      <section className="min-h-screen w-full bg-brand-red flex flex-col md:flex-row items-center justify-between px-8 py-20 relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="w-full md:w-1/2 flex justify-center md:justify-start mb-12 md:mb-0"
        >
          <div className="w-[80%] max-w-[500px] aspect-[4/5] bg-gray-300 grayscale relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 flex items-center justify-center text-black/20 font-serif text-2xl uppercase tracking-widest">
              Retrato
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-brand-red/20 to-transparent" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="w-full md:w-1/2 flex flex-col items-end text-right text-brand-cream font-handwritten text-4xl md:text-5xl leading-relaxed pr-0 md:pr-12"
        >
          <p>Minha vida e minhas obras</p>
          <p>Tudo numa colecção</p>
          <p>Aqui ficam arquivadas</p>
          <p>Escritas por minha mão</p>
        </motion.div>
      </section>

      {/* Section 3: Timeline */}
      <section className="py-32 px-6 max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl font-serif mb-4">Cronologia</h2>
          <div className="w-24 h-px bg-black/20 mx-auto" />
        </motion.div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-black/5 -translate-x-1/2 hidden md:block" />
          
          {texts.timelinePage.events.map((event, index) => (
            <TimelineEventCard key={index} event={event} index={index} />
          ))}
        </div>
      </section>

      {/* Section 4: Poem Panels */}
      <section className="bg-white">
        {poems[0] && <PoemOnePanel poem={poems[0]} />}
        {poems[1] && <PoemTwoPanel poem={poems[1]} />}
        {poems[2] && <PoemThreePanel poem={poems[2]} />}
      </section>

      {/* Section 5: CTA */}
      <section className="min-h-[60vh] w-full flex flex-col items-center justify-center bg-brand-cream py-20 border-t border-black/5">
        <motion.span 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-xs uppercase tracking-[0.4em] font-sans mb-12 opacity-60"
        >
          Experiência de Realidade Aumentada
        </motion.span>

        <motion.button
          onClick={onEnterAr}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-16 py-4 bg-brand-red text-brand-cream rounded-full font-serif text-2xl tracking-wide shadow-lg hover:bg-brand-red/90 transition-all"
        >
          Iniciar
        </motion.button>
      </section>

      {/* Footer */}
      <footer className="w-full bg-brand-red py-20 flex flex-col items-center justify-center">
        <div className="w-20 h-20 border border-brand-cream/30 flex items-center justify-center mb-8">
          <div className="w-12 h-12 border border-brand-cream/50 flex items-center justify-center text-brand-cream/50 text-[10px]">
            LOGO
          </div>
        </div>
        <p className="text-[10px] uppercase tracking-[0.5em] font-sans text-brand-cream/40">
          © 2026 Poeta Carpinteiro • Experiência Imersiva
        </p>
      </footer>
    </div>
  );
}
