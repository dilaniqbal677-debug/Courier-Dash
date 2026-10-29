/**
 * HND Warehouse & Packing Logistics Hub 3D Models & Portals
 */
import * as THREE from 'three';
import { drawExactHNDLogoImage2 } from './textures';
import { goldMat, cardboardMat, tapeMat } from './shared';

// ============================================================================
// HND WAREHOUSE / PACKING LOGISTICS 3D MODELS & ELECTRONIC PICKUPS
// ============================================================================

/**
 * High-visibility Signboard for HND Logistics & Packing Warehouse
 */
function createWarehouseSignTexture(isExit: boolean = false): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 300;
  const ctx = canvas.getContext('2d')!;

  // 1. Dark industrial slate base with caution hazard border
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 1024, 300);

  // Hazard diagonal stripes top and bottom borders
  const stripeH = 26;
  const drawHazardBar = (y: number) => {
    ctx.fillStyle = isExit ? '#10b981' : '#f59e0b';
    ctx.fillRect(0, y, 1024, stripeH);
    ctx.fillStyle = '#090d16';
    for (let x = -50; x < 1050; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 20, y);
      ctx.lineTo(x + 40, y + stripeH);
      ctx.lineTo(x + 20, y + stripeH);
      ctx.closePath();
      ctx.fill();
    }
  };
  drawHazardBar(0);
  drawHazardBar(300 - stripeH);

  // Glowing inner border
  ctx.strokeStyle = isExit ? '#34d399' : '#38bdf8';
  ctx.lineWidth = 6;
  ctx.strokeRect(12, stripeH + 4, 1000, 300 - stripeH * 2 - 8);

  // Official HND Computer Logo on the left
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(30, stripeH + 16, 260, 210, 16);
  ctx.fill();
  drawExactHNDLogoImage2(ctx, 40, stripeH + 26, 240, 190, '#0a0a0a');

  // Main Text on the right
  ctx.textAlign = 'left';
  if (isExit) {
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('🚚 LOGISTIK SELESAI • SIAP ANTAR', 320, stripeH + 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 44px "Arial Black", sans-serif';
    ctx.fillText('JALUR KE TOKO HND KOMPUTER', 320, stripeH + 110);

    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('BARANG ELEKTRONIK TERKEMAS RAPI • MENUJU TOKO SEKARANG!', 320, stripeH + 160);

    ctx.fillStyle = '#facc15';
    ctx.font = '900 18px monospace';
    ctx.fillText('>>> DESTINASI: TOKO HND KOMPUTER INCE NURDIN >>>', 320, stripeH + 195);
  } else {
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('🏭 AREA PACKING & LOGISTIK RESMI', 320, stripeH + 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 46px "Arial Black", sans-serif';
    ctx.fillText('GUDANG LOGISTIK HND', 320, stripeH + 110);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('📦 KEMAS ALAT ELEKTRONIK SEBELUM DIANTAR KE TOKO!', 320, stripeH + 160);

    ctx.fillStyle = '#fbbf24';
    ctx.font = '900 18px monospace';
    ctx.fillText('⚡ AMBIL VGA, LAPTOP, MOTHERBOARD & MONITOR DI JALUR INI ⚡', 320, stripeH + 195);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Floor Decal for Warehouse Packing Zone
 */
function createWarehouseFloorCarpetTexture(isExit: boolean = false): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, 512, 512);

  // Chevrons and text
  ctx.strokeStyle = isExit ? '#10b981' : '#f59e0b';
  ctx.lineWidth = 14;
  ctx.strokeRect(10, 10, 492, 492);

  ctx.fillStyle = isExit ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)';
  ctx.fillRect(20, 20, 472, 472);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 36px "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(isExit ? '🚚 JALUR PENGANTARAN 🚚' : '📦 AREA PACKING HND 📦', 256, 160);

  ctx.fillStyle = isExit ? '#34d399' : '#fbbf24';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(isExit ? 'MENUJU TOKO HND KOMPUTER' : 'GUDANG LOGISTIK ELEKTRONIK', 256, 230);

  // Barcode decoration
  ctx.fillStyle = '#ffffff';
  for (let x = 60; x < 450; x += 14) {
    const w = (x % 3 === 0) ? 8 : 4;
    ctx.fillRect(x, 300, w, 80);
  }

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('HND-LOGISTICS-HUB // VERIFIED', 256, 420);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Warehouse Grand Entrance Portal
 */
export function createWarehouseEntrancePortal(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'warehouse_entrance_portal';

  const trussMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.85,
    roughness: 0.35,
  });

  const hazardMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.5,
    roughness: 0.3,
  });

  const neonGlowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

  // 1. Dual Heavy-duty Hazard Pillars (Left & Right of lanes)
  const pillarH = 7.2;
  const pillarGeom = new THREE.BoxGeometry(0.75, pillarH, 0.75);

  const leftPillar = new THREE.Mesh(pillarGeom, hazardMat);
  leftPillar.position.set(-5.6, pillarH / 2, 0);
  leftPillar.castShadow = true;

  const rightPillar = new THREE.Mesh(pillarGeom, hazardMat);
  rightPillar.position.set(5.6, pillarH / 2, 0);
  rightPillar.castShadow = true;

  // Caution striped bands on pillars
  for (let y = 1.0; y < 6.5; y += 1.4) {
    const bandGeom = new THREE.BoxGeometry(0.82, 0.45, 0.82);
    const darkBandMat = new THREE.MeshStandardMaterial({ color: 0x090d16 });
    const bL = new THREE.Mesh(bandGeom, darkBandMat);
    bL.position.set(-5.6, y, 0);
    const bR = new THREE.Mesh(bandGeom, darkBandMat);
    bR.position.set(5.6, y, 0);
    group.add(bL, bR);
  }

  group.add(leftPillar, rightPillar);

  // 2. Overhead Truss Crossbar
  const crossGeom = new THREE.BoxGeometry(12.0, 0.7, 0.7);
  const crossbar = new THREE.Mesh(crossGeom, trussMat);
  crossbar.position.set(0, 6.8, 0);
  crossbar.castShadow = true;
  group.add(crossbar);

  // Lower secondary support crossbar
  const lowerCrossGeom = new THREE.BoxGeometry(11.6, 0.35, 0.35);
  const lowerCross = new THREE.Mesh(lowerCrossGeom, trussMat);
  lowerCross.position.set(0, 4.8, 0);
  group.add(lowerCross);

  // 3. Giant Overhead Warehouse Signboard
  const signGeom = new THREE.BoxGeometry(9.6, 2.8, 0.25);
  const signMat = new THREE.MeshStandardMaterial({
    map: createWarehouseSignTexture(false),
    roughness: 0.3,
    metalness: 0.2,
    emissive: 0x0284c7,
    emissiveIntensity: 0.25,
  });
  const signMesh = new THREE.Mesh(signGeom, signMat);
  signMesh.position.set(0, 5.8, 0.15);
  signMesh.castShadow = true;
  group.add(signMesh);

  // Glowing Neon Frame around sign
  const frameGeom = new THREE.BoxGeometry(9.85, 3.05, 0.18);
  const frameMesh = new THREE.Mesh(frameGeom, neonGlowMat);
  frameMesh.position.set(0, 5.8, 0.1);
  group.add(frameMesh);

  // 4. Dual Flashing Amber Beacons on top
  const beaconGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.45, 16);
  const beaconL = new THREE.Mesh(beaconGeom, beaconMat);
  beaconL.position.set(-5.6, 7.35, 0);
  const beaconR = new THREE.Mesh(beaconGeom, beaconMat);
  beaconR.position.set(5.6, 7.35, 0);
  group.add(beaconL, beaconR);

  // Point light for amber warehouse glow
  const beaconLight = new THREE.PointLight(0xf59e0b, 3.0, 18);
  beaconLight.position.set(0, 7.0, 1.5);
  group.add(beaconLight);

  // 5. Floor Hazard Entry Carpet
  const floorGeom = new THREE.PlaneGeometry(8.8, 10.0);
  floorGeom.rotateX(-Math.PI / 2);
  const floorMat = new THREE.MeshStandardMaterial({
    map: createWarehouseFloorCarpetTexture(false),
    roughness: 0.8,
    transparent: true,
    opacity: 0.9,
  });
  const floorMesh = new THREE.Mesh(floorGeom, floorMat);
  floorMesh.position.set(0, 0.04, -2.0);
  group.add(floorMesh);

  return group;
}

/**
 * Warehouse Grand Exit Portal (Transition from Logistics to Delivery)
 */
export function createWarehouseExitPortal(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'warehouse_exit_portal';

  const trussMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.85,
    roughness: 0.35,
  });

  const greenMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    metalness: 0.5,
    roughness: 0.3,
  });

  const neonGlowMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });

  // 1. Dual Heavy-duty Emerald Pillars
  const pillarH = 7.2;
  const pillarGeom = new THREE.BoxGeometry(0.75, pillarH, 0.75);

  const leftPillar = new THREE.Mesh(pillarGeom, greenMat);
  leftPillar.position.set(-5.6, pillarH / 2, 0);
  leftPillar.castShadow = true;

  const rightPillar = new THREE.Mesh(pillarGeom, greenMat);
  rightPillar.position.set(5.6, pillarH / 2, 0);
  rightPillar.castShadow = true;
  group.add(leftPillar, rightPillar);

  // 2. Overhead Truss Crossbar
  const crossGeom = new THREE.BoxGeometry(12.0, 0.7, 0.7);
  const crossbar = new THREE.Mesh(crossGeom, trussMat);
  crossbar.position.set(0, 6.8, 0);
  crossbar.castShadow = true;
  group.add(crossbar);

  // 3. Overhead Exit Signboard
  const signGeom = new THREE.BoxGeometry(9.6, 2.6, 0.25);
  const signMat = new THREE.MeshStandardMaterial({
    map: createWarehouseSignTexture(true),
    roughness: 0.3,
    metalness: 0.2,
    emissive: 0x059669,
    emissiveIntensity: 0.3,
  });
  const signMesh = new THREE.Mesh(signGeom, signMat);
  signMesh.position.set(0, 5.7, 0.15);
  signMesh.castShadow = true;
  group.add(signMesh);

  // Glowing Green Neon Frame
  const frameGeom = new THREE.BoxGeometry(9.85, 2.85, 0.18);
  const frameMesh = new THREE.Mesh(frameGeom, neonGlowMat);
  frameMesh.position.set(0, 5.7, 0.1);
  group.add(frameMesh);

  // 4. Floor Carpet
  const floorGeom = new THREE.PlaneGeometry(8.8, 8.0);
  floorGeom.rotateX(-Math.PI / 2);
  const floorMat = new THREE.MeshStandardMaterial({
    map: createWarehouseFloorCarpetTexture(true),
    roughness: 0.8,
    transparent: true,
    opacity: 0.9,
  });
  const floorMesh = new THREE.Mesh(floorGeom, floorMat);
  floorMesh.position.set(0, 0.04, -1.5);
  group.add(floorMesh);

  // Green delivery illumination
  const light = new THREE.PointLight(0x10b981, 3.2, 18);
  light.position.set(0, 6.5, 1.0);
  group.add(light);

  return group;
}

/**
 * Logistics Side Conveyor Belt and Warehouse Props
 * Placed along the sides of the road inside the packing warehouse area
 */
export function createWarehouseConveyorProp(length: number = 30, side: 'left' | 'right' = 'left'): THREE.Group {
  const group = new THREE.Group();
  group.name = `warehouse_conveyor_${side}`;

  const posX = side === 'left' ? -4.5 : 4.5;
  group.position.set(posX, 0, 0);

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.8,
    roughness: 0.3,
  });

  const rollerMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.9,
    roughness: 0.2,
  });

  // Long conveyor frame rail
  const railGeom = new THREE.BoxGeometry(1.0, 0.25, length);
  const rail = new THREE.Mesh(railGeom, metalMat);
  rail.position.set(0, 0.9, 0);
  rail.castShadow = true;
  group.add(rail);

  // Roller cylinders along length
  for (let z = -length / 2 + 1; z < length / 2; z += 1.2) {
    const rollerGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.95, 12);
    rollerGeom.rotateZ(Math.PI / 2);
    const roller = new THREE.Mesh(rollerGeom, rollerMat);
    roller.position.set(0, 1.05, z);
    group.add(roller);
  }

  // Support legs
  for (let z = -length / 2 + 2; z < length / 2; z += 6) {
    const legGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.9, 8);
    const leg1 = new THREE.Mesh(legGeom, metalMat);
    leg1.position.set(-0.4, 0.45, z);
    const leg2 = new THREE.Mesh(legGeom, metalMat);
    leg2.position.set(0.4, 0.45, z);
    group.add(leg1, leg2);
  }

  // Wooden pallets with stacked boxes on top of conveyor / alongside
  const boxMat = new THREE.MeshStandardMaterial({
    color: 0xba8c5b,
    roughness: 0.8,
  });

  for (let z = -length / 2 + 4; z < length / 2; z += 8) {
    const boxG = new THREE.BoxGeometry(0.7, 0.55, 0.8);
    const b1 = new THREE.Mesh(boxG, boxMat);
    b1.position.set(0, 1.45, z);
    b1.castShadow = true;

    // Red fragile tape band
    const tapeGeom = new THREE.BoxGeometry(0.72, 0.12, 0.82);
    const tapeMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
    const tape = new THREE.Mesh(tapeGeom, tapeMat);
    tape.position.set(0, 1.45, z);
    group.add(b1, tape);
  }

  return group;
}

// ============================================================================
// 3D PROCEDURAL ELECTRONIC COMPONENT PICKUPS
// ============================================================================

