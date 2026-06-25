import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import type { TimelineEventItem } from '../../types/content';

interface TimelineEventCardProps {
  event: TimelineEventItem;
  index: number;
}

export default function TimelineEventCard({ event, index }: TimelineEventCardProps) {
  const isEven = index % 2 === 0;
  const dotRef = useRef<HTMLDivElement>(null);
  const dotFilled = useInView(dotRef, { once: true, margin: '0px 0px -25% 0px' });

  return (
    <motion.div
      className={`flex w-full mb-24 items-center flex-col gap-8 md:gap-0 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.2 },
        },
      }}
    >
      {/* Year & Content */}
      <div className={`w-full md:w-1/2 px-6 md:px-16 ${isEven ? 'text-left md:text-right' : 'text-left'}`}>
        <motion.span
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 0.15, y: 0 },
          }}
          className="font-serif italic text-6xl md:text-7xl block mb-2 leading-none"
        >
          {event.year}
        </motion.span>
        <motion.h3
          variants={{
            hidden: { opacity: 0, x: isEven ? 20 : -20 },
            visible: { opacity: 1, x: 0 },
          }}
          className="text-3xl md:text-4xl font-serif mb-4 tracking-tight"
        >
          {event.title}
        </motion.h3>
        <motion.p
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 0.6, y: 0 },
          }}
          className="text-base leading-relaxed max-w-md inline-block font-sans"
        >
          {event.desc}
        </motion.p>
      </div>

      {/* Dot */}
      <div ref={dotRef} className="relative hidden md:flex flex-col items-center justify-center">
        <div
          className={`w-4 h-4 rounded-full z-10 border-2 transition-all duration-700 ease-out ${
            dotFilled
              ? 'bg-brand-red border-brand-red shadow-[0_0_12px_rgba(122,11,11,0.4)]'
              : 'bg-transparent border-black/25'
          }`}
        />
      </div>

      {/* Image */}
      <div className={`w-full md:w-1/2 px-6 md:px-16 flex justify-center ${isEven ? 'md:justify-start' : 'md:justify-end'}`}>
        <motion.div
          variants={{
            hidden: { opacity: 0, scale: 0.9, rotate: isEven ? -2 : 2 },
            visible: { opacity: 1, scale: 1, rotate: 0 },
          }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="w-64 h-64 md:w-80 md:h-80 grayscale contrast-110 overflow-hidden border border-black/5 shadow-xl relative group"
        >
          <div className="absolute inset-0 bg-brand-red/10 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <img
            src={event.imageA || event.imageB}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
