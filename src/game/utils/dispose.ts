import * as THREE from 'three';

/**
 * Traverses an Object3D hierarchy and disposes all geometries and materials
 * that are safe to discard (avoiding memory leaks in GPU VRAM).
 */
export function safeDisposeObject(obj: THREE.Object3D) {
  obj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry && !(mesh.geometry as any).isGlobalSharedGeometry) {
        mesh.geometry.dispose();
      }
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => {
            if (mat && !(mat as any).isGlobalSharedMaterial) {
              mat.dispose();
            }
          });
        } else if (!(mesh.material as any).isGlobalSharedMaterial) {
          mesh.material.dispose();
        }
      }
    }
  });
}
