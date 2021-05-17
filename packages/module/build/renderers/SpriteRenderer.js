"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = require("three");
const simple_png_1 = require("../assets/images/simple.png");
const UnlitSprite_1 = require("../materials/UnlitSprite");
class SpriteRenderer {
    constructor(texture = simple_png_1.default) {
        this.texture = typeof texture === 'string' ? new THREE.TextureLoader().load(texture) : texture;
        this.geometry = new THREE.BufferGeometry();
        // Preload
        this.material = new THREE.PointsMaterial({
            map: this.texture,
            size: 1,
            depthTest: true,
            depthWrite: false,
            transparent: true,
        });
        this.points = new THREE.Points(this.geometry, this.material);
        // Load
        UnlitSprite_1.default(this.texture).then((material) => {
            this.material = material;
            this.points.material = this.material;
        });
    }
    setup(system) {
        system.add(this.points);
    }
    update(particles) {
        this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(particles.flatMap((particle) => particle.position.toArray())), 3));
        this.geometry.setAttribute('scale', new THREE.BufferAttribute(new Float32Array(particles.flatMap((particle) => particle.scale.toArray())), 3));
        this.geometry.setAttribute('rotation', new THREE.BufferAttribute(new Float32Array(particles.flatMap((particle) => particle.rotation.toArray())), 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(particles.flatMap((particle) => particle.color.toArray().concat(particle.alpha))), 4));
    }
}
exports.default = SpriteRenderer;
