import * as THREE from 'three';
import { Renderer } from '../interfaces/Renderer';
import ParticleSystem from '../ParticleSystem';
import Particle from '../Particle';

class MeshRenderer implements Renderer {
    mesh: THREE.Mesh;

    instances: THREE.InstancedMesh;

    private dummy: THREE.Object3D;

    constructor(mesh: THREE.Mesh = new THREE.Mesh(
      new THREE.SphereBufferGeometry(),
      new THREE.MeshStandardMaterial(),
    ), maxParticles: number = 10000) {
      this.mesh = mesh;

      this.instances = new THREE.InstancedMesh(mesh.geometry, mesh.material, maxParticles);
      this.instances.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

      this.dummy = new THREE.Object3D();
    }

    setup(system: ParticleSystem): void {
      system.add(this.instances);
    }

    update(particles: Particle[]): void {
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

export default MeshRenderer;
