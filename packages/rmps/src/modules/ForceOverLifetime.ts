import * as THREE from 'three';
import Module from '../Module';
import Particle from '../Particle';
import { DynamicValue } from '../types/DynamicValue';
import evaluateDynamicVector from '../helpers/evaluateDynamicVector3';

export interface ForceOverLifetimeOptions {
    force: DynamicValue<THREE.Vector3>;
}

class ForceOverLifetime extends Module {
  constructor(public options: ForceOverLifetimeOptions) {
    super((particle: Particle) => {
      particle.acceleration = particle.start.acceleration.clone()
        .add(evaluateDynamicVector(this.options.force, particle.time, particle.id));
    });
  }
}

export default ForceOverLifetime;
