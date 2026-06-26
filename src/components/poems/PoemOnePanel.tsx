import React from 'react';
import { motion } from 'framer-motion';
import type { PoemData } from '../../types/content';

interface PoemPanelProps {
  poem: PoemData;
}

export default function PoemOnePanel({ poem }: PoemPanelProps) {
  return (
    <motion.section
      className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fdfcf9] relative overflow-hidden py-32"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 1.5, staggerChildren: 0.15 } }
      }}
    >
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]" />
      
      {/* Decorative Circle */}
      <motion.div 
        variants={{
          hidden: { opacity: 0, scale: 0.8 },
          visible: { opacity: 0.05, scale: 1 }
        }}
        className="absolute w-200 h-200 border border-black rounded-full pointer-events-none"
      />

      {/* Poem Content */}
      <div className="max-w-2xl px-8 relative z-10 text-center">
        <motion.span 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 0.1, y: 0 }
          }}
          className="font-serif italic text-[12rem] absolute -top-24 left-1/2 -translate-x-1/2 select-none pointer-events-none"
        >
          {poem.marker.roman}
        </motion.span>
        
        <motion.h2 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          className="text-4xl md:text-5xl font-serif mb-12 tracking-tight text-brand-red"
        >
          {poem.title}
        </motion.h2>

        <div className="space-y-6">
          {poem.verses.map((verse, idx) => (
            <motion.p
              key={idx}
              className="text-2xl md:text-3xl font-serif italic text-black/80 leading-snug"
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              {verse}
            </motion.p>
          ))}
        </div>
      </div>

      {/* Subtle Marker Label
      <motion.div 
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 0.4, y: 0 }
        }}
        className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center"
      >
        <div className="w-px h-16 bg-black mb-4" />
        <span className="text-[10px] uppercase tracking-[0.4em] font-sans">{poem.marker.label}</span>
      </motion.div> */}
    </motion.section>
  );
}
