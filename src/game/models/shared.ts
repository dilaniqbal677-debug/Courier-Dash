/**
 * Shared Materials and Math Vectors
 * Pre-allocated to guarantee zero GC during gameplay loops and safe GPU disposal
 */

import * as THREE from 'three';

export const cardboardMat = new THREE.MeshStandardMaterial({
  color: 0xba8c5b,
  roughness: 0.85,
  metalness: 0.05,
});

export const tapeMat = new THREE.MeshStandardMaterial({
  color: 0x7c5a36,
  roughness: 0.6,
  metalness: 0.1,
});

export const goldMat = new THREE.MeshStandardMaterial({
  color: 0xf59e0b,
  roughness: 0.25,
  metalness: 0.85,
});

export const roadMat = new THREE.MeshStandardMaterial({
  color: 0x1f242d,
  roughness: 0.9,
  metalness: 0.1,
});

export const sidewalkMat = new THREE.MeshStandardMaterial({
  color: 0x64748b,
  roughness: 0.7,
  metalness: 0.1,
});

export const curbMat = new THREE.MeshStandardMaterial({
  color: 0x94a3b8,
  roughness: 0.5,
  metalness: 0.2,
});

// Protect all shared materials from disposal
[cardboardMat, tapeMat, goldMat, roadMat, sidewalkMat, curbMat].forEach((m) => {
  (m as any).isGlobalSharedMaterial = true;
});

// Reusable math vectors for procedural animation loops (zero GC allocations)
export const _curPt = new THREE.Vector3();
export const _nextPt = new THREE.Vector3();
export const _midPt = new THREE.Vector3();
export const _dirPt = new THREE.Vector3();
export const _upVec = new THREE.Vector3(0, 1, 0);
