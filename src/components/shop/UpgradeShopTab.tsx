/**
 * Power-up & Permanent Courier Upgrades Shop Tab
 * Manages powerup duration level upgrades (Magnet, Shield, Speed, 2X Score) and permanent passive stats
 */

import React from 'react';
import { Check, Coins, Zap, Shield, Sparkles, TrendingUp, Award, Clock } from 'lucide-react';
import { POWERUPS, PowerupType, PermanentUpgrades, INITIAL_PERMANENT_UPGRADES } from '../../game/constants';
import { sounds } from '../../audio/soundManager';
import confetti from 'canvas-confetti';

interface UpgradeShopTabProps {
  coins: number;
  powerupLevels: Record<PowerupType, number>;
  permanentUpgrades?: PermanentUpgrades;
  onUpgradePowerup?: (type: PowerupType, cost: number) => void;
  onUpgradeStat?: (statId: keyof PermanentUpgrades, cost: number) => void;
}

export const UpgradeShopTab: React.FC<UpgradeShopTabProps> = ({
  coins,
  powerupLevels,
  permanentUpgrades = INITIAL_PERMANENT_UPGRADES,
  onUpgradePowerup,
  onUpgradeStat,
}) => {
  const powerupCosts = [500, 1000, 2000, 4000];

  const handleUpgradePowerup = (type: PowerupType, cost: number, isMax: boolean) => {
    if (isMax || coins < cost || !onUpgradePowerup) {
      sounds.playSlide();
      return;
    }
    onUpgradePowerup(type, cost);
    sounds.playUnlockFanfare();
    try {
      confetti({
        particleCount: 55,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#38bdf8', '#ffffff'],
      });
    } catch {}
  };

  const getPowerupDurationLabel = (type: PowerupType, level: number) => {
    const base = POWERUPS[type]?.duration || 10;
    const bonusSeconds = (level - 1) * 3;
    return `${base + bonusSeconds} Detik Durasi Aktif`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-5 text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/60 to-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xl text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
          <Sparkles size={14} />
          <span>BENGKEL UPGRADE TEKNOLOGI KURIR</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">⚡ Upgrade Kemampuan & Power-Up</h2>
        <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-lg mx-auto mt-1 leading-relaxed">
          Tingkatkan durasi magnet otomatis, perisai kebal benturan HND Guard, roket sepatu turbo, dan pengganda tips uang tunai!
        </p>

        {/* Coin balance indicator */}
        <div className="mt-3.5 inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700 shadow-inner">
          <Coins size={15} className="fill-amber-400 text-amber-400" />
          <span className="text-xs font-black text-amber-300">
            Koin Dimiliki: {coins.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* Grid of 4 Powerup Upgrades */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <TrendingUp size={16} className="text-sky-400" />
            <span>Power-up Utama (Maksimal Level 5)</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono font-medium">
            Biaya bertambah tiap tier
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {(Object.keys(POWERUPS) as PowerupType[]).map((type) => {
            const cfg = POWERUPS[type];
            const currentLevel = powerupLevels[type] || 1;
            const isMax = currentLevel >= 5;
            const nextCost = isMax ? 0 : powerupCosts[currentLevel - 1] || 500;
            const canAfford = coins >= nextCost && !isMax;

            return (
              <div
                key={type}
                className="rounded-2xl p-4 bg-slate-900/95 border-2 border-slate-800 hover:border-slate-700 shadow-lg flex flex-col justify-between gap-3.5 transition-all"
              >
                {/* Header */}
                <div className="flex items-start gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 flex items-center justify-center text-3xl shadow-inner shrink-0">
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-sm sm:text-base font-black text-white truncate">{cfg.name}</h4>
                      <span className="text-[11px] font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 shrink-0">
                        {isMax ? 'MAX TIER' : `LV. ${currentLevel}/5`}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-medium leading-relaxed">
                      {cfg.desc}
                    </p>

                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-400 mt-1.5 bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-800/60">
                      <Clock size={12} />
                      <span>{getPowerupDurationLabel(type, currentLevel)}</span>
                    </div>
                  </div>
                </div>

                {/* Level Pips & Action Button */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800 gap-3">
                  {/* Visual 5-pip Tier Meter */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Level Status</span>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`w-5 h-2 rounded-full transition-all ${
                            lvl <= currentLevel
                              ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                              : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleUpgradePowerup(type, nextCost, isMax)}
                    disabled={isMax || !canAfford}
                    className={`px-4 py-2 rounded-xl font-black text-xs shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
                      isMax
                        ? 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'
                        : canAfford
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black'
                        : 'bg-slate-800/80 border border-slate-700 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isMax ? (
                      <>
                        <Check size={14} className="text-emerald-400 stroke-[3]" />
                        <span>MAKSIMAL</span>
                      </>
                    ) : (
                      <>
                        <Coins size={14} className={canAfford ? 'fill-slate-950' : 'text-amber-400'} />
                        <span>UPGRADE ({nextCost.toLocaleString('id-ID')})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Passive Stat Mastery Section */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 mt-2">
        <div className="flex items-center gap-2 mb-2 text-sky-400 font-black text-xs sm:text-sm uppercase tracking-wide">
          <Award size={16} />
          <span>Bonus Pasif Permanen Ekspedisi HND</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Upgrade kemampuan powerup di atas berlaku secara permanen untuk semua skin dan karakter kurir yang Anda mainkan. Tingkatkan seluruhnya hingga Tier 5 untuk mendominasi peringkat skor tertinggi!
        </p>
      </div>
    </div>
  );
};
