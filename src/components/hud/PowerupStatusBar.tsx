/**
 * Active Power-ups & Quick Action Controls Bar
 * Displays live countdown meters for Magnet, Shield, Speed, and 2X Score, plus Audio and Pause buttons
 */

import React, { useState } from 'react';
import { Volume2, VolumeX, Pause, Play, ShoppingBag, Shield, Zap, Sparkles } from 'lucide-react';
import { POWERUPS, PowerupType } from '../../game/constants';
import { sounds } from '../../audio/soundManager';

interface PowerupStatusBarProps {
  activePowerups: Record<PowerupType, number>;
  isPaused: boolean;
  onTogglePause: () => void;
  onOpenShop: () => void;
}

export const PowerupStatusBar: React.FC<PowerupStatusBarProps> = ({
  activePowerups,
  isPaused,
  onTogglePause,
  onOpenShop,
}) => {
  const [isMuted, setIsMuted] = useState(sounds.isMuted);

  const toggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  // Filter active powerups with remaining duration > 0
  const activeEntries = (Object.keys(activePowerups) as PowerupType[]).filter(
    (key) => activePowerups[key] > 0
  );

  return (
    <div className="flex flex-col items-end gap-2 pointer-events-auto">
      {/* Top Quick Actions (Mute, Pause, Shop) */}
      <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md rounded-2xl p-1.5 border border-slate-700/80 shadow-xl">
        {/* Mute Button */}
        <button
          onClick={toggleMute}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition active:scale-90 cursor-pointer shadow"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        {/* Pause Button */}
        <button
          onClick={onTogglePause}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition active:scale-90 cursor-pointer shadow"
          title={isPaused ? 'Lanjutkan' : 'Jeda'}
        >
          {isPaused ? <Play size={16} /> : <Pause size={16} />}
        </button>

        {/* Shop Button */}
        <button
          onClick={onOpenShop}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 flex items-center justify-center shadow-lg transition active:scale-90 cursor-pointer"
          title="Buka Toko Kustomisasi"
        >
          <ShoppingBag size={16} className="fill-slate-950" />
        </button>
      </div>

      {/* Active Power-up Progress Meter Badges */}
      {activeEntries.length > 0 && (
        <div className="flex flex-col gap-1.5 items-end animate-in slide-in-from-right-3 duration-200">
          {activeEntries.map((type) => {
            const cfg = POWERUPS[type];
            const timeLeft = Math.ceil(activePowerups[type]);
            const maxDuration = cfg.duration || 10;
            const progress = Math.max(0, Math.min(100, (activePowerups[type] / maxDuration) * 100));

            return (
              <div
                key={type}
                className="bg-slate-950/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-2.5 py-1 shadow-lg flex items-center gap-2 min-w-[110px]"
              >
                {/* Icon */}
                <span className="text-sm shrink-0">{cfg.icon}</span>

                {/* Progress bar and time */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center justify-between text-[9px] font-black uppercase text-slate-300">
                    <span className="truncate max-w-[65px]">{cfg.name}</span>
                    <span className="font-mono text-amber-400">{timeLeft}s</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1 mt-0.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-sky-400 transition-all duration-100 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
