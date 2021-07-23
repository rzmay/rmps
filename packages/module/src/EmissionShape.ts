import * as THREE from 'three';
import { BufferAttribute } from 'three';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler';
import { EmissionSource } from './enums/EmissionSource';

interface EmissionShapeOptions {
    geometry: THREE.BufferGeometry;
    source: EmissionSource;
}

class EmissionShape {
    static maxVolumeIterations = 5;

    private static readonly _doubleSidedMaterial = new THREE.MeshBasicMaterial(
      { side: THREE.DoubleSide },
    );

    static Box(...args: any[]): EmissionShape {
      return new EmissionShape({ geometry: new THREE.BoxBufferGeometry(...args) });
    }

    static Sphere(...args: any[]): EmissionShape {
      return new EmissionShape({ geometry: new THREE.SphereBufferGeometry(...args) });
    }

    static Cone(...args: any[]): EmissionShape {
      return new EmissionShape({ geometry: new THREE.ConeBufferGeometry(...args) });
    }

    static Torus(...args: any[]): EmissionShape {
      return new EmissionShape({ geometry: new THREE.TorusBufferGeometry(...args) });
    }

    source: EmissionSource;

    private _geometry: THREE.BufferGeometry;

    private _surfaceSampler: MeshSurfaceSampler;

    private _vertexNormals: THREE.Vector3[] = [];

    private _raycaster: THREE.Raycaster = new THREE.Raycaster();

    private _mesh: THREE.Mesh;

    constructor(options: Partial<EmissionShapeOptions> = {}) {
      this._geometry = options.geometry ?? new THREE.SphereBufferGeometry();
      this.source = options.source ?? EmissionSource.Volume;

      this._mesh = new THREE.Mesh(this._geometry, EmissionShape._doubleSidedMaterial);
      this._surfaceSampler = new MeshSurfaceSampler(this._mesh)
        .build();

      this.computeVertexNormals();
      this._geometry.computeBoundingBox();
    }

    set geometry(value: THREE.BufferGeometry) {
      this._geometry = value;
      this._mesh = new THREE.Mesh(this._geometry, EmissionShape._doubleSidedMaterial);
      this._surfaceSampler = new MeshSurfaceSampler(this._mesh);

      this.computeVertexNormals();
      this._geometry.computeBoundingBox();
      this._mesh.updateMatrix();
    }

    get geometry() { return this._geometry; }

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
        .sort((a, b) => Math.abs(point.distanceTo(a)) - Math.abs(point.distanceTo(b)))
        .splice(0, maxVertices);

      // Get weighted average
      const sumVectors = (vectors: THREE.Vector3[]) => vectors.reduce(
        (a, b) => a.addScaledVector(b, 1),
      );
      const sumArray = (values: number[]) => values.reduce(
        (a, b) => a + b,
      );
      const weightedMean = (factorsArray: THREE.Vector3[], weightsArray: number[]) => sumVectors(
        factorsArray.map(
          (factor, index) => factor.multiplyScalar(weightsArray[index]),
        ),
      ).divideScalar(sumArray(weightsArray));

      return weightedMean(
        closest,
        closest.map((vector) => Math.abs(point.distanceTo(vector))),
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

    getPoint(overrideSource?: EmissionSource): { position: THREE.Vector3, normal: THREE.Vector3 } {
      switch (overrideSource ?? this.source) {
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

          // Search for the allotted iterations
          let iterations = 0;
          while (iterations < EmissionShape.maxVolumeIterations) {
            const simulationScene = new THREE.Scene();
            simulationScene.add(this._mesh);

            // If ray cast intercepts an odd number of sides, point is inside
            this._raycaster.set(randomPoint, new THREE.Vector3(1, 1, 1));

            const intersects = this._raycaster.intersectObject(this._mesh);

            // If inside, return; if not, try again
            if (intersects.length % 2 === 1) {
              return { position: randomPoint, normal: this._calculatePointNormal(randomPoint) };
            }

            iterations += 1;
          }

          // If not found, get from surface sampler
          return this.getPoint(EmissionSource.Surface);
      }
    }
}

export default EmissionShape;
