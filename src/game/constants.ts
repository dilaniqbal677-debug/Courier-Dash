/**
 * Game constants, configurations, and core physics parameters
 */

import { PowerupType, PowerupConfig } from '../types/game';

// Re-export all types and static data for clean structure & seamless backward compatibility
export * from '../types/game';
export * from './data/tokos';
export * from './data/skins';
export * from './data/vouchers';

// Core physics & game run values
export const INITIAL_SPEED = 18; // units per second
export const MAX_SPEED = 38;
export const ACCELERATION = 0.25; // speed increase per 100m
export const JUMP_VELOCITY = 13;
export const GRAVITY = -36;

export const POWERUPS: Record<PowerupType, PowerupConfig> = {
  magnet: {
    type: 'magnet',
    name: 'Magnet Paket',
    desc: 'Menarik paket dan koin secara otomatis!',
    duration: 10,
    icon: '🧲',
    color: '#ef4444',
  },
  shield: {
    type: 'shield',
    name: 'HND Guard',
    desc: 'Perisai HND Guard! Kebal dari benturan rintangan!',
    duration: 18,
    icon: '🛡️',
    color: '#38bdf8',
  },
  speed: {
    type: 'speed',
    name: 'Sepatu Turbo',
    desc: 'Lari secepat kilat dengan perlindungan penuh!',
    duration: 6,
    icon: '⚡',
    color: '#eab308',
  },
  double_score: {
    type: 'double_score',
    name: '2X Tip Ganda',
    desc: 'Bonus uang tips berlipat ganda saat mengantar!',
    duration: 12,
    icon: '💰',
    color: '#10b981',
  },
};

export const BOSS_CONFIG = {
  maxHp: 100,
  spawnDistance: 220, // Boss appears quickly at 220m for fast-paced action
};
