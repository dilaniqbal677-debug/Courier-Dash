/**
 * Toko Delivery Destination Station (Official HND Computer Storefront)
 */
import * as THREE from 'three';
import { TokoTarget } from '../constants';
import {
  hndBuildingFacadeTex,
  hndPapanJalanTex,
  hndGroundDropTex,
} from './textures';
import { curbMat } from './shared';

export function createTokoStation(toko: TokoTarget): THREE.Group {
  const group = new THREE.Group();
  group.name = 'toko_station';

  const pillarGeom = new THREE.BoxGeometry(0.8, 6.4, 0.8);
  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.5,
    metalness: 0.5,
  });

  const lPillar = new THREE.Mesh(pillarGeom, pillarMat);
  lPillar.position.set(-4.9, 3.2, 0);
  lPillar.castShadow = true;

  const rPillar = new THREE.Mesh(pillarGeom, pillarMat);
  rPillar.position.set(4.9, 3.2, 0);
  rPillar.castShadow = true;
  group.add(lPillar, rPillar);

  return group;
}
