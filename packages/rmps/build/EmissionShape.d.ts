import * as THREE from 'three';
import { EmissionSource } from './enums/EmissionSource';
interface EmissionShapeOptions {
    geometry: THREE.BufferGeometry;
    source: EmissionSource;
}
declare class EmissionShape extends THREE.Object3D {
    static maxVolumeIterations: number;
    private static readonly _doubleSidedMaterial;
    static Box(...args: any[]): EmissionShape;
    static Sphere(...args: any[]): EmissionShape;
    static Cone(...args: any[]): EmissionShape;
    static Torus(...args: any[]): EmissionShape;
    source: EmissionSource;
    private _geometry;
    private _surfaceSampler;
    private _vertexNormals;
    private _raycaster;
    private _mesh;
    constructor(options?: Partial<EmissionShapeOptions>);
    set geometry(value: THREE.BufferGeometry);
    get geometry(): THREE.BufferGeometry;
    get vertices(): THREE.Vector3[];
    private _calculatePointNormal;
    computeVertexNormals(): void;
    private _toParentPosition;
    private _toParentNormal;
    getPoint(overrideSource?: EmissionSource): {
        position: THREE.Vector3;
        normal: THREE.Vector3;
    };
}
export default EmissionShape;
