/**
 * Core Game Types and Interfaces
 */

export const LANES = [-2.8, 0, 2.8] as const;
export type LaneIndex = 0 | 1 | 2;

export type ElectronicType = 'gpu' | 'laptop' | 'motherboard' | 'monitor';

export interface ElectronicComponentInfo {
  type: ElectronicType;
  name: string;
  subname: string;
  brand: string;
  color: string;
  accentColor: string;
  icon: string;
  scoreVal: number;
}

export type DeliveryPhase = 'packing' | 'transit_to_store';

export interface OrderManifestEntry {
  type: ElectronicType;
  name: string;
  subname: string;
  brand: string;
  icon: string;
  color: string;
  accentColor: string;
  required: number;
  collected: number;
}

export interface TokoTarget {
  name: string;
  category: string;
  color: string;
  accentColor: string;
  baseReward: number; // in Rupiah
  packagesRequired: number;
  requestedManifest?: Partial<Record<ElectronicType, number>>;
}

export interface OrderMissionInfo {
  orderId: number;
  phase: DeliveryPhase;
  targetToko: TokoTarget;
  requiredComponents: ElectronicType[];
  manifest: Record<ElectronicType, OrderManifestEntry>;
  isManifestComplete: boolean;
  packedComponents: ElectronicType[];
  totalRequired: number;
  totalPacked: number;
  distToToko?: number;
  totalTransitDistance?: number;
  packingZoneStartDistance?: number;
  packingZoneEndDistance?: number;
}

export type PowerupType = 'magnet' | 'shield' | 'speed' | 'double_score';

export interface PowerupConfig {
  type: PowerupType;
  name: string;
  desc: string;
  duration: number; // in seconds
  icon: string;
  color: string;
}

export interface CourierOutfit {
  id: string;
  name: string;
  jacketColor: string;
  helmetColor: string;
  backpackColor: string;
  hatType?: string;
  unlocked: boolean;
  price: number;
  currency?: 'coins' | 'keys' | 'vouchers';
  avatarEmoji?: string;
}

export interface CourierSkin {
  id: string;
  name: string;
  title?: string;
  outfitName: string;
  activeOutfitId?: string;
  price: number;
  currency?: 'coins' | 'keys' | 'vouchers';
  unlocked: boolean;
  jacketColor: string;
  helmetColor: string;
  backpackColor: string;
  description: string;
  category?: 'Default' | 'Special' | 'Event' | 'Legend';
  badge?: 'calendar' | 'timer' | 'multiplier';
  multiplier?: number;
  perk?: string;
  hatType?: 'jester' | 'helmet' | 'beanie' | 'crown' | 'alien' | 'cap' | 'horns' | 'ninja' | 'punk';
  accentColor?: string;
  avatarEmoji?: string;
  outfits?: CourierOutfit[];
}

export interface HoverBoard {
  id: string;
  name: string;
  price: number;
  unlocked: boolean;
  deckColor: string;
  trailColor: string;
  perk: string;
  icon: string;
}

export interface PermanentUpgrades {
  shieldDuration: number; // Level 0-5 (+3s per level)
  magnetRadius: number;   // Level 0-5 (+2s duration & +25% pull distance per level)
  coinValue: number;      // Level 0-5 (+0.25x score & coin bonus per level)
  bossAmmoBonus: number;  // Level 0-5 (+1 starting blaster ammo per level)
}

export interface StatUpgradeConfig {
  id: keyof PermanentUpgrades;
  name: string;
  icon: string;
  description: string;
  effectPerLevel: string;
  maxLevel: number;
  costs: number[]; // Costs in vouchers for level 1 to 5
}

export interface ShoppingVoucher {
  id: string;
  title: string;
  discountText: string;
  storeName: string;
  category: string;
  code: string;
  minSpend: string;
  validDays: number;
  badge: string;
  accentColor: string;
  description: string;
  bonusTips: number;
  bonusScore: number;
}

export interface BossBattleState {
  active: boolean;
  hp: number;
  maxHp: number;
  name: string;
  z: number;
  x: number;
  phase: number;
  attackTimer: number;
  warningActive: boolean;
  warningLane: LaneIndex | null;
  attackType: 'none' | 'single_laser' | 'spread_missile' | 'rapid_burst';
  warningMeshes?: { mesh: any; lane: number }[];
  bossRig?: any;
}
