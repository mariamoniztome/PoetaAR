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
    <div id="screen-timeline" className="fixed inset-0 overflow-y-auto overflow-x-hidden z-[100] transition-all duration-700 ease-in-out bg-white">
      {/* Hero Section */}
      <header className="h-screen w-full flex flex-col px-6 py-6 max-[600px]:h-[60vh] max-[600px]:px-4 max-[600px]:py-4" id="tl-header">
        <div className="flex items-start justify-start">
          <img className="w-[200px] h-auto grayscale contrast-[1.2] max-[600px]:w-[84px]" src="assets/img/logotipo.svg" alt="Marca do projeto" />
        </div>
        
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <motion.h1 
            className="text-8xl font-serif leading-[0.9] tracking-tighter mb-8 max-[600px]:text-5xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            dangerouslySetInnerHTML={{ __html: texts.timelinePage.header.titleHtml }}
          />
          
          <motion.p
            className="text-sm uppercase tracking-[0.4em] font-mono opacity-40 mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            {texts.timelinePage.ctaLabel}
          </motion.p>

          <motion.button
            onClick={onEnterAr}
            className="px-12 py-4 border border-black/20 hover:bg-black hover:text-white transition-all duration-500 font-serif italic text-xl group relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <span className="relative z-10">{texts.timelinePage.ctaButton}</span>
            <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
          </motion.button>
        </div>

        <div className="flex justify-center pb-8">
          <motion.div 
            className="w-px h-16 bg-black/20"
            animate={{ height: [0, 64, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </header>

      {/* Timeline Section */}
      <section className="py-32 px-6 max-w-6xl mx-auto">
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-black/5 -translate-x-1/2 hidden md:block" />
          
          {texts.timelinePage.events.map((event, index) => (
            <TimelineEventCard key={index} event={event} index={index} />
          ))}
        </div>
      </section>

      {/* Poem Panels */}
      {poems[0] && <PoemOnePanel poem={poems[0]} />}
      {poems[1] && <PoemTwoPanel poem={poems[1]} />}
      {poems[2] && <PoemThreePanel poem={poems[2]} />}

      {/* Footer */}
      <footer className="py-24 px-6 text-center border-t border-black/5 bg-[#fbfbfb]">
        <img className="w-[120px] h-auto grayscale contrast-[1.2] mx-auto mb-8 opacity-30" src="assets/img/logotipo.svg" alt="Marca do projeto" />
        <p className="text-[10px] uppercase tracking-[0.5em] font-mono opacity-30">
          © 2026 Poeta Carpinteiro • Experiência Imersiva
        </p>
      </footer>
    </div>
  );
}
