"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nanoid_1 = require("nanoid");
const THREE = require("three");
class Particle {
    constructor(position, rotation = new THREE.Vector3(0, 0, 0), scale = new THREE.Vector3(1, 1, 1), color = new THREE.Color(0xffffff), alpha = 1, lifetime = 5) {
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.angularVelocity = new THREE.Vector3(0, 0, 0);
        this.scalarVelocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(0, 0, 0);
        this.angularAcceleration = new THREE.Vector3(0, 0, 0);
        this.scalarAcceleration = new THREE.Vector3(0, 0, 0);
        this.speed = 1;
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
        this.color = color;
        this.alpha = alpha;
        this.startTime = Date.now();
        this.lifetime = lifetime;
        this.id = nanoid_1.nanoid();
    }
    update(deltaTime) {
        // Update velocities
        this.velocity.addScaledVector(this.acceleration, deltaTime * this.speed);
        this.angularVelocity.addScaledVector(this.angularAcceleration, deltaTime * this.speed);
        this.scalarVelocity.addScaledVector(this.scalarAcceleration, deltaTime * this.speed);
        // Update transform
        this.position.addScaledVector(this.velocity, deltaTime * this.speed);
        this.rotation.addScaledVector(this.angularVelocity, deltaTime * this.speed);
        this.scale.addScaledVector(this.scalarVelocity, deltaTime * this.speed);
    }
}
exports.default = Particle;
