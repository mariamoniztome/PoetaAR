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
      <header className="min-h-screen w-full flex flex-col px-8 py-8 relative overflow-hidden bg-[#fdfcf9]">
        {/* Decorative background element */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.05, scale: 1 }}
          transition={{ duration: 3, ease: "easeOut" }}
          className="absolute -top-20 -right-20 w-[600px] h-[600px] rounded-full border border-black pointer-events-none"
        />

        {/* Logo Top Left */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-start justify-start mb-20 z-10"
        >
          <div className="border border-black p-2 flex flex-col items-center justify-center text-[8px] leading-tight font-sans uppercase tracking-[0.2em] w-[140px] bg-white">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 border border-black flex items-center justify-center bg-black text-white">
                <span className="text-[6px]">JMS</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold">JOAQUIM</span>
                <span>MOREIRA DA SILVA</span>
              </div>
            </div>
            <div className="w-full h-px bg-black my-1" />
            <span>POETA CARPINTEIRO</span>
          </div>
        </motion.div>
        
        <div className="flex-1 flex flex-col justify-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl"
          >
            <h1 className="text-[12vw] md:text-[10vw] font-serif leading-[0.85] tracking-tighter text-black">
              O Poeta <br />
              <span className="italic text-brand-red font-normal ml-[10vw]">Carpinteiro</span>
            </h1>
          </motion.div>

          {/* Hat & Bird Illustration Placeholder */}
          <motion.div 
            initial={{ opacity: 0, x: 50, rotate: 5 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: 1.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-10 right-0 md:right-20 flex flex-col items-center"
          >
            <div className="relative w-64 h-64 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-full h-full opacity-80 drop-shadow-sm">
                <path d="M40,140 Q40,110 100,110 Q160,110 160,140 L170,150 Q170,170 100,170 Q30,170 30,150 Z" fill="none" stroke="black" strokeWidth="1" />
                <path d="M110,110 Q110,80 140,80 Q150,80 150,110" fill="none" stroke="black" strokeWidth="1" />
                <circle cx="140" cy="80" r="8" fill="none" stroke="black" strokeWidth="1" />
                <path d="M145,75 L155,70" fill="none" stroke="black" strokeWidth="1" />
              </svg>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute -right-4 top-1/2 flex flex-col items-start font-handwritten text-3xl leading-none text-brand-red"
              >
                <span>nasci pra</span>
                <span className="ml-8">ser poeta</span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[8px] uppercase tracking-[0.3em] font-sans opacity-40">Scroll</span>
          <div className="w-px h-12 bg-black/20 relative overflow-hidden">
            <motion.div 
              animate={{ y: [0, 48] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-full h-1/2 bg-brand-red"
            />
          </div>
        </motion.div>
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
          className="w-full md:w-1/2 flex flex-col items-end text-right text-brand-cream font-serif italic text-3xl md:text-4xl leading-relaxed pr-0 md:pr-12"
        >
          <p className="mb-2">Minha vida e minhas obras</p>
          <p className="mb-2">Tudo numa colecção</p>
          <p className="mb-2">Aqui ficam arquivadas</p>
          <p>Escritas por minha mão</p>
        </motion.div>
      </section>

      {/* Section 3: Timeline */}
      <section className="py-40 px-6 max-w-6xl mx-auto relative">
        {/* Decorative background number */}
        <div className="absolute top-0 left-0 text-[20rem] font-serif italic opacity-[0.02] select-none pointer-events-none -translate-x-1/2 -translate-y-1/4">
          1886
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-32 relative z-10"
        >
          <h2 className="text-6xl md:text-7xl font-serif mb-6 tracking-tight">Cronologia</h2>
          <div className="w-24 h-px bg-brand-red mx-auto mb-4" />
          <p className="text-xs uppercase tracking-[0.5em] opacity-40">O percurso do mestre</p>
        </motion.div>

        <div className="relative">
          {/* Vertical Line with animation */}
          <motion.div 
            initial={{ height: 0 }}
            whileInView={{ height: '100%' }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute left-1/2 top-0 w-px bg-gradient-to-b from-brand-red/20 via-black/5 to-transparent -translate-x-1/2 hidden md:block" 
          />
          
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
      <section className="min-h-[80vh] w-full flex flex-col items-center justify-center bg-[#fdfcf9] py-32 relative overflow-hidden">
        {/* Decorative background text */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
          <span className="text-[30vw] font-serif italic whitespace-nowrap">Realidade Aumentada</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center z-10"
        >
          <span className="text-[10px] uppercase tracking-[0.6em] font-sans mb-16 opacity-40">
            Descobre o Poeta em 3D
          </span>

          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative group"
          >
            <motion.button
              onClick={onEnterAr}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-20 py-6 bg-brand-red text-brand-cream rounded-none font-serif text-3xl tracking-wide shadow-2xl relative z-10 overflow-hidden"
            >
              <span className="relative z-10">Iniciar Experiência</span>
              <motion.div 
                className="absolute inset-0 bg-black/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"
              />
            </motion.button>
            
            {/* Decorative corners */}
            <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-brand-red opacity-0 group-hover:opacity-100 transition-all duration-500" />
            <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-brand-red opacity-0 group-hover:opacity-100 transition-all duration-500" />
          </motion.div>

          <p className="mt-12 text-xs font-sans opacity-30 max-w-xs leading-relaxed uppercase tracking-widest">
            Aponta a câmara para os marcadores para desbloquear os mundos do poeta
          </p>
        </motion.div>
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
