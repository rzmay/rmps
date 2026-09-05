import * as THREE from 'three';
import Module from '../Module';
import Particle from '../Particle';
import { DynamicValue } from '../types/DynamicValue';
import evaluateDynamicVector from '../helpers/evaluateDynamicVector3';

export interface ScaleOverLifetimeOptions {
    scale: DynamicValue<THREE.Vector3>;
}

class ScaleOverLifetime extends Module {
  constructor(public options: ScaleOverLifetimeOptions) {
    super((particle: Particle) => {
      particle.scale = particle.start.scale.clone().multiply(evaluateDynamicVector(this.options.scale, particle.time, particle.id));
    });
  }
}

export default ScaleOverLifetime;
