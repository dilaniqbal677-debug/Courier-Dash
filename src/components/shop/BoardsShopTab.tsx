/**
 * Hoverboards & Skateboards Shop Tab
 * Manages skateboard inventory, perk stats, board selection, and coin unlocks
 */

import React from 'react';
import { Check, Coins, Zap, Shield, Sparkles, Flame, Rocket } from 'lucide-react';
import { HoverBoard } from '../../game/constants';
import { sounds } from '../../audio/soundManager';
import confetti from 'canvas-confetti';

interface BoardsShopTabProps {
  coins: number;
  boards: HoverBoard[];
  selectedBoardId: string;
  onSelectBoard: (boardId: string) => void;
  onBuyBoard: (board: HoverBoard) => void;
}

export const BoardsShopTab: React.FC<BoardsShopTabProps> = ({
  coins,
  boards,
  selectedBoardId,
  onSelectBoard,
  onBuyBoard,
}) => {
  const handleBoardAction = (board: HoverBoard) => {
    if (board.unlocked) {
      onSelectBoard(board.id);
      sounds.playEquipSkin();
    } else if (coins >= board.price) {
      onBuyBoard(board);
      sounds.playUnlockFanfare();
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#fbbf24', '#ffffff'],
        });
      } catch {}
    } else {
      sounds.playSlide();
    }
  };

  const getPerkIcon = (perk: string) => {
    if (perk.toLowerCase().includes('perisai') || perk.toLowerCase().includes('shield')) {
      return <Shield size={14} className="text-sky-400" />;
    }
    if (perk.toLowerCase().includes('turbo') || perk.toLowerCase().includes('kecepatan')) {
      return <Rocket size={14} className="text-amber-400" />;
    }
    if (perk.toLowerCase().includes('api') || perk.toLowerCase().includes('flame')) {
      return <Flame size={14} className="text-rose-400" />;
    }
    return <Zap size={14} className="text-yellow-400" />;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 text-white">
      {/* Header Info Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950/70 to-slate-900 border border-sky-500/30 rounded-2xl p-4 sm:p-5 shadow-xl text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 text-xs font-black uppercase tracking-wider mb-2">
          <Sparkles size={14} />
          <span>GARASI PAPAN SELUNCUR EKSPEDISI</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">🛹 Skateboard & Hoverboard Kurir</h2>
        <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-md mx-auto mt-1 leading-relaxed">
          Pilih papan seluncur andalanmu untuk kecepatan manuver ekstra dan proteksi tabrakan darurat di jalanan kota!
        </p>

        {/* Currency summary strip */}
        <div className="mt-3.5 inline-flex items-center gap-3 px-4 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700/80 shadow-inner">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <Coins size={14} className="fill-amber-400" />
            <span>Koin Tersedia: {coins.toLocaleString('id-ID')}</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="text-xs font-medium text-slate-400">
            Terbuka: <span className="text-white font-bold">{boards.filter((b) => b.unlocked).length}</span> / {boards.length}
          </div>
        </div>
      </div>

      {/* Grid of Board Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-1">
        {boards.map((board) => {
          const isEquipped = board.id === selectedBoardId;
          const canAffordBoard = coins >= board.price;

          return (
            <div
              key={board.id}
              className={`rounded-2xl p-4 border-2 transition-all flex flex-col justify-between gap-3 shadow-lg relative overflow-hidden ${
                isEquipped
                  ? 'bg-gradient-to-br from-sky-950/90 via-slate-900 to-sky-950/70 border-sky-400 ring-2 ring-sky-400/40 shadow-[0_0_25px_rgba(56,189,248,0.3)]'
                  : board.unlocked
                  ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  : 'bg-slate-950/80 border-slate-800/80 opacity-90'
              }`}
            >
              {/* Top Row: Icon, Titles & Perk */}
              <div className="flex items-start gap-3.5">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-md border-2 border-white/20 shrink-0 transform transition-transform hover:scale-105"
                  style={{ backgroundColor: board.deckColor }}
                >
                  {board.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h3 className="text-sm sm:text-base font-black text-white truncate">{board.name}</h3>
                    {isEquipped && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider shrink-0">
                        DIPAKAI
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-sky-400 font-bold bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20 w-fit">
                    {getPerkIcon(board.perk)}
                    <span className="truncate">{board.perk}</span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-medium mt-1.5 leading-snug">
                    {board.unlocked
                      ? 'Papan siap digunakan untuk berlari di jalur rel & aspal.'
                      : `Buka papan ini dengan ${board.price} koin emas.`}
                  </div>
                </div>
              </div>

              {/* Bottom Row: Actions & Status */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 gap-2">
                <div className="flex items-center gap-2">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                    {board.unlocked ? 'Status Koleksi' : 'Harga Pembelian'}
                  </div>
                </div>

                <div>
                  {isEquipped ? (
                    <span className="bg-emerald-600/90 text-white px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md">
                      <Check size={14} className="stroke-[3]" />
                      <span>Sedang Digunakan</span>
                    </span>
                  ) : board.unlocked ? (
                    <button
                      onClick={() => handleBoardAction(board)}
                      className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-1.5 rounded-xl font-black text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Pakai Papan</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBoardAction(board)}
                      disabled={!canAffordBoard}
                      className={`px-4 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer ${
                        canAffordBoard
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black'
                          : 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Coins size={13} className={canAffordBoard ? 'fill-slate-950' : 'fill-slate-500'} />
                      <span>{board.price.toLocaleString('id-ID')}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gameplay Hint Footer */}
      <div className="mt-auto pt-4 border-t border-slate-800 text-center">
        <p className="text-[11px] text-slate-400">
          💡 <span className="font-bold text-slate-300">Tips:</span> Ketuk dua kali (*double tap*) di layar permainan untuk mengaktifkan papan seluncur pelindung benturan saat berlari!
        </p>
      </div>
    </div>
  );
};
