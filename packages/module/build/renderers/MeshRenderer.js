"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = require("three");
class MeshRenderer {
    constructor(mesh = new THREE.Mesh(new THREE.SphereBufferGeometry(), new THREE.MeshStandardMaterial()), maxParticles = 10000) {
        this.mesh = mesh;
        this.instances = new THREE.InstancedMesh(mesh.geometry, mesh.material, maxParticles);
        this.instances.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.dummy = new THREE.Object3D();
    }
    setup(system) {
        system.add(this.instances);
    }
    update(particles) {
        this.instances.count = particles.length;
        particles.forEach((particle, i) => {
            this.dummy.position.set(...particle.position.toArray());
            this.dummy.rotation.set(...particle.rotation.toArray());
            this.dummy.scale.set(...particle.scale.toArray());
            this.dummy.updateMatrix();
            this.instances.setMatrixAt(i, this.dummy.matrix);
            this.instances.setColorAt(i, particle.color);
        });
        this.instances.instanceMatrix.needsUpdate = true;
    }
}
exports.default = MeshRenderer;
