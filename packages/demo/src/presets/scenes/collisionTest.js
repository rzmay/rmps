import * as THREE from 'three';
import createCollisionObjects from './createCollisionObjects';

export default async function createCollisionTest(scene) {
  const objects = createCollisionObjects();

  scene.add(objects.group);

  const clock = new THREE.Clock();
  let frameId;

  const animate = () => {
    const time = clock.getElapsedTime();

    objects.movingBox.position.x = Math.sin(time) * 2;
    objects.movingBox.position.y = 1;
    objects.movingBox.rotation.y = time * 0.75;

    frameId = requestAnimationFrame(animate);
  };

  animate();

  return () => {
    cancelAnimationFrame(frameId);

    objects.group.removeFromParent();

    objects.group.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;

      object.geometry.dispose();

      if (Array.isArray(object.material)) {
        object.material.forEach((material) => material.dispose());
      }
      else {
        object.material.dispose();
      }
    });
  };
}
