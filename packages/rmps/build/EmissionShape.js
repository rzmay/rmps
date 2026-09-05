import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { EmissionSource } from './enums/EmissionSource';
import isPointInMesh from './helpers/isPointInMesh';
class EmissionShape extends THREE.Object3D {
    static Box(...args) {
        return new EmissionShape({ geometry: new THREE.BoxGeometry(...args) });
    }
    static Sphere(...args) {
        return new EmissionShape({ geometry: new THREE.SphereGeometry(...args) });
    }
    static Cone(...args) {
        return new EmissionShape({ geometry: new THREE.ConeGeometry(...args) });
    }
    static Torus(...args) {
        return new EmissionShape({ geometry: new THREE.TorusGeometry(...args) });
    }
    constructor(options = {}) {
        var _a, _b;
        super();
        this._vertexNormals = [];
        this._raycaster = new THREE.Raycaster();
        this._geometry = (_a = options.geometry) !== null && _a !== void 0 ? _a : new THREE.SphereGeometry();
        this.source = (_b = options.source) !== null && _b !== void 0 ? _b : EmissionSource.Volume;
        this._mesh = new THREE.Mesh(this._geometry, EmissionShape._doubleSidedMaterial);
        this._surfaceSampler = new MeshSurfaceSampler(this._mesh)
            .build();
        this.computeVertexNormals();
        this._geometry.computeBoundingBox();
    }
    set geometry(value) {
        this._geometry = value;
        this._mesh = new THREE.Mesh(this._geometry, EmissionShape._doubleSidedMaterial);
        this._surfaceSampler = new MeshSurfaceSampler(this._mesh);
        this.computeVertexNormals();
        this._geometry.computeBoundingBox();
        this._mesh.updateMatrix();
    }
    get geometry() { return this._geometry; }
    get vertices() {
        const vertices = this._geometry.getAttribute('position');
        const res = [];
        for (let i = 0; i < vertices.array.length; i += 3) {
            res.push(new THREE.Vector3(vertices.array[i], vertices.array[i + 1], vertices.array[i + 2]));
        }
        return res;
    }
    // Calculate the normal of a point in the geometry volume
    _calculatePointNormal(point, maxVertices = 5) {
        // Get the closest vertices
        const { vertices } = this;
        const closest = vertices
            .sort((a, b) => Math.abs(point.distanceTo(a)) - Math.abs(point.distanceTo(b)))
            .splice(0, maxVertices);
        // Get weighted average
        const sumVectors = (vectors) => vectors.reduce((a, b) => a.addScaledVector(b, 1));
        const sumArray = (values) => values.reduce((a, b) => a + b);
        const weightedMean = (factorsArray, weightsArray) => sumVectors(factorsArray.map((factor, index) => factor.multiplyScalar(weightsArray[index]))).divideScalar(sumArray(weightsArray));
        return weightedMean(closest, closest.map((vector) => Math.abs(point.distanceTo(vector))));
    }
    computeVertexNormals() {
        this._geometry.computeVertexNormals();
        const vertexNormals = this._geometry.getAttribute('normal');
        const res = [];
        for (let i = 0; i < vertexNormals.array.length; i += 3) {
            res.push(new THREE.Vector3(vertexNormals.array[i], vertexNormals.array[i + 1], vertexNormals.array[i + 2]));
        }
        this._vertexNormals = res;
    }
    _toParentPosition(localPosition) {
        this.updateWorldMatrix(true, false);
        const worldPosition = localPosition.clone().applyMatrix4(this.matrixWorld);
        return this.parent
            ? this.parent.worldToLocal(worldPosition)
            : worldPosition;
    }
    _toParentNormal(localNormal) {
        const normalMatrix = new THREE.Matrix3().getNormalMatrix(this.matrix);
        return localNormal
            .clone()
            .applyNormalMatrix(normalMatrix)
            .normalize();
    }
    getPoint(overrideSource) {
        switch (overrideSource !== null && overrideSource !== void 0 ? overrideSource : this.source) {
            case EmissionSource.Vertices: // Select random vertex
                const { vertices } = this;
                const vertexIndex = Math.floor(Math.random() * vertices.length);
                return {
                    position: this._toParentPosition(vertices[vertexIndex]),
                    normal: this._toParentNormal(this._vertexNormals[vertexIndex]),
                };
            case EmissionSource.Surface: // Use surface sampler to find random point on surface
                const position = new THREE.Vector3(0, 0, 0);
                const normal = new THREE.Vector3(0, 0, 0);
                this._surfaceSampler.sample(position, normal);
                return {
                    position: this._toParentPosition(position),
                    normal: this._toParentNormal(normal),
                };
            default: // Choose random points in bounding box until one is contained by geometry (volume)
                const { min, max } = this._geometry.boundingBox;
                const randomPoint = new THREE.Vector3(THREE.MathUtils.lerp(min.x, max.x, Math.random()), THREE.MathUtils.lerp(min.y, max.y, Math.random()), THREE.MathUtils.lerp(min.z, max.z, Math.random()));
                // Search for the allotted iterations
                let iterations = 0;
                while (iterations < EmissionShape.maxVolumeIterations) {
                    if (isPointInMesh(randomPoint, this._mesh)) {
                        return {
                            position: this._toParentPosition(randomPoint),
                            normal: this._toParentNormal(this._calculatePointNormal(randomPoint)),
                        };
                    }
                    iterations += 1;
                }
                // If not found, get from surface sampler
                return this.getPoint(EmissionSource.Surface);
        }
    }
}
EmissionShape.maxVolumeIterations = 5;
EmissionShape._doubleSidedMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
export default EmissionShape;
