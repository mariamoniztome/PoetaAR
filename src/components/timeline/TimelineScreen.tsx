import React from 'react';
import { motion } from 'motion/react';
import type { AppTexts, PoemData } from '../../types/content';
import TimelineEventCard from './TimelineEventCard';
import PoemOnePanel from '../poems/PoemOnePanel';
import PoemTwoPanel from '../poems/PoemTwoPanel';
import PoemThreePanel from '../poems/PoemThreePanel';
import logotipoSvg from '../../assets/img/logotipo.svg';
import heroSection from '../../assets/img/header.svg';
import portrait from '../../assets/img/36anos.png';
import poem from '../../assets/img/hero.svg';
import logotipoSvg2 from '../../assets/img/logo2.svg';

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
          className="absolute -top-20 -right-20 w-150 h-150 rounded-full border border-black pointer-events-none"
        />

        {/* Logo Top Left */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-start justify-start mb-20 z-10"
        >
          <img src={logotipoSvg} alt="140 anos do Poeta Carpinteiro Logo" className="w-40 h-16 object-contain" />
        </motion.div>
        
        <div className="flex-1 flex flex-col justify-start relative z-10">
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
            className="absolute bottom-0 right-20 flex flex-col items-center"
          >
            <div className="relative w-full h-90 flex items-center justify-center">
              <img src={heroSection} alt="Nasci para ser poeta" className="w-full h-full object-contain" />
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
          <img src={portrait} alt="Retrato do Poeta Carpinteiro" className='w-96 h-auto' />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="w-full md:w-1/2 flex flex-col items-end text-right text-brand-cream font-serif italic text-3xl md:text-4xl leading-relaxed pr-0 md:pr-12"
        >
          <img src={poem} alt="Poema do Poeta Carpinteiro" className='w-full h-auto' />
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
        </motion.div>

        <div className="relative">
          {/* Vertical Line with animation */}
          <motion.div 
            initial={{ height: 0 }}
            whileInView={{ height: '100%' }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute left-1/2 top-0 w-px bg-linear-to-b from-brand-red/20 via-black/5 to-transparent -translate-x-1/2 hidden md:block" 
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
              className="px-20 py-6 cursor-pointer bg-brand-red text-brand-cream rounded-none font-serif text-3xl tracking-wide shadow-2xl relative z-10 overflow-hidden"
            >
              <span className="relative z-10">Iniciar Experiência</span>
              
            </motion.button>
            
          </motion.div>

          <p className="mt-12 text-xs font-sans opacity-30 max-w-xs leading-relaxed uppercase tracking-widest">
            Aponta a câmara para os marcadores para desbloquear os mundos do poeta
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-brand-red py-10 flex flex-col items-center justify-center">
        <img src={logotipoSvg2} alt="140 anos do Poeta Carpinteiro Logo" className="w-50 h-auto object-contain" />
        <p className="text-[10px] uppercase tracking-[0.5em] font-sans text-brand-cream/40">
          © 2026 Poeta Carpinteiro
        </p>
      </footer>
    </div>
  );
}
