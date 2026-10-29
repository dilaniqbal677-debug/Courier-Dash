/**
 * Boss Combat & Aerial Threat Engine
 * Coordinates boss drone movement, red warning lane telegraphs, missile/laser barrage,
 * player blaster firing, and boss defeat vouchers.
 */

import * as THREE from 'three';
import { LANES, LaneIndex } from '../constants';
import {
  createBossCharacter,
  BossRig,
  createPlayerProjectile,
  createBossProjectile,
  createBossWarningIndicator,
} from '../models';
import { createExplosion } from '../explosion';
import { sounds } from '../../audio/soundManager';
import { safeDisposeObject } from '../utils/dispose';
import { ParticlePool } from '../particles/particlePool';

export interface BossWarningMesh {
  mesh: THREE.Group;
  lane: number;
}

export interface BossBattleState {
  active: boolean;
  hp: number;
  maxHp: number;
  name: string;
  z: number;
  x: number;
  attackTimer: number;
  warningActive?: boolean;
  attackType?: string;
  warningLanes?: number[];
  warningMeshes?: BossWarningMesh[];
}

export interface BossCombatCallbacks {
  onBossBattleUpdate?: (
    boss: {
      active: boolean;
      hp: number;
      maxHp: number;
      name: string;
      warningActive?: boolean;
      attackType?: string;
      warningLanes?: number[];
    } | null,
    ammo: number
  ) => void;
  onBossDefeated?: () => void;
  onPlayerHitByBoss: () => void;
}

export class BossCombatEngine {
  private scene: THREE.Scene;
  private particlePool: ParticlePool;
  private callbacks: BossCombatCallbacks;

  public bossBattle: BossBattleState | null = null;
  public bossRig: BossRig | null = null;
  public blasterAmmo: number = 0;
  public activeBlasters: { id: number; mesh: THREE.Object3D; z: number }[] = [];
  public bossProjectiles: { id: number; mesh: THREE.Object3D; z: number; lane: number }[] = [];

  constructor(scene: THREE.Scene, particlePool: ParticlePool, callbacks: BossCombatCallbacks) {
    this.scene = scene;
    this.particlePool = particlePool;
    this.callbacks = callbacks;
  }

  public spawnBoss(courierZ: number, initialAmmo: number = 10) {
    if (this.bossBattle && this.bossBattle.active) return;

    this.blasterAmmo = initialAmmo;
    const bRig = createBossCharacter();
    bRig.root.position.set(0, 3.8, courierZ - 48);
    this.scene.add(bRig.root);
    this.bossRig = bRig;

    this.bossBattle = {
      active: true,
      hp: 100,
      maxHp: 100,
      name: 'DRONE CYBER-BEGAL 3000',
      z: courierZ - 48,
      x: 0,
      attackTimer: 0,
      warningActive: false,
      attackType: 'none',
      warningLanes: [],
      warningMeshes: [],
    };

    sounds.playWarehouseKlaxon();
    if (this.callbacks.onBossBattleUpdate) {
      this.callbacks.onBossBattleUpdate(
        { active: true, hp: 100, maxHp: 100, name: this.bossBattle.name },
        this.blasterAmmo
      );
    }
  }

  public shootBlaster(currentX: number, currentY: number, courierZ: number) {
    if (this.blasterAmmo <= 0 || !this.bossBattle?.active) return;

    this.blasterAmmo--;
    const projectile = createPlayerProjectile();
    projectile.position.set(currentX, currentY + 0.8, courierZ - 1.2);
    this.scene.add(projectile);
    this.activeBlasters.push({ id: Date.now() + Math.random(), mesh: projectile, z: courierZ - 1.2 });

    sounds.playBlasterShot();
    if (this.callbacks.onBossBattleUpdate) {
      this.callbacks.onBossBattleUpdate(
        {
          active: true,
          hp: this.bossBattle.hp,
          maxHp: this.bossBattle.maxHp,
          name: this.bossBattle.name,
        },
        this.blasterAmmo
      );
    }
  }

  public update(
    delta: number,
    time: number,
    courierZ: number,
    currentX: number,
    currentY: number,
    effectiveSpeed: number,
    hasShield: boolean,
    isExpressActive: boolean
  ) {
    if (!this.bossBattle || !this.bossBattle.active || !this.bossRig) {
      // Clean up projectiles that fly past
      this.updateRemainingProjectiles(delta, courierZ, effectiveSpeed, currentX, currentY, hasShield, isExpressActive);
      return;
    }

    const b = this.bossBattle;
    const bRig = this.bossRig;

    // 1. Boss Positioning & Floating Hover Animation
    b.z = courierZ - 42;
    b.x = Math.sin(time * 1.5) * 2.2;
    bRig.root.position.set(b.x, 3.8 + Math.sin(time * 2.5) * 0.45, b.z);
    bRig.updateAnimation(time, delta);

    // 2. Boss Attack Cycle (Warning Charge -> Projectile Volley)
    b.attackTimer += delta;
    const isPhase2 = b.hp < 50;
    const chargeThreshold = isPhase2 ? 2.5 : 3.8;
    const warningDuration = 1.35;

    // Telegraph Phase: Spawn red lane warning hazards
    if (b.attackTimer > chargeThreshold && !b.warningActive) {
      b.warningActive = true;
      bRig.setCannonCharging(true);
      sounds.playBossCharge();

      let targetLanes: number[] = [];
      let attackName = 'spread_missile';

      if (isPhase2) {
        // Phase 2: 2 lanes targeted or laser sweep
        const rand = Math.random();
        if (rand < 0.5) {
          attackName = 'spread_missile';
          const safeLane = Math.floor(Math.random() * 3);
          targetLanes = [0, 1, 2].filter((l) => l !== safeLane);
        } else {
          attackName = 'rapid_burst';
          targetLanes = [Math.floor(Math.random() * 3), (Math.floor(Math.random() * 3) + 1) % 3];
        }
      } else {
        // Phase 1: 1 or 2 targeted lanes
        attackName = 'spread_missile';
        targetLanes = [Math.floor(Math.random() * 3)];
      }

      b.attackType = attackName;
      b.warningLanes = targetLanes;
      b.warningMeshes = [];

      targetLanes.forEach((laneIdx) => {
        const indicator = createBossWarningIndicator(LANES[laneIdx as LaneIndex]);
        indicator.position.z = courierZ - 18;
        this.scene.add(indicator);
        b.warningMeshes?.push({ mesh: indicator, lane: laneIdx });
      });

      if (this.callbacks.onBossBattleUpdate) {
        this.callbacks.onBossBattleUpdate(
          {
            active: true,
            hp: b.hp,
            maxHp: b.maxHp,
            name: b.name,
            warningActive: true,
            attackType: attackName,
            warningLanes: targetLanes,
          },
          this.blasterAmmo
        );
      }
    }

    // Animate warning hazards while charging
    if (b.warningActive && b.warningMeshes) {
      const pulse = 0.55 + Math.sin(time * 24) * 0.35;
      b.warningMeshes.forEach((w) => {
        w.mesh.position.z = courierZ - 18;
        const floorMesh = w.mesh.children[0] as THREE.Mesh;
        if (floorMesh && floorMesh.material) {
          (floorMesh.material as THREE.MeshBasicMaterial).opacity = pulse;
        }
      });
    }

    // Warning Concluded: Fire Boss Projectiles
    if (b.warningActive && b.attackTimer > chargeThreshold + warningDuration) {
      bRig.setCannonCharging(false);

      b.warningMeshes?.forEach((w) => {
        const isLaser = b.attackType === 'single_laser';
        const proj = createBossProjectile(isLaser ? 'laser' : 'missile');
        proj.position.set(LANES[w.lane as LaneIndex], 1.5, b.z + 1.8);
        this.scene.add(proj);
        this.bossProjectiles.push({
          id: Date.now() + Math.random(),
          mesh: proj,
          z: b.z + 1.8,
          lane: w.lane,
        });

        this.scene.remove(w.mesh);
        safeDisposeObject(w.mesh);
      });

      b.warningActive = false;
      b.attackTimer = 0;
      b.warningMeshes = [];

      if (this.callbacks.onBossBattleUpdate) {
        this.callbacks.onBossBattleUpdate(
          {
            active: true,
            hp: b.hp,
            maxHp: b.maxHp,
            name: b.name,
            warningActive: false,
            attackType: 'none',
            warningLanes: [],
          },
          this.blasterAmmo
        );
      }
    }

    // 3. Update Boss Projectiles flight and collision
    this.updateRemainingProjectiles(delta, courierZ, effectiveSpeed, currentX, currentY, hasShield, isExpressActive);

    // 4. Update Player Blaster Projectiles (Fly forward to hit Boss)
    for (let i = this.activeBlasters.length - 1; i >= 0; i--) {
      const p = this.activeBlasters[i];
      p.z -= 65 * delta;
      p.mesh.position.z = p.z;

      const distToBossZ = Math.abs(p.z - b.z);
      if (distToBossZ < 2.5 && Math.abs(p.mesh.position.x - b.x) < 2.2) {
        b.hp = Math.max(0, b.hp - 10);
        this.scene.remove(p.mesh);
        safeDisposeObject(p.mesh);
        this.activeBlasters.splice(i, 1);

        bRig.setHitFlash(true);
        bRig.setHealth(b.hp, b.maxHp);
        sounds.playBossHit();

        const exp = createExplosion(0x38bdf8, 1.2);
        exp.position.copy(p.mesh.position);
        this.scene.add(exp);
        this.particlePool.addExplosion(exp);

        if (this.callbacks.onBossBattleUpdate) {
          this.callbacks.onBossBattleUpdate(
            { active: true, hp: b.hp, maxHp: b.maxHp, name: b.name },
            this.blasterAmmo
          );
        }

        // Check Boss Defeat
        if (b.hp <= 0) {
          this.handleBossDefeat(bRig);
          return;
        }
      }

      if (p.z < b.z - 20) {
        this.scene.remove(p.mesh);
        safeDisposeObject(p.mesh);
        this.activeBlasters.splice(i, 1);
      }
    }
  }

  private updateRemainingProjectiles(
    delta: number,
    courierZ: number,
    effectiveSpeed: number,
    currentX: number,
    currentY: number,
    hasShield: boolean,
    isExpressActive: boolean
  ) {
    for (let i = this.bossProjectiles.length - 1; i >= 0; i--) {
      const p = this.bossProjectiles[i];
      const projSpeed = 42;
      p.z += (effectiveSpeed + projSpeed) * delta;
      p.mesh.position.z = p.z;
      p.mesh.rotation.z += delta * 12;

      // Collision check with player
      const distToPlayerZ = Math.abs(p.z - courierZ);
      if (distToPlayerZ < 1.4) {
        const inSameLane = Math.abs(currentX - LANES[p.lane as LaneIndex]) < 1.05;
        const playerGrounded = currentY < 1.1;

        if (inSameLane && playerGrounded) {
          if (hasShield) {
            sounds.playShieldBlock();
            this.scene.remove(p.mesh);
            safeDisposeObject(p.mesh);
            this.bossProjectiles.splice(i, 1);
            continue;
          } else if (isExpressActive) {
            continue;
          } else {
            this.scene.remove(p.mesh);
            safeDisposeObject(p.mesh);
            this.bossProjectiles.splice(i, 1);
            this.callbacks.onPlayerHitByBoss();
            return;
          }
        }
      }

      if (p.z > courierZ + 12) {
        this.scene.remove(p.mesh);
        safeDisposeObject(p.mesh);
        this.bossProjectiles.splice(i, 1);
      }
    }
  }

  private handleBossDefeat(bRig: BossRig) {
    sounds.playBossDefeat();

    for (let k = 0; k < 4; k++) {
      const exp = createExplosion(0xf59e0b, 1.8 + k * 0.4);
      exp.position.set(bRig.root.position.x + (k - 1.5) * 0.8, 3.8 + k * 0.3, bRig.root.position.z);
      this.scene.add(exp);
      this.particlePool.addExplosion(exp);
    }

    this.scene.remove(bRig.root);
    this.bossRig = null;
    this.bossBattle = null;

    if (this.callbacks.onBossBattleUpdate) {
      this.callbacks.onBossBattleUpdate(null, this.blasterAmmo);
    }
    this.callbacks.onBossDefeated?.();
  }

  public reset() {
    if (this.bossRig) {
      this.scene.remove(this.bossRig.root);
      this.bossRig = null;
    }
    if (this.bossBattle?.warningMeshes) {
      this.bossBattle.warningMeshes.forEach((w) => {
        this.scene.remove(w.mesh);
        safeDisposeObject(w.mesh);
      });
    }
    this.bossBattle = null;

    this.activeBlasters.forEach((b) => {
      this.scene.remove(b.mesh);
      safeDisposeObject(b.mesh);
    });
    this.activeBlasters.length = 0;

    this.bossProjectiles.forEach((p) => {
      this.scene.remove(p.mesh);
      safeDisposeObject(p.mesh);
    });
    this.bossProjectiles.length = 0;
  }
}
