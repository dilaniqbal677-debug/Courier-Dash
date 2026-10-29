import React, { useState } from 'react';
import { Copy, Check, Sparkles, Tag, Gift, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { ShoppingVoucher } from '../game/constants';
import { sounds } from '../audio/soundManager';

interface VoucherModalProps {
  voucher: ShoppingVoucher | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({ voucher, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !voucher) return null;

  const handleCopyCode = () => {
    try {
      navigator.clipboard.writeText(voucher.code);
      setCopied(true);
      sounds.playCoin();
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-400/80 rounded-3xl p-6 shadow-[0_0_60px_rgba(245,158,11,0.45)] text-white overflow-hidden animate-in zoom-in-90 duration-300">
        
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-48 bg-amber-500/25 rounded-full blur-3xl pointer-events-none" />

        {/* Header Ribbon */}
        <div className="text-center relative z-10 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-widest uppercase mb-2 animate-bounce">
            <Sparkles size={14} className="text-amber-400" />
            {voucher.badge}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-sky-300">
            ★ BOS DIKALAHKAN! ★
          </h2>
          <p className="text-xs text-slate-300 font-medium mt-1">
            Selamat! Kamu berhasil menumbangkan Boss dan meraih voucher belanja eksklusif!
          </p>
        </div>

        {/* 3D Holographic Voucher Ticket Card */}
        <div className="relative bg-slate-800/90 border-2 border-dashed border-amber-400/70 rounded-2xl p-4 sm:p-5 shadow-2xl overflow-hidden mb-5">
          {/* Decorative side ticket notches */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-950 rounded-full border-r border-amber-400/50" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-950 rounded-full border-l border-amber-400/50" />

          {/* Store Name & Category */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-3 mb-3">
            <div>
              <div className="text-xs font-black text-amber-400 tracking-wider flex items-center gap-1.5">
                <Tag size={13} />
                {voucher.storeName}
              </div>
              <div className="text-[11px] text-slate-300 font-semibold">{voucher.category}</div>
            </div>
            <div className="bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg text-xs font-black tracking-tight shadow">
              {voucher.discountText}
            </div>
          </div>

          {/* Description */}
          <div className="text-sm font-bold text-white mb-3">
            {voucher.title}
          </div>
          <div className="text-xs text-slate-300 mb-4 leading-relaxed">
            {voucher.description}
          </div>

          {/* Promo Code Box */}
          <div className="bg-slate-950/80 border border-slate-700 rounded-xl p-3 flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Kode Promo Kupon:</div>
              <div className="text-base sm:text-lg font-black tracking-wider text-amber-300 font-mono">
                {voucher.code}
              </div>
            </div>
            <button
              onClick={handleCopyCode}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow ${
                copied
                  ? 'bg-emerald-500 text-slate-950 scale-95'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 active:scale-95'
              }`}
            >
              {copied ? (
                <>
                  <Check size={14} />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Salin Kode</span>
                </>
              )}
            </button>
          </div>

          {/* Validity & Terms */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mt-3 pt-2 border-t border-slate-700/50">
            <span>{voucher.minSpend}</span>
            <span>Berlaku: {voucher.validDays} Hari</span>
          </div>
        </div>

        {/* Bonus Loot Earned Bar */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3 flex items-center justify-around mb-5 text-center">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Bonus Uang Tip</div>
            <div className="text-sm font-black text-emerald-400">+Rp {voucher.bonusTips.toLocaleString('id-ID')}</div>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Bonus Skor Boss</div>
            <div className="text-sm font-black text-amber-400">+{voucher.bonusScore.toLocaleString()} Pts</div>
          </div>
        </div>

        {/* Action Button: Lanjut Balapan */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 py-3.5 px-6 rounded-2xl font-black text-sm tracking-wider uppercase transition-all shadow-lg active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Klaim & Lanjut Balapan</span>
          <ArrowRight size={18} />
        </button>

      </div>
    </div>
  );
};
