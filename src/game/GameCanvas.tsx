/**
 * Main 3D Game Canvas for Subway Courier Runner
 * Powered by Three.js with modular sub-engines:
 * - InputController: Keyboard, swipe gestures, and lane/jump physics
 * - ParticlePool: High-performance zero-GC dust, combos, and explosion particles
 * - BossCombatEngine: Boss drone telegraphs, missile volley, and blaster shooting
 * - CollisionEngine: Multi-condition obstacle collisions and item pickups
 * - WorldManager: Procedural track, district biomes, and warehouse packing
 */

import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  LANES,
  LaneIndex,
  INITIAL_SPEED,
  MAX_SPEED,
  GRAVITY,
  CourierSkin,
  TokoTarget,
  PowerupType,
  PermanentUpgrades,
  OrderMissionInfo,
} from './constants';
import { createCourierCharacter, syncPackageStack, CourierRig } from './models';
import { createCinematicCrashState, updateCinematicCrash, resetCourierRigPose, CrashType } from './cinematicCrash';
import { WorldManager } from './worldManager';
import { AudioManager } from './audioManager';
import { sounds } from '../audio/soundManager';
import { getBiomeForDistance } from './environment/biomeConfig';
import { InputController, RunnerState } from './controls/inputController';
import { ParticlePool } from './particles/particlePool';
import { BossCombatEngine } from './boss/bossCombatEngine';
import { CollisionEngine, CollisionRunnerState } from './collision/collisionEngine';

interface GameCanvasProps {
  isPlaying: boolean;
  isPaused: boolean;
  selectedSkin: CourierSkin;
  permanentUpgrades?: PermanentUpgrades;
  onScoreUpdate: (score: number, distance: number, packages: number, coins: number, tips: number) => void;
  onDeliverSuccess: (toko: TokoTarget, deliveredCount: number, bonusTip: number) => void;
  onPickupPowerup: (type: PowerupType) => void;
  onGameOver?: (finalStats: { score: number; distance: number; packages: number; coins: number; tips: number }) => void;
  onCrashAutoRestart?: (finalStats: { score: number; distance: number; packages: number; coins: number; tips: number }) => void;
  onCrashStart?: (type: CrashType, title: string, subtitle: string) => void;
  onActiveTokoChange: (toko: TokoTarget, quota: number) => void;
  onMissionOrderUpdate?: (order: OrderMissionInfo) => void;
  onPhaseAnnouncement?: (title: string, subtitle: string, icon: string) => void;
  onWeatherChange?: (weather: { name: string; icon: string; desc: string }) => void;
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
    blasterAmmo: number
  ) => void;
  onBossDefeated?: () => void;
  restartKey?: number;
  swipeSignal?: { direction: 'left' | 'right' | 'up' | 'down' | 'shoot'; timestamp: number } | null;
  powerupLevels?: Record<PowerupType, number>;
}

export const GameCanvas: React.FC<GameCanvasProps> = (props) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const resetGameRef = useRef<() => void>(() => {});

  // Internal mutable state shared with sub-engines
  const stateRef = useRef<RunnerState & CollisionRunnerState & {
    speed: number;
    runPhase: number;
    currentBiomeId: string;
    lastScoreUpdateTimestamp: number;
  }>({
    currentLane: 1 as LaneIndex,
    targetLaneX: 0,
    currentX: 0,
    currentY: 0,
    velY: 0,
    isJumping: false,
    isSliding: false,
    slideTimer: 0,
    distance: 0,
    speed: INITIAL_SPEED,
    score: 0,
    packagesCarried: 0,
    totalPackagesDelivered: 0,
    coins: 0,
    tipsEarned: 0,
    runPhase: 0,
    powerups: { magnet: 0, shield: 0, speed: 0, double_score: 0 },
    hndGuardActivation: null,
    hndExpressActivation: null,
    shakeIntensity: 0,
    isDead: false,
    comboStreak: 0,
    blasterAmmo: 0,
    unboxedComponents: [],
    currentBiomeId: '',
    lastScoreUpdateTimestamp: 0,
    cinematicCrash: createCinematicCrashState(),
  });

  const inputControllerRef = useRef<InputController | null>(null);
  const bossEngineRef = useRef<BossCombatEngine | null>(null);

  // Restart trigger
  useEffect(() => {
    if (props.restartKey !== undefined && props.restartKey > 0) {
      resetGameRef.current();
    }
  }, [props.restartKey]);

  // Touch swipe signal listener
  useEffect(() => {
    if (props.swipeSignal && inputControllerRef.current) {
      inputControllerRef.current.processSwipeSignal(props.swipeSignal);
    }
  }, [props.swipeSignal]);

  // Main Three.js Scene Setup & Loop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene, Camera, and Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x7dd3fc);
    scene.fog = new THREE.FogExp2(0xbae6fd, 0.008);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 250);
    camera.position.set(0, 4.5, 7.5);
    camera.lookAt(0, 1.8, -12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.0);
    sunLight.position.set(15, 30, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    // 3. Sub-Engines Initialization
    const particlePool = new ParticlePool(scene);

    const bossEngine = new BossCombatEngine(scene, particlePool, {
      onBossBattleUpdate: (boss, ammo) => propsRef.current.onBossBattleUpdate?.(boss, ammo),
      onBossDefeated: () => propsRef.current.onBossDefeated?.(),
      onPlayerHitByBoss: () => {
        const s = stateRef.current;
        if (s.isDead) return;
        s.isDead = true;
        s.comboStreak = 0;
        propsRef.current.onCrashStart?.('boss_blast', 'Terkena Tembakan Bos!', 'Gelombang ledakan rudal menghempas kurir');
        sounds.playCrash();
      },
    });
    bossEngineRef.current = bossEngine;

    const collisionEngine = new CollisionEngine(
      {
        onPickupPowerup: (type) => propsRef.current.onPickupPowerup(type),
        onDeliverSuccess: (toko, count, tip) => propsRef.current.onDeliverSuccess(toko, count, tip),
        onCrashStart: (type, title, subtitle) => propsRef.current.onCrashStart?.(type, title, subtitle),
        getPermanentUpgrades: () => propsRef.current.permanentUpgrades,
        getPowerupLevels: () => propsRef.current.powerupLevels,
      },
      particlePool
    );

    const s = stateRef.current;
    const inputController = new InputController(s, {
      isPlaying: () => propsRef.current.isPlaying,
      isPaused: () => propsRef.current.isPaused,
      onShoot: () => bossEngine.shootBlaster(s.currentX, s.currentY, -s.distance),
    });
    inputController.attach(container);
    inputControllerRef.current = inputController;

    // 4. World & Courier Rig Setup
    const world = new WorldManager(scene);
    const courierRig = createCourierCharacter(propsRef.current.selectedSkin);
    scene.add(courierRig.root);

    // 5. Reset Game Callback
    const resetGameSession = () => {
      s.currentLane = 1;
      s.targetLaneX = 0;
      s.currentX = 0;
      s.currentY = 0;
      s.velY = 0;
      s.isJumping = false;
      s.isSliding = false;
      s.slideTimer = 0;
      s.distance = 0;
      s.speed = INITIAL_SPEED;
      s.score = 0;
      s.packagesCarried = 0;
      s.totalPackagesDelivered = 0;
      s.coins = 0;
      s.tipsEarned = 0;
      s.runPhase = 0;
      s.powerups = { magnet: 0, shield: 0, speed: 0, double_score: 0 };
      s.hndGuardActivation = null;
      s.hndExpressActivation = null;
      s.shakeIntensity = 0;
      s.isDead = false;
      s.comboStreak = 0;
      s.cinematicCrash = createCinematicCrashState();

      resetCourierRigPose(courierRig);
      courierRig.root.position.set(0, 0, 0);
      courierRig.root.rotation.set(0, 0, 0);
      camera.position.set(0, 4.5, 7.5);
      camera.rotation.set(0, 0, 0);
      camera.lookAt(0, 1.8, -12);
      syncPackageStack(courierRig.packageStackGroup, 0);

      particlePool.reset();
      bossEngine.reset();
      world.reset();

      const initToko = world.getCurrentTokoTarget();
      propsRef.current.onActiveTokoChange(initToko, initToko.packagesRequired);
      propsRef.current.onScoreUpdate(0, 0, 0, 0, 0);

      if (propsRef.current.isPlaying && !propsRef.current.isPaused) {
        sounds.startBGM();
      }
    };
    resetGameRef.current = resetGameSession;

    // Initial Toko notification
    const initialToko = world.getCurrentTokoTarget();
    propsRef.current.onActiveTokoChange(initialToko, initialToko.packagesRequired);

    // Window Resize Handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      const aspect = w / h;
      camera.aspect = aspect;
      camera.fov = aspect < 1.0 ? Math.min(84, Math.max(68, 62 + (1.0 - aspect) * 26)) : 60;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // 6. Animation Tick Loop
    const clock = new THREE.Clock();
    let animId: number;

    const tick = () => {
      animId = requestAnimationFrame(tick);
      const delta = Math.min(0.05, clock.getDelta());
      const time = clock.getElapsedTime();

      if (!propsRef.current.isPlaying || propsRef.current.isPaused) {
        renderer.render(scene, camera);
        return;
      }

      // If dead, update cinematic crash animation
      if (s.isDead) {
        const isDone = updateCinematicCrash(
          s.cinematicCrash,
          delta,
          courierRig,
          camera,
          -s.distance,
          s.currentX,
          s.currentY
        );
        renderer.render(scene, camera);

        if (isDone) {
          propsRef.current.onGameOver?.({
            score: s.score,
            distance: Math.round(s.distance),
            packages: s.totalPackagesDelivered + s.packagesCarried,
            coins: s.coins,
            tips: s.tipsEarned,
          });
        }
        return;
      }

      // 1. Power-up Timers decay
      if (s.powerups.magnet > 0) s.powerups.magnet = Math.max(0, s.powerups.magnet - delta);
      if (s.powerups.shield > 0) s.powerups.shield = Math.max(0, s.powerups.shield - delta);
      if (s.powerups.speed > 0) s.powerups.speed = Math.max(0, s.powerups.speed - delta);
      if (s.powerups.double_score > 0) s.powerups.double_score = Math.max(0, s.powerups.double_score - delta);

      // 2. Physics & Movement Update
      inputController.updatePhysics(delta, GRAVITY);

      // 3. Forward Speed & Distance Progression
      const effectiveSpeed = Math.min(MAX_SPEED, s.speed + (s.powerups.speed > 0 ? 12 : 0));
      s.distance += effectiveSpeed * delta;
      s.runPhase += delta * (effectiveSpeed * 0.45);
      const courierZ = -s.distance;

      // Score accumulation based on distance & multiplier
      const skinMultiplier = propsRef.current.selectedSkin.multiplier || 1;
      const doubleScoreMultiplier = s.powerups.double_score > 0 ? 2 : 1;
      s.score += Math.round(effectiveSpeed * delta * 10 * skinMultiplier * doubleScoreMultiplier);

      // 4. District Biome Check
      const currentBiome = getBiomeForDistance(s.distance);
      if (s.currentBiomeId !== currentBiome.id) {
        s.currentBiomeId = currentBiome.id;
        if (propsRef.current.onPhaseAnnouncement && s.distance > 40) {
          propsRef.current.onPhaseAnnouncement(currentBiome.name, currentBiome.desc, currentBiome.icon);
        }
      }

      // 5. Courier 3D Model Pose Update
      courierRig.root.position.set(s.currentX, s.currentY, courierZ);
      courierRig.updateAnimation(
        s.runPhase,
        s.isJumping,
        s.isSliding,
        s.packagesCarried,
        s.powerups.shield > 0,
        s.hndGuardActivation?.progress,
        time,
        s.hndExpressActivation?.progress,
        s.powerups.speed > 0
      );

      // 6. Camera Follow with gentle smoothing and screen shake
      let targetCamX = s.currentX * 0.65;
      let targetCamY = 4.2 + (s.currentY > 0 ? s.currentY * 0.5 : 0);
      let targetCamZ = courierZ + 7.5;

      if (s.shakeIntensity > 0) {
        targetCamX += (Math.random() - 0.5) * s.shakeIntensity;
        targetCamY += (Math.random() - 0.5) * s.shakeIntensity;
        s.shakeIntensity = Math.max(0, s.shakeIntensity - delta * 0.3);
      }

      camera.position.x += (targetCamX - camera.position.x) * Math.min(1.0, 10 * delta);
      camera.position.y += (targetCamY - camera.position.y) * Math.min(1.0, 10 * delta);
      camera.position.z = targetCamZ;
      camera.lookAt(s.currentX * 0.3, 1.8 + s.currentY * 0.3, courierZ - 12);

      // 7. World Generation Tick
      world.update(courierZ, delta, s.powerups.magnet > 0, courierRig.root.position);

      // 8. Boss Battle Spawn at 220m
      if (s.distance >= 220 && !bossEngine.bossBattle) {
        bossEngine.spawnBoss(courierZ, 15);
      }
      bossEngine.update(
        delta,
        time,
        courierZ,
        s.currentX,
        s.currentY,
        effectiveSpeed,
        s.powerups.shield > 0,
        s.powerups.speed > 0
      );

      // 9. Particle Spawning & Update
      particlePool.updateDustSpawn(
        delta,
        s.currentX,
        s.currentY,
        courierZ,
        s.runPhase,
        s.isJumping,
        s.isSliding,
        s.powerups.speed > 0
      );
      particlePool.update(delta);

      // 10. Collision Evaluation
      collisionEngine.evaluateInteractions(
        world.items,
        s,
        courierRig,
        courierZ,
        effectiveSpeed,
        scene,
        world.getCurrentTokoTarget(),
        world.currentOrder
      );

      // 11. HUD Throttled Update (100ms interval)
      const now = performance.now();
      if (now - s.lastScoreUpdateTimestamp > 100) {
        s.lastScoreUpdateTimestamp = now;
        propsRef.current.onScoreUpdate(
          s.score,
          Math.round(s.distance),
          s.packagesCarried,
          s.coins,
          s.tipsEarned
        );
      }

      renderer.render(scene, camera);
    };

    tick();

    // 7. Cleanup on unmount
    return () => {
      cancelAnimationFrame(animId);
      inputController.detach();
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full overflow-hidden select-none" />;
};
