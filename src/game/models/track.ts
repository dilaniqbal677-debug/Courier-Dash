/**
 * Procedural Track Chunk Bridge & Street Props
 */
import * as THREE from 'three';
import { createDynamicTrackChunk } from '../environment/proceduralCity';
import { getBiomeForDistance } from '../environment/biomeConfig';
import { roadMat, sidewalkMat, curbMat } from './shared';

/**
 * 9. City Track Section (Road chunk with asphalt, sidewalks, dashed lane marks, trees, streetlights)
 */
// Pooled & Shared Geometries/Materials for Track Chunks (Zero Allocation per chunk!)
const sharedRoadGeom = new THREE.PlaneGeometry(8.6, 60);
const sharedDashGeom = new THREE.PlaneGeometry(0.18, 2.2);
const sharedDashMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
(sharedDashMat as any).isGlobalSharedMaterial = true;

const sharedSwGeom = new THREE.BoxGeometry(4.5, 0.3, 60);
const sharedCurbGeom = new THREE.BoxGeometry(0.3, 0.32, 60);

const sharedBenchSeatGeom = new THREE.BoxGeometry(1.2, 0.1, 0.4);
const sharedBenchLegGeom = new THREE.BoxGeometry(0.1, 0.4, 0.1);
const sharedBenchMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
(sharedBenchMat as any).isGlobalSharedMaterial = true;

const sharedTrunkGeom = new THREE.CylinderGeometry(0.2, 0.28, 2.2, 8);
const sharedTrunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
(sharedTrunkMat as any).isGlobalSharedMaterial = true;

const sharedLeavesGeom1 = new THREE.ConeGeometry(1.3, 2.6, 7);
const sharedLeavesMat1 = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
(sharedLeavesMat1 as any).isGlobalSharedMaterial = true;

const sharedLeavesGeom2 = new THREE.ConeGeometry(0.9, 1.8, 7);
const sharedLeavesMat2 = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.8 });
(sharedLeavesMat2 as any).isGlobalSharedMaterial = true;

const sharedLampPoleGeom = new THREE.CylinderGeometry(0.08, 0.1, 4.8, 8);
const sharedLampPoleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
(sharedLampPoleMat as any).isGlobalSharedMaterial = true;
const sharedLampArmGeom = new THREE.BoxGeometry(1.2, 0.08, 0.08);
const sharedLampHeadGeom = new THREE.BoxGeometry(0.35, 0.1, 0.2);
const sharedLampHeadMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
(sharedLampHeadMat as any).isGlobalSharedMaterial = true;

[
  sharedRoadGeom,
  sharedDashGeom,
  sharedSwGeom,
  sharedCurbGeom,
  sharedBenchSeatGeom,
  sharedBenchLegGeom,
  sharedTrunkGeom,
  sharedLeavesGeom1,
  sharedLeavesGeom2,
  sharedLampPoleGeom,
  sharedLampArmGeom,
  sharedLampHeadGeom,
].forEach((g) => {
  (g as any).isGlobalSharedGeometry = true;
});

/**
 * 9. City Track Section (Road chunk with asphalt, sidewalks, dashed lane marks, trees, streetlights)
 */
function createBench(): THREE.Group {
  const group = new THREE.Group();
  const seat = new THREE.Mesh(sharedBenchSeatGeom, sharedBenchMat);
  seat.position.y = 0.4;
  group.add(seat);
  const leg1 = new THREE.Mesh(sharedBenchLegGeom, sharedBenchMat);
  leg1.position.set(-0.5, 0.2, 0);
  const leg2 = new THREE.Mesh(sharedBenchLegGeom, sharedBenchMat);
  leg2.position.set(0.5, 0.2, 0);
  group.add(leg1, leg2);
  return group;
}

export function createTrackChunk(length: number = 60, targetZ: number = 0): THREE.Group {
  const biome = getBiomeForDistance(Math.abs(targetZ));
  return createDynamicTrackChunk(length, biome.id);
}

/**
 * Procedural City Tree (faceted low-poly canopy)
 */
function createCityTree(): THREE.Group {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(sharedTrunkGeom, sharedTrunkMat);
  trunk.position.y = 1.1;
  trunk.castShadow = true;
  tree.add(trunk);

  const leaves = new THREE.Mesh(sharedLeavesGeom1, sharedLeavesMat1);
  leaves.position.y = 2.8;
  leaves.castShadow = true;
  tree.add(leaves);

  const leavesTop = new THREE.Mesh(sharedLeavesGeom2, sharedLeavesMat2);
  leavesTop.position.y = 3.8;
  leavesTop.castShadow = true;
  tree.add(leavesTop);

  return tree;
}

/**
 * Procedural Street Lamp
 */
function createStreetLamp(): THREE.Group {
  const lamp = new THREE.Group();
  const pole = new THREE.Mesh(sharedLampPoleGeom, sharedLampPoleMat);
  pole.position.y = 2.4;
  lamp.add(pole);

  const arm = new THREE.Mesh(sharedLampArmGeom, sharedLampPoleMat);
  arm.position.set(-0.5, 4.7, 0);
  lamp.add(arm);

  const head = new THREE.Mesh(sharedLampHeadGeom, sharedLampHeadMat);
  head.position.set(-1.0, 4.6, 0);
  lamp.add(head);

  return lamp;
}

/**
 * Background building silhouette
 */
function createBackgroundBuilding(): THREE.Group {
  const height = 12 + Math.random() * 16;
  const width = 6 + Math.random() * 4;
  const depth = 8;
  const geom = new THREE.BoxGeometry(width, height, depth);
  const colors = [0x1e293b, 0x0f172a, 0x334155, 0x1e3a5f];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.8,
  });
  const bldg = new THREE.Group();
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.y = height / 2;
  bldg.add(mesh);

  // Add simple windows
  const windowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.3 });
  for (let i = 0; i < 6; i++) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(width * 0.6, 0.8, depth + 0.1), windowMat);
    win.position.set(0, Math.random() * height * 0.8 + 2, 0);
    bldg.add(win);
  }

  return bldg;
}

// ==========================================
