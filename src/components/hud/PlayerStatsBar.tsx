/**
 * Subway Surfers Authentic Player Stats Bar
 * Displays Score, Multiplier, Distance (m), Coins, Tips, and Vouchers in an arcade glass dock
 */

import React, { useState } from 'react';
import { Trophy, Coins, Ticket, ChevronDown, ChevronUp, MapPin, Sparkles } from 'lucide-react';

interface PlayerStatsBarProps {
  score: number;
  distance: number;
  coins: number;
  tipsEarned: number;
  vouchers?: number;
  isVoucherAnimating?: boolean;
}

export const PlayerStatsBar: React.FC<PlayerStatsBarProps> = ({
  score,
  distance,
  coins,
  tipsEarned,
  vouchers = 0,
  isVoucherAnimating = false,
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = useState(true);

  return (
    <div className="flex flex-col gap-1 pointer-events-auto">
      {/* Primary Score & Distance Dock */}
      <div className="bg-slate-950/85 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-slate-700/80 shadow-2xl flex flex-col gap-1 min-w-[125px] sm:min-w-[155px]">
        {/* Score Header */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-400">
            <Trophy size={13} className="text-amber-400 shrink-0" />
            <span>SKOR</span>
          </div>

          {/* Quick Collapse Toggle */}
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="text-slate-400 hover:text-white p-0.5 rounded transition cursor-pointer"
            aria-label="Toggle Stats Dock"
          >
            {isDockCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>

        {/* Big Score Value */}
        <div className="text-lg sm:text-2xl font-black font-mono text-white tracking-tight drop-shadow-md leading-none">
          {score.toLocaleString('id-ID')}
        </div>

        {/* Distance Indicator */}
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-300 mt-0.5">
          <MapPin size={11} className="text-sky-400 shrink-0" />
          <span>{distance.toLocaleString('id-ID')} m</span>
        </div>

        {/* Expanded View: Coins, Tips, and Vouchers summary */}
        {!isDockCollapsed && (
          <div className="mt-2 pt-2 border-t border-slate-800 flex flex-col gap-1.5 animate-in slide-in-from-top-2 duration-150">
            {/* Coins */}
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-400 text-[10px] font-bold">
                <Coins size={11} className="text-amber-400" />
                <span>Koin:</span>
              </span>
              <span className="font-mono font-black text-amber-300 text-xs">
                {coins.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Tips */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[10px] font-bold">Tips Tunai:</span>
              <span className="font-mono font-black text-emerald-400 text-xs">
                Rp {tipsEarned.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Vouchers */}
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-400 text-[10px] font-bold">
                <Ticket size={11} className="text-purple-400" />
                <span>Voucher:</span>
              </span>
              <span className="font-mono font-black text-purple-300 text-xs">
                {vouchers}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Mini Quick-Badge Strip (Coins & Tips summary when collapsed) */}
      {isDockCollapsed && (
        <div className="flex items-center gap-1.5">
          {/* Quick Coins Pill */}
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-500/30 text-amber-300 text-[10px] font-black font-mono shadow">
            <Coins size={10} className="fill-amber-400 text-amber-400" />
            <span>{coins.toLocaleString('id-ID')}</span>
          </div>

          {/* Quick Tips Pill */}
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-[10px] font-black font-mono shadow">
            <span>Rp</span>
            <span>{tipsEarned.toLocaleString('id-ID')}</span>
          </div>

          {/* Quick Vouchers Pill */}
          {vouchers > 0 && (
            <div
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-purple-500/40 text-purple-300 text-[10px] font-black font-mono shadow transition-all ${
                isVoucherAnimating ? 'scale-125 border-purple-300 ring-2 ring-purple-400/50' : ''
              }`}
            >
              <Ticket size={10} className="fill-purple-400" />
              <span>{vouchers}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
