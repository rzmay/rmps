import { nanoid } from 'nanoid';
import * as THREE from 'three';

class Particle {
    position: THREE.Vector3;

    rotation: THREE.Vector3;

    scale: THREE.Vector3;

    velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    angularVelocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    scalarVelocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    acceleration: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    angularAcceleration: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    scalarAcceleration: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    speed = 1;

    color: THREE.Color;

    alpha: number;

    startTime: number;

    lifetime: number;

    id: string;

    constructor(
      position: THREE.Vector3,
      rotation: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
      scale: THREE.Vector3 = new THREE.Vector3(1, 1, 1),
      color: THREE.Color = new THREE.Color(0xffffff),
      alpha = 1,
      lifetime = 5,
    ) {
      this.position = position;
      this.rotation = rotation;
      this.scale = scale;
      this.color = color;
      this.alpha = alpha;

      this.startTime = Date.now();
      this.lifetime = lifetime;

      this.id = nanoid();
    }

    update(deltaTime: number) {
      // Update velocities
      this.velocity.addScaledVector(this.acceleration, deltaTime * this.speed);
      this.angularVelocity.addScaledVector(this.angularAcceleration, deltaTime * this.speed);
      this.scalarVelocity.addScaledVector(this.scalarAcceleration, deltaTime * this.speed);

      // Update transform
      this.position.addScaledVector(this.velocity, deltaTime * this.speed);
      this.rotation.addScaledVector(this.angularVelocity, deltaTime * this.speed);
      this.scale.addScaledVector(this.scalarVelocity, deltaTime * this.speed);
    }
}

export default Particle;
