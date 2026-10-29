/**
 * Procedural Pickup Items: Packages, Coins, Powerups, Blaster Guns, Electronic Parts
 */
import * as THREE from 'three';
import { ElectronicType } from '../constants';
import {
  goldMat,
  cardboardMat,
  tapeMat,
} from './shared';
import {
  goldLabelTex,
  standardLabelTex,
  hndGuardTex,
} from './textures';

// Shared geometries & materials for pickups (zero GC & instant instantiation)
const w = 0.7;
const h = 0.55;
const d = 0.6;
const sharedPackageGeom = new THREE.BoxGeometry(w, h, d);
const sharedTape1Geom = new THREE.BoxGeometry(w * 1.02, h * 1.02, 0.12);
const sharedTape2Geom = new THREE.BoxGeometry(0.12, h * 1.02, d * 1.02);
const sharedLabelGeom = new THREE.PlaneGeometry(0.3, 0.3);
const sharedPackageAuraGeom = new THREE.RingGeometry(0.25, 0.6, 16);

const sharedGoldLabelMat = new THREE.MeshStandardMaterial({
  map: goldLabelTex,
  roughness: 0.4,
});
const sharedStandardLabelMat = new THREE.MeshStandardMaterial({
  map: standardLabelTex,
  roughness: 0.4,
});

const sharedGoldAuraMat = new THREE.MeshBasicMaterial({
  color: 0xf59e0b,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.45,
  depthWrite: false,
});
const sharedStandardAuraMat = new THREE.MeshBasicMaterial({
  color: 0x38bdf8,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.45,
  depthWrite: false,
});

const sharedCoinGeom = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 16);
const sharedCoinRimGeom = new THREE.TorusGeometry(0.32, 0.03, 8, 16);

[
  sharedPackageGeom,
  sharedTape1Geom,
  sharedTape2Geom,
  sharedLabelGeom,
  sharedPackageAuraGeom,
  sharedCoinGeom,
  sharedCoinRimGeom,
].forEach((g) => { (g as any).isGlobalSharedGeometry = true; });

[
  sharedGoldLabelMat,
  sharedStandardLabelMat,
  sharedGoldAuraMat,
  sharedStandardAuraMat,
].forEach((m) => { (m as any).isGlobalSharedMaterial = true; });

export function createPackagePickup(isGold: boolean = false): THREE.Group {
  const group = new THREE.Group();
  group.name = 'pickup_package';

  // Box
  const mesh = new THREE.Mesh(sharedPackageGeom, isGold ? goldMat : cardboardMat);
  mesh.castShadow = true;
  group.add(mesh);

  // Tape
  const tape1 = new THREE.Mesh(sharedTape1Geom, tapeMat);
  mesh.add(tape1);

  const tape2 = new THREE.Mesh(sharedTape2Geom, tapeMat);
  mesh.add(tape2);

  // Label
  const labelMesh = new THREE.Mesh(
    sharedLabelGeom,
    isGold ? sharedGoldLabelMat : sharedStandardLabelMat
  );
  labelMesh.position.set(0, h / 2 + 0.01, 0);
  labelMesh.rotation.x = -Math.PI / 2;
  mesh.add(labelMesh);

  // Glowing pulse aura underneath
  const aura = new THREE.Mesh(
    sharedPackageAuraGeom,
    isGold ? sharedGoldAuraMat : sharedStandardAuraMat
  );
  aura.rotation.x = -Math.PI / 2;
  aura.position.y = -0.3;
  group.add(aura);

  return group;
}

export function createCoinPickup(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'pickup_coin';

  const mesh = new THREE.Mesh(sharedCoinGeom, goldMat);
  mesh.rotation.x = Math.PI / 2;
  mesh.castShadow = true;
  group.add(mesh);

  // Inner ring embossing
  const rim = new THREE.Mesh(sharedCoinRimGeom, goldMat);
  group.add(rim);

  return group;
}

export function createPowerupPickup(type: string): THREE.Group {
  const group = new THREE.Group();
  group.name = `pickup_${type}`;

  if (type === 'shield') {
    const shieldPickupGroup = new THREE.Group();

    const shieldGeom = new THREE.BoxGeometry(0.82, 1.05, 0.12);
    const shieldMat = new THREE.MeshStandardMaterial({
      map: hndGuardTex,
      roughness: 0.22,
      metalness: 0.85,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35,
    });
    const shieldMesh = new THREE.Mesh(shieldGeom, shieldMat);
    shieldMesh.castShadow = true;
    shieldPickupGroup.add(shieldMesh);

    const rimGeom = new THREE.BoxGeometry(0.88, 1.12, 0.10);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const rim = new THREE.Mesh(rimGeom, rimMat);
    shieldPickupGroup.add(rim);

    const wingGeom = new THREE.ConeGeometry(0.18, 0.45, 4);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
    const lWing = new THREE.Mesh(wingGeom, wingMat);
    lWing.rotation.z = Math.PI / 3;
    lWing.position.set(-0.48, 0.15, 0);
    const rWing = new THREE.Mesh(wingGeom, wingMat);
    rWing.rotation.z = -Math.PI / 3;
    rWing.position.set(0.48, 0.15, 0);
    shieldPickupGroup.add(lWing, rWing);

    const ringGeom = new THREE.TorusGeometry(0.78, 0.035, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const ring1 = new THREE.Mesh(ringGeom, ringMat);
    ring1.rotation.x = Math.PI / 3.2;
    const ring2 = new THREE.Mesh(ringGeom, ringMat);
    ring2.rotation.x = -Math.PI / 3.2;
    shieldPickupGroup.add(ring1, ring2);

    const auraGeom = new THREE.RingGeometry(0.35, 0.85, 24);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
    });
    const aura = new THREE.Mesh(auraGeom, auraMat);
    aura.rotation.x = -Math.PI / 2;
    aura.position.y = -0.55;
    shieldPickupGroup.add(aura);

    group.add(shieldPickupGroup);
    return group;
  }

  const bubbleGeom = new THREE.SphereGeometry(0.6, 16, 16);
  const bubbleMat = new THREE.MeshStandardMaterial({
    color: type === 'magnet' ? 0xef4444 : 0xeab308,
    transparent: true,
    opacity: 0.65,
    roughness: 0.2,
    metalness: 0.3,
  });
  const bubble = new THREE.Mesh(bubbleGeom, bubbleMat);
  group.add(bubble);

  if (type === 'magnet') {
    const magnetTorus = new THREE.TorusGeometry(0.24, 0.08, 8, 16, Math.PI);
    const redMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
    const magnetMesh = new THREE.Mesh(magnetTorus, redMat);
    magnetMesh.rotation.z = Math.PI;
    group.add(magnetMesh);

    const tipGeom = new THREE.BoxGeometry(0.12, 0.14, 0.14);
    const tipMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8 });
    const tip1 = new THREE.Mesh(tipGeom, tipMat);
    tip1.position.set(-0.24, 0.1, 0);
    const tip2 = new THREE.Mesh(tipGeom, tipMat);
    tip2.position.set(0.24, 0.1, 0);
    group.add(tip1, tip2);
  } else if (type === 'speed') {
    const boltGeom = new THREE.ConeGeometry(0.22, 0.5, 4);
    const boltMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const bolt1 = new THREE.Mesh(boltGeom, boltMat);
    bolt1.position.set(0, 0.1, 0);
    bolt1.rotation.z = 0.3;
    const bolt2 = new THREE.Mesh(boltGeom, boltMat);
    bolt2.position.set(-0.06, -0.15, 0);
    bolt2.rotation.z = Math.PI + 0.3;
    group.add(bolt1, bolt2);
  }

  return group;
}

export function createBlasterPickup(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'pickup_blaster';
  const gunGroup = new THREE.Group();

  const barrelMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.9,
    roughness: 0.2,
  });
  const barrelGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.65, 12);
  barrelGeom.rotateX(Math.PI / 2);

  const topBarrel = new THREE.Mesh(barrelGeom, barrelMat);
  topBarrel.position.set(0, 0.10, 0.15);
  const bottomBarrel = new THREE.Mesh(barrelGeom, barrelMat);
  bottomBarrel.position.set(0, -0.05, 0.15);
  gunGroup.add(topBarrel, bottomBarrel);

  const muzzleMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const muzzleGeom = new THREE.CylinderGeometry(0.07, 0.07, 0.10, 12);
  muzzleGeom.rotateX(Math.PI / 2);
  const m1 = new THREE.Mesh(muzzleGeom, muzzleMat);
  m1.position.set(0, 0.10, 0.45);
  const m2 = new THREE.Mesh(muzzleGeom, muzzleMat);
  m2.position.set(0, -0.05, 0.45);
  gunGroup.add(m1, m2);

  const bodyMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.32, 0.52),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.25 })
  );
  bodyMesh.position.set(0, 0.03, -0.10);
  gunGroup.add(bodyMesh);

  const batteryMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.28, 12),
    new THREE.MeshBasicMaterial({ color: 0xfacc15 })
  );
  batteryMesh.position.set(0, 0.18, -0.08);
  gunGroup.add(batteryMesh);

  const gripGeom = new THREE.BoxGeometry(0.14, 0.34, 0.16);
  const gripMesh = new THREE.Mesh(
    gripGeom,
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5, metalness: 0.7 })
  );
  gripMesh.position.set(0, -0.22, -0.18);
  gripMesh.rotation.x = 0.28;
  gunGroup.add(gripMesh);

  gunGroup.scale.set(1.4, 1.4, 1.4);
  group.add(gunGroup);

  const holoRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.85, 0.04, 12, 32),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 })
  );
  group.add(holoRing);

  const aura = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.22, side: THREE.DoubleSide })
  );
  group.add(aura);

  return group;
}

export function createElectronicPickup(type: ElectronicType): THREE.Group {
  const group = new THREE.Group();
  group.name = `pickup_electronic_${type}`;

  const matteBlackMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.45,
    metalness: 0.5,
  });

  const shroudGeom = new THREE.BoxGeometry(1.35, 0.68, 0.26);
  const shroud = new THREE.Mesh(shroudGeom, matteBlackMat);
  shroud.castShadow = true;
  group.add(shroud);

  return group;
}
