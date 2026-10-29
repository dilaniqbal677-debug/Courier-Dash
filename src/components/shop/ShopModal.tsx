/**
 * Subway Surfers Authentic Shop & Customizer Hub ("ME")
 * Main coordinator linking modular tabs:
 * - Characters / Skins Roster & 3D Stage (SkinShopTab)
 * - Skateboards & Hoverboards Garage (BoardsShopTab)
 * - Power-up & Perk Upgrades (UpgradeShopTab)
 * - Voucher Exchange & Real Electronics Discounts (VoucherExchangeTab)
 */

import React, { useState } from 'react';
import { X, Coins, Key, Ticket, Sparkles, User, Zap, Shield } from 'lucide-react';
import { CourierSkin, HoverBoard, INITIAL_BOARDS, PowerupType, PermanentUpgrades, INITIAL_PERMANENT_UPGRADES } from '../../game/constants';
import { sounds } from '../../audio/soundManager';
import { SkinShopTab } from './SkinShopTab';
import { BoardsShopTab } from './BoardsShopTab';
import { UpgradeShopTab } from './UpgradeShopTab';
import { VoucherExchangeTab } from '../VoucherExchangeTab';

export interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  keys: number;
  vouchers: number;
  skins: CourierSkin[];
  selectedSkinId: string;
  permanentUpgrades?: PermanentUpgrades;
  powerupLevels?: Record<PowerupType, number>;
  onSelectSkin: (id: string, outfitId?: string) => void;
  onBuySkin: (skin: CourierSkin) => void;
  onSelectOutfit?: (skinId: string, outfitId: string) => void;
  onBuyOutfit?: (skinId: string, outfitId: string) => void;
  onUpgradeStat?: (statId: keyof PermanentUpgrades, cost: number) => void;
  onUnlockVoucherSkin?: (skinId: string, outfitId?: string, cost?: number) => void;
  onUpgradePowerup?: (type: PowerupType, cost: number) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  coins,
  keys,
  vouchers,
  skins,
  selectedSkinId,
  permanentUpgrades = INITIAL_PERMANENT_UPGRADES,
  powerupLevels = { magnet: 1, shield: 1, speed: 1, double_score: 1 },
  onSelectSkin,
  onBuySkin,
  onSelectOutfit,
  onBuyOutfit,
  onUpgradeStat,
  onUnlockVoucherSkin,
  onUpgradePowerup,
}) => {
  const [activeTab, setActiveTab] = useState<'characters' | 'boards' | 'upgrades' | 'vouchers'>('characters');

  const [boards, setBoards] = useState<HoverBoard[]>(() => {
    try {
      const saved = localStorage.getItem('subway_user_boards');
      return saved ? JSON.parse(saved) : INITIAL_BOARDS;
    } catch {
      return INITIAL_BOARDS;
    }
  });

  const [selectedBoardId, setSelectedBoardId] = useState<string>(() => {
    return localStorage.getItem('subway_selected_board') || 'classic';
  });

  const handleSelectBoard = (boardId: string) => {
    setSelectedBoardId(boardId);
    localStorage.setItem('subway_selected_board', boardId);
  };

  const handleBuyBoard = (board: HoverBoard) => {
    const updated = boards.map((b) => (b.id === board.id ? { ...b, unlocked: true } : b));
    setBoards(updated);
    setSelectedBoardId(board.id);
    localStorage.setItem('subway_user_boards', JSON.stringify(updated));
    localStorage.setItem('subway_selected_board', board.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[92vh] sm:h-[88vh] bg-slate-950 border-2 border-slate-700/80 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-white">
        
        {/* Top Header Bar & Currencies Strip */}
        <div className="bg-slate-900 border-b-2 border-slate-800 px-4 py-3 flex items-center justify-between shrink-0 shadow-md">
          {/* Left Title */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow">
              <User size={18} className="text-white" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-sky-400">Pusat Kustomisasi</div>
              <h1 className="text-sm sm:text-base font-black text-white leading-tight">TOKO KURIR HND</h1>
            </div>
          </div>

          {/* Center Currencies Strip (Coins, Keys, Vouchers) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Coins */}
            <div className="flex items-center gap-1.5 bg-slate-950/90 border border-amber-500/40 px-3 py-1 rounded-xl shadow-inner">
              <Coins size={14} className="fill-amber-400 text-amber-400" />
              <span className="text-xs font-black text-amber-300 font-mono">
                {coins.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Keys */}
            <div className="flex items-center gap-1.5 bg-slate-950/90 border border-sky-500/40 px-3 py-1 rounded-xl shadow-inner">
              <Key size={14} className="fill-sky-400 text-sky-400" />
              <span className="text-xs font-black text-sky-300 font-mono">
                {keys.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Vouchers */}
            <div className="flex items-center gap-1.5 bg-slate-950/90 border border-rose-500/40 px-3 py-1 rounded-xl shadow-inner">
              <Ticket size={14} className="fill-rose-400 text-rose-400" />
              <span className="text-xs font-black text-rose-300 font-mono">
                {vouchers.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => {
              onClose();
              sounds.playSlide();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-red-600 border border-slate-700 hover:border-red-500 text-slate-300 hover:text-white flex items-center justify-center transition active:scale-90 cursor-pointer shadow"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Viewport */}
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-950">
          {activeTab === 'characters' && (
            <SkinShopTab
              coins={coins}
              keys={keys}
              skins={skins}
              selectedSkinId={selectedSkinId}
              onSelectSkin={onSelectSkin}
              onBuySkin={onBuySkin}
              onSelectOutfit={onSelectOutfit}
              onBuyOutfit={onBuyOutfit}
            />
          )}

          {activeTab === 'boards' && (
            <BoardsShopTab
              coins={coins}
              boards={boards}
              selectedBoardId={selectedBoardId}
              onSelectBoard={handleSelectBoard}
              onBuyBoard={handleBuyBoard}
            />
          )}

          {activeTab === 'upgrades' && (
            <UpgradeShopTab
              coins={coins}
              powerupLevels={powerupLevels}
              permanentUpgrades={permanentUpgrades}
              onUpgradePowerup={onUpgradePowerup}
              onUpgradeStat={onUpgradeStat}
            />
          )}

          {activeTab === 'vouchers' && (
            <VoucherExchangeTab
              vouchers={vouchers}
              skins={skins}
              selectedSkinId={selectedSkinId}
              permanentUpgrades={permanentUpgrades}
              onUpgradeStat={(statId, cost) => onUpgradeStat?.(statId, cost)}
              onUnlockVoucherSkin={(skinId, outfitId, cost) => onUnlockVoucherSkin?.(skinId, outfitId, cost)}
              onSelectSkin={onSelectSkin}
            />
          )}
        </div>

        {/* Subway Surfers Authentic Bottom Navigation Tab Bar */}
        <div className="bg-slate-950 border-t-2 border-slate-800 px-3 py-2 flex items-center justify-around z-20 shrink-0">
          <button
            onClick={() => {
              setActiveTab('characters');
              sounds.playPickup();
            }}
            className={`flex-1 py-2 rounded-xl flex flex-col items-center gap-0.5 text-xs font-black transition cursor-pointer ${
              activeTab === 'characters'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>KARAKTER</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('boards');
              sounds.playPickup();
            }}
            className={`flex-1 py-2 rounded-xl flex flex-col items-center gap-0.5 text-xs font-black transition cursor-pointer ${
              activeTab === 'boards'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>SKATEBOARD</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('upgrades');
              sounds.playPickup();
            }}
            className={`flex-1 py-2 rounded-xl flex flex-col items-center gap-0.5 text-xs font-black transition cursor-pointer ${
              activeTab === 'upgrades'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>UPGRADE</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('vouchers');
              sounds.playPickup();
            }}
            className={`flex-1 py-2 rounded-xl flex flex-col items-center gap-0.5 text-xs font-black transition cursor-pointer relative ${
              activeTab === 'vouchers'
                ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {vouchers > 0 && (
              <span className="absolute -top-1 right-3 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse" />
            )}
            <span>VOUCHER</span>
          </button>
        </div>
      </div>
    </div>
  );
};
