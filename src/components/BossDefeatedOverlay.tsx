/**
 * Compact, non-obstructive 'Voucher Earned' notification toast when a boss is defeated.
 * Positioned cleanly in the top-right corner to never obstruct the player's line of sight.
 */

import React, { useEffect } from 'react';
import { Ticket, Sparkles, X, ChevronRight, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BossDefeatedOverlayProps {
  onDismiss: () => void;
  voucherTotal: number;
}

export const BossDefeatedOverlay: React.FC<BossDefeatedOverlayProps> = ({
  onDismiss,
  voucherTotal,
}) => {
  useEffect(() => {
    // Subtle, compact confetti burst
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.2, x: 0.85 },
        colors: ['#f59e0b', '#fbbf24', '#a855f7', '#38bdf8'],
      });
    } catch {}
  }, []);

  // Auto-dismiss after 3.8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 3800);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed top-16 right-4 sm:right-6 z-50 pointer-events-auto select-none animate-in slide-in-from-top-6 fade-in duration-300">
      <div className="relative w-72 sm:w-80 bg-slate-950/95 backdrop-blur-xl border-2 border-amber-400/80 rounded-2xl p-3.5 shadow-[0_0_30px_rgba(245,158,11,0.45)] text-white overflow-hidden ring-2 ring-amber-400/20">
        
        {/* Close Button */}
        <button
          onClick={onDismiss}
          className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
          aria-label="Tutup"
        >
          <X size={13} />
        </button>

        <div className="flex items-center gap-3">
          {/* Small Icon Badge */}
          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 border border-white flex items-center justify-center text-slate-950 shadow-lg shrink-0">
            <Ticket size={24} className="text-slate-950 -rotate-12" />
            <Sparkles size={12} className="absolute -top-1 -right-1 text-slate-950 animate-ping" />
          </div>

          <div className="min-w-0 flex-1 pr-4">
            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-400">
              <span>💥</span>
              <span>BOSS DIHANCURKAN!</span>
            </div>
            <div className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
              <span>VOUCHER EARNED!</span>
              <span className="text-[10px] bg-amber-400 text-slate-950 px-1 py-0.2 rounded font-black">+1</span>
            </div>
            <div className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
              Total: <strong className="text-amber-300 font-bold font-mono">{voucherTotal} Voucher</strong>
            </div>
          </div>
        </div>

        {/* Bottom Bar Action */}
        <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <span>Tukar di Menu Shop ➔ Vouchers</span>
          <button
            onClick={onDismiss}
            className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5 transition"
          >
            <span>Tutup</span>
            <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
