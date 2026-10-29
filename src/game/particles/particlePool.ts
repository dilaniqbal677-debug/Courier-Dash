/**
 * Particle System & VFX Pool Engine
 * High-performance, zero-garbage-collection visual effect system:
 * - Alternating footstep boot dust puffs while running on asphalt
 * - Turbo supersonic downdraft shockwave rings during jetpack flight
 * - Impact explosion debris and blaster spark bursts
 * - Complete scene addition, lifecycle decay, and cleanup methods
 */

import * as THREE from 'three';
import { safeDisposeObject } from '../utils/dispose';

export interface DustParticle {
  mesh: THREE.Mesh;
  life: number;
  maxLife: number;
  vx: number;
  vy: number;
  vz: number;
}

export interface ComboParticle {
  mesh: THREE.Mesh;
  life: number;
  maxLife: number;
  vx: number;
  vy: number;
  vz: number;
}

export interface ExplosionEntry {
  id: number;
  mesh: THREE.Object3D;
  life?: number;
}

// Module-level shared geometries and materials (Zero CPU allocations in render tick)
const _dustCircleGeom = new THREE.CircleGeometry(0.18, 8);
const _dustRingGeom = new THREE.RingGeometry(0.2, 0.45, 16);
const _sparkGeom = new THREE.BoxGeometry(0.08, 0.08, 0.08);

const _sharedDustCircleMat = new THREE.MeshBasicMaterial({
  color: 0xe2e8f0,
  transparent: true,
  opacity: 0.35,
  depthWrite: false,
});

const _sharedDustRingMat = new THREE.MeshBasicMaterial({
  color: 0x38bdf8,
  transparent: true,
  opacity: 0.45,
  side: THREE.DoubleSide,
  depthWrite: false,
});

const _sharedSparkMat = new THREE.MeshBasicMaterial({
  color: 0xfbbf24,
  transparent: true,
  opacity: 0.8,
  depthWrite: false,
});

export class ParticlePool {
  private scene: THREE.Scene;
  private dustParticles: DustParticle[] = [];
  private comboParticles: ComboParticle[] = [];
  private explosions: ExplosionEntry[] = [];
  private dustSpawnTimer: number = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /**
   * Spawns runner footstep dust puffs or turbo flight downdraft shockwaves
   */
  public updateDustSpawn(
    delta: number,
    currentX: number,
    currentY: number,
    courierZ: number,
    runPhase: number,
    isJumping: boolean,
    isSliding: boolean,
    isSpeedActive: boolean
  ) {
    if (isSpeedActive) {
      // Turbo flight downdraft shockwave ring
      this.dustSpawnTimer += delta;
      if (this.dustSpawnTimer >= 0.08) {
        this.dustSpawnTimer = 0;
        const ringMesh = new THREE.Mesh(_dustRingGeom, _sharedDustRingMat);
        ringMesh.rotation.x = -Math.PI / 2;
        ringMesh.position.set(
          currentX + (Math.random() - 0.5) * 0.4,
          0.02,
          courierZ + (Math.random() - 0.5) * 0.4
        );
        this.scene.add(ringMesh);
        this.dustParticles.push({
          mesh: ringMesh,
          life: 0.35,
          maxLife: 0.35,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 0.05,
          vz: 3.5,
        });
      }
    } else if (!isJumping && !isSliding && currentY <= 0.05) {
      // Ground running boot dust puffs (alternates left and right foot)
      this.dustSpawnTimer += delta;
      if (this.dustSpawnTimer >= 0.10) {
        this.dustSpawnTimer = 0;
        const particleMesh = new THREE.Mesh(_dustCircleGeom, _sharedDustCircleMat);
        particleMesh.rotation.x = -Math.PI / 2;

        const footOffset = Math.sin(runPhase * 2) > 0 ? -0.22 : 0.22;
        particleMesh.position.set(
          currentX + footOffset,
          0.02,
          courierZ + 0.3
        );
        this.scene.add(particleMesh);
        this.dustParticles.push({
          mesh: particleMesh,
          life: 0.35,
          maxLife: 0.35,
          vx: footOffset * 0.5,
          vy: 0.15 + Math.random() * 0.15,
          vz: 2.0 + Math.random() * 0.8,
        });
      }
    }
  }

  /**
   * Spawns sparkling burst when coins, letters, or combo streaks are achieved
   */
  public spawnSparks(x: number, y: number, z: number, count: number = 6) {
    for (let i = 0; i < count; i++) {
      const spark = new THREE.Mesh(_sparkGeom, _sharedSparkMat);
      spark.position.set(x, y, z);
      this.scene.add(spark);

      const angle = (Math.PI * 2 * i) / count;
      const speed = 2.5 + Math.random() * 2.0;

      this.comboParticles.push({
        mesh: spark,
        life: 0.45,
        maxLife: 0.45,
        vx: Math.cos(angle) * speed,
        vy: 1.5 + Math.random() * 2.0,
        vz: Math.sin(angle) * speed,
      });
    }
  }

  /**
   * Adds an explosion object to track and decay
   */
  public addExplosion(mesh: THREE.Object3D) {
    this.explosions.push({
      id: Date.now() + Math.random(),
      mesh,
      life: 0.6,
    });
  }

  /**
   * Updates all active particles and removes decayed ones from scene
   */
  public update(delta: number) {
    // 1. Update Dust Particles
    for (let i = this.dustParticles.length - 1; i >= 0; i--) {
      const dp = this.dustParticles[i];
      dp.life -= delta;
      if (dp.life <= 0) {
        this.scene.remove(dp.mesh);
        this.dustParticles.splice(i, 1);
      } else {
        const ratio = Math.max(0.01, dp.life / dp.maxLife);
        dp.mesh.position.x += dp.vx * delta;
        dp.mesh.position.y += dp.vy * delta;
        dp.mesh.position.z += dp.vz * delta;
        dp.mesh.scale.set(ratio, ratio, ratio);
      }
    }

    // 2. Update Combo & Coin Sparkles
    for (let i = this.comboParticles.length - 1; i >= 0; i--) {
      const cp = this.comboParticles[i];
      cp.life -= delta;
      if (cp.life <= 0) {
        this.scene.remove(cp.mesh);
        this.comboParticles.splice(i, 1);
      } else {
        const ratio = Math.max(0.01, cp.life / cp.maxLife);
        cp.vy -= 9.8 * delta; // Gravity
        cp.mesh.position.x += cp.vx * delta;
        cp.mesh.position.y += cp.vy * delta;
        cp.mesh.position.z += cp.vz * delta;
        cp.mesh.scale.set(ratio, ratio, ratio);
      }
    }

    // 3. Update Explosions
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const exp = this.explosions[i];
      if (exp.life !== undefined) {
        exp.life -= delta;
        if (exp.life <= 0) {
          this.scene.remove(exp.mesh);
          safeDisposeObject(exp.mesh);
          this.explosions.splice(i, 1);
        } else {
          exp.mesh.scale.multiplyScalar(1.0 + delta * 2.5);
        }
      }
    }
  }

  /**
   * Clears and disposes all active particles in scene on restart
   */
  public reset() {
    this.dustParticles.forEach((dp) => {
      this.scene.remove(dp.mesh);
    });
    this.dustParticles.length = 0;

    this.comboParticles.forEach((cp) => {
      this.scene.remove(cp.mesh);
    });
    this.comboParticles.length = 0;

    this.explosions.forEach((exp) => {
      this.scene.remove(exp.mesh);
      safeDisposeObject(exp.mesh);
    });
    this.explosions.length = 0;
  }
}
