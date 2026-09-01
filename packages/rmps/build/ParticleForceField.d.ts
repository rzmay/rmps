import * as THREE from 'three';
import Particle from './Particle';
import { IParticleForceField } from './interfaces/IParticleForceField';
import { DynamicValue } from './types/DynamicValue';
export type ForceFieldShape = 'sphere' | 'box';
export interface ForceFieldOptions {
    position: THREE.Vector3;
    direction?: DynamicValue<THREE.Vector3>;
    gravity?: DynamicValue<number>;
    rotationSpeed?: DynamicValue<number>;
    rotationAttraction?: DynamicValue<number>;
    drag?: DynamicValue<number>;
    radius?: number;
    shape?: ForceFieldShape;
    size?: THREE.Vector3;
}
declare class ParticleForceField implements IParticleForceField {
    position: THREE.Vector3;
    direction?: DynamicValue<THREE.Vector3>;
    gravity?: DynamicValue<number>;
    rotationSpeed?: DynamicValue<number>;
    rotationAttraction?: DynamicValue<number>;
    drag?: DynamicValue<number>;
    radius?: number;
    shape: ForceFieldShape;
    size: THREE.Vector3;
    constructor(options: ForceFieldOptions);
    getForce(particle: Particle): THREE.Vector3;
    private contains;
    private getFalloff;
    private getSphereRadius;
}
export default ParticleForceField;
