import Module from '../Module';
import Particle from '../Particle';
import { DynamicValue } from '../types/DynamicValue';
import evaluateDynamicNumber from '../helpers/evaluateDynamicNumber';
import { IParticleForceField } from '../interfaces/IParticleForceField';

export interface ExternalForcesOptions {
    multiplier?: DynamicValue<number>;
    forceFields: IParticleForceField[];
}

class ExternalForces extends Module {
  constructor(public options: ExternalForcesOptions) {
    super((particle: Particle, deltaTime: number) => {
      const multiplier = evaluateDynamicNumber(this.options.multiplier ?? 1, particle.time, particle.id);

      this.options.forceFields.forEach((forceField) => {
        particle.acceleration.addScaledVector(forceField.getForce(particle, deltaTime), multiplier);
      });
    });
  }
}

export default ExternalForces;
export { IParticleForceField };
