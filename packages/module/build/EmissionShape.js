"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = require("three");
const MeshSurfaceSampler_1 = require("three/examples/jsm/math/MeshSurfaceSampler");
const EmissionSource_1 = require("./enums/EmissionSource");
class EmissionShape {
    constructor(geometry = new THREE.SphereBufferGeometry(), source = EmissionSource_1.EmissionSource.Volume) {
        this._vertexNormals = [];
        this._raycaster = new THREE.Raycaster();
        this._geometry = geometry;
        this.source = source;
        this._mesh = new THREE.Mesh(this._geometry);
        this._surfaceSampler = new MeshSurfaceSampler_1.MeshSurfaceSampler(new THREE.Mesh(this._geometry))
            .build();
        this.computeVertexNormals();
        this._geometry.computeBoundingBox();
    }
    set geometry(value) {
        this._geometry = value;
        this._mesh = new THREE.Mesh(this._geometry);
        this._surfaceSampler = new MeshSurfaceSampler_1.MeshSurfaceSampler(this._mesh);
        this._geometry.computeVertexNormals();
        this._geometry.computeBoundingBox();
    }
    get mesh() {
        return this._mesh;
    }
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
            .map((_, index) => index)
            .sort((a, b) => point.distanceTo(vertices[a]) - point.distanceTo(vertices[b]))
            .splice(maxVertices);
        // Get weighted average
        const sumVectors = (vectors) => vectors.reduce((a, b) => a.addScaledVector(b, 1));
        const sumArray = (values) => values.reduce((a, b) => a + b);
        const weightedMean = (factorsArray, weightsArray) => sumVectors(factorsArray.map((factor, index) => factor.multiplyScalar(weightsArray[index]))).divideScalar(sumArray(weightsArray));
        return weightedMean(this._vertexNormals.filter((n, i) => closest.includes(i)), closest.map((i) => point.distanceTo(vertices[i])));
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
    getPoint() {
        switch (this.source) {
            case EmissionSource_1.EmissionSource.Vertices: // Select random vertex
                const { vertices } = this;
                const vertexIndex = Math.floor(Math.random() * vertices.length);
                return {
                    position: vertices[vertexIndex],
                    normal: this._vertexNormals[vertexIndex],
                };
            case EmissionSource_1.EmissionSource.Surface: // Use surface sampler to find random point on surface
                const position = new THREE.Vector3(0, 0, 0);
                const normal = new THREE.Vector3(0, 0, 0);
                this._surfaceSampler.sample(position, normal);
                return { position, normal };
            default: // Choose random points in bounding box until one is contained by geometry (volume)
                const { min, max } = this._geometry.boundingBox;
                const randomPoint = new THREE.Vector3(THREE.MathUtils.lerp(min.x, max.x, Math.random()), THREE.MathUtils.lerp(min.y, max.y, Math.random()), THREE.MathUtils.lerp(min.z, max.z, Math.random()));
                // If ray cast intercepts an odd number of sides, point is inside
                this._raycaster.set(randomPoint, new THREE.Vector3(1, 1, 1));
                const intersects = this._raycaster.intersectObject(this.mesh);
                const insideVolume = (intersects.length % 2 === 1);
                // If inside, return; if not, try again
                return insideVolume
                    ? { position: randomPoint, normal: this._calculatePointNormal(randomPoint) }
                    : this.getPoint();
        }
    }
}
EmissionShape.Box = new EmissionShape(new THREE.BoxBufferGeometry());
EmissionShape.Sphere = new EmissionShape(new THREE.SphereBufferGeometry());
EmissionShape.Cone = new EmissionShape(new THREE.ConeBufferGeometry());
EmissionShape.Torus = new EmissionShape(new THREE.TorusBufferGeometry());
exports.default = EmissionShape;
