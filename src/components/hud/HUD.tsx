/**
 * Subway Surfers Authentic In-Game Heads-Up Display (HUD)
 * Coordinates modular sub-components:
 * - PlayerStatsBar: Top-left Score, Multiplier, Distance, Coins, Tips, Vouchers
 * - MissionCard: Top-center Active Toko Delivery Target / Boss Health Bar
 * - PowerupStatusBar: Top-right Active Power-up countdowns, Audio Mute, Pause & Shop controls
 */

import React from 'react';
import { TokoTarget, PowerupType, OrderMissionInfo } from '../../game/constants';
import { PlayerStatsBar } from './PlayerStatsBar';
import { MissionCard } from './MissionCard';
import { PowerupStatusBar } from './PowerupStatusBar';

export interface HUDProps {
  score: number;
  distance: number;
  packagesCarried: number;
  coins: number;
  tipsEarned: number;
  vouchers?: number;
  isVoucherAnimating?: boolean;
  activeToko: TokoTarget | null;
  orderMission?: OrderMissionInfo | null;
  activePowerups: Record<PowerupType, number>;
  weather?: { name: string; icon: string; desc: string };
  bossBattle?: {
    active: boolean;
    hp: number;
    maxHp: number;
    name: string;
    warningActive?: boolean;
    attackType?: string;
  } | null;
  blasterAmmo?: number;
  isPaused: boolean;
  onTogglePause: () => void;
  onOpenShop: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  distance,
  packagesCarried,
  coins,
  tipsEarned,
  vouchers = 0,
  isVoucherAnimating = false,
  activeToko,
  orderMission,
  activePowerups,
  bossBattle,
  blasterAmmo = 0,
  isPaused,
  onTogglePause,
  onOpenShop,
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-30 select-none overflow-hidden p-3 sm:p-5 flex flex-col justify-between">
      {/* Top Header Region */}
      <div className="w-full flex items-start justify-between gap-2">
        {/* Left: Player Stats Bar (Score, Distance, Coins, Tips) */}
        <PlayerStatsBar
          score={score}
          distance={distance}
          coins={coins}
          tipsEarned={tipsEarned}
          vouchers={vouchers}
          isVoucherAnimating={isVoucherAnimating}
        />

        {/* Center: Delivery Mission Tracker or Boss Threat Card */}
        <div className="flex-1 flex justify-center pointer-events-auto px-1">
          <MissionCard
            activeToko={activeToko}
            orderMission={orderMission}
            packagesCarried={packagesCarried}
            bossBattle={bossBattle}
            blasterAmmo={blasterAmmo}
          />
        </div>

        {/* Right: Active Power-up Progress & Quick Actions */}
        <PowerupStatusBar
          activePowerups={activePowerups}
          isPaused={isPaused}
          onTogglePause={onTogglePause}
          onOpenShop={onOpenShop}
        />
      </div>

      {/* Bottom Area Spacer reserved for Touch Controls and notifications */}
      <div className="w-full flex items-end justify-between pointer-events-none" />
    </div>
  );
};
