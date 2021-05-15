import * as THREE from 'three';
import { EmissionSource } from './enums/EmissionSource';
declare class EmissionShape {
    static Box: EmissionShape;
    static Sphere: EmissionShape;
    static Cone: EmissionShape;
    static Torus: EmissionShape;
    source: EmissionSource;
    private _geometry;
    private _surfaceSampler;
    private _vertexNormals;
    private _raycaster;
    private _mesh;
    constructor(geometry?: THREE.BufferGeometry, source?: EmissionSource);
    set geometry(value: THREE.BufferGeometry);
    get mesh(): THREE.Mesh;
    get vertices(): THREE.Vector3[];
    private _calculatePointNormal;
    computeVertexNormals(): void;
    getPoint(): {
        position: THREE.Vector3;
        normal: THREE.Vector3;
    };
}
export default EmissionShape;
