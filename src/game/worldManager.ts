/**
 * World Manager: Infinite road chunks, warehouse packing zones, electronic pickups, and Toko stations
 */

import * as THREE from 'three';
import {
  LANES,
  LaneIndex,
  TokoTarget,
  TOKO_LIST,
  POWERUPS,
  PowerupType,
  ElectronicType,
  DeliveryPhase,
  OrderMissionInfo,
  ELECTRONIC_COMPONENTS,
} from './constants';
import {
  createTrackChunk,
  createPackagePickup,
  createCoinPickup,
  createPowerupPickup,
  createLowBarrier,
  createHighBarrier,
  createVehicleObstacle,
  createTokoStation,
  createBlasterPickup,
  VehicleType,
  createWarehouseEntrancePortal,
  createWarehouseExitPortal,
  createWarehouseConveyorProp,
  createElectronicPickup,
} from './models';
import { sounds } from '../audio/soundManager';
import { safeDisposeObject } from './utils/dispose';

export interface ActiveItem {
  id: number;
  mesh: THREE.Group;
  lane: LaneIndex;
  z: number;
  type:
    | 'package'
    | 'gold_package'
    | 'coin'
    | 'powerup'
    | 'blaster_pickup'
    | 'obstacle_low'
    | 'obstacle_high'
    | 'obstacle_vehicle'
    | 'electronic';
  powerupType?: PowerupType;
  electronicType?: ElectronicType;
  collected?: boolean;
  speed?: number; // For moving obstacle vehicles
}

export interface ActiveToko {
  z: number;
  mesh: THREE.Group;
  target: TokoTarget;
  delivered: boolean;
}

export interface ActiveWarehouseZone {
  id: number;
  entranceZ: number;
  exitZ: number;
  entranceMesh: THREE.Group;
  exitMesh: THREE.Group;
  conveyorMeshes: THREE.Group[];
  hasTriggeredEntrance: boolean;
  hasTriggeredExit: boolean;
}

export interface FlyingPackageEffect {
  mesh: THREE.Group;
  startPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  progress: number; // 0 to 1
  speed: number;
}

export class WorldManager {
  public scene: THREE.Scene;
  private nextItemId = 1;

  // Track Chunks
  private chunkLength = 60;
  private chunks: { mesh: THREE.Group; z: number }[] = [];
  private lastChunkZ = 0;

  // Active items & structures
  public items: ActiveItem[] = [];
  public activeToko: ActiveToko | null = null;
  public activeWarehouse: ActiveWarehouseZone | null = null;
  public flyingPackages: FlyingPackageEffect[] = [];

  // Spawner & Mission tracking
  private lastSpawnZ = -25;
  public orderIndex = 0;
  public currentOrder: OrderMissionInfo | null = null;

  // Notification callbacks
  public onPhaseChange?: (phase: DeliveryPhase, message: string) => void;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.initTrack();
  }

  // Pre-seed track chunks ahead and schedule initial logistics warehouse & toko cycle
  public initTrack() {
    this.lastChunkZ = 30;
    for (let i = 0; i < 4; i++) {
      const z = this.lastChunkZ - i * this.chunkLength;
      const mesh = createTrackChunk(this.chunkLength, z);
      mesh.position.z = z;
      this.scene.add(mesh);
      this.chunks.push({ mesh, z });
    }
    this.lastChunkZ = this.chunks[this.chunks.length - 1].z;

    // Start 1st Mission Cycle further down the road (Warehouse appears after running ~180m)
    this.scheduleMissionCycle(-180);
  }

  public getCurrentTokoTarget(): TokoTarget {
    return TOKO_LIST[this.orderIndex % TOKO_LIST.length];
  }

  /**
   * Schedules a complete two-phase delivery cycle:
   * 1. Area Packing Logistik HND (starts ~45m ahead, length ~70m)
   * 2. Roadway to Toko HND Komputer (drop zone at ~175m)
   */
  public scheduleMissionCycle(courierZ: number) {
    const targetToko = this.getCurrentTokoTarget();
    const quota = targetToko.packagesRequired;

    // Assemble specific manifest requested by Toko HND or default
    const requested = targetToko.requestedManifest || {
      gpu: 1,
      laptop: 1,
      motherboard: 1,
      monitor: 1,
    };

    const manifest: Record<ElectronicType, any> = {
      gpu: { ...ELECTRONIC_COMPONENTS['gpu'], type: 'gpu' as ElectronicType, required: requested.gpu || 0, collected: 0 },
      laptop: { ...ELECTRONIC_COMPONENTS['laptop'], type: 'laptop' as ElectronicType, required: requested.laptop || 0, collected: 0 },
      motherboard: { ...ELECTRONIC_COMPONENTS['motherboard'], type: 'motherboard' as ElectronicType, required: requested.motherboard || 0, collected: 0 },
      monitor: { ...ELECTRONIC_COMPONENTS['monitor'], type: 'monitor' as ElectronicType, required: requested.monitor || 0, collected: 0 },
    };

    const requiredComponents: ElectronicType[] = [];
    (Object.keys(manifest) as ElectronicType[]).forEach((type) => {
      const entry = manifest[type];
      for (let i = 0; i < entry.required; i++) {
        requiredComponents.push(type);
      }
    });

    const entranceZ = courierZ - 45;
    const exitZ = courierZ - 135;
    const tokoZ = courierZ - 520; // Substantially longer distance as requested (520m transit boulevard!)

    // 1. Warehouse Entrance Portal
    const entranceMesh = createWarehouseEntrancePortal();
    entranceMesh.position.z = entranceZ;
    this.scene.add(entranceMesh);

    // 2. Warehouse Exit Portal
    const exitMesh = createWarehouseExitPortal();
    exitMesh.position.z = exitZ;
    this.scene.add(exitMesh);

    // 3. Side Conveyor props along the packing hub
    const conveyorMeshes: THREE.Group[] = [];
    const convLeft = createWarehouseConveyorProp(45, 'left');
    convLeft.position.z = (entranceZ + exitZ) / 2;
    this.scene.add(convLeft);
    conveyorMeshes.push(convLeft);

    const convRight = createWarehouseConveyorProp(45, 'right');
    convRight.position.z = (entranceZ + exitZ) / 2;
    this.scene.add(convRight);
    conveyorMeshes.push(convRight);

    this.activeWarehouse = {
      id: this.orderIndex + 1,
      entranceZ,
      exitZ,
      entranceMesh,
      exitMesh,
      conveyorMeshes,
      hasTriggeredEntrance: false,
      hasTriggeredExit: false,
    };

    // 4. Toko Station at end of road
    const tokoMesh = createTokoStation(targetToko);
    tokoMesh.position.z = tokoZ;
    this.scene.add(tokoMesh);

    this.activeToko = {
      z: tokoZ,
      mesh: tokoMesh,
      target: targetToko,
      delivered: false,
    };

    // 5. Initialize current order mission state
    this.currentOrder = {
      orderId: this.orderIndex + 1,
      phase: 'packing',
      targetToko,
      requiredComponents,
      manifest,
      isManifestComplete: false,
      packedComponents: [],
      totalRequired: requiredComponents.length,
      totalPacked: 0,
      distToToko: Math.abs(tokoZ - courierZ),
      totalTransitDistance: Math.abs(tokoZ - exitZ),
      packingZoneStartDistance: Math.abs(entranceZ),
      packingZoneEndDistance: Math.abs(exitZ),
    };
  }

  public update(
    courierZ: number,
    delta: number,
    magnetActive: boolean,
    courierPos: THREE.Vector3,
    magnetRadius: number = 25
  ) {
    // 1. Maintain Infinite Track Chunks ahead of courier (lightweight 140m buffer)
    while (this.lastChunkZ > courierZ - 140) {
      const nextZ = this.lastChunkZ - this.chunkLength;
      const mesh = createTrackChunk(this.chunkLength, nextZ);
      mesh.position.z = nextZ;
      this.scene.add(mesh);
      this.chunks.push({ mesh, z: nextZ });
      this.lastChunkZ = nextZ;
    }

    // Cleanup chunks behind player promptly
    for (let i = this.chunks.length - 1; i >= 0; i--) {
      const chunk = this.chunks[i];
      if (chunk.z > courierZ + 120) {
        safeDisposeObject(chunk.mesh);
        this.scene.remove(chunk.mesh);
        this.chunks.splice(i, 1);
      }
    }

    // 2. Mission Phase Updates & Portal Trigger Detections
    if (this.currentOrder && this.activeToko) {
      this.currentOrder.distToToko = Math.max(0, Math.round(Math.abs(courierZ - this.activeToko.z)));
    }

    if (this.activeWarehouse) {
      // Crossing Entrance into Logistics Hub
      if (courierZ <= this.activeWarehouse.entranceZ && !this.activeWarehouse.hasTriggeredEntrance) {
        this.activeWarehouse.hasTriggeredEntrance = true;
        sounds.playWarehouseKlaxon();
        if (this.currentOrder) {
          this.currentOrder.phase = 'packing';
        }
        if (this.onPhaseChange) {
          this.onPhaseChange('packing', 'MEMASUKI AREA PACKING & LOGISTIK HND KOMPUTER!');
        }
      }

      // Crossing Exit Portal onto City Roadway towards Toko
      if (courierZ <= this.activeWarehouse.exitZ && !this.activeWarehouse.hasTriggeredExit) {
        this.activeWarehouse.hasTriggeredExit = true;
        sounds.playOrderCompletePacking();
        if (this.currentOrder) {
          this.currentOrder.phase = 'transit_to_store';
        }
        if (this.onPhaseChange) {
          this.onPhaseChange('transit_to_store', 'LOGISTIK SELESAI! MENUJU TOKO HND KOMPUTER!');
        }
      }

      // Cleanup warehouse structures once behind courier
      if (this.activeWarehouse.exitZ > courierZ + 120) {
        safeDisposeObject(this.activeWarehouse.entranceMesh);
        this.scene.remove(this.activeWarehouse.entranceMesh);
        safeDisposeObject(this.activeWarehouse.exitMesh);
        this.scene.remove(this.activeWarehouse.exitMesh);
        this.activeWarehouse.conveyorMeshes.forEach((c) => {
          safeDisposeObject(c);
          this.scene.remove(c);
        });
        this.activeWarehouse = null;
      }
    }

    // 3. Spawn Items & Obstacles periodically
    const distanceTraveled = Math.abs(courierZ);
    const spawnInterval = Math.max(12, 28 - distanceTraveled * 0.01);
    const spawnHorizon = courierZ - 180;
    while (this.lastSpawnZ > spawnHorizon) {
      this.lastSpawnZ -= spawnInterval + Math.random() * 6;
      this.spawnRow(this.lastSpawnZ, distanceTraveled);
    }

    // 4. Update active items (animations, magnet pull, cleanup)
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];

      // Remove items far behind courier
      if (item.z > courierZ + 120) {
        safeDisposeObject(item.mesh);
        this.scene.remove(item.mesh);
        this.items.splice(i, 1);
        continue;
      }

      // Rotate pickups for visual flair
      if (item.type === 'package' || item.type === 'gold_package') {
        item.mesh.rotation.y += delta * 2.2;
        item.mesh.position.y = 0.5 + Math.sin(Date.now() * 0.004 + item.id) * 0.12;
      } else if (item.type === 'electronic') {
        item.mesh.rotation.y += delta * 2.6;
        item.mesh.position.y = 0.75 + Math.sin(Date.now() * 0.005 + item.id) * 0.14;
      } else if (item.type === 'coin') {
        item.mesh.rotation.y += delta * 4;
        item.mesh.position.y = 0.6 + Math.sin(Date.now() * 0.005 + item.id) * 0.1;
      } else if (item.type === 'powerup') {
        item.mesh.rotation.y += delta * 3;
        item.mesh.position.y = 1.0 + Math.sin(Date.now() * 0.005 + item.id) * 0.18;
      } else if (item.type === 'blaster_pickup') {
        item.mesh.rotation.y += delta * 3.5;
        item.mesh.position.y = 0.8 + Math.sin(Date.now() * 0.005 + item.id) * 0.15;
      } else if (item.type === 'obstacle_vehicle' && item.speed) {
        item.z += item.speed * delta;
        item.mesh.position.z = item.z;
      }

      // Magnet effect: attract packages, electronics, and coins towards courier
      if (
        magnetActive &&
        (item.type === 'package' ||
          item.type === 'gold_package' ||
          item.type === 'coin' ||
          item.type === 'electronic')
      ) {
        const distZ = Math.abs(item.z - courierPos.z);
        if (distZ < magnetRadius && item.z < courierPos.z) {
          item.mesh.position.x = THREE.MathUtils.lerp(item.mesh.position.x, courierPos.x, delta * 12);
          item.mesh.position.y = THREE.MathUtils.lerp(item.mesh.position.y, courierPos.y + 1, delta * 12);
          item.mesh.position.z = THREE.MathUtils.lerp(item.mesh.position.z, courierPos.z, delta * 8);
          item.z = item.mesh.position.z;
        }
      }
    }

    // 5. Update Flying Package Delivery Effects
    for (let f = this.flyingPackages.length - 1; f >= 0; f--) {
      const fly = this.flyingPackages[f];
      fly.progress += delta * fly.speed;
      if (fly.progress >= 1) {
        this.scene.remove(fly.mesh);
        this.flyingPackages.splice(f, 1);
        continue;
      }

      const p0 = fly.startPos;
      const p2 = fly.targetPos;
      const p1 = new THREE.Vector3(
        (p0.x + p2.x) / 2,
        Math.max(p0.y, p2.y) + 3.5,
        (p0.z + p2.z) / 2
      );

      const t = fly.progress;
      const invT = 1 - t;
      fly.mesh.position.x = invT * invT * p0.x + 2 * invT * t * p1.x + t * t * p2.x;
      fly.mesh.position.y = invT * invT * p0.y + 2 * invT * t * p1.y + t * t * p2.y;
      fly.mesh.position.z = invT * invT * p0.z + 2 * invT * t * p1.z + t * t * p2.z;

      fly.mesh.rotation.x += delta * 10;
      fly.mesh.rotation.y += delta * 12;
      fly.mesh.scale.setScalar(THREE.MathUtils.lerp(1, 0.4, t));
    }

    // 6. Toko cleanup & Next Mission Cycle Scheduler
    if (this.activeToko) {
      if (this.activeToko.z > courierZ + 120) {
        safeDisposeObject(this.activeToko.mesh);
        this.scene.remove(this.activeToko.mesh);
        this.activeToko = null;
        this.orderIndex++;
        // Start next mission cycle (Warehouse Hub -> Toko)
        this.scheduleMissionCycle(courierZ);
      }
    }
  }

  /**
   * Spawns rows tailored to current zone:
   * - Inside Packing Hub: Unboxed electronic components to collect and pack!
   * - City Transit Road: Powerups, coins, and obstacles on route to Toko HND
   */
  private spawnRow(z: number, distanceTraveled: number = 0) {
    // Avoid spawning obstacles directly overlapping portals or Toko
    if (this.activeToko && Math.abs(z - this.activeToko.z) < 18) {
      return;
    }
    if (this.activeWarehouse && (Math.abs(z - this.activeWarehouse.entranceZ) < 8 || Math.abs(z - this.activeWarehouse.exitZ) < 8)) {
      return;
    }

    const isRoadBeforeWarehouse = this.activeWarehouse && z > this.activeWarehouse.entranceZ;
    const isInWarehouse =
      this.activeWarehouse &&
      z <= this.activeWarehouse.entranceZ - 4 &&
      z >= this.activeWarehouse.exitZ + 4;

    const lanes: LaneIndex[] = [0, 1, 2];
    lanes.sort(() => Math.random() - 0.5);

    if (isRoadBeforeWarehouse || isInWarehouse) {
      // ----------------------------------------------------------------------
      // ROADWAY COMPONENT COLLECTION & WAREHOUSE PACKING ZONE
      // ----------------------------------------------------------------------
      let chosenType: ElectronicType = 'gpu';
      if (this.currentOrder && this.currentOrder.requiredComponents.length > 0) {
        const reqs = this.currentOrder.requiredComponents;
        chosenType = reqs[Math.floor(Math.random() * reqs.length)];
      } else {
        const electronicTypes: ElectronicType[] = ['gpu', 'laptop', 'motherboard', 'monitor'];
        chosenType = electronicTypes[Math.floor(Math.random() * electronicTypes.length)];
      }

      const itemLane = lanes[0];
      const obsLane = lanes[1];
      const coinLane = lanes[2];

      // Spawn the unboxed electronic hardware pickup on road & warehouse!
      this.spawnItem('electronic', itemLane, z, chosenType);

      // Low hazard roadblock or barrier
      if (Math.random() < 0.55) {
        this.spawnItem('obstacle_low', obsLane, z);
      }

      // Coins or powerup on third lane
      if (Math.random() < 0.25) {
        this.spawnPowerup(coinLane, z);
      } else {
        this.spawnItem('coin', coinLane, z);
      }
      return;
    }

    // ------------------------------------------------------------------------
    // CITY TRANSIT ROAD TO TOKO HND SPAWN LOGIC
    // ------------------------------------------------------------------------
    const roll = Math.random();
    const difficultyFactor = Math.min(0.75, distanceTraveled / 1200);

    if (roll < 0.55 - difficultyFactor * 0.1) {
      const numObstacles = distanceTraveled > 180 && Math.random() < 0.25 + difficultyFactor * 0.3 ? 2 : 1;
      const obsLanes = lanes.slice(0, numObstacles);
      const freeLanes = lanes.slice(numObstacles);

      obsLanes.forEach((lane) => {
        const obsTypeRoll = Math.random();
        if (obsTypeRoll < 0.35) {
          this.spawnItem('obstacle_low', lane, z);
        } else if (obsTypeRoll < 0.7) {
          this.spawnItem('obstacle_high', lane, z);
        } else {
          this.spawnItem('obstacle_vehicle', lane, z);
        }
      });

      const safeLane = freeLanes[0];
      if (Math.random() < 0.55) {
        const isGold = Math.random() < 0.15 + difficultyFactor * 0.15;
        this.spawnItem(isGold ? 'gold_package' : 'package', safeLane, z);
      } else if (Math.random() < 0.2) {
        this.spawnItem('blaster_pickup', safeLane, z);
      } else {
        this.spawnItem('coin', safeLane, z);
      }

      if (freeLanes.length > 1) {
        if (Math.random() < 0.2) {
          this.spawnPowerup(freeLanes[1], z);
        } else {
          this.spawnItem('coin', freeLanes[1], z);
        }
      }
    } else if (roll < 0.78) {
      const pkgLane = Math.floor(Math.random() * 3) as LaneIndex;
      this.spawnItem('package', pkgLane, z);
      this.spawnItem('package', pkgLane, z - 4);
      this.spawnItem('coin', ((pkgLane + 1) % 3) as LaneIndex, z);
    } else {
      const lane = Math.floor(Math.random() * 3) as LaneIndex;
      const isHigh = Math.random() > 0.5;
      this.spawnItem(isHigh ? 'obstacle_high' : 'obstacle_low', lane, z);
      const bonus = this.spawnItem(isHigh ? 'package' : 'gold_package', lane, z);
      if (bonus && !isHigh) {
        bonus.mesh.position.y = 1.9;
      }
    }
  }

  private spawnItem(
    type: ActiveItem['type'],
    lane: LaneIndex,
    z: number,
    electronicType?: ElectronicType
  ): ActiveItem | null {
    let mesh: THREE.Group;

    switch (type) {
      case 'electronic':
        mesh = createElectronicPickup(electronicType || 'gpu');
        mesh.position.set(LANES[lane], 0.75, z);
        break;
      case 'package':
        mesh = createPackagePickup(false);
        mesh.position.set(LANES[lane], 0.5, z);
        break;
      case 'gold_package':
        mesh = createPackagePickup(true);
        mesh.position.set(LANES[lane], 0.5, z);
        break;
      case 'coin':
        mesh = createCoinPickup();
        mesh.position.set(LANES[lane], 0.6, z);
        break;
      case 'obstacle_low':
        mesh = createLowBarrier();
        mesh.position.set(LANES[lane], 0, z);
        break;
      case 'obstacle_high':
        mesh = createHighBarrier();
        mesh.position.set(LANES[lane], 0, z);
        break;
      case 'obstacle_vehicle':
        const vehicleTypes: VehicleType[] = ['van', 'angkot', 'taxi', 'bus'];
        mesh = createVehicleObstacle(vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)]);
        mesh.position.set(LANES[lane], 0, z);
        break;
      case 'blaster_pickup':
        mesh = createBlasterPickup();
        mesh.position.set(LANES[lane], 0.8, z);
        break;
      default:
        return null;
    }

    this.scene.add(mesh);
    const item: ActiveItem = {
      id: this.nextItemId++,
      mesh,
      lane,
      z,
      type,
      electronicType,
    };

    if (type === 'obstacle_vehicle') {
      item.speed = 5 + Math.random() * 10;
    }

    this.items.push(item);
    return item;
  }

  private spawnPowerup(lane: LaneIndex, z: number) {
    const types: PowerupType[] = ['magnet', 'shield', 'speed', 'double_score'];
    const type = types[Math.floor(Math.random() * types.length)];
    const mesh = createPowerupPickup(type);
    mesh.position.set(LANES[lane], 0.9, z);
    this.scene.add(mesh);

    this.items.push({
      id: this.nextItemId++,
      mesh,
      lane,
      z,
      type: 'powerup',
      powerupType: type,
    });
  }

  public spawnBlasterPickup(lane: LaneIndex, z: number): ActiveItem {
    const mesh = createBlasterPickup();
    mesh.position.set(LANES[lane], 0.8, z);
    this.scene.add(mesh);

    const item: ActiveItem = {
      id: this.nextItemId++,
      mesh,
      lane,
      z,
      type: 'blaster_pickup',
      collected: false,
    };
    this.items.push(item);
    return item;
  }

  /**
   * Launch visual flying package animation when courier delivers to Toko
   */
  public triggerDeliveryFlings(courierPos: THREE.Vector3, count: number, tokoZ: number) {
    const displayCount = Math.min(count, 8);
    for (let i = 0; i < displayCount; i++) {
      const flyMesh = createPackagePickup(i % 2 === 1);
      flyMesh.position.copy(courierPos);
      this.scene.add(flyMesh);

      const targetPos = new THREE.Vector3(
        6.5 + Math.random() * 2,
        2.2 + Math.random() * 1.5,
        tokoZ - 2 + Math.random() * 4
      );

      this.flyingPackages.push({
        mesh: flyMesh,
        startPos: courierPos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.8, 1.2, 0)),
        targetPos,
        progress: 0,
        speed: 1.8 + i * 0.25,
      });
    }
  }

  public reset() {
    // Clear items
    this.items.forEach((item) => {
      safeDisposeObject(item.mesh);
      this.scene.remove(item.mesh);
    });
    this.items = [];

    // Clear flying packages
    this.flyingPackages.forEach((f) => {
      safeDisposeObject(f.mesh);
      this.scene.remove(f.mesh);
    });
    this.flyingPackages = [];

    // Clear Toko
    if (this.activeToko) {
      safeDisposeObject(this.activeToko.mesh);
      this.scene.remove(this.activeToko.mesh);
      this.activeToko = null;
    }

    // Clear Warehouse
    if (this.activeWarehouse) {
      safeDisposeObject(this.activeWarehouse.entranceMesh);
      this.scene.remove(this.activeWarehouse.entranceMesh);
      safeDisposeObject(this.activeWarehouse.exitMesh);
      this.scene.remove(this.activeWarehouse.exitMesh);
      this.activeWarehouse.conveyorMeshes.forEach((c) => {
        safeDisposeObject(c);
        this.scene.remove(c);
      });
      this.activeWarehouse = null;
    }

    // Reset chunks
    this.chunks.forEach((c) => {
      safeDisposeObject(c.mesh);
      this.scene.remove(c.mesh);
    });
    this.chunks = [];

    this.orderIndex = 0;
    this.lastSpawnZ = -25;
    this.initTrack();
  }
}
