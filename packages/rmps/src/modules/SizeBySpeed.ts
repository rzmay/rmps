import * as THREE from 'three';
import Module from '../Module';
import Particle from '../Particle';
import { DynamicValue } from '../types/DynamicValue';
import evaluateDynamicVector from '../helpers/evaluateDynamicVector3';
import { SpeedRange } from './ColorBySpeed';

export interface SizeBySpeedOptions {
    size: DynamicValue<THREE.Vector3>;
    speedRange: SpeedRange;
}

class SizeBySpeed extends Module {
  constructor(public options: SizeBySpeedOptions) {
    super((particle: Particle) => {
      particle.scale = particle.start.scale.clone().multiply(
        evaluateDynamicVector(this.options.size, this.getSpeedTime(particle.velocity.length()), particle.id),
      );
    });
  }

  private getSpeedTime(speed: number): number {
    const min = Array.isArray(this.options.speedRange) ? this.options.speedRange[0] : this.options.speedRange.min;
    const max = Array.isArray(this.options.speedRange) ? this.options.speedRange[1] : this.options.speedRange.max;
    if (max === min) return speed >= max ? 1 : 0;

    return Math.min(Math.max((speed - min) / (max - min), 0), 1);
  }
}

export default SizeBySpeed;
