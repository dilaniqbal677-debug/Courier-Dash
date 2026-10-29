/**
 * Procedural Realistic City Architecture & Infrastructure
 * Generates rich, realistic procedural buildings, road furniture, shipping containers,
 * overhead gantries, and streetscapes tailored to each dynamic district biome.
 */

import * as THREE from 'three';
import { BiomeId } from './biomeConfig';

// ==========================================
// 1. PROCEDURAL TEXTURE GENERATORS
// ==========================================

function createRealisticAsphaltTexture(style: 'modern' | 'hazard' | 'neon' | 'guardrail'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // 1. Base Road Surface
  if (style === 'neon') {
    // Hutan: Natural dark earth forest trail
    ctx.fillStyle = '#1c1917';
  } else if (style === 'hazard') {
    // Pelabuhan: Industrial harbor slab concrete
    ctx.fillStyle = '#1e293b';
  } else if (style === 'guardrail') {
    // Angkasa: Deep space cosmic dark roadway
    ctx.fillStyle = '#030712';
  } else {
    // Perkotaan: Premium dark asphalt
    ctx.fillStyle = '#0f172a';
  }
  ctx.fillRect(0, 0, 512, 512);

  // Subtle aggregate asphalt stipples (sparse and calm)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
  for (let y = 0; y < 512; y += 32) {
    for (let x = (y % 64 === 0 ? 0 : 32); x < 512; x += 64) {
      ctx.fillRect(x, y, 4, 4);
    }
  }

  // 2. Solid Road Shoulders (Left X: 18, Right X: 494)
  ctx.lineWidth = 6;
  if (style === 'hazard') {
    // Pelabuhan: Diagonal hazard caution stripes along shoulders
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, 0, 24, 512);
    ctx.fillRect(488, 0, 24, 512);
    ctx.fillStyle = '#090e1a';
    for (let y = 0; y < 512; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(24, y + 24);
      ctx.lineTo(24, y + 40);
      ctx.lineTo(0, y + 16);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(488, y);
      ctx.lineTo(512, y + 24);
      ctx.lineTo(512, y + 40);
      ctx.lineTo(488, y + 16);
      ctx.fill();
    }
  } else if (style === 'guardrail') {
    // Angkasa: Glowing neon edge rails
    ctx.strokeStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(18, 0); ctx.lineTo(18, 512);
    ctx.moveTo(494, 0); ctx.lineTo(494, 512);
    ctx.stroke();
    ctx.shadowBlur = 0;
  } else if (style === 'neon') {
    // Hutan: Mossy natural green shoulder lines
    ctx.strokeStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(18, 0); ctx.lineTo(18, 512);
    ctx.moveTo(494, 0); ctx.lineTo(494, 512);
    ctx.stroke();
  } else {
    // Perkotaan: Crisp solid white road shoulders
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.moveTo(18, 0); ctx.lineTo(18, 512);
    ctx.moveTo(494, 0); ctx.lineTo(494, 512);
    ctx.stroke();
  }

  // 3. 2 SPACED DASHED LANE DIVIDERS (Defining 3 runner lanes cleanly & calmly)
  // Left divider: X = 175, Right divider: X = 337
  ctx.lineWidth = 4;
  ctx.setLineDash([64, 64]);

  if (style === 'hazard') {
    ctx.strokeStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(175, 0); ctx.lineTo(175, 512);
    ctx.moveTo(337, 0); ctx.lineTo(337, 512);
    ctx.stroke();
  } else if (style === 'guardrail') {
    ctx.strokeStyle = '#00f5ff';
    ctx.shadowColor = '#00f5ff';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(175, 0); ctx.lineTo(175, 512);
    ctx.moveTo(337, 0); ctx.lineTo(337, 512);
    ctx.stroke();
    ctx.shadowBlur = 0;
  } else if (style === 'neon') {
    ctx.strokeStyle = '#86efac';
    ctx.beginPath();
    ctx.moveTo(175, 0); ctx.lineTo(175, 512);
    ctx.moveTo(337, 0); ctx.lineTo(337, 512);
    ctx.stroke();
  } else {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.moveTo(175, 0); ctx.lineTo(175, 512);
    ctx.moveTo(337, 0); ctx.lineTo(337, 512);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 1.5);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createSidewalkTileTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base concrete
  ctx.fillStyle = '#64748b';
  ctx.fillRect(0, 0, 512, 512);

  // Paver tile grid
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 3;
  const tileSize = 64;
  for (let x = 0; x <= 512; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Yellow tactile paving strip (guiding path for visually impaired)
  ctx.fillStyle = '#eab308';
  ctx.fillRect(18, 0, 34, 512);
  ctx.fillStyle = '#ca8a04';
  for (let y = 8; y < 512; y += 24) {
    ctx.fillRect(22, y, 26, 10);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createHazardCurbTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 256, 64);

  // 45-degree yellow safety hazard stripes
  ctx.fillStyle = '#f59e0b';
  for (let x = -64; x < 320; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 24, 0);
    ctx.lineTo(x + 24 + 64, 64);
    ctx.lineTo(x + 64, 64);
    ctx.closePath();
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createBuildingWindowTexture(theme: 'modern' | 'industrial' | 'cyberpunk'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Building facade background
  ctx.fillStyle = theme === 'cyberpunk' ? '#090d16' : theme === 'industrial' ? '#334155' : '#1e293b';
  ctx.fillRect(0, 0, 512, 1024);

  // Architectural floor division horizontal bands
  ctx.fillStyle = theme === 'cyberpunk' ? '#0f172a' : '#111827';
  for (let y = 0; y < 1024; y += 96) {
    ctx.fillRect(0, y, 512, 14);
  }

  // Windows
  const cols = 6;
  const colW = 512 / cols;
  for (let y = 18; y < 1024; y += 96) {
    for (let c = 0; c < cols; c++) {
      const isLit = Math.random() > (theme === 'cyberpunk' ? 0.35 : 0.65);
      const wx = c * colW + 12;
      const wy = y;
      const ww = colW - 24;
      const wh = 66;

      if (isLit) {
        if (theme === 'cyberpunk') {
          // Cyberpunk glowing windows (Cyan, Amber, Hot Pink, Electric Blue)
          const colors = ['#38bdf8', '#f59e0b', '#ec4899', '#a855f7', '#06b6d4'];
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        } else {
          // Warm interior tungsten office / apartment lights
          ctx.fillStyle = Math.random() > 0.4 ? '#fef08a' : '#fed7aa';
        }
      } else {
        // Dark reflective glass
        ctx.fillStyle = '#0f172a';
      }

      ctx.fillRect(wx, wy, ww, wh);

      // Window mullions / window frame cross
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.lineWidth = 2;
      ctx.strokeRect(wx, wy, ww, wh);
      ctx.beginPath();
      ctx.moveTo(wx + ww / 2, wy);
      ctx.lineTo(wx + ww / 2, wy + wh);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createNeonBillboardTexture(title: string, subtitle: string, brandColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Dark cyber metallic screen
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, 512, 256);

  // Glowing neon frame
  ctx.strokeStyle = brandColor;
  ctx.lineWidth = 8;
  ctx.shadowColor = brandColor;
  ctx.shadowBlur = 18;
  ctx.strokeRect(12, 12, 488, 232);

  // Digital grid background lines
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 2;
  for (let x = 0; x < 512; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }

  // Main Header Text
  ctx.shadowColor = brandColor;
  ctx.shadowBlur = 14;
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 42px "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 256, 115);

  // Subtitle
  ctx.fillStyle = brandColor;
  ctx.font = 'bold 20px monospace';
  ctx.fillText(subtitle, 256, 175);

  // Bottom HND Computer tag
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('★ HND COMPUTER RESMI MAKASSAR ★', 256, 218);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createShippingContainerTexture(company: string, color: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Base container industrial paint
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 512, 256);

  // Vertical corrugated ribs
  for (let x = 0; x < 512; x += 16) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.fillRect(x, 0, 6, 256);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(x + 6, 0, 5, 256);
  }

  // Steel corner casting frames
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.lineWidth = 14;
  ctx.strokeRect(0, 0, 512, 256);

  // Container Stencil Code & Brand
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 36px "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(company, 256, 120);

  ctx.font = 'bold 16px monospace';
  ctx.fillText('HNDU 849201 [45G1] MAX GROSS 32.500 KG', 256, 165);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Pre-generated reusable textures (Zero runtime allocation during chunk streaming)
const asphaltModernTex = createRealisticAsphaltTexture('modern');
const asphaltHazardTex = createRealisticAsphaltTexture('hazard');
const asphaltNeonTex = createRealisticAsphaltTexture('neon');
const asphaltGuardrailTex = createRealisticAsphaltTexture('guardrail');

const sidewalkTilesTex = createSidewalkTileTexture();
const hazardCurbTex = createHazardCurbTexture();

const windowModernTex = createBuildingWindowTexture('modern');
const windowIndustrialTex = createBuildingWindowTexture('industrial');
const windowCyberpunkTex = createBuildingWindowTexture('cyberpunk');

const billboardRtxTex = createNeonBillboardTexture('GEFORCE RTX 5090', 'ULTIMATE TECH RIG // 32GB GDDR7', '#22c55e');
const billboardHndTex = createNeonBillboardTexture('HND COMPUTER', 'TOKOPEDIA & SHOPEE TOP SELLER', '#38bdf8');
const billboardCpuTex = createNeonBillboardTexture('INTEL CORE ULTRA', 'NEXT-GEN AI GAMING POWER', '#0ea5e9');
const billboardCyberTex = createNeonBillboardTexture('CYBER DECK 2077', 'ULTRA FAST PC HARDWARE', '#ec4899');

const containerBlueTex = createShippingContainerTexture('HND FREIGHT', '#1d4ed8');
const containerRedTex = createShippingContainerTexture('LOGISTICS DEPOT', '#b91c1c');
const containerGreenTex = createShippingContainerTexture('TECH CARGO', '#047857');
const containerOrangeTex = createShippingContainerTexture('HND EXPRESS', '#c2410c');

// ==========================================
// 2. SHARED MATERIALS & POOLED GEOMETRIES
// ==========================================

const modernRoadMat = new THREE.MeshStandardMaterial({
  map: asphaltModernTex,
  roughness: 0.8,
  metalness: 0.1,
});
const industrialRoadMat = new THREE.MeshStandardMaterial({
  map: asphaltHazardTex,
  roughness: 0.88,
  metalness: 0.08,
});
const cyberpunkRoadMat = new THREE.MeshStandardMaterial({
  map: asphaltNeonTex,
  roughness: 0.35,
  metalness: 0.25,
});
const skywayRoadMat = new THREE.MeshStandardMaterial({
  map: asphaltGuardrailTex,
  roughness: 0.3,
  metalness: 0.3,
});

const modernSidewalkMat = new THREE.MeshStandardMaterial({
  map: sidewalkTilesTex,
  roughness: 0.75,
});
const hazardCurbMat = new THREE.MeshStandardMaterial({
  map: hazardCurbTex,
  roughness: 0.6,
});
const modernCurbMat = new THREE.MeshStandardMaterial({
  color: 0x94a3b8,
  roughness: 0.5,
});
const neonCurbMat = new THREE.MeshStandardMaterial({
  color: 0x06b6d4,
  emissive: 0x0891b2,
  emissiveIntensity: 0.8,
  roughness: 0.2,
});

const steelFrameMat = new THREE.MeshStandardMaterial({
  color: 0x475569,
  metalness: 0.85,
  roughness: 0.3,
});
const yellowGantryMat = new THREE.MeshStandardMaterial({
  color: 0xf59e0b,
  metalness: 0.6,
  roughness: 0.4,
});

// Mark all global shared materials so safeDisposeObject leaves them cached in GPU
[
  modernRoadMat,
  industrialRoadMat,
  cyberpunkRoadMat,
  skywayRoadMat,
  modernSidewalkMat,
  hazardCurbMat,
  modernCurbMat,
  neonCurbMat,
  steelFrameMat,
  yellowGantryMat,
].forEach((m) => {
  (m as any).isGlobalSharedMaterial = true;
});

// Shared Prefab Materials & Textures (Pre-allocated once to eliminate GPU shader churn and memory thrashing)
const sharedSkyscraperMat = new THREE.MeshStandardMaterial({
  map: windowModernTex,
  roughness: 0.25,
  metalness: 0.45,
});
const sharedCanopyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
const sharedStoreGlassMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.75 });
const sharedHvacMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7 });
const sharedAntennaTipMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

const sharedContainerMats = [
  new THREE.MeshStandardMaterial({ map: containerBlueTex, roughness: 0.5, metalness: 0.3 }),
  new THREE.MeshStandardMaterial({ map: containerRedTex, roughness: 0.5, metalness: 0.3 }),
  new THREE.MeshStandardMaterial({ map: containerGreenTex, roughness: 0.5, metalness: 0.3 }),
  new THREE.MeshStandardMaterial({ map: containerOrangeTex, roughness: 0.5, metalness: 0.3 }),
];

const sharedIndustrialShedMat = new THREE.MeshStandardMaterial({
  map: windowIndustrialTex,
  roughness: 0.8,
});
const sharedIndustrialLightHeadMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });

const sharedCyberpunkMegatowerMat = new THREE.MeshStandardMaterial({
  map: windowCyberpunkTex,
  roughness: 0.3,
  metalness: 0.6,
});
const sharedBillboardMats = [
  new THREE.MeshBasicMaterial({ map: billboardRtxTex }),
  new THREE.MeshBasicMaterial({ map: billboardHndTex }),
  new THREE.MeshBasicMaterial({ map: billboardCpuTex }),
  new THREE.MeshBasicMaterial({ map: billboardCyberTex }),
];
const sharedNeonCyanStripMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
const sharedNeonPinkStripMat = new THREE.MeshBasicMaterial({ color: 0xec4899 });

const sharedBusStopRoofMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
const sharedBusStopGlassMat = new THREE.MeshStandardMaterial({
  color: 0x7dd3fc,
  transparent: true,
  opacity: 0.55,
  metalness: 0.1,
  roughness: 0.1,
});
const sharedBenchWoodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });

function createSharedGantryTexture(): THREE.CanvasTexture {
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 512;
  signCanvas.height = 96;
  const sCtx = signCanvas.getContext('2d')!;
  sCtx.fillStyle = '#060a14';
  sCtx.fillRect(0, 0, 512, 96);
  sCtx.strokeStyle = '#38bdf8';
  sCtx.lineWidth = 4;
  sCtx.strokeRect(4, 4, 504, 88);
  sCtx.fillStyle = '#22c55e';
  sCtx.font = 'bold 28px sans-serif';
  sCtx.fillText('↓ [LANE 1]', 45, 60);
  sCtx.fillText('↓ [HND EXPRESS]', 195, 60);
  sCtx.fillText('↓ [LANE 3]', 395, 60);
  const signTex = new THREE.CanvasTexture(signCanvas);
  signTex.colorSpace = THREE.SRGBColorSpace;
  return signTex;
}
const sharedGantrySignTex = createSharedGantryTexture();
const sharedGantrySignMat = new THREE.MeshBasicMaterial({ map: sharedGantrySignTex });

const sharedCobraDayMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
const sharedCobraNeonMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

const sharedConcretePylonMat = new THREE.MeshStandardMaterial({
  color: 0x475569,
  roughness: 0.9,
  metalness: 0.05,
});

// District-Themed Sidewalk & Scenery Materials
const forestSidewalkMat = new THREE.MeshStandardMaterial({
  color: 0x14532d, // Lush forest moss/grass
  roughness: 0.9,
  metalness: 0.05,
});
const industrialSidewalkMat = new THREE.MeshStandardMaterial({
  color: 0x334155, // Harbor concrete deck
  roughness: 0.85,
  metalness: 0.1,
});
const spaceSidewalkMat = new THREE.MeshStandardMaterial({
  color: 0x090d16, // Cosmic metallic skyway platform
  roughness: 0.35,
  metalness: 0.8,
});
const forestBarkMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 });
const forestPineLeavesMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.75 });
const forestEmeraldLeavesMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });
const forestRockMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.95 });
const spaceSolarMat = new THREE.MeshStandardMaterial({
  color: 0x0284c7,
  roughness: 0.2,
  metalness: 0.9,
  emissive: 0x0369a1,
  emissiveIntensity: 0.4,
});
const spaceRingMat = new THREE.MeshStandardMaterial({
  color: 0x38bdf8,
  roughness: 0.3,
  metalness: 0.7,
  emissive: 0x0284c7,
  emissiveIntensity: 0.6,
});
const spaceAsteroidMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.95 });

// Protect all shared materials from disposal
[
  sharedSkyscraperMat,
  sharedCanopyMat,
  sharedStoreGlassMat,
  sharedHvacMat,
  sharedAntennaTipMat,
  ...sharedContainerMats,
  sharedIndustrialShedMat,
  sharedIndustrialLightHeadMat,
  sharedCyberpunkMegatowerMat,
  ...sharedBillboardMats,
  sharedNeonCyanStripMat,
  sharedNeonPinkStripMat,
  sharedBusStopRoofMat,
  sharedBusStopGlassMat,
  sharedBenchWoodMat,
  sharedGantrySignMat,
  sharedCobraDayMat,
  sharedCobraNeonMat,
  sharedConcretePylonMat,
  forestSidewalkMat,
  industrialSidewalkMat,
  spaceSidewalkMat,
  forestBarkMat,
  forestPineLeavesMat,
  forestEmeraldLeavesMat,
  forestRockMat,
  spaceSolarMat,
  spaceRingMat,
  spaceAsteroidMat,
].forEach((m) => {
  (m as any).isGlobalSharedMaterial = true;
});

// ==========================================
// 3. ARCHITECTURAL PREFAB BUILDERS
// ==========================================

/**
 * 1. Modern Commercial Glass Skyscraper (Multi-tier, storefront canopy, rooftop HVAC & antennas)
 */
export function createCommercialSkyscraper(tierHeight: number = 32): THREE.Group {
  const group = new THREE.Group();
  group.name = 'commercial_skyscraper';

  const w = 11;
  const d = 12;

  // Base tier 1 (Main body)
  const baseGeom = new THREE.BoxGeometry(w, tierHeight, d);
  const baseMesh = new THREE.Mesh(baseGeom, sharedSkyscraperMat);
  baseMesh.position.y = tierHeight / 2;
  baseMesh.receiveShadow = true;
  group.add(baseMesh);

  // Tier 2 (Setback penthouse tower)
  const tier2H = 14;
  const tier2W = w * 0.75;
  const tier2D = d * 0.75;
  const tier2Geom = new THREE.BoxGeometry(tier2W, tier2H, tier2D);
  const tier2Mesh = new THREE.Mesh(tier2Geom, sharedSkyscraperMat);
  tier2Mesh.position.set(0, tierHeight + tier2H / 2, 0);
  group.add(tier2Mesh);

  // Ground floor modern retail storefront canopy & entrance
  const canopyGeom = new THREE.BoxGeometry(w * 0.85, 0.4, 3.2);
  const canopyMesh = new THREE.Mesh(canopyGeom, sharedCanopyMat);
  canopyMesh.position.set(0, 3.8, d / 2 + 1.2);
  group.add(canopyMesh);

  // Storefront glass display windows
  const storeGlassGeom = new THREE.BoxGeometry(w * 0.8, 3.2, 0.2);
  const storeGlassMesh = new THREE.Mesh(storeGlassGeom, sharedStoreGlassMat);
  storeGlassMesh.position.set(0, 1.8, d / 2 + 0.1);
  group.add(storeGlassMesh);

  // Rooftop mechanical HVAC chiller unit
  const hvacGeom = new THREE.BoxGeometry(3.5, 2.2, 3.5);
  const hvacMesh = new THREE.Mesh(hvacGeom, sharedHvacMat);
  hvacMesh.position.set(1.5, tierHeight + tier2H + 1.1, 0);
  group.add(hvacMesh);

  // Rooftop communications antenna mast
  const mastGeom = new THREE.CylinderGeometry(0.08, 0.16, 7, 8);
  const mastMesh = new THREE.Mesh(mastGeom, steelFrameMat);
  mastMesh.position.set(-1.8, tierHeight + tier2H + 3.5, 0);
  group.add(mastMesh);

  // Red warning light on antenna tip
  const tipGeom = new THREE.SphereGeometry(0.2, 8, 8);
  const tipMesh = new THREE.Mesh(tipGeom, sharedAntennaTipMat);
  tipMesh.position.set(-1.8, tierHeight + tier2H + 7.1, 0);
  group.add(tipMesh);

  return group;
}

/**
 * 2. Industrial Cargo Depot (Stack of colorful shipping containers + cargo warehouse)
 */
export function createIndustrialCargoStack(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'industrial_cargo_stack';

  const containerW = 4.2;
  const containerH = 2.6;
  const containerD = 8.8;
  const cGeom = new THREE.BoxGeometry(containerW, containerH, containerD);

  // 1st Level: 2 containers side by side
  const c1 = new THREE.Mesh(cGeom, sharedContainerMats[0]);
  c1.position.set(-2.2, containerH / 2, 0);
  c1.receiveShadow = true;
  group.add(c1);

  const c2 = new THREE.Mesh(cGeom, sharedContainerMats[1]);
  c2.position.set(2.2, containerH / 2, 0);
  c2.receiveShadow = true;
  group.add(c2);

  // 2nd Level: 1 container stacked diagonally
  const c3 = new THREE.Mesh(cGeom, sharedContainerMats[2]);
  c3.position.set(0, containerH * 1.5, 0);
  c3.rotation.y = 0.05;
  group.add(c3);

  // Warehouse storage shed in background
  const shedW = 12;
  const shedH = 8;
  const shedD = 14;
  const shedGeom = new THREE.BoxGeometry(shedW, shedH, shedD);
  const shedMesh = new THREE.Mesh(shedGeom, sharedIndustrialShedMat);
  shedMesh.position.set(0, shedH / 2, -12);
  shedMesh.receiveShadow = true;
  group.add(shedMesh);

  // Industrial floodlight pole
  const lightPoleGeom = new THREE.CylinderGeometry(0.12, 0.16, 9, 8);
  const lightPoleMesh = new THREE.Mesh(lightPoleGeom, steelFrameMat);
  lightPoleMesh.position.set(5.5, 4.5, 3.5);
  group.add(lightPoleMesh);

  const lightHeadGeom = new THREE.BoxGeometry(1.2, 0.4, 0.6);
  const lightHeadMesh = new THREE.Mesh(lightHeadGeom, sharedIndustrialLightHeadMat);
  lightHeadMesh.position.set(5.5, 9.0, 3.5);
  lightHeadMesh.rotation.x = 0.3;
  group.add(lightHeadMesh);

  return group;
}

/**
 * 3. Cyberpunk Megatower with Glowing Hologram Billboards
 */
export function createCyberpunkMegatower(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'cyberpunk_megatower';

  const w = 12;
  const h = 42;
  const d = 13;

  const towerGeom = new THREE.BoxGeometry(w, h, d);
  const towerMesh = new THREE.Mesh(towerGeom, sharedCyberpunkMegatowerMat);
  towerMesh.position.y = h / 2;
  group.add(towerMesh);

  // Large holographic floating billboard on the front facade
  const bbGeom = new THREE.PlaneGeometry(8, 4.5);
  const chosenMat = sharedBillboardMats[Math.floor(Math.random() * sharedBillboardMats.length)];
  const bbMesh = new THREE.Mesh(bbGeom, chosenMat);
  bbMesh.position.set(0, 18 + Math.random() * 12, d / 2 + 0.3);
  group.add(bbMesh);

  // Neon vertical light strip running down tower corner
  const stripGeom = new THREE.BoxGeometry(0.15, h, 0.15);
  const chosenStripMat = Math.random() > 0.5 ? sharedNeonCyanStripMat : sharedNeonPinkStripMat;
  const stripMesh = new THREE.Mesh(stripGeom, chosenStripMat);
  stripMesh.position.set(w / 2 + 0.05, h / 2, d / 2 + 0.05);
  group.add(stripMesh);

  return group;
}

/**
 * 4. Realistic Modern Bus Stop Shelter with Bench & Glass Panels
 */
export function createModernBusStop(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'bus_stop';

  // Frame columns
  const colGeom = new THREE.BoxGeometry(0.12, 2.7, 0.12);
  const c1 = new THREE.Mesh(colGeom, steelFrameMat);
  c1.position.set(-1.8, 1.35, -0.9);
  const c2 = new THREE.Mesh(colGeom, steelFrameMat);
  c2.position.set(1.8, 1.35, -0.9);
  const c3 = new THREE.Mesh(colGeom, steelFrameMat);
  c3.position.set(-1.8, 1.35, 0.9);
  const c4 = new THREE.Mesh(colGeom, steelFrameMat);
  c4.position.set(1.8, 1.35, 0.9);
  group.add(c1, c2, c3, c4);

  // Curved glass roof
  const roofGeom = new THREE.BoxGeometry(4.2, 0.16, 2.3);
  const roof = new THREE.Mesh(roofGeom, sharedBusStopRoofMat);
  roof.position.set(0, 2.75, 0);
  group.add(roof);

  // Rear safety glass panel with advertising
  const glassGeom = new THREE.PlaneGeometry(3.4, 2.2);
  const glassMesh = new THREE.Mesh(glassGeom, sharedBusStopGlassMat);
  glassMesh.position.set(0, 1.4, -0.88);
  group.add(glassMesh);

  // Teak wood waiting bench
  const benchGeom = new THREE.BoxGeometry(2.8, 0.12, 0.5);
  const bench = new THREE.Mesh(benchGeom, sharedBenchWoodMat);
  bench.position.set(0, 0.5, -0.4);
  group.add(bench);

  return group;
}

/**
 * 5. Overhead Highway Electronic Traffic Gantry (Spans across all 3 lanes)
 */
export function createOverheadTrafficGantry(theme: BiomeId): THREE.Group {
  const group = new THREE.Group();
  group.name = 'traffic_gantry';

  const roadSpan = 11.2;
  const clearanceH = 6.2;

  // Left & right steel lattice support posts
  const postGeom = new THREE.BoxGeometry(0.45, clearanceH, 0.45);
  const postL = new THREE.Mesh(postGeom, steelFrameMat);
  postL.position.set(-roadSpan / 2, clearanceH / 2, 0);
  const postR = new THREE.Mesh(postGeom, steelFrameMat);
  postR.position.set(roadSpan / 2, clearanceH / 2, 0);
  group.add(postL, postR);

  // Cross horizontal bridge beam
  const beamGeom = new THREE.BoxGeometry(roadSpan + 0.9, 0.8, 0.8);
  const beam = new THREE.Mesh(beamGeom, steelFrameMat);
  beam.position.set(0, clearanceH + 0.4, 0);
  group.add(beam);

  // Electronic Signboard facing runner (reuses shared material and canvas texture)
  const signGeom = new THREE.PlaneGeometry(8.8, 1.4);
  const signMesh = new THREE.Mesh(signGeom, sharedGantrySignMat);
  signMesh.position.set(0, clearanceH + 0.4, 0.45);
  group.add(signMesh);

  return group;
}

/**
 * 6. Sleek Modern Curved Cobra-Head Street Lamp
 */
export function createModernCobraLamp(isNightOrNeon: boolean = false): THREE.Group {
  const lamp = new THREE.Group();
  lamp.name = 'modern_street_lamp';

  // Base pole
  const poleGeom = new THREE.CylinderGeometry(0.08, 0.14, 5.8, 8);
  const pole = new THREE.Mesh(poleGeom, steelFrameMat);
  pole.position.y = 2.9;
  lamp.add(pole);

  // Curved upper arm
  const armGeom = new THREE.BoxGeometry(1.6, 0.09, 0.09);
  const arm = new THREE.Mesh(armGeom, steelFrameMat);
  arm.position.set(-0.7, 5.75, 0);
  arm.rotation.z = -0.15;
  lamp.add(arm);

  // Streamlined luminaire head
  const headGeom = new THREE.BoxGeometry(0.55, 0.12, 0.28);
  const head = new THREE.Mesh(headGeom, steelFrameMat);
  head.position.set(-1.45, 5.9, 0);
  lamp.add(head);

  // Glowing LED emitter lens
  const lensGeom = new THREE.BoxGeometry(0.48, 0.02, 0.24);
  const lens = new THREE.Mesh(lensGeom, isNightOrNeon ? sharedCobraNeonMat : sharedCobraDayMat);
  lens.position.set(-1.45, 5.83, 0);
  lamp.add(lens);

  return lamp;
}

/**
 * 7. Skyway Bridge Pylon Structure (Supports elevated highway above clouds)
 */
export function createSkywayPylon(): THREE.Group {
  const pylon = new THREE.Group();
  pylon.name = 'skyway_pylon';

  // Massive concrete column extending below the road deck
  const columnGeom = new THREE.BoxGeometry(3.5, 25, 4.2);
  const col = new THREE.Mesh(columnGeom, sharedConcretePylonMat);
  col.position.y = -12.5;
  pylon.add(col);

  // Crosshead pier cap holding the deck
  const capGeom = new THREE.BoxGeometry(12.5, 2.2, 5.5);
  const cap = new THREE.Mesh(capGeom, sharedConcretePylonMat);
  cap.position.y = -1.1;
  pylon.add(cap);

  return pylon;
}

/**
 * 8. Forest Tree & Rock Cluster (Lush wilderness along forest highway)
 */
export function createForestTreeCluster(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'forest_tree_cluster';

  // 1. Tall Pine Tree
  const trunkGeom = new THREE.CylinderGeometry(0.35, 0.5, 7, 8);
  const trunk = new THREE.Mesh(trunkGeom, forestBarkMat);
  trunk.position.set(0, 3.5, 0);
  trunk.castShadow = true;
  group.add(trunk);

  const cone1 = new THREE.Mesh(new THREE.ConeGeometry(2.4, 4.2, 8), forestPineLeavesMat);
  cone1.position.set(0, 6.2, 0);
  cone1.castShadow = true;
  group.add(cone1);

  const cone2 = new THREE.Mesh(new THREE.ConeGeometry(1.9, 3.6, 8), forestEmeraldLeavesMat);
  cone2.position.set(0, 8.4, 0);
  cone2.castShadow = true;
  group.add(cone2);

  const cone3 = new THREE.Mesh(new THREE.ConeGeometry(1.3, 2.8, 8), forestPineLeavesMat);
  cone3.position.set(0, 10.2, 0);
  cone3.castShadow = true;
  group.add(cone3);

  // 2. Secondary smaller tree offset
  const trunk2 = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 5, 8), forestBarkMat);
  trunk2.position.set(3.2, 2.5, 1.8);
  trunk2.castShadow = true;
  group.add(trunk2);

  const coneS1 = new THREE.Mesh(new THREE.ConeGeometry(1.7, 3.2, 7), forestEmeraldLeavesMat);
  coneS1.position.set(3.2, 4.6, 1.8);
  group.add(coneS1);

  const coneS2 = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2.4, 7), forestPineLeavesMat);
  coneS2.position.set(3.2, 6.3, 1.8);
  group.add(coneS2);

  // 3. Mossy boulders
  const rock1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2, 1), forestRockMat);
  rock1.position.set(-2.0, 0.8, 1.2);
  rock1.rotation.set(0.4, 0.8, 0.2);
  group.add(rock1);

  return group;
}

/**
 * 9. Orbital Cosmic Space Station Structure (Futuristic cosmic skyway architecture)
 */
export function createSpaceStationStructure(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'space_station_structure';

  // Floating Gyro Cosmic Ring
  const ring = new THREE.Mesh(new THREE.TorusGeometry(5.5, 0.45, 8, 24), spaceRingMat);
  ring.position.set(0, 14, 0);
  ring.rotation.x = Math.PI / 4;
  group.add(ring);

  // Solar Panel Arrays
  const solarGeom = new THREE.BoxGeometry(6.5, 0.12, 2.0);
  const solarL = new THREE.Mesh(solarGeom, spaceSolarMat);
  solarL.position.set(-6, 14, 0);
  solarL.rotation.z = 0.2;
  const solarR = new THREE.Mesh(solarGeom, spaceSolarMat);
  solarR.position.set(6, 14, 0);
  solarR.rotation.z = -0.2;
  group.add(solarL, solarR);

  // Floating Asteroid Rock
  const asteroid = new THREE.Mesh(new THREE.DodecahedronGeometry(2.8, 1), spaceAsteroidMat);
  asteroid.position.set(2, 6, -3);
  asteroid.rotation.set(0.5, 1.2, 0.3);
  group.add(asteroid);

  return group;
}

// ==========================================
// 4. MAIN DYNAMIC CHUNK GENERATOR (OPTIMIZED & CACHED)
// ==========================================

const sharedRoadGeom60 = new THREE.PlaneGeometry(8.8, 60);
const sharedSidewalkGeom60 = new THREE.BoxGeometry(4.8, 0.28, 60);
const sharedCurbGeom60 = new THREE.BoxGeometry(0.32, 0.32, 60);
const sharedSkywayRailGeom60 = new THREE.BoxGeometry(0.12, 0.9, 60);
const sharedCableTowerGeom = new THREE.CylinderGeometry(0.3, 0.5, 30, 8);

[
  sharedRoadGeom60,
  sharedSidewalkGeom60,
  sharedCurbGeom60,
  sharedSkywayRailGeom60,
  sharedCableTowerGeom,
].forEach((g) => {
  (g as any).isGlobalSharedGeometry = true;
});

const sharedSkywayRailMat = new THREE.MeshStandardMaterial({
  color: 0x94a3b8,
  metalness: 0.9,
  roughness: 0.2,
});
(sharedSkywayRailMat as any).isGlobalSharedMaterial = true;

export function createDynamicTrackChunk(length: number = 60, biome: BiomeId = 'perkotaan'): THREE.Group {
  const group = new THREE.Group();
  group.name = `track_chunk_${biome}`;

  // 1. Select appropriate road surface and sidewalk material for biome
  let roadMat = modernRoadMat;
  let curbMat = modernCurbMat;
  let sidewalkMat = modernSidewalkMat;

  if (biome === 'pelabuhan') {
    roadMat = industrialRoadMat;
    curbMat = hazardCurbMat;
    sidewalkMat = industrialSidewalkMat;
  } else if (biome === 'hutan') {
    roadMat = cyberpunkRoadMat;
    curbMat = neonCurbMat;
    sidewalkMat = forestSidewalkMat;
  } else if (biome === 'angkasa') {
    roadMat = skywayRoadMat;
    curbMat = modernCurbMat;
    sidewalkMat = spaceSidewalkMat;
  }

  // 2. Main 3-lane roadbed (Width: 8.8m, Length: 60m)
  const roadGeom = length === 60 ? sharedRoadGeom60 : new THREE.PlaneGeometry(8.8, length);
  const road = new THREE.Mesh(roadGeom, roadMat);
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0;
  road.receiveShadow = true;
  group.add(road);

  // 3. Sidewalks / Highway Shoulders
  const swWidth = 4.8;
  const swGeom = length === 60 ? sharedSidewalkGeom60 : new THREE.BoxGeometry(swWidth, 0.28, length);
  const leftSidewalk = new THREE.Mesh(swGeom, sidewalkMat);
  leftSidewalk.position.set(-4.4 - swWidth / 2, 0.14, 0);
  leftSidewalk.receiveShadow = true;

  const rightSidewalk = new THREE.Mesh(swGeom, sidewalkMat);
  rightSidewalk.position.set(4.4 + swWidth / 2, 0.14, 0);
  rightSidewalk.receiveShadow = true;
  group.add(leftSidewalk, rightSidewalk);

  // 4. Curbs
  const curbGeom = length === 60 ? sharedCurbGeom60 : new THREE.BoxGeometry(0.32, 0.32, length);
  const leftCurb = new THREE.Mesh(curbGeom, curbMat);
  leftCurb.position.set(-4.45, 0.16, 0);
  const rightCurb = new THREE.Mesh(curbGeom, curbMat);
  rightCurb.position.set(4.45, 0.16, 0);
  group.add(leftCurb, rightCurb);

  // 5. Skyway elevated pylons & steel crash barriers if in angkasa biome
  if (biome === 'angkasa') {
    const pylon = createSkywayPylon();
    pylon.position.set(0, 0, 0);
    group.add(pylon);

    // Steel W-beam guardrails along both sides
    const railGeom = length === 60 ? sharedSkywayRailGeom60 : new THREE.BoxGeometry(0.12, 0.9, length);
    const railL = new THREE.Mesh(railGeom, sharedSkywayRailMat);
    railL.position.set(-4.5, 0.6, 0);
    const railR = new THREE.Mesh(railGeom, sharedSkywayRailMat);
    railR.position.set(4.5, 0.6, 0);
    group.add(railL, railR);
  }

  // District-Specific Procedural Architecture & Street Furniture
  const propInterval = 18;
  const propCount = Math.floor(length / propInterval);

  // 6. District-Specific Procedural Architecture & Street Furniture
  for (let p = 0; p < propCount; p++) {
    const propZ = -length / 2 + p * propInterval + 9 + (Math.random() - 0.5) * 4;

    // --- LEFT SIDE ARCHITECTURE & SCENERY ---
    if (biome === 'perkotaan') {
      const bldg = createCommercialSkyscraper(26 + Math.random() * 18);
      bldg.position.set(-14 - Math.random() * 2, 0, propZ);
      group.add(bldg);

      // Bus stop shelter or street trees
      if (p === 1 && Math.random() > 0.4) {
        const busStop = createModernBusStop();
        busStop.position.set(-6.2, 0.28, propZ + 3);
        group.add(busStop);
      }
    } else if (biome === 'pelabuhan') {
      const cargo = createIndustrialCargoStack();
      cargo.position.set(-13, 0, propZ);
      group.add(cargo);
    } else if (biome === 'hutan') {
      const forestProp = createForestTreeCluster();
      forestProp.position.set(-11, 0, propZ);
      group.add(forestProp);
    } else if (biome === 'angkasa') {
      const spaceProp = createSpaceStationStructure();
      spaceProp.position.set(-12, 0, propZ);
      group.add(spaceProp);
    }

    // --- RIGHT SIDE ARCHITECTURE & SCENERY ---
    if (biome === 'perkotaan') {
      const bldgR = createCommercialSkyscraper(28 + Math.random() * 16);
      bldgR.position.set(14 + Math.random() * 2, 0, propZ + 4);
      group.add(bldgR);
    } else if (biome === 'pelabuhan') {
      const cargoR = createIndustrialCargoStack();
      cargoR.position.set(13, 0, propZ + 3);
      group.add(cargoR);
    } else if (biome === 'hutan') {
      const forestPropR = createForestTreeCluster();
      forestPropR.position.set(11, 0, propZ + 3);
      forestPropR.rotation.y = Math.PI * 0.7;
      group.add(forestPropR);
    } else if (biome === 'angkasa') {
      const spacePropR = createSpaceStationStructure();
      spacePropR.position.set(12, 0, propZ + 3);
      group.add(spacePropR);
    }

    // Street Lamps along sidewalk
    if (biome !== 'angkasa') {
      const lampL = createModernCobraLamp(biome === 'hutan');
      lampL.position.set(-5.8, 0.28, propZ);
      lampL.rotation.y = Math.PI; // Face inward towards road
      group.add(lampL);

      const lampR = createModernCobraLamp(biome === 'hutan');
      lampR.position.set(5.8, 0.28, propZ + 9);
      group.add(lampR);
    }
  }

  // 7. Overhead Highway Traffic Gantry (Every ~120m)
  if (Math.abs(length) >= 60 && Math.random() > 0.45) {
    const gantry = createOverheadTrafficGantry(biome);
    gantry.position.set(0, 0, -length / 4);
    group.add(gantry);
  }

  return group;
}
