/**
 * Courier Character Rig & 3D Shopping Cart Animation System
 */
import * as THREE from 'three';
import { CourierSkin } from '../constants';
import {
  exactImage2LogoTex,
  hndGuardTex,
  hndGuardBannerTex,
  hndExpressBannerTex,
  superheroCapeTex,
  mascotFaceTex,
  standardLabelTex,
  goldLabelTex,
} from './textures';
import {
  cardboardMat,
  tapeMat,
  goldMat,
  _curPt,
  _nextPt,
  _midPt,
  _dirPt,
  _upVec,
} from './shared';

/**
 * 1. Procedural Courier Character: Mascot Robot & Shopping Cart (Keranjang Belanja)
 */
export interface CourierRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  headGroup: THREE.Group;
  head: THREE.Mesh;
  helmet: THREE.Mesh;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  cartGroup: THREE.Group;
  packageStackGroup: THREE.Group;
  shieldOrbitGroup: THREE.Group;
  hndGuardBanner: THREE.Group;
  hndExpressBanner: THREE.Group;
  cape: THREE.Mesh;
  lightningGroup: THREE.Group;
  flightDustGroup: THREE.Group;
  slideEffectsGroup: THREE.Group;
  hoverboard: THREE.Group;
  updateAnimation: (
    runPhase: number,
    isJumping: boolean,
    isSliding: boolean,
    stackCount: number,
    hasShield: boolean,
    hndGuardSpinProgress?: number,
    elapsedTime?: number,
    hndExpressSpinProgress?: number,
    isFlying?: boolean
  ) => void;
  updateSkin: (skin: CourierSkin) => void;
}

export function createCourierCharacter(skin: CourierSkin): CourierRig {
  const root = new THREE.Group();
  root.name = 'courier_root';

  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  // Vibrant yellow suit material (glossy cute robot mascot finish)
  const suitColor = new THREE.Color(skin.jacketColor);
  const suitMat = new THREE.MeshStandardMaterial({
    color: suitColor,
    roughness: 0.28,
    metalness: 0.15,
  });

  // Dark navy face visor / headphones
  const navyMat = new THREE.MeshStandardMaterial({
    color: 0x090e1a,
    roughness: 0.15,
    metalness: 0.35,
  });

  // Orange helmet racing stripe
  const orangeStripeMat = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    roughness: 0.3,
    metalness: 0.15,
  });

  // Polished chrome metal material for cart handles and joints
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.1,
    metalness: 0.95,
  });

  // Black shopping cart material (Keranjang belanja berwarna hitam)
  const basketMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.25,
    metalness: 0.85,
    wireframe: false,
  });

  // Tech delivery backpack material
  const backpackMat = new THREE.MeshStandardMaterial({
    color: skin.backpackColor,
    roughness: 0.5,
    metalness: 0.2,
  });

  // ==========================================
  // 1. HEAD & HELMET (HIGH-QUALITY MASCOT ROBOT)
  // ==========================================
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.95, 0);
  bodyGroup.add(headGroup);

  // Giant cute rounded yellow helmet with smooth segments
  const helmetGeom = new THREE.SphereGeometry(0.48, 32, 28);
  const helmet = new THREE.Mesh(helmetGeom, suitMat);
  helmet.castShadow = true;
  headGroup.add(helmet);

  // Orange Racing Stripe on top of helmet (front to back)
  const stripeGeom = new THREE.BoxGeometry(0.14, 0.06, 0.72);
  const stripe = new THREE.Mesh(stripeGeom, orangeStripeMat);
  stripe.position.set(0, 0.46, 0.02);
  headGroup.add(stripe);

  // Dark curved visor screen with cute animated face texture
  const visorGeom = new THREE.SphereGeometry(0.44, 28, 24, 0, Math.PI * 2, 0, Math.PI * 0.7);
  const visorFaceMat = new THREE.MeshStandardMaterial({
    map: mascotFaceTex,
    roughness: 0.1,
    metalness: 0.2,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.45,
  });
  const visor = new THREE.Mesh(visorGeom, visorFaceMat);
  visor.rotation.x = Math.PI / 2;
  visor.position.set(0, 0, -0.06);
  headGroup.add(visor);

  // Headphone Band (Chrome arch across top of helmet)
  const bandGeom = new THREE.TorusGeometry(0.49, 0.042, 10, 28, Math.PI);
  const band = new THREE.Mesh(bandGeom, chromeMat);
  band.rotation.z = Math.PI;
  band.rotation.y = Math.PI / 2;
  band.position.set(0, 0.08, 0);
  headGroup.add(band);

  // Left & Right Headphone Earcups with glowing cyan rings
  const cupBaseGeom = new THREE.CylinderGeometry(0.16, 0.16, 0.12, 20);
  cupBaseGeom.rotateZ(Math.PI / 2);

  const leftCup = new THREE.Mesh(cupBaseGeom, navyMat);
  leftCup.position.set(-0.48, 0.08, 0);
  const leftRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.14, 0.02, 8, 20),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  );
  leftRing.rotation.y = Math.PI / 2;
  leftCup.add(leftRing);
  headGroup.add(leftCup);

  const rightCup = new THREE.Mesh(cupBaseGeom, navyMat);
  rightCup.position.set(0.48, 0.08, 0);
  const rightRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.14, 0.02, 8, 20),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  );
  rightRing.rotation.y = Math.PI / 2;
  rightCup.add(rightRing);
  headGroup.add(rightCup);

  // Flexible Cyber Antenna with glowing tip on right ear
  const antennaStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.02, 0.28, 8),
    chromeMat
  );
  antennaStem.position.set(0.48, 0.24, 0.04);
  antennaStem.rotation.z = -0.25;
  const antennaTip = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  );
  antennaTip.position.set(0, 0.15, 0);
  antennaStem.add(antennaTip);
  headGroup.add(antennaStem);

  // Special Character Hats / Headgear (Subway Surfers Theme)
  if (skin.hatType === 'jester') {
    // Jaro Joker 2-Horn Curved Jester Hat with Golden Bells
    const jesterMat = new THREE.MeshStandardMaterial({
      color: 0x4c1d95,
      roughness: 0.35,
      metalness: 0.2,
    });
    const goldBellMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.2,
      metalness: 0.85,
    });
    const hornGeom = new THREE.ConeGeometry(0.18, 0.65, 12);
    hornGeom.translate(0, 0.32, 0);

    const leftHorn = new THREE.Mesh(hornGeom, jesterMat);
    leftHorn.position.set(-0.25, 0.40, 0);
    leftHorn.rotation.z = 0.55;
    leftHorn.rotation.x = -0.15;
    const bellL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), goldBellMat);
    bellL.position.set(0, 0.65, 0);
    leftHorn.add(bellL);

    const rightHorn = new THREE.Mesh(hornGeom, jesterMat);
    rightHorn.position.set(0.25, 0.40, 0);
    rightHorn.rotation.z = -0.55;
    rightHorn.rotation.x = -0.15;
    const bellR = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), goldBellMat);
    bellR.position.set(0, 0.65, 0);
    rightHorn.add(bellR);

    const jesterBand = new THREE.Mesh(
      new THREE.TorusGeometry(0.48, 0.05, 8, 24),
      goldBellMat
    );
    jesterBand.rotation.x = Math.PI / 2;
    jesterBand.position.set(0, 0.22, 0);

    headGroup.add(leftHorn, rightHorn, jesterBand);
  } else if (skin.hatType === 'crown') {
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.15,
      metalness: 0.95,
    });
    const crownBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.36, 0.30, 0.24, 5),
      crownMat
    );
    crownBase.position.set(0, 0.54, 0);
    headGroup.add(crownBase);
  } else if (skin.hatType === 'beanie') {
    const beanieMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.75,
      metalness: 0.05,
    });
    const beanie = new THREE.Mesh(
      new THREE.SphereGeometry(0.50, 24, 20),
      beanieMat
    );
    beanie.position.set(0, 0.14, -0.04);
    beanie.scale.set(1.02, 1.05, 1.02);
    headGroup.add(beanie);
  } else if (skin.hatType === 'alien') {
    const alienMat = new THREE.MeshBasicMaterial({ color: 0x4ade80 });
    const antL = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8), alienMat);
    antL.position.set(-0.25, 0.58, 0);
    antL.rotation.z = 0.35;
    const bulbL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), alienMat);
    bulbL.position.set(0, 0.2, 0);
    antL.add(bulbL);

    const antR = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8), alienMat);
    antR.position.set(0.25, 0.58, 0);
    antR.rotation.z = -0.35;
    const bulbR = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), alienMat);
    bulbR.position.set(0, 0.2, 0);
    antR.add(bulbR);

    headGroup.add(antL, antR);
  } else if (skin.hatType === 'ninja') {
    const ninjaBandMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
    const ninjaBand = new THREE.Mesh(
      new THREE.TorusGeometry(0.48, 0.045, 8, 24),
      ninjaBandMat
    );
    ninjaBand.rotation.x = Math.PI / 2;
    ninjaBand.position.set(0, 0.18, 0);
    headGroup.add(ninjaBand);

    // Flowing ninja headband tails
    const tailGeom = new THREE.BoxGeometry(0.08, 0.35, 0.02);
    tailGeom.translate(0, -0.15, 0);
    const tail1 = new THREE.Mesh(tailGeom, ninjaBandMat);
    tail1.position.set(-0.06, 0.18, 0.48);
    tail1.rotation.x = 0.35;
    tail1.rotation.z = -0.15;
    const tail2 = new THREE.Mesh(tailGeom, ninjaBandMat);
    tail2.position.set(0.06, 0.18, 0.48);
    tail2.rotation.x = 0.45;
    tail2.rotation.z = 0.15;
    headGroup.add(tail1, tail2);
  } else if (skin.hatType === 'cap') {
    // Subway Surfers snapback street cap
    const capMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(skin.accentColor || skin.jacketColor),
      roughness: 0.4,
      metalness: 0.1,
    });
    const capCrown = new THREE.Mesh(
      new THREE.SphereGeometry(0.49, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.45),
      capMat
    );
    capCrown.position.set(0, 0.15, 0);

    // Front visor brim
    const brimGeom = new THREE.BoxGeometry(0.44, 0.03, 0.32);
    const brim = new THREE.Mesh(brimGeom, capMat);
    brim.position.set(0, 0.16, -0.46);
    brim.rotation.x = 0.12;

    // Top button
    const buttonGeom = new THREE.SphereGeometry(0.045, 12, 12);
    const capButton = new THREE.Mesh(buttonGeom, new THREE.MeshBasicMaterial({ color: 0xffffff }));
    capButton.position.set(0, 0.52, 0);

    headGroup.add(capCrown, brim, capButton);
  } else if (skin.hatType === 'horns') {
    // Lucy goth punk rock horn spikes
    const hornMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(skin.accentColor || 0xec4899),
      roughness: 0.3,
      metalness: 0.3,
    });
    const coneGeom = new THREE.ConeGeometry(0.12, 0.42, 12);
    coneGeom.translate(0, 0.2, 0);

    const leftHorn = new THREE.Mesh(coneGeom, hornMat);
    leftHorn.position.set(-0.24, 0.38, 0.05);
    leftHorn.rotation.z = 0.45;
    leftHorn.rotation.x = -0.1;

    const rightHorn = new THREE.Mesh(coneGeom, hornMat);
    rightHorn.position.set(0.24, 0.38, 0.05);
    rightHorn.rotation.z = -0.45;
    rightHorn.rotation.x = -0.1;

    headGroup.add(leftHorn, rightHorn);
  } else if (skin.hatType === 'punk') {
    // Mohawk punk rocker spikes
    const punkMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(skin.accentColor || 0x06b6d4),
      roughness: 0.2,
      metalness: 0.4,
    });
    for (let i = -2; i <= 2; i++) {
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.38 - Math.abs(i) * 0.05, 8),
        punkMat
      );
      spike.position.set(0, 0.48, i * 0.16);
      spike.rotation.x = -i * 0.15;
      headGroup.add(spike);
    }
  }


  // ==========================================
  // 2. TORSO & CHUBBY JUMPSUIT WITH HND EMBLEM
  // ==========================================
  const torsoGeom = new THREE.SphereGeometry(0.48, 24, 20);
  torsoGeom.scale(1.0, 1.15, 0.92);
  const torso = new THREE.Mesh(torsoGeom, suitMat);
  torso.position.y = 1.15;
  torso.castShadow = true;
  torso.receiveShadow = true;
  bodyGroup.add(torso);

  // Chest HND Logo Emblem Badge
  const badgeMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.24, 0.16),
    new THREE.MeshBasicMaterial({ map: exactImage2LogoTex, transparent: true })
  );
  badgeMesh.position.set(0, 1.25, -0.44);
  bodyGroup.add(badgeMesh);

  // Tech Utility Belt
  const beltGeom = new THREE.TorusGeometry(0.46, 0.04, 8, 24);
  const belt = new THREE.Mesh(beltGeom, navyMat);
  belt.rotation.x = Math.PI / 2;
  belt.position.set(0, 0.88, 0);
  bodyGroup.add(belt);

  // Belt Buckle (Glowing cyan LED)
  const buckleGeom = new THREE.BoxGeometry(0.12, 0.08, 0.04);
  const buckle = new THREE.Mesh(buckleGeom, new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
  buckle.position.set(0, 0.88, -0.46);
  bodyGroup.add(buckle);

  // Character-Specific Unique 3D Accessories & Geometries
  if (skin.id === 'ninja') {
    const sheathMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 });
    const hiltMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2, metalness: 0.8 });
    const sheath = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 1.1, 8), sheathMat);
    sheath.position.set(0.2, 1.3, 0.35);
    sheath.rotation.z = -0.35;
    sheath.rotation.x = 0.25;
    const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.35, 8), hiltMat);
    hilt.position.set(0, 0.6, 0);
    sheath.add(hilt);
    bodyGroup.add(sheath);
  } else if (skin.id === 'jaro') {
    const ruffMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 });
    const ruff = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.08, 12, 24), ruffMat);
    ruff.rotation.x = Math.PI / 2;
    ruff.position.set(0, 1.55, 0);
    bodyGroup.add(ruff);
  } else if (skin.id === 'lucy') {
    const spikeMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.2, metalness: 0.8 });
    const shoulderL = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 8), spikeMat);
    shoulderL.position.set(-0.48, 1.45, 0);
    shoulderL.rotation.z = -0.5;
    const shoulderR = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 8), spikeMat);
    shoulderR.position.set(0.48, 1.45, 0);
    shoulderR.rotation.z = 0.5;
    bodyGroup.add(shoulderL, shoulderR);
  } else if (skin.id === 'fresh') {
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.3 });
    const speakerMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.2 });
    const boombox = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 0.25), boxMat);
    boombox.position.set(0, 1.2, 0.42);
    const sp1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16), speakerMat);
    sp1.rotation.x = Math.PI / 2;
    sp1.position.set(-0.15, 0, 0.13);
    const sp2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16), speakerMat);
    sp2.rotation.x = Math.PI / 2;
    sp2.position.set(0.15, 0, 0.13);
    boombox.add(sp1, sp2);
    bodyGroup.add(boombox);
  } else if (skin.id === 'tricky') {
    const boardMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.05, 0.85), boardMat);
    deck.position.set(0, 1.2, 0.38);
    deck.rotation.y = 0.2;
    bodyGroup.add(deck);
  } else if (skin.id === 'yutani') {
    const dishMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.2, metalness: 0.8 });
    const dish = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.15, 16), dishMat);
    dish.rotation.x = Math.PI / 2;
    dish.position.set(0, 1.25, 0.38);
    bodyGroup.add(dish);
  } else if (skin.id === 'cyber_blue') {
    const thrusterMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.2, metalness: 0.9 });
    const thrusterL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.45, 12), thrusterMat);
    thrusterL.position.set(-0.22, 1.15, 0.4);
    thrusterL.rotation.x = 0.3;
    const thrusterR = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.45, 12), thrusterMat);
    thrusterR.position.set(0.22, 1.15, 0.4);
    thrusterR.rotation.x = 0.3;
    bodyGroup.add(thrusterL, thrusterR);
  } else if (skin.id === 'gold_vip') {
    const goldMatLocal = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.15, metalness: 0.95 });
    const pauldronL = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), goldMatLocal);
    pauldronL.position.set(-0.45, 1.45, 0);
    const pauldronR = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), goldMatLocal);
    pauldronR.position.set(0.45, 1.45, 0);
    bodyGroup.add(pauldronL, pauldronR);
  }

  // ==========================================
  // 3. 3D HIGH-DETAIL KERANJANG BELANJA (SHOPPING CART)
  // ==========================================
  const cartGroup = new THREE.Group();
  cartGroup.position.set(0, 1.15, 0.48); // Positioned on the back like a backpack
  bodyGroup.add(cartGroup);

  // Cart Chrome Tubular Frame & Handlebar
  const frameGroup = new THREE.Group();
  cartGroup.add(frameGroup);

  // Top Handlebar where robot hands hold (facing the robot)
  const handleBarGeom = new THREE.CylinderGeometry(0.028, 0.028, 0.72, 12);
  handleBarGeom.rotateZ(Math.PI / 2);
  const handleBar = new THREE.Mesh(handleBarGeom, chromeMat);
  handleBar.position.set(0, 0.58, -0.32);
  frameGroup.add(handleBar);

  // Soft Rubber Hand Grips
  const gripGeom = new THREE.CylinderGeometry(0.038, 0.038, 0.18, 12);
  gripGeom.rotateZ(Math.PI / 2);
  const leftGrip = new THREE.Mesh(gripGeom, navyMat);
  leftGrip.position.set(-0.25, 0.58, -0.32);
  const rightGrip = new THREE.Mesh(gripGeom, navyMat);
  rightGrip.position.set(0.25, 0.58, -0.32);
  frameGroup.add(leftGrip, rightGrip);

  // Angled Chrome Frame Struts connecting handle to basket base
  const strutGeom = new THREE.CylinderGeometry(0.022, 0.022, 0.65, 8);
  const leftStrut = new THREE.Mesh(strutGeom, chromeMat);
  leftStrut.position.set(-0.28, 0.32, -0.16);
  leftStrut.rotation.x = -0.52;
  const rightStrut = new THREE.Mesh(strutGeom, chromeMat);
  rightStrut.position.set(0.28, 0.32, -0.16);
  rightStrut.rotation.x = -0.52;
  frameGroup.add(leftStrut, rightStrut);

  // Lower chassis base frame
  const baseFrame = new THREE.Mesh(
    new THREE.BoxGeometry(0.66, 0.04, 0.62),
    chromeMat
  );
  baseFrame.position.set(0, 0.02, 0.05);
  frameGroup.add(baseFrame);

  // Basket Body (Black shopping basket)
  const basketBed = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.38, 0.56),
    basketMat
  );
  basketBed.position.set(0, 0.24, 0.05);
  basketBed.castShadow = true;
  cartGroup.add(basketBed);

  // Glossy Orange / Cyan Top Rim of basket
  const rimGeom = new THREE.BoxGeometry(0.76, 0.04, 0.60);
  const rim = new THREE.Mesh(rimGeom, orangeStripeMat);
  rim.position.set(0, 0.43, 0.05);
  cartGroup.add(rim);

  // Badge on Basket with HND COMPUTER Logo
  const cartBadge = new THREE.Mesh(
    new THREE.PlaneGeometry(0.36, 0.22),
    new THREE.MeshBasicMaterial({ map: exactImage2LogoTex, transparent: true })
  );
  cartBadge.position.set(0, 0.24, 0.34);
  cartGroup.add(cartBadge);

  // 4 Caster Wheels with Chrome Hubs & Rubber Tires
  const wheelGeom = new THREE.CylinderGeometry(0.065, 0.065, 0.04, 12);
  wheelGeom.rotateZ(Math.PI / 2);
  const wheelPositions = [
    [-0.30, -0.05, -0.22],
    [0.30, -0.05, -0.22],
    [-0.30, -0.05, 0.32],
    [0.30, -0.05, 0.32],
  ];
  wheelPositions.forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(wheelGeom, navyMat);
    wheel.position.set(wx, wy, wz);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.045, 10), chromeMat);
    hub.rotateZ(Math.PI / 2);
    wheel.add(hub);
    cartGroup.add(wheel);
  });

  // Package Stack Group (Mounted ON TOP of the shopping cart/basket)
  const packageStackGroup = new THREE.Group();
  packageStackGroup.position.set(0, 0.48, 0.05);
  cartGroup.add(packageStackGroup);

  // ==========================================
  // 4. ARMS & ROBOTIC GLOVES (HOLDING BASKET HANDLE)
  // ==========================================
  const armGeom = new THREE.CylinderGeometry(0.11, 0.13, 0.52, 12);

  // Left Arm
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.42, 1.35, 0);
  const leftArmMesh = new THREE.Mesh(armGeom, suitMat);
  leftArmMesh.position.y = -0.22;
  leftArmMesh.castShadow = true;
  leftArm.add(leftArmMesh);

  // Left cute yellow glove hand gripping handle reaching backward
  const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), suitMat);
  leftHand.position.set(0.12, -0.32, 0.30);
  leftArm.add(leftHand);
  bodyGroup.add(leftArm);

  // Right Arm
  const rightArm = new THREE.Group();
  rightArm.position.set(0.42, 1.35, 0);
  const rightArmMesh = new THREE.Mesh(armGeom, suitMat);
  rightArmMesh.position.y = -0.22;
  rightArmMesh.castShadow = true;
  rightArm.add(rightArmMesh);

  // Right cute yellow glove hand gripping handle reaching backward
  const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), suitMat);
  rightHand.position.set(-0.12, -0.32, 0.30);
  rightArm.add(rightHand);
  bodyGroup.add(rightArm);

  // ==========================================
  // 5. LEGS & BULBOUS RUNNER BOOTS
  // ==========================================
  const legGeom = new THREE.CylinderGeometry(0.14, 0.16, 0.58, 12);
  const bootGeom = new THREE.BoxGeometry(0.28, 0.20, 0.44);

  // Left Leg
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.24, 0.72, 0);
  const leftLegMesh = new THREE.Mesh(legGeom, suitMat);
  leftLegMesh.position.y = -0.25;
  leftLegMesh.castShadow = true;
  leftLeg.add(leftLegMesh);

  // Left Bulbous Runner Boot with glowing sole
  const leftShoe = new THREE.Mesh(bootGeom, suitMat);
  leftShoe.position.set(0, -0.55, -0.05);
  leftShoe.castShadow = true;
  // Glowing cyan sole tread
  const leftSole = new THREE.Mesh(
    new THREE.BoxGeometry(0.29, 0.04, 0.45),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  );
  leftSole.position.set(0, -0.10, 0);
  leftShoe.add(leftSole);
  leftLeg.add(leftShoe);
  bodyGroup.add(leftLeg);

  // Right Leg
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.24, 0.72, 0);
  const rightLegMesh = new THREE.Mesh(legGeom, suitMat);
  rightLegMesh.position.y = -0.25;
  rightLegMesh.castShadow = true;
  rightLeg.add(rightLegMesh);

  // Right Bulbous Runner Boot with glowing sole
  const rightShoe = new THREE.Mesh(bootGeom, suitMat);
  rightShoe.position.set(0, -0.55, -0.05);
  rightShoe.castShadow = true;
  const rightSole = new THREE.Mesh(
    new THREE.BoxGeometry(0.29, 0.04, 0.45),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  );
  rightSole.position.set(0, -0.10, 0);
  rightShoe.add(rightSole);
  rightLeg.add(rightShoe);
  bodyGroup.add(rightLeg);

  // ==========================================
  // 6. HND GUARD PERISAI KELILING (ORBITING SHIELD AURA)
  // User: "setelah itu logo hnd guard muncul di sekeliling karakter sebagai perisai"
  // ==========================================
  const shieldOrbitGroup = new THREE.Group();
  shieldOrbitGroup.visible = false;
  root.add(shieldOrbitGroup);

  // A. Hexagonal translucent glowing energy forcefield bubble
  const forcefieldGeom = new THREE.SphereGeometry(1.45, 24, 20);
  const forcefieldMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.22,
    roughness: 0.15,
    metalness: 0.8,
    side: THREE.DoubleSide,
  });
  const forcefieldBubble = new THREE.Mesh(forcefieldGeom, forcefieldMat);
  forcefieldBubble.position.set(0, 1.25, 0);
  shieldOrbitGroup.add(forcefieldBubble);

  // B. 3 Orbiting 3D HND GUARD Shield Emblems surrounding mascot
  const orbitingShields: THREE.Group[] = [];
  for (let i = 0; i < 3; i++) {
    const shieldRig = new THREE.Group();

    // Shield Plate - Circular shape instead of box
    const shieldPlateGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 32);
    shieldPlateGeom.rotateX(Math.PI / 2);

    const shieldPlateMat = new THREE.MeshStandardMaterial({
      map: hndGuardTex,
      roughness: 0.2,
      metalness: 0.85,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4,
    });
    const shieldPlate = new THREE.Mesh(shieldPlateGeom, shieldPlateMat);
    shieldRig.add(shieldPlate);

    // Glowing Cyan Bevel Rim - Circular ring
    const rimMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.38, 0.03, 16, 64),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    shieldRig.add(rimMesh);

    // Glowing Trail Sparkle
    const spark = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b })
    );
    spark.position.set(0, 0, 0.06);
    shieldRig.add(spark);

    orbitingShields.push(shieldRig);
    shieldOrbitGroup.add(shieldRig);
  }

  // ==========================================
  // 7. 3D FLOATING HND GUARD BANNER (SPIN ACTIVATION)
  // User: "pada saat berputar muncul tulisan HND GUARD"
  // ==========================================
  const hndGuardBanner = new THREE.Group();
  hndGuardBanner.position.set(0, 2.75, 0);
  hndGuardBanner.visible = false;

  const bannerPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 0.56),
    new THREE.MeshBasicMaterial({ map: hndGuardBannerTex, transparent: true, side: THREE.DoubleSide })
  );
  hndGuardBanner.add(bannerPlane);
  root.add(hndGuardBanner);

  // ==========================================
  // 7B. 3D FLOATING HND EXPRES BANNER (SPEED FLIGHT ACTIVATION)
  // User: "muncul tulisann HND EXPRES"
  // ==========================================
  const hndExpressBanner = new THREE.Group();
  hndExpressBanner.position.set(0, 2.75, 0);
  hndExpressBanner.visible = false;

  const expressBannerPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.65, 0.58),
    new THREE.MeshBasicMaterial({ map: hndExpressBannerTex, transparent: true, side: THREE.DoubleSide })
  );
  hndExpressBanner.add(expressBannerPlane);
  root.add(hndExpressBanner);

  // ==========================================
  // 7C. SUPERHERO CAPE (JUBAH SUPERHERO MEWAH & TEBAL)
  // User: "pada saat terbang saya mau karakter memakai jubah... efeknya tebal"
  // ==========================================
  const capeGeom = new THREE.PlaneGeometry(1.35, 2.35, 12, 18);
  capeGeom.translate(0, -1.15, 0); // pivot at shoulders
  const capeOrigPositions = Float32Array.from(capeGeom.attributes.position.array);

  const capeMat = new THREE.MeshStandardMaterial({
    map: superheroCapeTex,
    roughness: 0.25,
    metalness: 0.3,
    side: THREE.DoubleSide,
  });
  const cape = new THREE.Mesh(capeGeom, capeMat);
  cape.position.set(0, 1.45, 0.20);
  cape.visible = false;
  bodyGroup.add(cape);

  // Large golden eagle clasps on shoulders
  const claspGeom = new THREE.CylinderGeometry(0.09, 0.09, 0.06, 16);
  const claspMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.12 });
  const leftClasp = new THREE.Mesh(claspGeom, claspMat);
  leftClasp.position.set(-0.28, 0, 0.04);
  leftClasp.rotation.x = Math.PI / 2;
  cape.add(leftClasp);

  const rightClasp = new THREE.Mesh(claspGeom, claspMat);
  rightClasp.position.set(0.28, 0, 0.04);
  rightClasp.rotation.x = Math.PI / 2;
  cape.add(rightClasp);

  // ==========================================
  // 7D. PROCEDURAL 3D VOLUMETRIC LIGHTNING SYSTEM (PETIR TEBAL 3D)
  // User: "animasi petir dan debu disekeliling karakter saat terbang efeknya tebal"
  // ==========================================
  const lightningGroup = new THREE.Group();
  lightningGroup.visible = false;
  root.add(lightningGroup);

  // Dynamic Pulsing Electric PointLight (flickering electric storm illumination)
  const electricLight = new THREE.PointLight(0x38bdf8, 4.5, 14);
  electricLight.position.set(0, 1.35, 0);
  lightningGroup.add(electricLight);

  // 1. Triple Thick 3D Electric Torus Rings (gyro-spinning electric cage)
  const electricRings: THREE.Mesh[] = [];
  const ringMaterials = [
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.9 }),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.9 }),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 }),
  ];
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.65 + i * 0.12, 0.09, 16, 48), ringMaterials[i]);
    lightningGroup.add(ring);
    electricRings.push(ring);
  }

  // 2. Electric Leading Fist Aura (Right hand energy fist)
  const fistAura = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 })
  );
  fistAura.position.set(-0.12, -0.32, 0.30);
  fistAura.visible = false;
  rightArm.add(fistAura);

  // ==========================================
  // 7E. THICK DUST VORTEX, JET SPEEDLINES & ROCKET THRUSTERS
  // User: "efeknya kurang tebal... debu disekeliling karakter saat terbang"
  // ==========================================
  const flightDustGroup = new THREE.Group();
  flightDustGroup.visible = false;
  root.add(flightDustGroup);

  // 1. Dual-Stage Rocket Boot Thrusters (White Hot Core + Cyan/Gold Plasma Plumes)
  const outerThrusterGeo = new THREE.ConeGeometry(0.26, 1.45, 16);
  outerThrusterGeo.rotateX(Math.PI); // Point flame downward/backward
  const outerThrusterMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.9,
  });

  const innerThrusterGeo = new THREE.ConeGeometry(0.14, 0.85, 16);
  innerThrusterGeo.rotateX(Math.PI);
  const innerThrusterMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.95,
  });

  const leftOuterThruster = new THREE.Mesh(outerThrusterGeo, outerThrusterMat);
  leftOuterThruster.position.set(-0.24, -0.75, 0.15);
  const leftInnerThruster = new THREE.Mesh(innerThrusterGeo, innerThrusterMat);
  leftInnerThruster.position.set(-0.24, -0.55, 0.15);
  bodyGroup.add(leftOuterThruster, leftInnerThruster);
  leftOuterThruster.visible = false;
  leftInnerThruster.visible = false;

  const rightOuterThruster = new THREE.Mesh(outerThrusterGeo, outerThrusterMat);
  rightOuterThruster.position.set(0.24, -0.75, 0.15);
  const rightInnerThruster = new THREE.Mesh(innerThrusterGeo, innerThrusterMat);
  rightInnerThruster.position.set(0.24, -0.55, 0.15);
  bodyGroup.add(rightOuterThruster, rightInnerThruster);
  rightOuterThruster.visible = false;
  rightInnerThruster.visible = false;

  // Twin Rocket Boosters on the Cart
  const cartBoosterGeo = new THREE.ConeGeometry(0.22, 1.25, 14);
  cartBoosterGeo.rotateX(Math.PI);
  const cartLeftBooster = new THREE.Mesh(cartBoosterGeo, outerThrusterMat);
  cartLeftBooster.position.set(-0.28, 0.15, 0.65);
  const cartRightBooster = new THREE.Mesh(cartBoosterGeo, outerThrusterMat);
  cartRightBooster.position.set(0.28, 0.15, 0.65);
  cartGroup.add(cartLeftBooster, cartRightBooster);
  cartLeftBooster.visible = false;
  cartRightBooster.visible = false;

  // 2. Thick 3D Supersonic Speedlines (aerodynamic, sleek, non-intrusive)
  const speedlineGeo = new THREE.CylinderGeometry(0.04, 0.04, 7.0, 6);
  speedlineGeo.rotateX(Math.PI / 2);
  const speedlineMat = new THREE.MeshBasicMaterial({
    color: 0xe0f2fe,
    transparent: true,
    opacity: 0.16, // Clean and subtle
    depthWrite: false,
  });
  const speedlines: THREE.Mesh[] = [];
  for (let i = 0; i < 12; i++) {
    const sl = new THREE.Mesh(speedlineGeo, speedlineMat);
    flightDustGroup.add(sl);
    speedlines.push(sl);
  }

  // 3. Concentric Expanding Sonic Shockwave Rings (crisp, subtle)
  const sonicRings: THREE.Mesh[] = [];
  for (let i = 0; i < 5; i++) {
    const ringMesh = new THREE.Mesh(
      new THREE.TorusGeometry(1.1, 0.04, 8, 28),
      new THREE.MeshBasicMaterial({
        color: 0xf1f5f9,
        transparent: true,
        opacity: 0.10, // Transparent, non-blocking
        depthWrite: false,
      })
    );
    ringMesh.rotation.x = Math.PI / 2;
    flightDustGroup.add(ringMesh);
    sonicRings.push(ringMesh);
  }

  // 4. Subtle Dust Vortex Clouds
  const vortexDusts: THREE.Mesh[] = [];
  for (let i = 0; i < 16; i++) {
    const radius = 0.22 + (i % 4) * 0.05;
    const dustSphereGeo = new THREE.SphereGeometry(radius, 8, 8);
    const dMat = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? 0xffffff : 0xbae6fd,
      transparent: true,
      opacity: 0.04, // Very soft translucent wisps
      depthWrite: false,
    });
    const dMesh = new THREE.Mesh(dustSphereGeo, dMat);
    flightDustGroup.add(dMesh);
    vortexDusts.push(dMesh);
  }

  // 5. Road-Skimming Ground Dust Rooster-Tail Puffs
  const groundRoosterPuffs: THREE.Mesh[] = [];
  for (let i = 0; i < 6; i++) {
    const rGeo = new THREE.SphereGeometry(0.3 + (i % 2) * 0.08, 8, 8);
    const rMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
    });
    const rMesh = new THREE.Mesh(rGeo, rMat);
    flightDustGroup.add(rMesh);
    groundRoosterPuffs.push(rMesh);
  }

  // ==========================================
  // 7F. ATHLETIC POWERSLIDE FRICTION SPARKS & SMOKE
  // User: "perbagus juga animasi slidenya jangan pakai posisi baring untuk slidenya"
  // ==========================================
  const slideEffectsGroup = new THREE.Group();
  slideEffectsGroup.visible = false;
  root.add(slideEffectsGroup);

  // 14 Glowing friction sparks flying backward from soles & plant hand
  const slideSparks: THREE.Mesh[] = [];
  const sparkGeoSlide = new THREE.SphereGeometry(0.08, 8, 8);
  const sparkMatGold = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
  const sparkMatOrange = new THREE.MeshBasicMaterial({ color: 0xf97316 });
  const sparkMatWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (let i = 0; i < 14; i++) {
    const mat = i % 3 === 0 ? sparkMatWhite : i % 3 === 1 ? sparkMatGold : sparkMatOrange;
    const spk = new THREE.Mesh(sparkGeoSlide, mat);
    slideEffectsGroup.add(spk);
    slideSparks.push(spk);
  }

  // 8 Billowing road smoke puffs
  const slideSmokePuffs: THREE.Mesh[] = [];
  for (let i = 0; i < 8; i++) {
    const smk = new THREE.Mesh(
      new THREE.SphereGeometry(0.26 + (i % 3) * 0.10, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xf1f5f9, transparent: true, opacity: 0.55, depthWrite: false })
    );
    slideEffectsGroup.add(smk);
    slideSmokePuffs.push(smk);
  }

  // Hoverboard (kept for compatibility)
  const hoverboard = new THREE.Group();
  hoverboard.visible = false;
  root.add(hoverboard);

  // ==========================================
  // 8. ANIMATION CONTROLLER
  // ==========================================
  const updateAnimation = (
    runPhase: number,
    isJumping: boolean,
    isSliding: boolean,
    stackCount: number,
    hasShield: boolean,
    hndGuardSpinProgress: number = 0,
    elapsedTime: number = 0,
    hndExpressSpinProgress: number = 0,
    isFlying: boolean = false
  ) => {
    // 1. HND GUARD Spin & Jump Activation
    if (hndGuardSpinProgress > 0 && hndGuardSpinProgress < 1) {
      const spinAngle = hndGuardSpinProgress * Math.PI * 4;
      bodyGroup.rotation.y = spinAngle;
      bodyGroup.position.y = Math.sin(hndGuardSpinProgress * Math.PI) * 2.2;

      hndGuardBanner.visible = true;
      hndGuardBanner.position.set(bodyGroup.position.x, bodyGroup.position.y + 2.85, bodyGroup.position.z);
      const bannerScale = Math.sin(hndGuardSpinProgress * Math.PI) * 1.25;
      hndGuardBanner.scale.set(bannerScale, bannerScale, bannerScale);

      leftArm.rotation.x = -2.2;
      rightArm.rotation.x = -2.2;
      cape.visible = false;
      lightningGroup.visible = false;
      flightDustGroup.visible = false;
      leftOuterThruster.visible = false;
      leftInnerThruster.visible = false;
      rightOuterThruster.visible = false;
      rightInnerThruster.visible = false;
      cartLeftBooster.visible = false;
      cartRightBooster.visible = false;
      fistAura.visible = false;
      hndExpressBanner.visible = false;
      slideEffectsGroup.visible = false;
      return;
    } else {
      hndGuardBanner.visible = false;
    }

    // 1B. HND EXPRES Spin & Takeoff Activation
    // User: "lompat lalu berputarlalu terbang dan muncul tulisann HND EXPRES"
    if (hndExpressSpinProgress > 0 && hndExpressSpinProgress < 1) {
      const spinAngle = hndExpressSpinProgress * Math.PI * 4;
      bodyGroup.rotation.y = spinAngle;
      bodyGroup.position.y = Math.sin(hndExpressSpinProgress * Math.PI) * 2.5;

      hndExpressBanner.visible = true;
      hndExpressBanner.position.set(bodyGroup.position.x, bodyGroup.position.y + 2.95, bodyGroup.position.z);
      const bannerScale = Math.sin(hndExpressSpinProgress * Math.PI) * 1.35;
      hndExpressBanner.scale.set(bannerScale, bannerScale, bannerScale);

      leftArm.rotation.x = -2.4;
      rightArm.rotation.x = -2.4;
      cape.visible = true;
      lightningGroup.visible = true;
      flightDustGroup.visible = true;
      leftOuterThruster.visible = true;
      rightOuterThruster.visible = true;
      fistAura.visible = true;
      electricLight.intensity = 5.0;
      slideEffectsGroup.visible = false;
      return;
    } else {
      hndExpressBanner.visible = false;
    }

    // 2. Shield Orbiting Perisai Animation
    shieldOrbitGroup.visible = hasShield;
    if (hasShield) {
      shieldOrbitGroup.position.copy(bodyGroup.position);
      forcefieldBubble.rotation.y += 0.02;
      forcefieldBubble.scale.setScalar(1.0 + Math.sin(elapsedTime * 6) * 0.04);

      const orbitRadius = 1.32;
      orbitingShields.forEach((shield, idx) => {
        const angle = elapsedTime * 3.4 + idx * ((Math.PI * 2) / 3);
        const sx = Math.cos(angle) * orbitRadius;
        const sz = Math.sin(angle) * orbitRadius;
        shield.position.set(sx, 1.25 + Math.sin(angle * 2) * 0.12, sz);
        shield.rotation.y = -angle + Math.PI / 2;
      });
    }

    // 3. SUPERHERO FLIGHT ANIMATION (HND EXPRES SPEED BOOST)
    // User: "perbaiki lagi animasi terbangnya masih jelrek efeknya kurang tebal"
    if (isFlying) {
      slideEffectsGroup.visible = false;
      bodyGroup.rotation.y = 0;
      cape.visible = true;
      lightningGroup.visible = true;
      flightDustGroup.visible = true;
      leftOuterThruster.visible = true;
      leftInnerThruster.visible = true;
      rightOuterThruster.visible = true;
      rightInnerThruster.visible = true;
      cartLeftBooster.visible = true;
      cartRightBooster.visible = true;
      fistAura.visible = true;

      // Pulse rocket thruster plumes with supersonic shock diamonds
      const thrusterScale = 1.0 + Math.sin(elapsedTime * 40) * 0.2; // Toned down thruster pulse
      leftOuterThruster.scale.set(1.1, thrusterScale * 1.1, 1.1);
      leftInnerThruster.scale.set(1.0, thrusterScale * 1.0, 1.0);
      rightOuterThruster.scale.set(1.1, thrusterScale * 1.1, 1.1);
      rightInnerThruster.scale.set(1.0, thrusterScale * 1.0, 1.0);
      cartLeftBooster.scale.set(1.0, thrusterScale * 1.1, 1.0);
      cartRightBooster.scale.set(1.0, thrusterScale * 1.1, 1.0);

      // Flickering dynamic lightning light - reduced intensity
      electricLight.intensity = 1.2 + Math.sin(elapsedTime * 40) * 0.4 + Math.cos(elapsedTime * 20) * 0.2;

      // Fist energy aura pulsation - reduced intensity
      fistAura.scale.setScalar(1.0 + Math.sin(elapsedTime * 20) * 0.08);

      // A. Dynamic Majestic Superhero Cape Billowing Simulation
      const posAttr = capeGeom.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < posAttr.count; i++) {
        const ox = capeOrigPositions[i * 3];
        const oy = capeOrigPositions[i * 3 + 1];
        const distFromShoulder = Math.abs(oy);
        // Multi-octave supersonic airflow ripples
        const waveZ = (Math.sin(elapsedTime * 30 + oy * 6) * 0.3 + Math.cos(elapsedTime * 20 + ox * 7) * 0.15) * distFromShoulder;
        const flapX = (Math.cos(elapsedTime * 22 + oy * 5) * 0.15) * distFromShoulder;
        posAttr.setXYZ(i, ox + flapX, oy, -distFromShoulder * 0.82 + waveZ);
      }
      posAttr.needsUpdate = true;
      capeGeom.computeVertexNormals();

      // B. Thick 3D Volumetric Lightning Arcs
      lightningGroup.position.copy(bodyGroup.position);

      // Gyro-spin electric rings
      electricRings[0].rotation.x += 0.05;
      electricRings[0].rotation.y += 0.03;
      electricRings[1].rotation.y += 0.06;
      electricRings[1].rotation.z += 0.04;
      electricRings[2].rotation.z += 0.05;
      electricRings[2].rotation.x += 0.04;


      // C. Supersonic Jet Speedlines
      speedlines.forEach((sl, idx) => {
        const speedPhase = ((elapsedTime * 6.0 + idx * 0.065) % 1.0);
        const angle = (idx / 16) * Math.PI * 2;
        const rad = 2.2 + (idx % 3) * 0.5;
        sl.position.set(Math.cos(angle) * rad, 1.25 + Math.sin(angle) * 0.6, 1.2 + speedPhase * 7.5);
        sl.scale.set(0.7, 0.7, 1.0 + (1 - speedPhase) * 0.5);
        (sl.material as THREE.MeshBasicMaterial).opacity = Math.sin(speedPhase * Math.PI) * 0.15;
      });

      // D. Sonic Shockwave Rings
      sonicRings.forEach((ring, idx) => {
        const ringPhase = ((elapsedTime * 4.2 + idx * 0.16) % 1.0);
        ring.position.set(0, 0.4, 0.8 + ringPhase * 4.5);
        ring.scale.setScalar(0.8 + ringPhase * 1.5);
        (ring.material as THREE.MeshBasicMaterial).opacity = (1 - ringPhase) * 0.15;
      });

      // E. Billowing Dust Vortex Wake
      vortexDusts.forEach((vd, idx) => {
        const vAngle = elapsedTime * 8 + idx * ((Math.PI * 2) / 32);
        const vRadius = 1.35 + (idx / 32) * 1.6;
        const vZ = 0.8 + idx * 0.22;
        vd.position.set(Math.cos(vAngle) * vRadius, 1.2 + Math.sin(vAngle) * 0.65, vZ);
        vd.scale.setScalar(1.0 + Math.sin(elapsedTime * 14 + idx) * 0.2);
        (vd.material as THREE.MeshBasicMaterial).opacity = Math.max(0.04, 0.12 - (idx / 32) * 0.1);
      });

      // F. Road-Skimming Ground Dust Rooster-Tail
      groundRoosterPuffs.forEach((gp, idx) => {
        const gPhase = ((elapsedTime * 6.5 + idx * 0.1) % 1.0);
        gp.position.set(
          (Math.sin(idx * 4) * 0.65),
          -2.2 + gPhase * 0.4,
          1.2 + gPhase * 4.2
        );
        gp.scale.setScalar(0.8 + gPhase * 1.2);
        (gp.material as THREE.MeshBasicMaterial).opacity = (1 - gPhase) * 0.15;
      });

      // G. Heroic Supersonic Superhero Flying Posture (Cutting through the air like Superman!)
      bodyGroup.scale.set(1, 1, 1);
      bodyGroup.rotation.x = -1.18; // Sleek supersonic forward flight angle (~68 degrees horizontal)
      bodyGroup.rotation.z = Math.sin(elapsedTime * 4.5) * 0.12; // Banking roll
      torso.position.y = 1.25;
      headGroup.position.y = 1.95;
      headGroup.rotation.x = 1.08; // Head lifted heroically looking directly ahead down the road

      // Leading Superman Punch Arm
      rightArm.rotation.x = -3.05;
      rightArm.rotation.z = 0.08;

      // Aerodynamic Stabilizing Arm
      leftArm.rotation.x = -1.75;
      leftArm.rotation.z = -0.25;

      // Legs streamlined straight backwards together like a rocket torpedo
      leftLeg.position.set(-0.20, 0.72, 0);
      rightLeg.position.set(0.20, 0.72, 0);
      leftLeg.rotation.x = 1.12;
      rightLeg.rotation.x = 1.12;

      // Cart nestled as an aerodynamic booster backpack on the courier's back
      cartGroup.position.set(0, 1.15, 0.38);
      cartGroup.rotation.x = -0.95;
      return;
    } else {
      cape.visible = false;
      lightningGroup.visible = false;
      flightDustGroup.visible = false;
      leftOuterThruster.visible = false;
      leftInnerThruster.visible = false;
      rightOuterThruster.visible = false;
      rightInnerThruster.visible = false;
      cartLeftBooster.visible = false;
      cartRightBooster.visible = false;
      fistAura.visible = false;
    }

    bodyGroup.rotation.y = 0;

    // 4. ATHLETIC PARKOUR KNEE-SKID SLIDE (BUKAN POSISI BARING!)
    // User: "perbagus juga animasi slidenya jangan pakai posisi baring untuk slidenya"
    if (isSliding) {
      bodyGroup.scale.set(1, 1, 1);
      slideEffectsGroup.visible = true;

      // Athletic parkour crouch: body is lowered but LEANS FORWARD aggressively (NOT tilted backward!)
      torso.position.y = 0.65;
      bodyGroup.rotation.x = -0.34; // Aggressive forward tilt over the knees!
      bodyGroup.rotation.z = -0.16; // Stylish drift banking angle

      // Head is held high and alert, looking laser-sharp forward
      headGroup.position.y = 1.42;
      headGroup.rotation.x = 0.35;

      // Left leg tucked under the hips in an athletic knee-skid
      leftLeg.position.set(-0.24, 0.42, -0.05);
      leftLeg.rotation.x = 0.48;
      leftLeg.rotation.z = -0.18;

      // Right leg bent and extended forward in controlled heel-powerslide
      rightLeg.position.set(0.26, 0.46, 0.18);
      rightLeg.rotation.x = -0.42;
      rightLeg.rotation.z = 0.22;

      // Left arm brushing near the asphalt in an action-hero 3-point skid
      leftArm.rotation.x = 0.75;
      leftArm.rotation.z = -0.52;

      // Right arm holding cart handlebar securely
      rightArm.rotation.x = -0.72;
      rightArm.rotation.z = 0.15;

      // Cart tucked low alongside the courier in a tight drift
      cartGroup.position.set(0.06, 0.68, 0.38);
      cartGroup.rotation.x = -0.22;
      cartGroup.rotation.z = -0.12;

      // Animate road friction sparks shooting backward
      slideSparks.forEach((spk, idx) => {
        const p = ((elapsedTime * 9 + idx * 0.08) % 1.0);
        const originX = idx % 2 === 0 ? -0.24 : 0.26;
        spk.position.set(
          originX + (Math.sin(idx * 7) * 0.18),
          0.06 + Math.sin(p * Math.PI) * 0.25,
          -0.1 + p * 2.2
        );
        spk.scale.setScalar((1 - p) * 1.3);
      });

      // Animate road friction smoke billowing backward
      slideSmokePuffs.forEach((smk, idx) => {
        const p = ((elapsedTime * 5 + idx * 0.14) % 1.0);
        smk.position.set(
          (Math.sin(idx * 5) * 0.35),
          0.12 + p * 0.38,
          0.2 + p * 2.8
        );
        smk.scale.setScalar(0.8 + p * 2.2);
        (smk.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.55;
      });

      return;
    } else {
      slideEffectsGroup.visible = false;
    }

    // Reset leg positions when not sliding
    leftLeg.position.set(-0.24, 0.72, 0);
    rightLeg.position.set(0.24, 0.72, 0);
    bodyGroup.scale.set(1, 1, 1);

    // 5. Jumping Animation
    if (isJumping) {
      bodyGroup.rotation.x = -0.15;
      torso.position.y = 1.15;
      headGroup.position.y = 1.95;
      cartGroup.position.set(0, 1.18, 0.48);
      cartGroup.rotation.x = 0.08;
      leftArm.rotation.x = -0.4;
      rightArm.rotation.x = -0.4;
      leftLeg.rotation.x = 0.45;
      rightLeg.rotation.x = -0.3;
      return;
    }

    // 6. Normal Energetic Running Animation (More realistic gait)
    const runBounce = Math.sin(runPhase * 2) * 0.03; 
    torso.position.y = 1.15 + Math.abs(runBounce * 0.4);
    headGroup.position.y = 1.95 + Math.abs(runBounce * 0.1);

    // Dynamic athletic forward lean that increases with speed
    bodyGroup.rotation.x = 0.15 + Math.sin(runPhase * 2) * 0.01; 
    bodyGroup.rotation.z = Math.sin(runPhase) * 0.03;

    // Cart bobs more naturally
    cartGroup.position.set(0, 1.15 + Math.abs(runBounce * 0.2), 0.48);
    cartGroup.rotation.z = -Math.sin(runPhase) * 0.02;
    cartGroup.rotation.x = 0.02 + Math.sin(runPhase * 2) * 0.02;

    // Enhanced sprint arm/leg movement for realism
    const armSwing = Math.sin(runPhase) * 0.35; // Increased arm swing range
    leftArm.rotation.x = -0.25 + armSwing;
    rightArm.rotation.x = -0.25 - armSwing;

    // More distinct swing and stance phases for legs
    const legSwing = Math.sin(runPhase) * 1.2; // Increased leg swing range
    leftLeg.rotation.x = -legSwing;
    rightLeg.rotation.x = legSwing;
    
    // Slight knee bend simulation during stance
    leftLeg.rotation.z = runPhase > 0 ? -0.1 : 0.1;
    rightLeg.rotation.z = runPhase > 0 ? 0.1 : -0.1;

    // Package stack spring bounce & inertia sway
    const stackSway = Math.sin(runPhase * 2) * 0.06;
    packageStackGroup.rotation.z = stackSway;
    packageStackGroup.rotation.x = -0.05 + Math.abs(Math.sin(runPhase * 2)) * 0.03;
    packageStackGroup.position.y = 0.48 + Math.abs(Math.sin(runPhase * 4)) * 0.035;
  };

  const updateSkin = (newSkin: CourierSkin) => {
    suitMat.color.set(newSkin.jacketColor);
    helmet.material = suitMat;
  };

  return {
    root,
    bodyGroup,
    headGroup,
    head: helmet,
    helmet,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    cartGroup,
    packageStackGroup,
    shieldOrbitGroup,
    hndGuardBanner,
    hndExpressBanner,
    cape,
    lightningGroup,
    flightDustGroup,
    slideEffectsGroup,
    hoverboard,
    updateAnimation,
    updateSkin,
  };
}

/**
 * Rebuild stack of packages INSIDE the 3D shopping cart (Keranjang Belanja)
 */
export function syncPackageStack(stackGroup: THREE.Group, count: number) {
  console.log('syncPackageStack called, count:', count);
  // Clear existing
  while (stackGroup.children.length > 0) {
    stackGroup.remove(stackGroup.children[0]);
  }

  const displayCount = Math.min(count, 10); // Display up to 10 packages in the shopping cart
  console.log('displayCount:', displayCount);

  // Precise positions inside and stacked on the shopping cart bed
  // Increased size of boxes to make them more visible
  const slotLayouts = [
    { x: 0.0, y: 0.0, z: 0.0, rx: 0.0, ry: 0.0, w: 0.50, h: 0.25, d: 0.42 },
    { x: 0.0, y: 0.23, z: 0.0, rx: 0.0, ry: 0.02, w: 0.48, h: 0.24, d: 0.40 },
    { x: 0.0, y: 0.45, z: 0.0, rx: 0.0, ry: -0.02, w: 0.45, h: 0.22, d: 0.38 },
    { x: 0.0, y: 0.65, z: 0.0, rx: 0.0, ry: 0.04, w: 0.42, h: 0.22, d: 0.35 },
    { x: 0.0, y: 0.84, z: 0.0, rx: 0.0, ry: -0.03, w: 0.38, h: 0.20, d: 0.32 },
    { x: 0.0, y: 1.01, z: 0.0, rx: 0.0, ry: 0.01, w: 0.35, h: 0.18, d: 0.30 },
    { x: 0.0, y: 1.17, z: 0.0, rx: 0.0, ry: 0.02, w: 0.32, h: 0.18, d: 0.28 },
    { x: 0.0, y: 1.32, z: 0.0, rx: 0.0, ry: -0.01, w: 0.30, h: 0.16, d: 0.25 },
    { x: 0.0, y: 1.46, z: 0.0, rx: 0.0, ry: 0.02, w: 0.28, h: 0.15, d: 0.22 },
    { x: 0.0, y: 1.59, z: 0.0, rx: 0.0, ry: 0.0, w: 0.25, h: 0.14, d: 0.20 },
  ];

  for (let i = 0; i < displayCount; i++) {
    const p = slotLayouts[i] || { x: 0, y: 0.18 * i, z: 0, rx: 0, ry: 0, w: 0.34, h: 0.2, d: 0.26 };
    const isGold = i % 3 === 2;
    const boxGeom = new THREE.BoxGeometry(p.w, p.h, p.d);
    const boxMesh = new THREE.Mesh(boxGeom, isGold ? goldMat : cardboardMat);
    boxMesh.castShadow = true;

    boxMesh.position.set(p.x, p.y, p.z);
    boxMesh.rotation.set(p.rx, p.ry, i % 2 === 0 ? 0.02 : -0.02);

    // Label with HND branding
    const labelGeom = new THREE.PlaneGeometry(p.w * 0.72, p.d * 0.72);
    const labelMat = new THREE.MeshStandardMaterial({
      map: isGold ? goldLabelTex : standardLabelTex,
      roughness: 0.4,
    });
    const labelMesh = new THREE.Mesh(labelGeom, labelMat);
    labelMesh.position.set(0, p.h / 2 + 0.005, 0);
    labelMesh.rotation.x = -Math.PI / 2;
    boxMesh.add(labelMesh);

    // Tape strap
    const tapeGeom = new THREE.BoxGeometry(p.w * 1.01, p.h * 1.01, 0.05);
    const tapeMesh = new THREE.Mesh(tapeGeom, tapeMat);
    boxMesh.add(tapeMesh);

    stackGroup.add(boxMesh);
  }
}

