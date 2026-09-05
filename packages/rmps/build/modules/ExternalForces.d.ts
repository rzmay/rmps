import Module from '../Module';
import { DynamicValue } from '../types/DynamicValue';
import { IParticleForceField } from '../interfaces/IParticleForceField';
import ParticleForceField from '../ParticleForceField';
import ParticleSystem from '../ParticleSystem';
export interface ExternalForcesOptions {
    multiplier?: DynamicValue<number>;
    forceFieldFilter?: (forceField: ParticleForceField) => boolean;
    forceFields?: IParticleForceField[];
}
declare class ExternalForces extends Module {
    multiplier: DynamicValue<number>;
    explicitForceFields?: IParticleForceField[];
    forceFieldFilter?: (forceField: ParticleForceField) => boolean;
    private forceFields;
    constructor(options: ExternalForcesOptions);
    prepare(particleSystem: ParticleSystem, deltaTime: number): void;
}
export default ExternalForces;
export { IParticleForceField };
