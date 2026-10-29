/**
 * Unified Game Notification Banner
 * Manages all in-game transient toasts (Delivery, Phase changes, Powerups, Weather, Boss Warnings, Crashes)
 * Guarantees zero overlapping / stacking by rendering only one coordinated, high-priority notification at a time.
 */

import React from 'react';
import { Sparkles, CheckCircle2, Shield, Zap, AlertTriangle, CloudSun, Package } from 'lucide-react';

export type NoticeTheme = 'emerald' | 'amber' | 'sky' | 'rose' | 'purple';

export interface GameNotice {
  id: string;
  category: 'delivery' | 'phase' | 'powerup' | 'weather' | 'crash' | 'boss';
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: string | React.ReactNode;
  theme: NoticeTheme;
  priority: number;
  timestamp: number;
}

interface GameNotificationProps {
  notice: GameNotice | null;
}

const THEME_STYLES: Record<NoticeTheme, {
  border: string;
  shadow: string;
  badgeBg: string;
  badgeText: string;
  iconBg: string;
  glowRing: string;
}> = {
  emerald: {
    border: 'border-emerald-400/80',
    shadow: 'shadow-[0_8px_32px_rgba(16,185,129,0.4)]',
    badgeBg: 'bg-emerald-500/20 border-emerald-400/40',
    badgeText: 'text-emerald-300',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white',
    glowRing: 'ring-emerald-400/20',
  },
  amber: {
    border: 'border-amber-400/80',
    shadow: 'shadow-[0_8px_32px_rgba(245,158,11,0.4)]',
    badgeBg: 'bg-amber-500/20 border-amber-400/40',
    badgeText: 'text-amber-300',
    iconBg: 'bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950',
    glowRing: 'ring-amber-400/20',
  },
  sky: {
    border: 'border-sky-400/80',
    shadow: 'shadow-[0_8px_32px_rgba(56,189,248,0.4)]',
    badgeBg: 'bg-sky-500/20 border-sky-400/40',
    badgeText: 'text-sky-300',
    iconBg: 'bg-gradient-to-br from-sky-400 to-blue-600 text-white',
    glowRing: 'ring-sky-400/20',
  },
  rose: {
    border: 'border-rose-500/90',
    shadow: 'shadow-[0_8px_32px_rgba(244,63,94,0.45)]',
    badgeBg: 'bg-rose-500/20 border-rose-400/40',
    badgeText: 'text-rose-300',
    iconBg: 'bg-gradient-to-br from-rose-500 to-red-700 text-white',
    glowRing: 'ring-rose-400/20',
  },
  purple: {
    border: 'border-purple-400/80',
    shadow: 'shadow-[0_8px_32px_rgba(168,85,247,0.4)]',
    badgeBg: 'bg-purple-500/20 border-purple-400/40',
    badgeText: 'text-purple-300',
    iconBg: 'bg-gradient-to-br from-purple-500 to-indigo-700 text-white',
    glowRing: 'ring-purple-400/20',
  },
};

export const GameNotification: React.FC<GameNotificationProps> = ({ notice }) => {
  if (!notice) return null;

  const style = THEME_STYLES[notice.theme] || THEME_STYLES.sky;

  const renderDefaultIcon = () => {
    if (notice.icon && typeof notice.icon !== 'string') {
      return notice.icon;
    }
    if (typeof notice.icon === 'string' && notice.icon.length > 0) {
      return <span className="text-xl select-none leading-none">{notice.icon}</span>;
    }
    switch (notice.category) {
      case 'delivery':
        return <CheckCircle2 size={20} />;
      case 'powerup':
        return <Shield size={20} />;
      case 'boss':
      case 'crash':
        return <AlertTriangle size={20} />;
      case 'weather':
        return <CloudSun size={20} />;
      default:
        return <Package size={20} />;
    }
  };

  return (
    <div
      key={notice.id}
      className="fixed top-[110px] md:top-[88px] left-1/2 -translate-x-1/2 z-40 pointer-events-none w-[94%] max-w-sm sm:max-w-md animate-in fade-in slide-in-from-top-3 duration-200"
    >
      <div
        className={`bg-slate-950/95 backdrop-blur-xl border ${style.border} ${style.shadow} ring-2 ${style.glowRing} rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center gap-3 text-white transition-all`}
      >
        {/* Icon Frame */}
        <div
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${style.iconBg} flex items-center justify-center shrink-0 shadow-md border border-white/20`}
        >
          {renderDefaultIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center justify-between gap-1.5 mb-0.5">
            <span
              className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${style.badgeBg} ${style.badgeText} truncate`}
            >
              {notice.badge || notice.category.toUpperCase()}
            </span>
            <span className="text-[10px] text-slate-400 font-mono shrink-0">
              {new Date(notice.timestamp).toLocaleTimeString([], { second: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="text-xs sm:text-sm font-black text-white truncate leading-tight">
            {notice.title}
          </div>

          {notice.subtitle && (
            <div className="text-[10px] sm:text-[11px] font-medium text-slate-300 truncate mt-0.5">
              {notice.subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
