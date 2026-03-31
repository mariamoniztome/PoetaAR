import React from 'react';
import { motion } from 'motion/react';
import type { TimelineEventItem } from '../../types/content';

interface TimelineEventCardProps {
  event: TimelineEventItem;
  index: number;
}

export default function TimelineEventCard({ event, index }: TimelineEventCardProps) {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      className={`flex w-full mb-12 items-center ${isEven ? 'flex-row' : 'flex-row-reverse'}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
    >
      {/* Year & Content */}
      <div className={`w-1/2 px-8 ${isEven ? 'text-right' : 'text-left'}`}>
        <span className="font-mono text-4xl opacity-20 block mb-2">{event.year}</span>
        <h3 className="text-2xl font-serif italic mb-2">{event.title}</h3>
        <p className="text-sm opacity-70 leading-relaxed max-w-md inline-block">
          {event.desc}
        </p>
      </div>

      {/* Visual Indicator */}
      <div className="relative flex flex-col items-center justify-center">
        <div className="w-px h-24 bg-black/10 absolute -top-12" />
        <div className="w-4 h-4 rounded-full border border-black/30 bg-white z-10" />
        <div className="w-px h-24 bg-black/10 absolute -bottom-12" />
      </div>

      {/* Image */}
      <div className={`w-1/2 px-8 flex ${isEven ? 'justify-start' : 'justify-end'}`}>
        <div className="w-48 h-48 grayscale contrast-125 overflow-hidden border border-black/10">
          <img
            src={event.imageA || event.imageB}
            alt={event.title}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </motion.div>
  );
}
