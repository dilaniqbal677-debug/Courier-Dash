/**
 * Mission & Boss Threat Display Card
 * Shows active delivery toko quota, packing warehouse progress, or boss drone battle health bar
 */

import React from 'react';
import { Package, Box, CheckCircle2, AlertTriangle, Shield, Zap, Sparkles } from 'lucide-react';
import { TokoTarget, OrderMissionInfo, ElectronicType } from '../../game/constants';

interface MissionCardProps {
  activeToko: TokoTarget | null;
  orderMission?: OrderMissionInfo | null;
  packagesCarried: number;
  bossBattle?: {
    active: boolean;
    hp: number;
    maxHp: number;
    name: string;
    warningActive?: boolean;
    attackType?: string;
  } | null;
  blasterAmmo?: number;
}

export const MissionCard: React.FC<MissionCardProps> = ({
  activeToko,
  orderMission,
  packagesCarried,
  bossBattle,
  blasterAmmo = 0,
}) => {
  const quota = activeToko ? activeToko.packagesRequired : 4;
  const quotaReached = packagesCarried >= quota;
  const isPackingPhase = orderMission ? orderMission.phase === 'packing' : false;

  // Boss Battle Card Mode
  if (bossBattle && bossBattle.active) {
    const healthPercent = Math.max(0, Math.min(100, (bossBattle.hp / bossBattle.maxHp) * 100));

    return (
      <div className="w-full max-w-[340px] sm:max-w-[420px] animate-in zoom-in-95 duration-200">
        <div
          className={`w-full bg-slate-950/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 text-center transition-all duration-150 ${
            bossBattle.warningActive
              ? 'border-2 border-red-400 shadow-[0_0_35px_rgba(239,68,68,1)] ring-2 ring-red-500/50 animate-pulse'
              : 'border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.6)]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-black text-red-400 uppercase tracking-wider mb-1">
            <span className="flex items-center gap-1.5 animate-pulse truncate">
              <span>⚠️</span>
              <span>{bossBattle.name}</span>
            </span>
            <span className="text-amber-300 font-mono font-bold shrink-0">
              {bossBattle.hp}/{bossBattle.maxHp} HP
            </span>
          </div>

          {/* Boss Health Bar */}
          <div className="w-full bg-slate-900 rounded-full h-2.5 sm:h-3 overflow-hidden border border-red-800/80 p-0.5 shadow-inner">
            <div
              className={`h-full transition-all duration-200 rounded-full ${
                healthPercent > 50
                  ? 'bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-400'
                  : healthPercent > 25
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-400'
                  : 'bg-gradient-to-r from-red-600 via-rose-500 to-red-500 animate-pulse'
              }`}
              style={{ width: `${healthPercent}%` }}
            />
          </div>

          {/* Boss Action Status Hints */}
          <div className="text-[10px] font-bold mt-1.5 flex items-center justify-center gap-1">
            {bossBattle.warningActive ? (
              <span className="text-red-300 font-black tracking-wide animate-bounce flex items-center gap-1">
                <span>🚨</span>
                <span>AWAS! SERANGAN DITARGETKAN! PINDAH JALUR!</span>
                <span>🚨</span>
              </span>
            ) : blasterAmmo > 0 ? (
              <span className="text-sky-300 font-black flex items-center gap-1">
                <Zap size={12} className="text-amber-400 animate-pulse" />
                <span>Tekan tombol tembak atau geser ke atas untuk menyerang Boss!</span>
              </span>
            ) : (
              <span className="text-amber-400 font-black flex items-center gap-1">
                <span>🔫</span>
                <span>Ambil Pistol Energi di jalur untuk menembak Bos!</span>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Active Store Delivery Mission Card Mode
  if (activeToko) {
    return (
      <div className="w-full max-w-[320px] sm:max-w-[420px] animate-in fade-in zoom-in-95 duration-200">
        <div
          className={`w-full backdrop-blur-md rounded-2xl p-2 sm:p-2.5 shadow-xl text-center border-2 transition-all duration-200 ${
            isPackingPhase
              ? 'bg-slate-950/95 border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
              : 'bg-slate-900/95 border-sky-400/80 shadow-[0_0_20px_rgba(56,189,248,0.3)]'
          }`}
        >
          {/* Top Phase Header Tag */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-1">
            <span
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
                isPackingPhase
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              }`}
            >
              <span>{isPackingPhase ? '🏭 FASE 1: PACKING GUDANG' : '🛵 FASE 2: KIRIM KE TOKO'}</span>
            </span>
            <span className="text-slate-400 text-[9px] sm:text-[10px] truncate max-w-[140px] font-mono">
              {activeToko.category}
            </span>
          </div>

          {/* Store Name Title */}
          <div className="text-xs sm:text-sm font-black text-white flex items-center justify-center gap-1.5 truncate">
            <span>{activeToko.name}</span>
          </div>

          {/* Component Requirements or Delivery Progress Bar */}
          {isPackingPhase && orderMission ? (
            <div className="mt-1 flex flex-col gap-1">
              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-amber-300">
                <span className="flex items-center gap-1 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-600/40">
                  <Box size={10} />
                  <span>
                    Kemas Paket: {orderMission.totalPacked || orderMission.packedComponents.length} / {orderMission.totalRequired || orderMission.requiredComponents.length} Komponen
                  </span>
                </span>
              </div>

              {/* Progress bar towards packing completion */}
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-amber-500/30">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      ((orderMission.totalPacked || orderMission.packedComponents.length) /
                        Math.max(1, orderMission.totalRequired || orderMission.requiredComponents.length)) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="mt-1 flex flex-col gap-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                <span className="flex items-center gap-1">
                  <Package size={11} className={quotaReached ? 'text-emerald-400' : 'text-sky-400'} />
                  <span>Paket Dibawa: {packagesCarried} / {quota}</span>
                </span>
                <span className={quotaReached ? 'text-emerald-400 font-black' : 'text-amber-400'}>
                  {quotaReached ? '✓ Siap Antar' : `${quota - packagesCarried} Box Lagi`}
                </span>
              </div>

              {/* Progress bar towards quota */}
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-sky-500/30">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    quotaReached
                      ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                      : 'bg-gradient-to-r from-sky-500 to-blue-400'
                  }`}
                  style={{ width: `${Math.min(100, (packagesCarried / quota) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback Free Run Mode
  return (
    <div className="w-full max-w-[280px] sm:max-w-[340px] animate-in fade-in duration-200">
      <div className="w-full bg-slate-950/80 backdrop-blur-md rounded-2xl p-2 text-center border border-slate-700/60 shadow-lg">
        <div className="text-[10px] font-black uppercase tracking-wider text-sky-400 flex items-center justify-center gap-1">
          <Sparkles size={11} />
          <span>EKSPEDISI KILAT HND</span>
        </div>
        <div className="text-xs font-bold text-slate-300 mt-0.5">
          Kumpulkan paket & koin di jalan raya!
        </div>
      </div>
    </div>
  );
};
