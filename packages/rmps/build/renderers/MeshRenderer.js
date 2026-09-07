import * as THREE from 'three';
import { Renderer } from '../Renderer';
class MeshRenderer extends Renderer {
    constructor(options = {}) {
        var _a, _b, _c, _d, _e, _f, _g;
        super(options);
        this.castShadow = false;
        this.receiveShadow = false;
        this.mesh = (_a = options.mesh) !== null && _a !== void 0 ? _a : new THREE.Mesh((_b = options.geometry) !== null && _b !== void 0 ? _b : new THREE.SphereGeometry(), (_c = options.material) !== null && _c !== void 0 ? _c : new THREE.MeshStandardMaterial(options.materialOptions));
        this.instances = new THREE.InstancedMesh(this.mesh.geometry, this.mesh.material, (_d = options.maxParticles) !== null && _d !== void 0 ? _d : 10000);
        this.instances.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.castShadow = (_e = options.castShadow) !== null && _e !== void 0 ? _e : this.castShadow;
        this.receiveShadow = (_f = options.receiveShadow) !== null && _f !== void 0 ? _f : this.receiveShadow;
        this._alphaAttr = new THREE.InstancedBufferAttribute(new Float32Array((_g = options.maxParticles) !== null && _g !== void 0 ? _g : 10000), 1);
        this.mesh.geometry.setAttribute('instanceAlpha', this._alphaAttr);
        this.dummy = new THREE.Object3D();
        this.preprocessMaterial(this.mesh.material);
    }
    setup(system) {
        system.addRendererObject(this.instances);
    }
    _update(particles) {
        this.instances.count = particles.length;
        this.instances.castShadow = this.castShadow;
        this.instances.receiveShadow = this.receiveShadow;
        particles.forEach((particle, i) => {
            this.dummy.position.set(...particle.position.toArray());
            this.dummy.rotation.set(...particle.rotation.toArray());
            this.dummy.scale.set(...particle.scale.toArray());
            this.dummy.updateMatrix();
            this.instances.setMatrixAt(i, this.dummy.matrix);
            this.instances.setColorAt(i, particle.color);
            this._alphaAttr.setX(i, particle.alpha);
        });
        if (this.instances.instanceColor)
            this.instances.instanceColor.needsUpdate = true;
        this.instances.instanceMatrix.needsUpdate = true;
        this._alphaAttr.needsUpdate = true;
    }
    destroy() {
        this.instances.removeFromParent();
    }
    preprocessMaterial(material) {
        if (Array.isArray(material))
            return material.forEach((mat) => this.preprocessMaterial(mat));
        material.transparent = true;
        material.onBeforeCompile = (shader) => {
            shader.vertexShader = `
attribute float instanceAlpha;
varying float vInstanceAlpha;
${shader.vertexShader}
        `.replace('#include <begin_vertex>', `
#include <begin_vertex>
vInstanceAlpha = instanceAlpha;`);
            shader.fragmentShader = `
varying float vInstanceAlpha;
${shader.fragmentShader}
        `.replace('#include <opaque_fragment>', `
#include <opaque_fragment>
gl_FragColor.a *= vInstanceAlpha;`);
        };
        material.needsUpdate = true;
    }
}
export default MeshRenderer;
