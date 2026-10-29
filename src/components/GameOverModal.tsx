/**
 * Game Over Modal
 * Results screen with detailed courier delivery performance recap
 */

import React, { useEffect, useState } from 'react';
import { RotateCcw, ShoppingBag, Trophy, Package, Coins, DollarSign, Footprints, Medal } from 'lucide-react';
import { LeaderboardModal } from './LeaderboardModal';
import { auth, saveHighScore } from '../firebase';

interface GameOverModalProps {
  stats: {
    score: number;
    distance: number;
    packages: number;
    coins: number;
    tips: number;
  };
  highScore: number;
  isNewHigh: boolean;
  onRestart: () => void;
  onOpenShop: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  highScore,
  isNewHigh,
  onRestart,
  onOpenShop,
}) => {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  useEffect(() => {
    if (auth.currentUser) {
      saveHighScore(auth.currentUser.uid, auth.currentUser.displayName || 'Anon', stats.score);
    }
  }, [stats.score]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onRestart]);

  return (
    <>
    <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-4 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-white text-center relative overflow-hidden my-auto max-h-[94vh] overflow-y-auto">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-red-500 via-amber-500 to-red-500 rounded-b-full shadow-[0_0_20px_#ef4444]" />

        {/* Title */}
        <div className="inline-block px-3 py-1 bg-red-950/80 border border-red-500/40 rounded-full text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
          Tabrakan di Jalan!
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-4">
          Misi Kurir Selesai
        </h2>

        {/* Big Score Box */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-4">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Total Skor
          </div>
          <div className="text-4xl sm:text-5xl font-black text-amber-400 tracking-tight my-1 tabular-nums">
            {stats.score.toLocaleString()}
          </div>
          {isNewHigh ? (
            <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              <Trophy size={12} /> REKOR SKOR BARU!
            </div>
          ) : (
            <div className="text-xs text-slate-400">
              Rekor Terbaik: {highScore.toLocaleString()}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-6 text-left">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-950/80 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Package size={20} />
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Paket Tersukses</div>
              <div className="text-base font-extrabold text-white">{stats.packages} Kotak</div>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <DollarSign size={20} />
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Uang Tips</div>
              <div className="text-sm font-extrabold text-emerald-300 truncate">
                Rp {stats.tips.toLocaleString('id-ID')}
              </div>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Footprints size={20} />
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Total Jarak Tempuh</div>
              <div className="text-base font-extrabold text-white">{stats.distance} m</div>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Coins size={20} />
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Total Koin</div>
              <div className="text-base font-extrabold text-amber-300">+{stats.coins}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onRestart}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-base shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <RotateCcw size={20} />
            <span>KIRIM PAKET LAGI (SPASI)</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={onOpenShop}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-sm font-bold flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <ShoppingBag size={18} className="text-amber-400" />
              <span>Toko Skin</span>
            </button>
            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-sm font-bold flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <Medal size={18} className="text-amber-400" />
              <span>Leaderboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <LeaderboardModal isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />
    </>
  );
};

