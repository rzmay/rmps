import * as THREE from 'three';
import Particle from './Particle';
import { IParticleForceField } from './interfaces/IParticleForceField';
import { DynamicValue } from './types/DynamicValue';
import { StrictMultiple } from './types/Multiple';
import { Tag } from './types/Tag';
export interface ForceFieldOptions {
    position: THREE.Vector3;
    direction: DynamicValue<THREE.Vector3>;
    gravity: DynamicValue<number>;
    rotationSpeed: DynamicValue<number>;
    rotationAttraction: DynamicValue<number>;
    drag: DynamicValue<number>;
    scale: THREE.Vector3;
    geometry: THREE.BufferGeometry;
    tags: StrictMultiple<Tag>;
}
declare class ParticleForceField extends THREE.Object3D implements IParticleForceField {
    private static readonly _doubleSidedMaterial;
    static Box(options?: Partial<ForceFieldOptions>, ...args: any[]): ParticleForceField;
    static Sphere(options?: Partial<ForceFieldOptions>, ...args: any[]): ParticleForceField;
    static Cone(options?: Partial<ForceFieldOptions>, ...args: any[]): ParticleForceField;
    static Torus(options?: Partial<ForceFieldOptions>, ...args: any[]): ParticleForceField;
    direction?: DynamicValue<THREE.Vector3>;
    gravity?: DynamicValue<number>;
    rotationSpeed?: DynamicValue<number>;
    rotationAttraction?: DynamicValue<number>;
    drag?: DynamicValue<number>;
    tags?: Tag[];
    private _geometry;
    set geometry(value: THREE.BufferGeometry);
    get geometry(): THREE.BufferGeometry;
    private _mesh;
    constructor(options: Partial<ForceFieldOptions>);
    getForce(particle: Particle): THREE.Vector3;
    private contains;
    private getFalloff;
}
export default ParticleForceField;
