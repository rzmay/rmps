import Module from '../Module';
import { DynamicValue } from '../types/DynamicValue';
import { IParticleForceField } from '../interfaces/IParticleForceField';
export interface ExternalForcesOptions {
    multiplier?: DynamicValue<number>;
    forceFields: IParticleForceField[];
}
declare class ExternalForces extends Module {
    options: ExternalForcesOptions;
    constructor(options: ExternalForcesOptions);
}
export default ExternalForces;
export { IParticleForceField };
