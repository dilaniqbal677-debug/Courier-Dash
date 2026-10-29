/**
 * On-screen touch controls for Mobile & Tablet runners
 * Ergonomic virtual thumb controls that adapt seamlessly to Vertical (Portrait) & Horizontal (Landscape) orientations
 */

import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Zap } from 'lucide-react';

interface TouchControlsProps {
  onTriggerAction: (dir: 'left' | 'right' | 'up' | 'down' | 'shoot') => void;
  blasterAmmo?: number;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ onTriggerAction, blasterAmmo = 0 }) => {
  return (
    <div className="fixed inset-x-0 bottom-2 sm:bottom-5 landscape:bottom-2 portrait:bottom-6 z-30 pointer-events-none flex items-end justify-between px-3 sm:px-6 select-none pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {/* Left thumb: Steer Left & Right */}
      <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
        <button
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            onTriggerAction('left');
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            onTriggerAction('left');
          }}
          className="w-12 h-12 sm:w-14 sm:h-14 landscape:w-11 landscape:h-11 landscape:sm:w-13 landscape:sm:h-13 rounded-2xl bg-slate-900/85 active:bg-amber-500 border-2 border-slate-700/80 active:border-amber-400 backdrop-blur-md flex items-center justify-center text-white active:text-slate-950 active:scale-90 transition-transform shadow-2xl touch-manipulation cursor-pointer"
          aria-label="Geser Kiri"
        >
          <ArrowLeft className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
        </button>

        <button
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            onTriggerAction('right');
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            onTriggerAction('right');
          }}
          className="w-12 h-12 sm:w-14 sm:h-14 landscape:w-11 landscape:h-11 landscape:sm:w-13 landscape:sm:h-13 rounded-2xl bg-slate-900/85 active:bg-amber-500 border-2 border-slate-700/80 active:border-amber-400 backdrop-blur-md flex items-center justify-center text-white active:text-slate-950 active:scale-90 transition-transform shadow-2xl touch-manipulation cursor-pointer"
          aria-label="Geser Kanan"
        >
          <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
        </button>
      </div>

      {/* Right thumb: Slide, Jump & Optional Shoot Blaster */}
      <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
        {/* Blaster Shoot Button - Displays when courier has energy pistol ammo */}
        {blasterAmmo > 0 && (
          <button
            type="button"
            onTouchStart={(e) => {
              e.preventDefault();
              onTriggerAction('shoot');
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              onTriggerAction('shoot');
            }}
            className="w-12 h-12 sm:w-14 sm:h-14 landscape:w-11 landscape:h-11 landscape:sm:w-13 landscape:sm:h-13 rounded-2xl bg-sky-950/90 active:bg-sky-400 border-2 border-sky-400 active:border-white backdrop-blur-md flex flex-col items-center justify-center text-sky-300 active:text-slate-950 active:scale-90 transition-transform shadow-[0_0_20px_rgba(56,189,248,0.7)] touch-manipulation cursor-pointer animate-pulse relative"
            aria-label="Tembak Boss"
          >
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-300 text-amber-300" />
            <span className="text-[9px] font-black font-mono leading-none">{blasterAmmo}</span>
          </button>
        )}

        <button
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            onTriggerAction('down');
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            onTriggerAction('down');
          }}
          className="w-12 h-12 sm:w-14 sm:h-14 landscape:w-11 landscape:h-11 landscape:sm:w-13 landscape:sm:h-13 rounded-2xl bg-slate-900/85 active:bg-cyan-500 border-2 border-slate-700/80 active:border-cyan-400 backdrop-blur-md flex items-center justify-center text-white active:text-slate-950 active:scale-90 transition-transform shadow-2xl touch-manipulation cursor-pointer"
          aria-label="Slide Merunduk"
        >
          <ArrowDown className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
        </button>

        <button
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            onTriggerAction('up');
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            onTriggerAction('up');
          }}
          className="w-12 h-12 sm:w-14 sm:h-14 landscape:w-11 landscape:h-11 landscape:sm:w-13 landscape:sm:h-13 rounded-2xl bg-slate-900/85 active:bg-emerald-500 border-2 border-slate-700/80 active:border-emerald-400 backdrop-blur-md flex items-center justify-center text-white active:text-slate-950 active:scale-90 transition-transform shadow-2xl touch-manipulation cursor-pointer"
          aria-label="Lompat"
        >
          <ArrowUp className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
