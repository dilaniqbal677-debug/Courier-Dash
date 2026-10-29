/**
 * Collision Detection & Item Interaction Engine
 * Handles precise bounding checks for:
 * - Low hurdles (obstacle_low) -> trip forward vs mid-air fall
 * - Overhead gantry signs (obstacle_high) -> overhead impact
 * - Cargo delivery trucks/vans (obstacle_vehicle) -> frontal impact
 * - Collectibles: Coins, Parcels, Power-ups, Blaster pickups, Electronic components
 * - Toko Target dropzone delivery fulfillment
 */

import * as THREE from 'three';
import {
  TokoTarget,
  POWERUPS,
  PowerupType,
  OrderMissionInfo,
  ElectronicType,
  PermanentUpgrades,
} from '../constants';
import { triggerCinematicCrash, CrashType, CinematicCrashState } from '../cinematicCrash';
import { CourierRig, syncPackageStack } from '../models';
import { sounds } from '../../audio/soundManager';
import confetti from 'canvas-confetti';
import { ParticlePool } from '../particles/particlePool';

export interface WorldItem {
  id: number;
  type: string;
  mesh: THREE.Object3D;
  lane: number;
  powerupType?: PowerupType;
  componentType?: ElectronicType;
  unboxed?: boolean;
}

export interface CollisionRunnerState {
  currentX: number;
  currentY: number;
  distance: number;
  isJumping: boolean;
  isSliding: boolean;
  isDead: boolean;
  score: number;
  coins: number;
  packagesCarried: number;
  totalPackagesDelivered: number;
  tipsEarned: number;
  comboStreak: number;
  blasterAmmo: number;
  shakeIntensity: number;
  powerups: Record<PowerupType, number>;
  unboxedComponents: ElectronicType[];
  hndGuardActivation: { active: boolean; timer: number; duration: number; progress: number } | null;
  hndExpressActivation: { active: boolean; timer: number; duration: number; progress: number } | null;
  cinematicCrash: CinematicCrashState;
}

export interface CollisionCallbacks {
  onPickupPowerup: (type: PowerupType) => void;
  onDeliverSuccess: (toko: TokoTarget, count: number, tip: number) => void;
  onCrashStart?: (type: CrashType, title: string, subtitle: string) => void;
  getPermanentUpgrades?: () => PermanentUpgrades | undefined;
  getPowerupLevels?: () => Record<PowerupType, number> | undefined;
}

export class CollisionEngine {
  private callbacks: CollisionCallbacks;
  private particlePool: ParticlePool;

  constructor(callbacks: CollisionCallbacks, particlePool: ParticlePool) {
    this.callbacks = callbacks;
    this.particlePool = particlePool;
  }

  /**
   * Evaluates interactions between the courier and all active items in the world
   */
  public evaluateInteractions(
    items: WorldItem[],
    s: CollisionRunnerState,
    courierRig: CourierRig,
    courierZ: number,
    effectiveSpeed: number,
    scene: THREE.Scene,
    activeToko: TokoTarget | null,
    orderMission: OrderMissionInfo | null
  ) {
    if (s.isDead) return;

    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      const distZ = Math.abs(courierZ - item.mesh.position.z);

      // A. Pickups (Parcels, Coins, Power-ups, Components, Blasters)
      if (
        item.type === 'package' ||
        item.type === 'gold_package' ||
        item.type === 'coin' ||
        item.type === 'powerup' ||
        item.type === 'blaster_pickup' ||
        item.type === 'electronic_component'
      ) {
        // Magnet vacuum pull effect
        if (s.powerups.magnet > 0 && distZ < 18) {
          const dx = s.currentX - item.mesh.position.x;
          const dz = courierZ - item.mesh.position.z;
          item.mesh.position.x += dx * 0.14;
          item.mesh.position.z += dz * 0.14;
        }

        // Collection Proximity Check
        const distX = Math.abs(s.currentX - item.mesh.position.x);
        const distY = Math.abs(s.currentY - item.mesh.position.y);

        if (distZ < 1.35 && distX < 1.25 && distY < 2.2) {
          scene.remove(item.mesh);
          items.splice(i, 1);

          if (item.type === 'electronic_component' && item.componentType) {
            // Electronic component packing pickup
            s.unboxedComponents.push(item.componentType);
            sounds.playComponentPickup();
            s.score += 350;
            this.particlePool.spawnSparks(s.currentX, s.currentY + 0.8, courierZ, 6);
          } else if (item.type === 'package') {
            s.packagesCarried++;
            s.score += 150;
            sounds.playPickup();
            syncPackageStack(courierRig.packageStackGroup, s.packagesCarried);
          } else if (item.type === 'gold_package') {
            s.packagesCarried += 2;
            s.score += 400;
            sounds.playPickup();
            syncPackageStack(courierRig.packageStackGroup, s.packagesCarried);
          } else if (item.type === 'coin') {
            const extraCoin = Math.floor((this.callbacks.getPermanentUpgrades?.()?.coinValue || 0) * 0.5);
            s.coins += 1 + extraCoin;
            const scoreBonus = Math.round(50 * (1 + (this.callbacks.getPermanentUpgrades?.()?.coinValue || 0) * 0.25));
            s.score += scoreBonus;
            sounds.playCoin();
          } else if (item.type === 'blaster_pickup') {
            const ammoBonus = (this.callbacks.getPermanentUpgrades?.()?.bossAmmoBonus || 0) * 2;
            s.blasterAmmo += 15 + ammoBonus;
            sounds.playPickup();
            try {
              confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.5 },
                colors: ['#38bdf8', '#0ea5e9', '#ffffff'],
              });
            } catch {}
          } else if (item.type === 'powerup' && item.powerupType) {
            this.handlePowerupPickup(item.powerupType, s);
          }
          continue;
        }
      }

      // B. Obstacles (Low barrier, High barrier, Cargo Vehicles)
      if (
        item.type === 'obstacle_low' ||
        item.type === 'obstacle_high' ||
        item.type === 'obstacle_vehicle'
      ) {
        const distX = Math.abs(s.currentX - item.mesh.position.x);

        if (distX < 1.15) {
          let hit = false;
          let crashType: CrashType = 'vehicle_impact';
          let crashTitle = 'Menabrak Kendaraan!';
          let crashSubtitle = 'Benturan keras di jalur jalan raya';

          if (item.type === 'obstacle_low') {
            if (distZ < 1.1 && s.currentY < 1.05) {
              hit = true;
              if (s.isJumping || s.currentY > 0.35) {
                crashType = 'midair_fall';
                crashTitle = 'Jatuh di Udara!';
                crashSubtitle = 'Lompatan tersangkut palang barikade jalan';
              } else {
                crashType = 'trip_hurdle';
                crashTitle = 'Tersandung Barikade!';
                crashSubtitle = 'Kaki terantuk rintangan rendah saat berlari';
              }
            }
          } else if (item.type === 'obstacle_high') {
            if (distZ < 1.2 && !s.isSliding) {
              hit = true;
              crashType = 'overhead_impact';
              crashTitle = 'Terbentur Plang Rambu!';
              crashSubtitle = 'Gagal meluncur (slide) di bawah rambu jalan';
            }
          } else if (item.type === 'obstacle_vehicle') {
            if (distZ < 2.5) {
              hit = true;
              crashType = 'vehicle_impact';
              crashTitle = 'Menabrak Mobil Ekspedisi!';
              crashSubtitle = 'Benturan frontal kendaraan di jalur jalan';
            }
          }

          if (hit) {
            // Turbo speed smashes straight through obstacle!
            if (s.powerups.speed > 0) {
              sounds.playCrash();
              s.shakeIntensity = 0.08;
              scene.remove(item.mesh);
              items.splice(i, 1);
              s.score += 250;
              continue;
            }

            // HND Guard Shield absorbs impact
            if (s.powerups.shield > 0) {
              s.powerups.shield = 0;
              sounds.playShieldBlock();
              s.shakeIntensity = 0.08;
              scene.remove(item.mesh);
              items.splice(i, 1);
              continue;
            }

            // Unshielded Crash: Trigger realistic multi-condition crash
            triggerCinematicCrash(
              s.cinematicCrash,
              courierRig,
              courierZ,
              s.currentX,
              s.currentY,
              effectiveSpeed,
              crashType
            );
            s.isDead = true;
            s.comboStreak = 0;
            this.callbacks.onCrashStart?.(crashType, crashTitle, crashSubtitle);
            sounds.playCrash();
            return;
          }
        }
      }
    }

    // C. Toko Target Delivery Zone Dropoff Check
    if (activeToko && s.packagesCarried > 0) {
      // Check delivery trigger when passing delivery dropzone
      const quota = activeToko.packagesRequired || 4;
      if (s.packagesCarried >= quota && (!orderMission || orderMission.phase === 'transit_to_store')) {
        const bonusTip = activeToko.baseReward || 250000;
        const delivered = s.packagesCarried;
        s.packagesCarried = 0;
        s.totalPackagesDelivered += delivered;
        s.tipsEarned += bonusTip;
        s.score += delivered * 500;
        sounds.playDeliverSuccess();
        syncPackageStack(courierRig.packageStackGroup, 0);
        this.callbacks.onDeliverSuccess(activeToko, delivered, bonusTip);
      }
    }
  }

  private handlePowerupPickup(type: PowerupType, s: CollisionRunnerState) {
    const cfg = POWERUPS[type];
    let duration = cfg.duration;
    const perms = this.callbacks.getPermanentUpgrades?.();
    const pLevels = this.callbacks.getPowerupLevels?.();
    const pLvl = pLevels?.[type] || 1;
    duration = duration * (1 + 0.2 * (pLvl - 1));

    if (type === 'shield' && perms?.shieldDuration) {
      duration += perms.shieldDuration * 3;
    } else if (type === 'magnet' && perms?.magnetRadius) {
      duration += perms.magnetRadius * 2;
    }

    s.powerups[type] = duration;

    if (type === 'speed') {
      s.hndExpressActivation = {
        active: true,
        timer: 0,
        duration: 1.25,
        progress: 0,
      };
      sounds.playHNDExpressActivate();
      s.shakeIntensity = 0.05;
      try {
        confetti({
          particleCount: 80,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#f59e0b', '#38bdf8', '#fbbf24', '#ffffff'],
        });
      } catch {}
    } else if (type === 'shield') {
      s.hndGuardActivation = {
        active: true,
        timer: 0,
        duration: 1.25,
        progress: 0,
      };
      sounds.playHNDGuardPickup();
      s.shakeIntensity = 0.05;
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#38bdf8', '#0ea5e9', '#f59e0b', '#ffffff'],
        });
      } catch {}
    } else {
      sounds.playPowerup();
    }

    this.callbacks.onPickupPowerup(type);
  }
}
