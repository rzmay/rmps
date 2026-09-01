import * as THREE from 'three';
import Module from '../Module';
import Particle from '../Particle';
import { DynamicValue } from '../types/DynamicValue';
import evaluateDynamicVector from '../helpers/evaluateDynamicVector3';

export interface SizeOverLifetimeOptions {
    size: DynamicValue<THREE.Vector3>;
}

class SizeOverLifetime extends Module {
  constructor(public options: SizeOverLifetimeOptions) {
    super((particle: Particle) => {
      particle.scale = particle.start.scale.clone().multiply(evaluateDynamicVector(this.options.size, particle.time, particle.id));
    });
  }
}

export default SizeOverLifetime;
