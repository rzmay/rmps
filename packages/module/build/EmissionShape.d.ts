import * as THREE from 'three';
import { EmissionSource } from './enums/EmissionSource';
declare class EmissionShape {
    static maxVolumeIterations: number;
    private static readonly _doubleSidedMaterial;
    static readonly Box: EmissionShape;
    static readonly Sphere: EmissionShape;
    static readonly Cone: EmissionShape;
    static readonly Torus: EmissionShape;
    source: EmissionSource;
    private _geometry;
    private _surfaceSampler;
    private _vertexNormals;
    private _raycaster;
    private _mesh;
    constructor(geometry?: THREE.BufferGeometry, source?: EmissionSource);
    set geometry(value: THREE.BufferGeometry);
    get geometry(): THREE.BufferGeometry;
    get vertices(): THREE.Vector3[];
    private _calculatePointNormal;
    computeVertexNormals(): void;
    getPoint(overrideSource?: EmissionSource): {
        position: THREE.Vector3;
        normal: THREE.Vector3;
    };
}
export default EmissionShape;
