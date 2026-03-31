import React from 'react';
import { motion } from 'motion/react';
import type { PoemData } from '../../types/content';

interface PoemPanelProps {
  poem: PoemData;
}

export default function PoemOnePanel({ poem }: PoemPanelProps) {
  return (
    <motion.section
      className="h-screen w-full flex flex-col items-center justify-center bg-[#f5f5f0] relative overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2 }}
    >
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]" />

      {/* Poem Content */}
      <div className="max-w-xl px-8 relative z-10 text-center">
        <span className="font-serif italic text-6xl opacity-10 absolute -top-12 -left-12 select-none">
          {poem.marker.roman}
        </span>
        <h2 className="text-4xl font-serif mb-8 tracking-tight">{poem.title}</h2>
        <div className="space-y-4">
          {poem.verses.map((verse, idx) => (
            <motion.p
              key={idx}
              className="text-xl font-serif italic text-black/80"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 + idx * 0.2 }}
            >
              {verse}
            </motion.p>
          ))}
        </div>
      </div>

      {/* Subtle Marker Label */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-40">
        <div className="w-px h-12 bg-black mb-4" />
        <span className="text-[10px] uppercase tracking-[0.3em] font-mono">{poem.marker.label}</span>
      </div>
    </motion.section>
  );
}
