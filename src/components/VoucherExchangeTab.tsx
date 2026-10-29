/**
 * Voucher Exchange UI Component
 * Allows runners to spend rare vouchers earned from defeating bosses
 * on exclusive Legendary outfits, permanent stat boosts, and digital discount coupons.
 */

import React, { useState } from 'react';
import { Ticket, Shield, Zap, Sparkles, Check, Lock, ArrowUpRight, Copy, Award, Flame, Star } from 'lucide-react';
import { 
  CourierSkin, 
  CourierOutfit, 
  PermanentUpgrades, 
  STAT_UPGRADE_CONFIGS, 
  SHOPPING_VOUCHERS, 
  ShoppingVoucher 
} from '../game/constants';
import { sounds } from '../audio/soundManager';
import confetti from 'canvas-confetti';

interface VoucherExchangeTabProps {
  vouchers: number;
  skins: CourierSkin[];
  selectedSkinId: string;
  permanentUpgrades: PermanentUpgrades;
  onUpgradeStat: (statId: keyof PermanentUpgrades, cost: number) => void;
  onUnlockVoucherSkin: (skinId: string, outfitId?: string, cost?: number) => void;
  onSelectSkin: (skinId: string, outfitId?: string) => void;
}

export const VoucherExchangeTab: React.FC<VoucherExchangeTabProps> = ({
  vouchers,
  skins,
  selectedSkinId,
  permanentUpgrades,
  onUpgradeStat,
  onUnlockVoucherSkin,
  onSelectSkin,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'upgrades' | 'skins' | 'coupons'>('all');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Filter voucher-exclusive skins and outfits
  const voucherSkins = skins.filter(s => s.currency === 'vouchers' || s.outfits?.some(o => o.currency === 'vouchers'));

  const handleCopyCode = (voucher: ShoppingVoucher) => {
    navigator.clipboard?.writeText(voucher.code);
    setCopiedCodeId(voucher.id);
    sounds.playPickup();
    setTimeout(() => setCopiedCodeId(null), 2200);
  };

  const handleUpgradeClick = (statId: keyof PermanentUpgrades, currentLevel: number, maxLevel: number, cost: number) => {
    if (currentLevel >= maxLevel) return;
    if (vouchers < cost) {
      sounds.playSlide();
      return;
    }
    sounds.playUnlockFanfare();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#fb7185', '#38bdf8', '#facc15']
      });
    } catch {}
    onUpgradeStat(statId, cost);
  };

  const handleSkinRedeemClick = (skin: CourierSkin, cost: number) => {
    if (skin.unlocked) {
      onSelectSkin(skin.id, skin.activeOutfitId);
      sounds.playEquipSkin();
      return;
    }
    if (vouchers < cost) {
      sounds.playSlide();
      return;
    }
    sounds.playUnlockFanfare();
    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#f43f5e', '#a855f7', '#38bdf8', '#facc15']
      });
    } catch {}
    onUnlockVoucherSkin(skin.id, skin.outfits?.[0]?.id, cost);
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-4 text-white">
      {/* 1. Top Voucher Balance & Motivation Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-950/90 via-slate-900 to-amber-950/80 border-2 border-rose-500/40 p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-[0_0_25px_rgba(244,63,94,0.6)] shrink-0">
              <Ticket size={28} className="rotate-[-10deg]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-rose-400 font-black">BOS CONQUEROR VAULT</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold">
                  EXCHANGE
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                Pusat Penukaran Voucher Bos
              </h2>
              <p className="text-xs text-slate-300 font-medium max-w-md mt-0.5">
                Tukarkan voucher kemenangan atas Dr. Eggman & Mecha Begal untuk upgrade stat permanen dan kostum legendaris!
              </p>
            </div>
          </div>

          {/* Current Voucher Counter Pill */}
          <div className="bg-slate-950/90 border-2 border-rose-400/80 rounded-2xl px-4 py-2.5 flex items-center gap-3 shrink-0 shadow-inner self-start sm:self-auto">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
              <Ticket size={20} />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Voucher Kamu</div>
              <div className="text-xl font-black text-rose-400 font-mono tabular-nums leading-none mt-0.5">
                {vouchers.toLocaleString()} <span className="text-xs font-bold text-rose-300 font-sans">Tiket</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter Navigation Segments */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto no-scrollbar shrink-0">
        {[
          { id: 'all', label: 'Semua Hadiah', icon: Sparkles },
          { id: 'upgrades', label: 'Permanent Stats', icon: Shield },
          { id: 'skins', label: 'Kostum Legendaris', icon: Flame },
          { id: 'coupons', label: 'Kupon Diskon Toko', icon: Ticket },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveFilter(tab.id as any);
                sounds.playSlide();
              }}
              className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. SECTION: Permanent Multi-Level Stat Boosts */}
      {(activeFilter === 'all' || activeFilter === 'upgrades') && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-rose-400" />
              <h3 className="text-sm font-black text-white tracking-wide uppercase">Upgrade Stat Permanen</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Berlaku permanen di setiap lari</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STAT_UPGRADE_CONFIGS.map((cfg) => {
              const currentLvl = permanentUpgrades[cfg.id] || 0;
              const isMax = currentLvl >= cfg.maxLevel;
              const nextCost = isMax ? 0 : cfg.costs[currentLvl] || 1;
              const canAfford = vouchers >= nextCost && !isMax;

              return (
                <div
                  key={cfg.id}
                  className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3.5 flex flex-col justify-between gap-3 shadow-sm hover:border-slate-700 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-black text-white truncate">{cfg.name}</h4>
                        <span className="text-[11px] font-mono font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20 shrink-0">
                          {isMax ? 'MAX TIER' : `LV. ${currentLvl}/${cfg.maxLevel}`}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                        {cfg.description}
                      </p>
                      <div className="text-[11px] font-semibold text-sky-400 mt-1 flex items-center gap-1">
                        <Sparkles size={11} />
                        <span>Efek: {cfg.effectPerLevel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Level Pips & Upgrade Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 gap-3">
                    {/* 5-Pip Level Display */}
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((pip) => (
                        <div
                          key={pip}
                          className={`w-5 h-2 rounded-full transition-all duration-300 ${
                            pip <= currentLvl
                              ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]'
                              : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleUpgradeClick(cfg.id, currentLvl, cfg.maxLevel, nextCost)}
                      disabled={isMax || !canAfford}
                      className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
                        isMax
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          : canAfford
                          ? 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-black shadow-md'
                          : 'bg-slate-800/80 border border-slate-700 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {isMax ? (
                        <>
                          <Check size={14} className="text-emerald-400" />
                          <span>MAKSIMAL</span>
                        </>
                      ) : (
                        <>
                          <Ticket size={13} className={canAfford ? 'fill-slate-950' : 'text-rose-400'} />
                          <span>UPGRADE ({nextCost})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. SECTION: Exclusive Legendary Boss Conqueror Outfits */}
      {(activeFilter === 'all' || activeFilter === 'skins') && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-amber-400" />
              <h3 className="text-sm font-black text-white tracking-wide uppercase">Kostum Eksklusif Voucher</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Hanya bisa dibuka dengan Voucher Bos</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {voucherSkins.map((skin) => {
              const isEquipped = selectedSkinId === skin.id;
              const canAfford = vouchers >= skin.price && !skin.unlocked;

              return (
                <div
                  key={skin.id}
                  className={`rounded-2xl bg-slate-900/90 border p-3.5 flex flex-col justify-between gap-3 shadow-md relative overflow-hidden transition ${
                    isEquipped ? 'border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.25)]' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Legendary Corner Glow */}
                  <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-rose-500/10 blur-xl pointer-events-none" />

                  <div className="flex items-start gap-3 relative z-10">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-inner border-2"
                      style={{ 
                        backgroundColor: skin.jacketColor || '#1e293b', 
                        borderColor: skin.accentColor || '#f43f5e' 
                      }}
                    >
                      {skin.avatarEmoji || '🎖️'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
                          LEGENDARY
                        </span>
                        <span className="text-[10px] font-black font-mono text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                          <Star size={10} className="fill-amber-400" />
                          {skin.multiplier}x SKOR
                        </span>
                      </div>

                      <h4 className="text-sm font-black text-white mt-1 truncate">{skin.name}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mt-0.5">
                        {skin.description}
                      </p>
                      {skin.perk && (
                        <div className="text-[11px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                          <Sparkles size={11} />
                          <span>{skin.perk}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Redeem / Equip Footer */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 relative z-10">
                    <div className="text-xs font-bold text-slate-400">
                      {skin.unlocked ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Check size={14} /> Terbuka di Koleksi
                        </span>
                      ) : (
                        <div className="flex items-center gap-1 text-rose-400 font-black">
                          <Ticket size={14} className="fill-rose-400" />
                          <span>{skin.price} Voucher</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleSkinRedeemClick(skin, skin.price)}
                      disabled={!skin.unlocked && !canAfford}
                      className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
                        isEquipped
                          ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-300 cursor-default'
                          : skin.unlocked
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                          : canAfford
                          ? 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-black shadow-md'
                          : 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isEquipped ? (
                        <>
                          <Check size={14} />
                          <span>DIGUNAKAN</span>
                        </>
                      ) : skin.unlocked ? (
                        <>
                          <Award size={14} />
                          <span>PAKAI SEKARANG</span>
                        </>
                      ) : (
                        <>
                          <Ticket size={13} className={canAfford ? 'fill-slate-950' : 'text-slate-500'} />
                          <span>TUKAR KOSTUM</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. SECTION: Store Discount Coupons */}
      {(activeFilter === 'all' || activeFilter === 'coupons') && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Ticket size={16} className="text-sky-400" />
              <h3 className="text-sm font-black text-white tracking-wide uppercase">Kupon Diskon Toko HND</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Bisa dipakai saat servis & rakit PC</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SHOPPING_VOUCHERS.map((voucher) => (
              <div
                key={voucher.id}
                className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3.5 flex flex-col justify-between gap-3 shadow-sm relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span 
                      className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border"
                      style={{ 
                        color: voucher.accentColor || '#38bdf8', 
                        borderColor: `${voucher.accentColor}55` || '#38bdf855',
                        backgroundColor: `${voucher.accentColor}15` || '#38bdf815',
                      }}
                    >
                      {voucher.badge}
                    </span>
                    <h4 className="text-base font-black text-white mt-1.5">{voucher.title}</h4>
                    <div className="text-xs font-bold text-slate-300 mt-0.5">{voucher.storeName}</div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {voucher.description}
                    </p>
                  </div>

                  <div className="w-11 h-11 rounded-2xl bg-sky-950/60 border border-sky-800 flex items-center justify-center text-xl shrink-0 text-sky-400">
                    🎁
                  </div>
                </div>

                {/* Coupon Code & Copy Action */}
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-800 gap-2">
                  <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-dashed border-slate-700 font-mono text-xs font-bold text-amber-300 select-all">
                    {voucher.code}
                  </div>

                  <button
                    onClick={() => handleCopyCode(voucher)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black flex items-center gap-1.5 transition active:scale-95 cursor-pointer border border-slate-700"
                  >
                    {copiedCodeId === voucher.id ? (
                      <>
                        <Check size={13} className="text-emerald-400" />
                        <span className="text-emerald-400">TERSALIN!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>SALIN KODE</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
