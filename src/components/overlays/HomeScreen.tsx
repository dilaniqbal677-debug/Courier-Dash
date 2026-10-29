/**
 * Main Home & Launch Screen Overlay
 * Displays official HND Computer corporate branding, current skin preview, high-score card, and game start controls
 */

import React from 'react';
import { Play, Sparkles, Star, Volume2, VolumeX, Award, Key, Coins, Ticket, MapPin, ShoppingBag, Target } from 'lucide-react';
import { CourierSkin } from '../../game/constants';
import { sounds } from '../../audio/soundManager';

interface HomeScreenProps {
  currentSkin: CourierSkin;
  highScore: number;
  coins: number;
  keys: number;
  vouchers: number;
  onStartGame: () => void;
  onOpenShop: () => void;
  onOpenMissions: () => void;
  onOpenLeaderboard: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentSkin,
  highScore,
  coins,
  keys,
  vouchers,
  onStartGame,
  onOpenShop,
  onOpenMissions,
  onOpenLeaderboard,
}) => {
  return (
    <div className="absolute inset-0 z-40 bg-gradient-to-b from-slate-950/80 via-slate-900/90 to-slate-950/98 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900/95 border-2 border-sky-500/30 rounded-3xl p-5 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.9)] text-center text-white relative my-auto max-h-[96vh] overflow-y-auto">
        
        {/* Top Mini Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-500/15 border border-sky-500/40 rounded-full text-sky-400 text-xs font-black uppercase tracking-wider mb-3 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
          <Sparkles size={14} className="text-amber-400 animate-pulse" />
          <span>SUBWAY RUNNER: KURIR HND KOMPUTER</span>
        </div>

        {/* Official HND Logo Card */}
        <div className="mx-auto w-40 sm:w-48 bg-white rounded-2xl p-3 shadow-2xl mb-4 flex items-center justify-center border-2 border-slate-300">
          <svg viewBox="0 0 480 300" className="w-full h-auto" fill="#000000">
            {/* H */}
            <rect x="10" y="20" width="42" height="160" />
            <rect x="52" y="80" width="56" height="42" />
            <rect x="108" y="20" width="42" height="160" />
            {/* N */}
            <rect x="170" y="20" width="42" height="160" />
            <polygon points="170,20 212,20 310,180 268,180" />
            <rect x="268" y="20" width="42" height="160" />
            {/* D */}
            <rect x="330" y="20" width="42" height="160" />
            <path d="M 372 20 Q 460 20 460 100 Q 460 180 372 180 Z" />
            {/* Subtitle */}
            <text x="240" y="225" fontFamily="Arial Black, Impact, sans-serif" fontWeight="900" fontSize="34" letterSpacing="6" textAnchor="middle" fill="#000000">
              COMPUTER
            </text>
            <text x="240" y="270" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="16" letterSpacing="3" textAnchor="middle" fill="#000000">
              PUSAT LAPTOP &amp; PC
            </text>
          </svg>
        </div>

        {/* Title & Tagline */}
        <h1 className="text-2xl sm:text-3xl font-black mb-1 tracking-tight bg-gradient-to-r from-white via-sky-200 to-sky-400 bg-clip-text text-transparent">
          COURIER DASH 3D
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mb-5 font-medium max-w-md mx-auto">
          Antar paket laptop &amp; sparepart komputer ke toko-toko mitra di jalan raya kota!
        </p>

        {/* Current Equipped Skin & High Score Card */}
        <div
          onClick={onOpenShop}
          className="bg-slate-800/80 hover:bg-slate-800 border-2 border-slate-700 hover:border-sky-400/80 rounded-2xl p-3.5 mb-5 flex items-center justify-between transition cursor-pointer group shadow-lg"
        >
          <div className="flex items-center gap-3.5">
            <div
              className="w-13 h-13 rounded-2xl border-2 border-white/40 flex items-center justify-center shadow-xl text-3xl group-hover:scale-105 transition"
              style={{ backgroundColor: currentSkin.jacketColor }}
            >
              <span>{currentSkin.avatarEmoji || '🤖'}</span>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black text-white">{currentSkin.name}</span>
                <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-700 px-1.5 py-0.5 rounded font-extrabold uppercase">
                  {currentSkin.outfitName}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-400 text-white font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Star size={10} className="fill-amber-300 text-amber-300" />
                  x{currentSkin.multiplier || 1} SKOR
                </span>
                <span className="text-[10px] text-amber-400 font-bold group-hover:underline flex items-center gap-0.5">
                  Ganti Karakter ➔
                </span>
              </div>
            </div>
          </div>

          <div className="text-right pl-2 border-l border-slate-700">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Skor Terbaik</div>
            <div className="text-base sm:text-lg font-black text-amber-400 font-mono">
              {highScore.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Action Buttons Hub */}
        <div className="flex flex-col gap-3">
          {/* Main Play CTA Button */}
          <button
            onClick={onStartGame}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-lg sm:text-xl shadow-[0_10px_30px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2.5 transition active:scale-95 cursor-pointer border border-amber-300"
          >
            <Play size={24} fill="currentColor" />
            <span>MULAI LARI (SPASI)</span>
          </button>

          {/* Secondary Hub: Character / Shop Row */}
          <button
            onClick={onOpenShop}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 border border-sky-400/80 text-white text-xs sm:text-sm font-black transition active:scale-95 cursor-pointer shadow-lg shadow-blue-600/30 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-sky-300" />
              <span>ME / PILIH KARAKTER &amp; OUTFIT</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-950/60 px-2.5 py-1 rounded-lg font-mono text-xs">
              <span className="text-amber-300 flex items-center gap-0.5">🪙{coins.toLocaleString('id-ID')}</span>
              <span className="text-sky-300 flex items-center gap-0.5">🔑{keys}</span>
              <span className="text-purple-300 flex items-center gap-0.5">🎟️{vouchers}</span>
            </div>
          </button>

          {/* Bottom Grid for Leaderboard, Tasks, and Audio */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Leaderboard Button */}
            <button
              onClick={onOpenLeaderboard}
              className="py-3 px-2 rounded-xl bg-sky-950/80 hover:bg-sky-900 border border-sky-600/60 text-sky-200 hover:text-white font-black text-xs transition active:scale-95 cursor-pointer shadow flex flex-col items-center justify-center gap-1"
            >
              <Award size={18} className="text-amber-400" />
              <span>Leaderboard</span>
            </button>

            {/* Daily Tasks Button */}
            <button
              onClick={onOpenMissions}
              className="py-3 px-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-600/60 text-amber-200 hover:text-white font-black text-xs transition active:scale-95 cursor-pointer shadow flex flex-col items-center justify-center gap-1"
            >
              <Target size={18} className="text-amber-400" />
              <span>Tugas Harian</span>
            </button>

            {/* Sound Toggle Button */}
            <button
              onClick={() => sounds.toggleMute()}
              className="py-3 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs transition active:scale-95 cursor-pointer shadow flex flex-col items-center justify-center gap-1"
              title="Suara"
            >
              {sounds.isMuted ? <VolumeX size={18} className="text-rose-400" /> : <Volume2 size={18} className="text-emerald-400" />}
              <span>{sounds.isMuted ? 'Mati' : 'Aktif'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
