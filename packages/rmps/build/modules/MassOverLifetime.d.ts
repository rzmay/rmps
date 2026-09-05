import Module from '../Module';
import { DynamicValue } from '../types/DynamicValue';
export interface MassOverLifetimeOptions {
    mass: DynamicValue<number>;
    multiplyMassBySize: boolean;
}
declare class MassOverLifetime extends Module {
    options: MassOverLifetimeOptions;
    constructor(options: MassOverLifetimeOptions);
}
export default MassOverLifetime;
