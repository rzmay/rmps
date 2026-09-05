import Module from '../Module';
import Particle from '../Particle';
import { DynamicValue } from '../types/DynamicValue';
import evaluateDynamicNumber from '../helpers/evaluateDynamicNumber';
import { IParticleForceField } from '../interfaces/IParticleForceField';
import ParticleForceField from '../ParticleForceField';
import ParticleSystem from '../ParticleSystem';

export interface ExternalForcesOptions {
    multiplier?: DynamicValue<number>;
    forceFieldFilter?: (forceField: ParticleForceField) => boolean;
    forceFields?: IParticleForceField[];
}

class ExternalForces extends Module {
  multiplier: DynamicValue<number> = 1;

  explicitForceFields?: IParticleForceField[];

  forceFieldFilter?: (forceField: ParticleForceField) => boolean;

  private forceFields: Set<IParticleForceField> = new Set();

  constructor(options: ExternalForcesOptions) {
    super((particle: Particle, deltaTime: number) => {
      const multiplier = evaluateDynamicNumber(this.multiplier ?? 1, particle.time, particle.id);

      this.forceFields.forEach((forceField) => {
        particle.acceleration.addScaledVector(forceField.getForce(particle, deltaTime), multiplier);
      });
    });

    this.explicitForceFields = options.forceFields;
    this.forceFieldFilter = options.forceFieldFilter ?? (() => true );
  }

  public prepare(particleSystem: ParticleSystem, deltaTime: number): void {
    // If explicit force fields are provided, just use those
    if (Array.isArray(this.explicitForceFields)) {
      this.forceFields = new Set(this.explicitForceFields);

      return;
    }

    // Otherwise, scan the scene for force fields
    particleSystem.scene?.traverse((object) => {
      if (
        object instanceof ParticleForceField
        && this.forceFieldFilter?.(object)
      ) this.forceFields.add(object);
    });
  }
}

export default ExternalForces;
export { IParticleForceField };
