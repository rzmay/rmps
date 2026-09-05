import * as THREE from 'three';
import Particle from './Particle';
import { IParticleForceField } from './interfaces/IParticleForceField';
import { DynamicValue } from './types/DynamicValue';
export interface ForceFieldOptions {
    position?: THREE.Vector3;
    direction?: DynamicValue<THREE.Vector3>;
    gravity?: DynamicValue<number>;
    rotationSpeed?: DynamicValue<number>;
    rotationAttraction?: DynamicValue<number>;
    drag?: DynamicValue<number>;
    radius?: number;
    scale?: THREE.Vector3;
    geometry?: THREE.BufferGeometry;
}
declare class ParticleForceField extends THREE.Object3D implements IParticleForceField {
    private static readonly _doubleSidedMaterial;
    static Box(options?: ForceFieldOptions, ...args: any[]): ParticleForceField;
    static Sphere(options?: ForceFieldOptions, ...args: any[]): ParticleForceField;
    static Cone(options?: ForceFieldOptions, ...args: any[]): ParticleForceField;
    static Torus(options?: ForceFieldOptions, ...args: any[]): ParticleForceField;
    direction?: DynamicValue<THREE.Vector3>;
    gravity?: DynamicValue<number>;
    rotationSpeed?: DynamicValue<number>;
    rotationAttraction?: DynamicValue<number>;
    drag?: DynamicValue<number>;
    radius?: number;
    private _geometry;
    set geometry(value: THREE.BufferGeometry);
    get geometry(): THREE.BufferGeometry;
    private _mesh;
    constructor(options: ForceFieldOptions);
    getForce(particle: Particle): THREE.Vector3;
    private contains;
    private getFalloff;
}
export default ParticleForceField;
