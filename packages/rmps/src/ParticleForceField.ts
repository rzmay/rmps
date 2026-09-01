import * as THREE from 'three';
import Particle from './Particle';
import { IParticleForceField } from './interfaces/IParticleForceField';
import { DynamicValue } from './types/DynamicValue';
import evaluateDynamicNumber from './helpers/evaluateDynamicNumber';
import evaluateDynamicVector from './helpers/evaluateDynamicVector3';

export type ForceFieldShape = 'sphere' | 'box';

export interface ForceFieldOptions {
    position: THREE.Vector3;
    direction?: DynamicValue<THREE.Vector3>;
    gravity?: DynamicValue<number>;
    rotationSpeed?: DynamicValue<number>;
    rotationAttraction?: DynamicValue<number>;
    drag?: DynamicValue<number>;
    radius?: number;
    shape?: ForceFieldShape;
    size?: THREE.Vector3;
}

class ParticleForceField implements IParticleForceField {
    position: THREE.Vector3;

    direction?: DynamicValue<THREE.Vector3>;

    gravity?: DynamicValue<number>;

    rotationSpeed?: DynamicValue<number>;

    rotationAttraction?: DynamicValue<number>;

    drag?: DynamicValue<number>;

    radius?: number;

    shape: ForceFieldShape;

    size: THREE.Vector3;

    constructor(options: ForceFieldOptions) {
      this.position = options.position.clone();
      this.direction = options.direction;
      this.gravity = options.gravity;
      this.rotationSpeed = options.rotationSpeed;
      this.rotationAttraction = options.rotationAttraction;
      this.drag = options.drag;
      this.radius = options.radius;
      this.shape = options.shape ?? 'sphere';
      this.size = options.size?.clone() ?? new THREE.Vector3(
        (options.radius ?? 1) * 2,
        (options.radius ?? 1) * 2,
        (options.radius ?? 1) * 2,
      );
    }

    getForce(particle: Particle): THREE.Vector3 {
      if (!this.contains(particle.position)) return new THREE.Vector3();

      const { time } = particle;
      const force = new THREE.Vector3();
      const toCenter = this.position.clone().sub(particle.position);
      const distanceSq = toCenter.lengthSq();

      if (this.direction !== undefined) {
        force.add(evaluateDynamicVector(this.direction, time));
      }

      if (this.gravity !== undefined && distanceSq > 0) {
        force.add(toCenter.clone().normalize().multiplyScalar(evaluateDynamicNumber(this.gravity, time)));
      }

      if (this.rotationSpeed !== undefined && distanceSq > 0) {
        const rotationAxis = new THREE.Vector3(0, 1, 0);
        const fromCenter = particle.position.clone().sub(this.position);
        const tangent = rotationAxis.cross(fromCenter).normalize();

        force.add(tangent.multiplyScalar(evaluateDynamicNumber(this.rotationSpeed, time)));
      }

      if (this.rotationAttraction !== undefined && distanceSq > 0) {
        force.add(toCenter.clone().normalize().multiplyScalar(
          evaluateDynamicNumber(this.rotationAttraction, time),
        ));
      }

      if (this.drag !== undefined) {
        force.addScaledVector(particle.velocity, -evaluateDynamicNumber(this.drag, time));
      }

      return force.multiplyScalar(this.getFalloff(particle.position));
    }

    private contains(position: THREE.Vector3): boolean {
      if (this.shape === 'box') {
        const local = position.clone().sub(this.position);
        const halfSize = this.size.clone().multiplyScalar(0.5);

        return Math.abs(local.x) <= halfSize.x
          && Math.abs(local.y) <= halfSize.y
          && Math.abs(local.z) <= halfSize.z;
      }

      return position.distanceToSquared(this.position) <= this.getSphereRadius() ** 2;
    }

    private getFalloff(position: THREE.Vector3): number {
      if (this.shape === 'box') return 1;

      const radius = this.getSphereRadius();
      if (radius <= 0) return 0;

      return 1 - Math.min(position.distanceTo(this.position) / radius, 1);
    }

    private getSphereRadius(): number {
      return this.radius ?? Math.max(this.size.x, this.size.y, this.size.z) * 0.5;
    }
}

export default ParticleForceField;
