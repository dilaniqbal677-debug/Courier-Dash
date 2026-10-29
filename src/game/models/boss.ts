/**
 * 3D Mecha Boss Character (Mecha-Begal Cyber 3000), Boss Projectiles, Laser Bolts, and Warning Indicators
 */
import * as THREE from 'three';

// ==========================================
// 11. 3D MECHA BOSS CHARACTER ("MECHA-BEGAL CYBER 3000")
// User: "buat sistem bos yang dimana mewajibkan pemain untuk megambil pistol dijalan untuk menaembak bos"
// ==========================================
export interface BossRig {
  root: THREE.Group;
  bodyMesh: THREE.Mesh;
  eyeLight: THREE.PointLight;
  leftTurbine: THREE.Mesh;
  rightTurbine: THREE.Mesh;
  leftThrusterFlame: THREE.Mesh;
  rightThrusterFlame: THREE.Mesh;
  cannonMuzzleFlash: THREE.Mesh;
  hpBarFill: THREE.Mesh;
  hpBarBorder: THREE.Mesh;
  setHealth: (hp: number, maxHp: number) => void;
  setHitFlash: (active: boolean) => void;
  setCannonCharging: (charging: boolean) => void;
  updateAnimation: (elapsedTime: number, delta: number) => void;
}

export function createBossCharacter(): BossRig {
  const root = new THREE.Group();
  root.name = 'boss_character';

  const redMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.25, metalness: 0.2 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.2, metalness: 0.8 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2, metalness: 0.9 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfb923c, roughness: 0.6 });
  const mustacheMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
  const glassMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45, side: THREE.DoubleSide });

  // 1. Eggmobile Hover Pod (Classic Dr. Eggman Egg Pod Vehicle)
  const podLowerGeom = new THREE.SphereGeometry(1.4, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const podLower = new THREE.Mesh(podLowerGeom, whiteMat);
  podLower.position.y = 1.8;
  podLower.scale.set(1.2, 0.9, 1.2);
  root.add(podLower);

  const podRimGeom = new THREE.TorusGeometry(1.6, 0.18, 12, 32);
  podRimGeom.rotateX(Math.PI / 2);
  const podRim = new THREE.Mesh(podRimGeom, redMat);
  podRim.position.y = 2.2;
  root.add(podRim);

  // Transparent Cockpit Windshield Dome
  const canopyGeom = new THREE.SphereGeometry(1.35, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const canopy = new THREE.Mesh(canopyGeom, glassMat);
  canopy.position.y = 2.2;
  canopy.scale.set(1.15, 1.1, 1.15);
  root.add(canopy);

  // Side Thrusters on Eggmobile Pod
  const sideThrusterGeo = new THREE.CylinderGeometry(0.35, 0.45, 1.2, 16);
  sideThrusterGeo.rotateZ(Math.PI / 2);
  const leftThruster = new THREE.Mesh(sideThrusterGeo, metalMat);
  leftThruster.position.set(-1.6, 1.8, 0);
  const rightThruster = new THREE.Mesh(sideThrusterGeo, metalMat);
  rightThruster.position.set(1.6, 1.8, 0);
  root.add(leftThruster, rightThruster);

  // Thruster Flames
  const flameGeo = new THREE.ConeGeometry(0.3, 0.8, 12);
  flameGeo.rotateX(Math.PI / 2);
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const leftFlame = new THREE.Mesh(flameGeo, flameMat);
  leftFlame.position.set(-2.3, 1.8, 0);
  const rightFlame = new THREE.Mesh(flameGeo, flameMat);
  rightFlame.position.set(2.3, 1.8, 0);
  root.add(leftFlame, rightFlame);

  // 2. Dr. Eggman Sitting Inside Cockpit
  const drGroup = new THREE.Group();
  drGroup.position.set(0, 2.2, 0);
  root.add(drGroup);

  // Eggman Round Torso / Red Jacket inside pod
  const drBody = new THREE.Mesh(new THREE.SphereGeometry(0.85, 20, 16), redMat);
  drBody.position.y = 0.1;
  drGroup.add(drBody);

  // White Lapel & Gold Buttons
  const drLapel = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.9, 0.1), whiteMat);
  drLapel.position.set(0, 0.1, 0.8);
  drGroup.add(drLapel);

  // Dr. Eggman Head
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.1, 0);
  drGroup.add(headGroup);

  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 16), skinMat);
  headGroup.add(headMesh);

  // Huge Iconic Bushy Brown Mustache
  const mustacheGeom = new THREE.TorusGeometry(0.48, 0.14, 12, 24, Math.PI);
  mustacheGeom.rotateZ(Math.PI);
  const mustache = new THREE.Mesh(mustacheGeom, mustacheMat);
  mustache.position.set(0, -0.1, 0.45);
  mustache.scale.set(1.3, 1.0, 0.8);
  headGroup.add(mustache);

  // Round Pink Nose
  const noseMesh = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 14), skinMat);
  noseMesh.position.set(0, 0.02, 0.52);
  headGroup.add(noseMesh);

  // Tinted Pince-nez Glasses
  const glasses = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.28, 0.1), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
  glasses.position.set(0, 0.16, 0.48);
  headGroup.add(glasses);

  // Goggles on forehead
  const goggles = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.16, 20), metalMat);
  goggles.position.set(0, 0.35, 0);
  headGroup.add(goggles);

  // 3. Eye / Core Light & Cannon Muzzle Flash
  const eyeLight = new THREE.PointLight(0xef4444, 4.0, 10);
  eyeLight.position.set(0, 3.2, 1.0);
  root.add(eyeLight);

  const muzzleFlashMat = new THREE.MeshBasicMaterial({ color: 0xff0044, transparent: true, opacity: 0 });
  const cannonMuzzleFlash = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), muzzleFlashMat);
  cannonMuzzleFlash.position.set(0, 2.6, 1.6);
  root.add(cannonMuzzleFlash);

  // 4. 3D Floating Holographic Health Bar & Nameplate ("⚠️ BOS: DR. EGGMAN ⚠️")
  const hpBarGroup = new THREE.Group();
  hpBarGroup.position.set(0, 4.6, 0);
  root.add(hpBarGroup);

  const bossCanvas = document.createElement('canvas');
  bossCanvas.width = 512;
  bossCanvas.height = 100;
  const bctx = bossCanvas.getContext('2d')!;
  bctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  bctx.roundRect(8, 8, 496, 84, 20);
  bctx.fill();
  bctx.strokeStyle = '#ef4444';
  bctx.lineWidth = 6;
  bctx.stroke();
  bctx.fillStyle = '#f87171';
  bctx.font = '900 26px "Arial Black", sans-serif';
  bctx.textAlign = 'center';
  bctx.fillText('⚠️ BOS: DR. EGGMAN ⚠️', 256, 58);
  const bossTex = new THREE.CanvasTexture(bossCanvas);
  bossTex.colorSpace = THREE.SRGBColorSpace;

  const bossTitlePlane = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 0.7),
    new THREE.MeshBasicMaterial({ map: bossTex, transparent: true, side: THREE.DoubleSide })
  );
  bossTitlePlane.position.y = 0.65;
  hpBarGroup.add(bossTitlePlane);

  const hpBg = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.28, 0.08),
    new THREE.MeshBasicMaterial({ color: 0x331111 })
  );
  hpBarGroup.add(hpBg);

  // Text canvas for HP percentage
  const hpTextCanvas = document.createElement('canvas');
  hpTextCanvas.width = 128;
  hpTextCanvas.height = 40;
  const hctx = hpTextCanvas.getContext('2d')!;
  const hpTex = new THREE.CanvasTexture(hpTextCanvas);

  const hpTextPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 0.4),
    new THREE.MeshBasicMaterial({ map: hpTex, transparent: true, side: THREE.DoubleSide })
  );
  hpTextPlane.position.set(0, 0.45, 0.05);
  hpBarGroup.add(hpTextPlane);

  const hpFillGeom = new THREE.BoxGeometry(3.5, 0.22, 0.1);
  hpFillGeom.translate(1.75, 0, 0);
  const hpFillMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
  const hpBarFill = new THREE.Mesh(hpFillGeom, hpFillMat);
  hpBarFill.position.set(-1.75, 0, 0.02);
  hpBarGroup.add(hpBarFill);

  const hpBorderGeom = new THREE.BoxGeometry(3.68, 0.36, 0.06);
  const hpBarBorder = new THREE.Mesh(
    hpBorderGeom,
    new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
  );
  hpBarGroup.add(hpBarBorder);

  // Dummy placeholders
  const leftTurbine = leftThruster;
  const rightTurbine = rightThruster;
  const leftThrusterFlame = leftFlame;
  const rightThrusterFlame = rightFlame;
  const bodyMesh = podLower;

  const setHealth = (hp: number, maxHp: number) => {
    const ratio = Math.max(0, Math.min(1, hp / maxHp));
    hpBarFill.scale.x = ratio;

    // Dynamic color: Green (100-60%) -> Orange (60-25%) -> Red (25-0%)
    if (ratio > 0.6) {
      hpFillMat.color.setHex(0x22c55e); // Green
    } else if (ratio > 0.25) {
      hpFillMat.color.setHex(0xf59e0b); // Orange
    } else {
      hpFillMat.color.setHex(0xef4444); // Red
    }

    // Update text
    hctx.clearRect(0, 0, 128, 40);
    hctx.fillStyle = '#ffffff';
    hctx.font = 'bold 24px monospace';
    hctx.textAlign = 'center';
    hctx.fillText(`${Math.round(ratio * 100)}%`, 64, 30);
    hpTex.needsUpdate = true;
  };

  const setHitFlash = (active: boolean) => {
    if (active) {
      redMat.emissive.setHex(0xffffff);
      redMat.emissiveIntensity = 1.0;
    } else {
      redMat.emissive.setHex(0x000000);
      redMat.emissiveIntensity = 0;
    }
  };

  const setCannonCharging = (charging: boolean) => {
    muzzleFlashMat.opacity = charging ? 0.95 : 0;
  };

  const updateAnimation = (elapsedTime: number, delta: number) => {
    // Hovering Eggmobile floating bounce & head bobbing
    root.position.y = 2.6 + Math.sin(elapsedTime * 4.5) * 0.2;
    headGroup.rotation.y = Math.sin(elapsedTime * 2.5) * 0.25;
    root.rotation.z = Math.sin(elapsedTime * 3.0) * 0.05;
  };

  return {
    root,
    bodyMesh,
    eyeLight,
    leftTurbine,
    rightTurbine,
    leftThrusterFlame,
    rightThrusterFlame,
    cannonMuzzleFlash,
    hpBarFill,
    hpBarBorder,
    setHealth,
    setHitFlash,
    setCannonCharging,
    updateAnimation,
  };
}

export function createBossProjectile(type: 'missile' | 'laser' = 'missile'): THREE.Group {
  const group = new THREE.Group();
  group.name = 'boss_projectile';

  if (type === 'missile') {
    // Egg-Bomb (Telur Robot Melayang Berbahaya dengan Garis Peringatan)
    const eggGeom = new THREE.SphereGeometry(0.55, 18, 16);
    eggGeom.scale(1.0, 1.35, 1.0);
    const eggMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // White eggshell
      roughness:.3,
      metalness: 0.2,
    });
    const eggMesh = new THREE.Mesh(eggGeom, eggMat);
    group.add(eggMesh);

    // Red hazard warning band around egg
    const bandGeom = new THREE.TorusGeometry(0.52, 0.08, 8, 24);
    bandGeom.rotateX(Math.PI / 2);
    const bandMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const band = new THREE.Mesh(bandGeom, bandMat);
    group.add(band);

    // Glowing fuse tip
    const fuseGeom = new THREE.SphereGeometry(0.15, 12, 12);
    const fuseMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const fuse = new THREE.Mesh(fuseGeom, fuseMat);
    fuse.position.y = 0.75;
    group.add(fuse);

    const light = new THREE.PointLight(0xf59e0b, 3.0, 5);
    group.add(light);
  } else {
    // Plasma Laser Beam
    const coreGeom = new THREE.CylinderGeometry(0.12, 0.12, 2.2, 8);
    coreGeom.rotateX(Math.PI / 2);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const core = new THREE.Mesh(coreGeom, coreMat);
    group.add(core);

    const auraGeom = new THREE.CylinderGeometry(0.25, 0.25, 2.4, 8);
    auraGeom.rotateX(Math.PI / 2);
    const auraMat = new THREE.MeshBasicMaterial({ color: 0xff0044, transparent: true, opacity: 0.9 });
    const aura = new THREE.Mesh(auraGeom, auraMat);
    group.add(aura);

    const light = new THREE.PointLight(0xff0033, 3.0, 6);
    group.add(light);
  }

  return group;
}

// ==========================================
// 12. LASER PROJECTILE BOLT (TEMBAKAN PISTOL PEMAIN & LASER BOS)
// ==========================================
export function createLaserBolt(color: number = 0x38bdf8): THREE.Mesh {
  const geom = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8);
  geom.rotateX(Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.95,
  });
  const mesh = new THREE.Mesh(geom, mat);
  return mesh;
}


export function createBoss(): THREE.Group {
  // Use the full mechanical Boss character rig
  const bossRig = createBossCharacter();
  return bossRig.root;
}

export function createPlayerProjectile(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'player_plasma_bolt';
  
  // High-energy cyan plasma core
  const coreGeom = new THREE.CylinderGeometry(0.09, 0.09, 1.4, 8);
  coreGeom.rotateX(Math.PI / 2);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const core = new THREE.Mesh(coreGeom, coreMat);
  group.add(core);

  // Outer glowing aura
  const auraGeom = new THREE.CylinderGeometry(0.18, 0.18, 1.6, 8);
  auraGeom.rotateX(Math.PI / 2);
  const auraMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.85,
  });
  const aura = new THREE.Mesh(auraGeom, auraMat);
  group.add(aura);

  return group;
}



let _warningCanvasTexture: THREE.CanvasTexture | null = null;
function getWarningHazardTexture(): THREE.CanvasTexture {
  if (_warningCanvasTexture) return _warningCanvasTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // High contrast red & dark crimson diagonal warning hazard stripes
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(0, 0, 128, 512);

  ctx.fillStyle = '#ef4444';
  const stripeWidth = 28;
  for (let y = -128; y < 512 + 128; y += stripeWidth * 2) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(128, y + 128);
    ctx.lineTo(128, y + 128 + stripeWidth);
    ctx.lineTo(0, y + stripeWidth);
    ctx.closePath();
    ctx.fill();
  }

  // Warning text & chevrons
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px monospace';
  ctx.textAlign = 'center';
  for (let y = 60; y < 512; y += 110) {
    ctx.save();
    ctx.translate(64, y);
    ctx.fillText('⚠ DANGER ⚠', 0, 0);
    ctx.restore();
  }

  _warningCanvasTexture = new THREE.CanvasTexture(canvas);
  _warningCanvasTexture.wrapS = THREE.RepeatWrapping;
  _warningCanvasTexture.wrapT = THREE.RepeatWrapping;
  _warningCanvasTexture.repeat.set(1, 4);
  _warningCanvasTexture.colorSpace = THREE.SRGBColorSpace;
  return _warningCanvasTexture;
}

export function createBossWarningIndicator(length: number = 36): THREE.Group {
  const group = new THREE.Group();
  group.name = 'boss_warning_strip';

  // 1. Danger ground floor carpet with animated scrolling hazard stripes
  const floorGeom = new THREE.PlaneGeometry(2.35, length);
  floorGeom.rotateX(-Math.PI / 2);
  const floorMat = new THREE.MeshBasicMaterial({
    map: getWarningHazardTexture(),
    color: 0xff4444,
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const floorMesh = new THREE.Mesh(floorGeom, floorMat);
  floorMesh.position.y = 0.05;
  group.add(floorMesh);

  // 2. High-contrast left and right hazard laser boundary rails
  const railGeom = new THREE.BoxGeometry(0.1, 0.1, length);
  const railMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });

  const leftRail = new THREE.Mesh(railGeom, railMat);
  leftRail.position.set(-1.14, 0.08, 0);
  const rightRail = new THREE.Mesh(railGeom, railMat);
  rightRail.position.set(1.14, 0.08, 0);
  group.add(leftRail, rightRail);

  // 3. Ground-level concentric pulsing warning target rings at the player impact zone
  const targetRingGeom = new THREE.TorusGeometry(0.85, 0.06, 8, 32);
  targetRingGeom.rotateX(Math.PI / 2);
  const targetRingMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
  
  const targetRing1 = new THREE.Mesh(targetRingGeom, targetRingMat);
  targetRing1.position.set(0, 0.07, length * 0.45); // Near courier end
  
  const targetRing2 = new THREE.Mesh(targetRingGeom, targetRingMat);
  targetRing2.position.set(0, 0.07, 0); // Middle

  group.add(targetRing1, targetRing2);

  // 4. Warning Point Light for ground illumination
  const warningLight = new THREE.PointLight(0xff0033, 3.5, 10);
  warningLight.position.set(0, 0.8, length * 0.45);
  group.add(warningLight);

  return group;
}
