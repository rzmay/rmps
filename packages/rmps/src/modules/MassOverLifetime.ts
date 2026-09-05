import * as THREE from 'three';
import Module from '../Module';
import Particle from '../Particle';
import { DynamicValue } from '../types/DynamicValue';
import evaluateDynamicNumber from '../helpers/evaluateDynamicNumber';

export interface MassOverLifetimeOptions {
    mass: DynamicValue<number>;
    multiplyMassBySize: boolean; // Default to true
}

class MassOverLifetime extends Module {
  constructor(public options: MassOverLifetimeOptions) {
    super((particle: Particle) => {
      const sizeRatio = particle.scale.length() / particle.start.scale.length();

      particle.mass = particle.start.mass
        * evaluateDynamicNumber(this.options.mass, particle.time, particle.id)
        * (options.multiplyMassBySize ?? true ? sizeRatio : 1);
    });
  }
}

export default MassOverLifetime;
