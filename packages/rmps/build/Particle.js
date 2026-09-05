import { nanoid } from 'nanoid';
import * as THREE from 'three';
class Particle {
    constructor(options = {}) {
        var _a, _b, _c, _d, _e, _f, _g;
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.angularVelocity = new THREE.Vector3(0, 0, 0);
        this.scalarVelocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(0, 0, 0);
        this.angularAcceleration = new THREE.Vector3(0, 0, 0);
        this.scalarAcceleration = new THREE.Vector3(0, 0, 0);
        this.speed = 1;
        this.mass = 0;
        this.position = (_a = options.position) !== null && _a !== void 0 ? _a : new THREE.Vector3();
        this.rotation = (_b = options.rotation) !== null && _b !== void 0 ? _b : new THREE.Vector3();
        this.scale = (_c = options.scale) !== null && _c !== void 0 ? _c : new THREE.Vector3(1, 1, 1);
        this.color = (_d = options.color) !== null && _d !== void 0 ? _d : new THREE.Color(0xffffff);
        this.alpha = (_e = options.alpha) !== null && _e !== void 0 ? _e : 1;
        this.mass = (_f = options.mass) !== null && _f !== void 0 ? _f : 0;
        this.lifetime = (_g = options.lifetime) !== null && _g !== void 0 ? _g : 5;
        this.startTime = Date.now();
        this.time = 0;
        this.realtime = 0;
        this.id = nanoid();
        this.start = this.createStartValues();
        this.noise = {};
        this.data = {};
    }
    cacheStartValues() {
        this.start = this.createStartValues();
    }
    createStartValues() {
        return {
            lifetime: this.lifetime,
            position: this.position.clone(),
            rotation: this.rotation.clone(),
            scale: this.scale.clone(),
            velocity: this.velocity.clone(),
            angularVelocity: this.angularVelocity.clone(),
            scalarVelocity: this.scalarVelocity.clone(),
            acceleration: this.acceleration.clone(),
            angularAcceleration: this.angularAcceleration.clone(),
            scalarAcceleration: this.scalarAcceleration.clone(),
            speed: this.speed,
            mass: this.mass,
            color: this.color.clone(),
            alpha: this.alpha,
        };
    }
    update(deltaTime) {
        // Update time
        this.realtime = (Date.now() - this.startTime) / 1000;
        this.time = this.realtime / this.lifetime;
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
export default Particle;
