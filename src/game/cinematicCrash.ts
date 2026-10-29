/**
 * Cinematic Crash Choreography & Multi-Condition Physics Controller
 * Provides realistic, diverse collision animations tailored to what was hit and runner state:
 * 
 * 1. 'trip_hurdle': Low barrier trip -> stumble forward, hands brace against asphalt, knees flex
 * 2. 'overhead_impact': Overhead gantry sign -> head/upper recoil backward, arms reflex to helmet, seated slide
 * 3. 'vehicle_impact': Delivery truck/van -> frontal high-inertia impact, cross-guard reflex, asphalt skid
 * 4. 'boss_blast': Boss missile/laser -> lateral shockwave blast, sideways skid towards road shoulder
 * 5. 'midair_fall': Mid-air hurdle hit -> mid-air loss of momentum, staged angular landing
 */

import * as THREE from 'three';
import { CourierRig } from './models';

export type CrashType =
  | 'trip_hurdle'
  | 'overhead_impact'
  | 'vehicle_impact'
  | 'boss_blast'
  | 'midair_fall';

export interface CinematicCrashState {
  active: boolean;
  timer: number;
  totalDuration: number;
  crashType: CrashType;
  initialCourierZ: number;
  initialCourierX: number;
  initialCourierY: number;
  originalRotX: number;
  originalRotY: number;
  originalRotZ: number;
  skidDistance: number;
  impactSide: number; // -1 for left, 1 for right
}

export function createCinematicCrashState(): CinematicCrashState {
  return {
    active: false,
    timer: 0,
    totalDuration: 1.25,
    crashType: 'vehicle_impact',
    initialCourierZ: 0,
    initialCourierX: 0,
    initialCourierY: 0,
    originalRotX: 0,
    originalRotY: 0,
    originalRotZ: 0,
    skidDistance: 0,
    impactSide: 1,
  };
}

export function triggerCinematicCrash(
  state: CinematicCrashState,
  courierRig: CourierRig,
  courierZ: number,
  currentX: number,
  currentY: number,
  effectiveSpeed: number,
  crashType: CrashType = 'vehicle_impact'
) {
  state.active = true;
  state.crashType = crashType;
  state.totalDuration = crashType === 'vehicle_impact' ? 1.35 : crashType === 'boss_blast' ? 1.3 : 1.2;
  state.timer = state.totalDuration;
  state.initialCourierZ = courierZ;
  state.initialCourierX = currentX;
  state.initialCourierY = currentY;
  state.originalRotX = courierRig.root.rotation.x;
  state.originalRotY = courierRig.root.rotation.y;
  state.originalRotZ = courierRig.root.rotation.z;
  state.impactSide = currentX >= 0 ? 1 : -1;

  // Realistic inertia distance based on crash type and run velocity
  if (crashType === 'vehicle_impact') {
    state.skidDistance = Math.min(2.4, Math.max(1.4, effectiveSpeed * 0.11));
  } else if (crashType === 'trip_hurdle') {
    state.skidDistance = Math.min(1.8, Math.max(1.1, effectiveSpeed * 0.08));
  } else if (crashType === 'overhead_impact') {
    state.skidDistance = Math.min(1.5, Math.max(0.9, effectiveSpeed * 0.07));
  } else if (crashType === 'boss_blast') {
    state.skidDistance = Math.min(2.0, Math.max(1.3, effectiveSpeed * 0.09));
  } else {
    state.skidDistance = Math.min(1.6, Math.max(1.0, effectiveSpeed * 0.08));
  }
}

/**
 * Updates the cinematic crash sequence per frame.
 * Returns true when the cinematic sequence is complete.
 */
export function updateCinematicCrash(
  state: CinematicCrashState,
  delta: number,
  courierRig: CourierRig,
  camera: THREE.PerspectiveCamera,
  courierZ: number,
  currentX: number,
  currentY: number
): boolean {
  if (!state.active) return false;

  state.timer -= delta;
  const elapsed = state.totalDuration - state.timer;
  const progress = Math.min(1.0, Math.max(0, elapsed / state.totalDuration));

  // Natural slow-motion deceleration curves
  const easeOutCubic = 1 - Math.pow(1 - progress, 3);
  const slideProgress = Math.min(1.0, progress * 1.4);
  const slideEase = 1 - Math.pow(1 - slideProgress, 2);

  const side = state.impactSide;

  switch (state.crashType) {
    case 'trip_hurdle': {
      // 1. TRIP OVER LOW BARRIER:
      // Foot snags hurdle, character pitches forward (~38 deg) and lands onto knees with hands bracing the asphalt
      const targetTiltX = Math.PI * 0.22; // Pitch forward
      const targetTiltZ = -0.06 * side;

      courierRig.root.rotation.x = THREE.MathUtils.lerp(state.originalRotX, targetTiltX, slideEase);
      courierRig.root.rotation.y = THREE.MathUtils.lerp(courierRig.root.rotation.y, 0.04 * side, delta * 4);
      courierRig.root.rotation.z = THREE.MathUtils.lerp(state.originalRotZ, targetTiltZ, slideEase);

      // Slides forward slightly along road as feet catch
      const forwardOffset = slideEase * (state.skidDistance * 0.6);
      const curZ = state.initialCourierZ - forwardOffset;
      const restingY = 0.20;
      const charY = THREE.MathUtils.lerp(state.initialCourierY, restingY, slideEase);
      courierRig.root.position.set(state.initialCourierX, charY, curZ);

      // Arm bracing reflex: hands reach down and forward to catch the fall
      if (courierRig.leftArm && courierRig.rightArm) {
        courierRig.leftArm.rotation.x = THREE.MathUtils.lerp(courierRig.leftArm.rotation.x, -1.15, delta * 6);
        courierRig.leftArm.rotation.z = THREE.MathUtils.lerp(courierRig.leftArm.rotation.z, -0.32, delta * 6);
        courierRig.rightArm.rotation.x = THREE.MathUtils.lerp(courierRig.rightArm.rotation.x, -1.15, delta * 6);
        courierRig.rightArm.rotation.z = THREE.MathUtils.lerp(courierRig.rightArm.rotation.z, 0.32, delta * 6);
      }

      // Head lifts up slightly to look ahead from the road
      if (courierRig.headGroup) {
        courierRig.headGroup.rotation.x = THREE.MathUtils.lerp(courierRig.headGroup.rotation.x, 0.28, delta * 5);
      }

      // Legs: knees bent forward in a landing position
      if (courierRig.leftLeg && courierRig.rightLeg) {
        courierRig.leftLeg.rotation.x = THREE.MathUtils.lerp(courierRig.leftLeg.rotation.x, 0.65, delta * 6);
        courierRig.rightLeg.rotation.x = THREE.MathUtils.lerp(courierRig.rightLeg.rotation.x, -0.35, delta * 6);
      }

      // Packages spill forward along the asphalt
      if (courierRig.packageStackGroup) {
        courierRig.packageStackGroup.children.forEach((pkg, idx) => {
          const spreadDir = idx % 2 === 0 ? 0.35 : -0.35;
          pkg.position.x = THREE.MathUtils.lerp(pkg.position.x, spreadDir * (idx + 1) * 0.4, delta * 4);
          pkg.position.z = THREE.MathUtils.lerp(pkg.position.z, -(idx + 1) * 0.55, delta * 4);
          pkg.position.y = THREE.MathUtils.lerp(pkg.position.y, 0.08, delta * 5);
          pkg.rotation.x = THREE.MathUtils.lerp(pkg.rotation.x, -0.25, delta * 3);
          pkg.rotation.z = THREE.MathUtils.lerp(pkg.rotation.z, spreadDir * 0.2, delta * 3);
        });
      }

      // Camera: Low-angle front-quarter tracking dolly
      const targetCamX = state.initialCourierX + (side * 1.6);
      const targetCamY = 1.1;
      const targetCamZ = curZ - 3.0; // Ahead of player looking back
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 4.5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 4.0, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 4.0, delta);
      camera.lookAt(new THREE.Vector3(state.initialCourierX, 0.5, curZ));
      camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, 0, delta * 5);
      break;
    }

    case 'overhead_impact': {
      // 2. OVERHEAD HIGH SIGN IMPACT:
      // Head/helmet strikes upper gantry sign, forceful recoil backward, hands reflexively clutch helmet, slides into seated pose
      const targetTiltX = -Math.PI * 0.28; // Reclined back ~50 deg
      const targetTiltZ = 0.08 * side;

      courierRig.root.rotation.x = THREE.MathUtils.lerp(state.originalRotX, targetTiltX, slideEase);
      courierRig.root.rotation.y = THREE.MathUtils.lerp(courierRig.root.rotation.y, -0.06 * side, delta * 4);
      courierRig.root.rotation.z = THREE.MathUtils.lerp(state.originalRotZ, targetTiltZ, slideEase);

      // Recoil backward along Z
      const recoilOffset = (1 - slideEase) * (state.skidDistance * 0.7);
      const curZ = state.initialCourierZ + recoilOffset;
      const restingY = 0.28;
      const charY = THREE.MathUtils.lerp(state.initialCourierY, restingY, slideEase);
      courierRig.root.position.set(state.initialCourierX, charY, curZ);

      // Head snaps back from the impact
      if (courierRig.headGroup) {
        courierRig.headGroup.rotation.x = THREE.MathUtils.lerp(courierRig.headGroup.rotation.x, -0.42, delta * 7);
      }

      // Arms reflex: hands raise to helmet/head in protective reflex
      if (courierRig.leftArm && courierRig.rightArm) {
        courierRig.leftArm.rotation.x = THREE.MathUtils.lerp(courierRig.leftArm.rotation.x, -1.35, delta * 7);
        courierRig.leftArm.rotation.z = THREE.MathUtils.lerp(courierRig.leftArm.rotation.z, -0.55, delta * 7);
        courierRig.rightArm.rotation.x = THREE.MathUtils.lerp(courierRig.rightArm.rotation.x, -1.35, delta * 7);
        courierRig.rightArm.rotation.z = THREE.MathUtils.lerp(courierRig.rightArm.rotation.z, 0.55, delta * 7);
      }

      // Legs: splayed out seated posture
      if (courierRig.leftLeg && courierRig.rightLeg) {
        courierRig.leftLeg.rotation.x = THREE.MathUtils.lerp(courierRig.leftLeg.rotation.x, -0.4, delta * 5);
        courierRig.leftLeg.rotation.z = THREE.MathUtils.lerp(courierRig.leftLeg.rotation.z, -0.25, delta * 5);
        courierRig.rightLeg.rotation.x = THREE.MathUtils.lerp(courierRig.rightLeg.rotation.x, -0.4, delta * 5);
        courierRig.rightLeg.rotation.z = THREE.MathUtils.lerp(courierRig.rightLeg.rotation.z, 0.25, delta * 5);
      }

      // Packages tumble backward
      if (courierRig.packageStackGroup) {
        courierRig.packageStackGroup.children.forEach((pkg, idx) => {
          pkg.position.z = THREE.MathUtils.lerp(pkg.position.z, (idx + 1) * 0.5, delta * 4);
          pkg.position.y = THREE.MathUtils.lerp(pkg.position.y, 0.12, delta * 4);
          pkg.rotation.x = THREE.MathUtils.lerp(pkg.rotation.x, 0.35, delta * 3);
        });
      }

      // Camera: Upward tilted low-angle shot showing both the high sign and seated courier
      const targetCamX = state.initialCourierX + (side * 2.1);
      const targetCamY = 1.6;
      const targetCamZ = curZ + 2.5;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 4.5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 4.0, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 4.0, delta);
      camera.lookAt(new THREE.Vector3(state.initialCourierX, 1.1, curZ - 0.5));
      camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, 0, delta * 5);
      break;
    }

    case 'boss_blast': {
      // 3. BOSS EXPLOSIVE BLAST:
      // Lateral concussive shockwave sweeps courier sideways towards road verge, blast shielding arm gesture
      const targetTiltZ = -0.38 * side; // Heavy sideways tilt away from blast
      const targetTiltX = -Math.PI * 0.12;

      courierRig.root.rotation.x = THREE.MathUtils.lerp(state.originalRotX, targetTiltX, slideEase);
      courierRig.root.rotation.y = THREE.MathUtils.lerp(courierRig.root.rotation.y, 0.15 * side, delta * 4);
      courierRig.root.rotation.z = THREE.MathUtils.lerp(state.originalRotZ, targetTiltZ, slideEase);

      // Slide sideways towards curb/shoulder + slight recoil
      const lateralSkid = slideEase * (state.skidDistance * 0.55) * side;
      const recoilOffset = (1 - slideEase) * 0.5;
      const curX = THREE.MathUtils.clamp(state.initialCourierX + lateralSkid, -3.8, 3.8);
      const curZ = state.initialCourierZ + recoilOffset;
      const restingY = 0.22;
      const charY = THREE.MathUtils.lerp(state.initialCourierY, restingY, slideEase);
      courierRig.root.position.set(curX, charY, curZ);

      // Blast-shielding arm posture (arm nearest blast shields face, other arm supports body)
      if (courierRig.leftArm && courierRig.rightArm) {
        if (side > 0) {
          courierRig.rightArm.rotation.x = THREE.MathUtils.lerp(courierRig.rightArm.rotation.x, -0.9, delta * 6);
          courierRig.rightArm.rotation.z = THREE.MathUtils.lerp(courierRig.rightArm.rotation.z, 0.7, delta * 6);
          courierRig.leftArm.rotation.x = THREE.MathUtils.lerp(courierRig.leftArm.rotation.x, -0.4, delta * 6);
          courierRig.leftArm.rotation.z = THREE.MathUtils.lerp(courierRig.leftArm.rotation.z, -0.4, delta * 6);
        } else {
          courierRig.leftArm.rotation.x = THREE.MathUtils.lerp(courierRig.leftArm.rotation.x, -0.9, delta * 6);
          courierRig.leftArm.rotation.z = THREE.MathUtils.lerp(courierRig.leftArm.rotation.z, -0.7, delta * 6);
          courierRig.rightArm.rotation.x = THREE.MathUtils.lerp(courierRig.rightArm.rotation.x, -0.4, delta * 6);
          courierRig.rightArm.rotation.z = THREE.MathUtils.lerp(courierRig.rightArm.rotation.z, 0.4, delta * 6);
        }
      }

      // Head turns away from blast origin
      if (courierRig.headGroup) {
        courierRig.headGroup.rotation.y = THREE.MathUtils.lerp(courierRig.headGroup.rotation.y, -0.3 * side, delta * 5);
      }

      // Camera: Dramatic cinematic blast tracking angle
      const targetCamX = curX - (side * 2.2);
      const targetCamY = 1.3;
      const targetCamZ = curZ + 3.0;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 4.5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 4.0, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 4.0, delta);
      camera.lookAt(new THREE.Vector3(curX, 0.6, curZ));
      camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, 0.04 * side, delta * 4);
      break;
    }

    case 'midair_fall': {
      // 4. MID-AIR JUMP COLLISION:
      // Lost aerial stability, gradual gravity drag down to asphalt with staged landing
      const targetTiltX = 0.12;
      const targetTiltZ = 0.25 * side;

      courierRig.root.rotation.x = THREE.MathUtils.lerp(state.originalRotX, targetTiltX, slideEase);
      courierRig.root.rotation.z = THREE.MathUtils.lerp(state.originalRotZ, targetTiltZ, slideEase);

      const curZ = state.initialCourierZ + (1 - slideEase) * 0.4;
      const restingY = 0.24;
      const charY = THREE.MathUtils.lerp(state.initialCourierY, restingY, slideEase);
      courierRig.root.position.set(state.initialCourierX, charY, curZ);

      // Shock-absorbing flex
      if (courierRig.leftLeg && courierRig.rightLeg) {
        courierRig.leftLeg.rotation.x = THREE.MathUtils.lerp(courierRig.leftLeg.rotation.x, 0.5, delta * 5);
        courierRig.rightLeg.rotation.x = THREE.MathUtils.lerp(courierRig.rightLeg.rotation.x, 0.5, delta * 5);
      }
      if (courierRig.leftArm && courierRig.rightArm) {
        courierRig.leftArm.rotation.z = THREE.MathUtils.lerp(courierRig.leftArm.rotation.z, -0.5, delta * 5);
        courierRig.rightArm.rotation.z = THREE.MathUtils.lerp(courierRig.rightArm.rotation.z, 0.5, delta * 5);
      }

      // Camera: Smooth descending camera dolly
      const targetCamX = state.initialCourierX + (side * 1.8);
      const targetCamY = 1.25;
      const targetCamZ = curZ + 3.1;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 4.5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 4.0, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 4.0, delta);
      camera.lookAt(new THREE.Vector3(state.initialCourierX, 0.6, curZ));
      camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, 0, delta * 5);
      break;
    }

    case 'vehicle_impact':
    default: {
      // 5. FRONTAL VEHICLE COLLISION:
      // High-inertia direct impact, defensive cross-guard reflex, asphalt skid marks & backwards inertia slide
      const targetTiltX = -Math.PI * 0.20; // 35-degree natural stumble onto one knee
      const targetTiltZ = 0.10 * side;

      courierRig.root.rotation.x = THREE.MathUtils.lerp(state.originalRotX, targetTiltX, slideEase);
      courierRig.root.rotation.y = THREE.MathUtils.lerp(courierRig.root.rotation.y, 0.05 * side, delta * 3);
      courierRig.root.rotation.z = THREE.MathUtils.lerp(state.originalRotZ, targetTiltZ, slideEase);

      // Backwards inertia skid along road
      const recoilOffset = (1 - slideEase) * state.skidDistance;
      const curZ = state.initialCourierZ + recoilOffset;
      const restingY = 0.25;
      const charY = THREE.MathUtils.lerp(state.initialCourierY, restingY, slideEase);
      courierRig.root.position.set(state.initialCourierX, charY, curZ);

      // Defensive cross-guard reflex across chest
      if (courierRig.leftArm && courierRig.rightArm) {
        courierRig.leftArm.rotation.x = THREE.MathUtils.lerp(courierRig.leftArm.rotation.x, -0.65, delta * 6);
        courierRig.leftArm.rotation.y = THREE.MathUtils.lerp(courierRig.leftArm.rotation.y, 0.60, delta * 6);
        courierRig.rightArm.rotation.x = THREE.MathUtils.lerp(courierRig.rightArm.rotation.x, -0.65, delta * 6);
        courierRig.rightArm.rotation.y = THREE.MathUtils.lerp(courierRig.rightArm.rotation.y, -0.60, delta * 6);
      }

      // Head stumbles back slightly
      if (courierRig.headGroup) {
        courierRig.headGroup.rotation.x = THREE.MathUtils.lerp(courierRig.headGroup.rotation.x, -0.18, delta * 5);
      }

      // Packages displace and slide onto asphalt
      if (courierRig.packageStackGroup && courierRig.packageStackGroup.children.length > 0) {
        courierRig.packageStackGroup.children.forEach((pkg, idx) => {
          const spreadDir = idx % 2 === 0 ? 0.45 : -0.45;
          pkg.position.x = THREE.MathUtils.lerp(pkg.position.x, spreadDir * (idx + 1) * 0.38, delta * 3);
          pkg.position.z = THREE.MathUtils.lerp(pkg.position.z, (idx + 1) * 0.48, delta * 3);
          pkg.position.y = THREE.MathUtils.lerp(pkg.position.y, 0.1, delta * 4);
          pkg.rotation.x = THREE.MathUtils.lerp(pkg.rotation.x, 0.2, delta * 3);
          pkg.rotation.z = THREE.MathUtils.lerp(pkg.rotation.z, spreadDir * 0.3, delta * 3);
        });
      }

      // Dramatic cinematic Dutch-angle camera shot
      const targetCamX = state.initialCourierX + (side * 2.0);
      const targetCamY = 1.35;
      const targetCamZ = curZ + 3.2;

      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 4.5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 4.0, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 4.0, delta);
      camera.lookAt(new THREE.Vector3(state.initialCourierX, 0.6, curZ));
      camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, 0.05 * side, delta * 3);
      break;
    }
  }

  return state.timer <= 0;
}

export function resetCourierRigPose(courierRig: CourierRig) {
  courierRig.root.rotation.set(0, 0, 0);
  if (courierRig.bodyGroup) {
    courierRig.bodyGroup.rotation.set(0, 0, 0);
    courierRig.bodyGroup.position.set(0, 0, 0);
  }
  if (courierRig.cartGroup) {
    courierRig.cartGroup.position.set(0, 1.15, 0.48);
    courierRig.cartGroup.rotation.set(0, 0, 0);
  }
  if (courierRig.leftArm && courierRig.rightArm) {
    courierRig.leftArm.rotation.set(0, 0, 0);
    courierRig.rightArm.rotation.set(0, 0, 0);
  }
  if (courierRig.leftLeg && courierRig.rightLeg) {
    courierRig.leftLeg.rotation.set(0, 0, 0);
    courierRig.rightLeg.rotation.set(0, 0, 0);
  }
  if (courierRig.headGroup) {
    courierRig.headGroup.rotation.set(0, 0, 0);
  }
  if (courierRig.packageStackGroup) {
    courierRig.packageStackGroup.children.forEach((pkg, idx) => {
      pkg.position.set(0, idx * 0.28, 0);
      pkg.rotation.set(0, 0, 0);
    });
  }
}
