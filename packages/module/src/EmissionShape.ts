import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler';
import { BufferAttribute } from 'three';
import { EmissionSource } from './enums/EmissionSource';

class EmissionShape {
    static Box = new EmissionShape(new THREE.BoxBufferGeometry());

    static Sphere = new EmissionShape(new THREE.SphereBufferGeometry());

    static Cone = new EmissionShape(new THREE.ConeBufferGeometry());

    static Torus = new EmissionShape(new THREE.TorusBufferGeometry());

    source: EmissionSource;

    private _geometry: THREE.BufferGeometry;

    private _surfaceSampler: MeshSurfaceSampler;

    private _vertexNormals: THREE.Vector3[] = [];

    private _raycaster: THREE.Raycaster = new THREE.Raycaster();

    private _mesh: THREE.Mesh;

    constructor(
      geometry: THREE.BufferGeometry = new THREE.SphereBufferGeometry(),
      source: EmissionSource = EmissionSource.Volume,
    ) {
      this._geometry = geometry;
      this.source = source;

      this._mesh = new THREE.Mesh(this._geometry);
      this._surfaceSampler = new MeshSurfaceSampler(new THREE.Mesh(this._geometry))
        .build();

      this.computeVertexNormals();
      this._geometry.computeBoundingBox();
    }

    set geometry(value: THREE.BufferGeometry) {
      this._geometry = value;
      this._mesh = new THREE.Mesh(this._geometry);
      this._surfaceSampler = new MeshSurfaceSampler(this._mesh);

      this._geometry.computeVertexNormals();
      this._geometry.computeBoundingBox();
    }

    get mesh(): THREE.Mesh {
      return this._mesh;
    }

    get vertices() {
      const vertices: BufferAttribute = this._geometry.getAttribute('position') as BufferAttribute;
      const res: THREE.Vector3[] = [];

      for (let i = 0; i < vertices.array.length; i += 3) {
        res.push(new THREE.Vector3(
          vertices.array[i],
          vertices.array[i + 1],
          vertices.array[i + 2],
        ));
      }

      return res;
    }

    // Calculate the normal of a point in the geometry volume
    private _calculatePointNormal(point: THREE.Vector3, maxVertices = 5): THREE.Vector3 {
      // Get the closest vertices
      const { vertices } = this;
      const closest = vertices
        .map((_, index) => index)
        .sort((a, b) => point.distanceTo(vertices[a]) - point.distanceTo(vertices[b]))
        .splice(maxVertices);

      // Get weighted average
      const sumVectors = (vectors: THREE.Vector3[]) => vectors.reduce(
        (a, b) => a.addScaledVector(b, 1),
      );
      const sumArray = (values: number[]) => values.reduce(
        (a, b) => a + b,
      );
      const weightedMean = (factorsArray: THREE.Vector3[], weightsArray: number[]) => sumVectors(
        factorsArray.map((factor, index) => factor.multiplyScalar(weightsArray[index])),
      ).divideScalar(sumArray(weightsArray));

      return weightedMean(
        this._vertexNormals.filter((n, i) => closest.includes(i)),
        closest.map((i) => point.distanceTo(vertices[i])),
      );
    }

    computeVertexNormals(): void {
      this._geometry.computeVertexNormals();
      const vertexNormals: BufferAttribute = this._geometry.getAttribute('normal') as BufferAttribute;
      const res: THREE.Vector3[] = [];

      for (let i = 0; i < vertexNormals.array.length; i += 3) {
        res.push(new THREE.Vector3(
          vertexNormals.array[i],
          vertexNormals.array[i + 1],
          vertexNormals.array[i + 2],
        ));
      }

      this._vertexNormals = res;
    }

    getPoint(): { position: THREE.Vector3, normal: THREE.Vector3 } {
      switch (this.source) {
        case EmissionSource.Vertices: // Select random vertex
          const { vertices } = this;
          const vertexIndex = Math.floor(Math.random() * vertices.length);
          return {
            position: vertices[vertexIndex],
            normal: this._vertexNormals[vertexIndex],
          };

        case EmissionSource.Surface: // Use surface sampler to find random point on surface
          const position: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
          const normal: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
          this._surfaceSampler.sample(position, normal);
          return { position, normal };

        default: // Choose random points in bounding box until one is contained by geometry (volume)
          const { min, max } = this._geometry.boundingBox!;
          const randomPoint = new THREE.Vector3(
            THREE.MathUtils.lerp(min.x, max.x, Math.random()),
            THREE.MathUtils.lerp(min.y, max.y, Math.random()),
            THREE.MathUtils.lerp(min.z, max.z, Math.random()),
          );

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

export default EmissionShape;
