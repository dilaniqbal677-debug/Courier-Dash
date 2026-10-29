import * as THREE from 'three';

export function createExplosion(color: number = 0xffa500, size: number = 1.0): THREE.Group {
  const group = new THREE.Group();
  group.name = 'explosion_particles';

  // Shared spark geometry & lightweight flash
  const sparkGeo = new THREE.SphereGeometry(0.12 * size, 6, 6);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
  
  for (let i = 0; i < 10; i++) {
    const spark = new THREE.Mesh(sparkGeo, mat);
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 0.4 + 0.15;
    // Store velocity in userData for updateAnimation
    (spark.userData as any).velocity = new THREE.Vector3(
      Math.cos(angle) * speed,
      (Math.random() - 0.5) * 0.4,
      Math.sin(angle) * speed
    );
    group.add(spark);
  }

  // Add a subtle central glow flash (Zero PointLight overhead)
  const flash = new THREE.Mesh(
    new THREE.SphereGeometry(0.35 * size, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 })
  );
  group.add(flash);

  (group.userData as any).timer = 0;
  
  (group.userData as any).update = (delta: number) => {
    (group.userData as any).timer += delta;
    
    // Expand sparks
    group.children.forEach((child) => {
      const velocity = (child as THREE.Mesh).userData.velocity as THREE.Vector3;
      if (velocity) {
        child.position.add(velocity);
        child.scale.multiplyScalar(0.95);
      }
    });

    // Fade out flash
    flash.scale.multiplyScalar(0.9);
    (flash.material as THREE.MeshBasicMaterial).opacity -= delta * 2;
    
    return (group.userData as any).timer > 0.5; // Return true when expired
  };

  return group;
}
