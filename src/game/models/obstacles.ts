/**
 * Road Obstacles: Low Barriers, High Clearance Hurdles, Moving Vehicles
 */
import * as THREE from 'three';

/**
 * 5. Low Barrier Obstacle (Traffic Barricade / Roadblock - Jump Over)
 */
export function createLowBarrier(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'obstacle_low';

  // Cross beam
  const beamGeom = new THREE.BoxGeometry(2.4, 0.35, 0.15);
  // Canvas for black/yellow caution hazard stripes
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#eab308';
  ctx.fillRect(0, 0, 256, 64);
  ctx.fillStyle = '#18181b';
  for (let x = -64; x < 256; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 20, 0);
    ctx.lineTo(x + 50, 64);
    ctx.lineTo(x + 30, 64);
    ctx.closePath();
    ctx.fill();
  }
  const stripeTex = new THREE.CanvasTexture(canvas);
  stripeTex.colorSpace = THREE.SRGBColorSpace;

  const beamMat = new THREE.MeshStandardMaterial({
    map: stripeTex,
    roughness: 0.5,
  });
  const beam = new THREE.Mesh(beamGeom, beamMat);
  beam.position.y = 0.65;
  beam.castShadow = true;
  group.add(beam);

  // Legs / A-frame stands
  const legMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.4 });
  const legGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8);

  const leftLeg1 = new THREE.Mesh(legGeom, legMat);
  leftLeg1.position.set(-1.0, 0.45, 0.2);
  leftLeg1.rotation.x = 0.3;
  leftLeg1.castShadow = true;

  const leftLeg2 = new THREE.Mesh(legGeom, legMat);
  leftLeg2.position.set(-1.0, 0.45, -0.2);
  leftLeg2.rotation.x = -0.3;
  leftLeg2.castShadow = true;

  const rightLeg1 = new THREE.Mesh(legGeom, legMat);
  rightLeg1.position.set(1.0, 0.45, 0.2);
  rightLeg1.rotation.x = 0.3;
  rightLeg1.castShadow = true;

  const rightLeg2 = new THREE.Mesh(legGeom, legMat);
  rightLeg2.position.set(1.0, 0.45, -0.2);
  rightLeg2.rotation.x = -0.3;
  rightLeg2.castShadow = true;

  group.add(leftLeg1, leftLeg2, rightLeg1, rightLeg2);

  // Red blinking warning lights on top
  const lightGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.16, 8);
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const lLight = new THREE.Mesh(lightGeom, lightMat);
  lLight.position.set(-1.0, 0.9, 0);
  const rLight = new THREE.Mesh(lightGeom, lightMat);
  rLight.position.set(1.0, 0.9, 0);
  group.add(lLight, rLight);

  return group;
}

/**
 * 6. High Clearance Obstacle (Girder / Sign - Slide Under)
 */
export function createHighBarrier(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'obstacle_high';

  // Tall side pillars
  const postGeom = new THREE.CylinderGeometry(0.09, 0.09, 3.8, 8);
  const postMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });

  const lPost = new THREE.Mesh(postGeom, postMat);
  lPost.position.set(-1.3, 1.9, 0);
  lPost.castShadow = true;

  const rPost = new THREE.Mesh(postGeom, postMat);
  rPost.position.set(1.3, 1.9, 0);
  rPost.castShadow = true;
  group.add(lPost, rPost);

  // Hanging sign that hangs down to Y = 1.35 (requires crouch / slide)
  const signGeom = new THREE.BoxGeometry(2.6, 1.4, 0.18);
  const signMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.4, metalness: 0.3 });
  const sign = new THREE.Mesh(signGeom, signMat);
  sign.position.set(0, 2.7, 0);
  sign.castShadow = true;
  group.add(sign);

  // Clearance warning banner
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(0, 0, 256, 128);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('▼ AWAS KEPALA ▼', 128, 48);
  ctx.font = '18px sans-serif';
  ctx.fillText('SLIDE / MERUNDUK!', 128, 88);

  const warnTex = new THREE.CanvasTexture(canvas);
  warnTex.colorSpace = THREE.SRGBColorSpace;
  const labelGeom = new THREE.PlaneGeometry(2.4, 1.2);
  const labelMat = new THREE.MeshBasicMaterial({ map: warnTex });
  const label = new THREE.Mesh(labelGeom, labelMat);
  label.position.set(0, 2.7, 0.1);
  group.add(label);

  return group;
}

/**
 * 7. Delivery Box Van / Angkot (City Vehicle Obstacle)
 */
export type VehicleType = 'van' | 'angkot' | 'taxi' | 'bus';

export function createVehicleObstacle(type: VehicleType = 'van'): THREE.Group {
  const group = new THREE.Group();
  group.name = 'obstacle_vehicle';

  let bodyColor = 0x2563eb;
  let boxColor = 0xf8fafc;
  
  switch(type) {
    case 'angkot':
      bodyColor = 0x059669;
      boxColor = 0x047857;
      break;
    case 'taxi':
      bodyColor = 0xfacc15;
      boxColor = 0xfef9c3;
      break;
    case 'bus':
      bodyColor = 0x991b1b;
      boxColor = 0xfee2e2;
      break;
  }

  const bodyMat = new THREE.MeshStandardMaterial({
    color: bodyColor,
    roughness: 0.4,
    metalness: 0.4,
  });

  // Lower chassis
  const chassisGeom = new THREE.BoxGeometry(2.1, 0.6, type === 'bus' ? 6.0 : 4.4);
  const chassis = new THREE.Mesh(chassisGeom, bodyMat);
  chassis.position.y = 0.6;
  chassis.castShadow = true;
  group.add(chassis);

  // Cabin / Box
  const boxGeom = new THREE.BoxGeometry(2.05, 1.6, type === 'bus' ? 4.8 : 2.8);
  const boxMat = new THREE.MeshStandardMaterial({
    color: boxColor,
    roughness: 0.5,
    metalness: 0.2,
  });
  const cargoBox = new THREE.Mesh(boxGeom, boxMat);
  cargoBox.position.set(0, 1.6, -0.6);
  cargoBox.castShadow = true;
  group.add(cargoBox);

  // Front cabin
  const cabinGeom = new THREE.BoxGeometry(2.0, 1.2, 1.4);
  const cabin = new THREE.Mesh(cabinGeom, bodyMat);
  cabin.position.set(0, 1.4, type === 'bus' ? 2.5 : 1.35);
  cabin.castShadow = true;
  group.add(cabin);

  // ... (rest of the wheels/lights remains similar, just adjust positions if needed) ...
  // Keeping simple for now
  
  // Windshield
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.1,
    metalness: 0.9,
  });
  const windGeom = new THREE.PlaneGeometry(1.7, 0.7);
  const wind = new THREE.Mesh(windGeom, glassMat);
  wind.position.set(0, 1.6, type === 'bus' ? 3.0 : 2.06);
  group.add(wind);

  // Headlights (Basic)
  const lightGeom = new THREE.BoxGeometry(0.3, 0.2, 0.1);
  const headMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  const lHead = new THREE.Mesh(lightGeom, headMat);
  lHead.position.set(-0.75, 0.65, type === 'bus' ? 3.1 : 2.2);
  const rHead = new THREE.Mesh(lightGeom, headMat);
  rHead.position.set(0.75, 0.65, type === 'bus' ? 3.1 : 2.2);
  group.add(lHead, rHead);

  return group;
}

