import * as THREE from 'three';
import evaluateDynamicNumber from './helpers/evaluateDynamicNumber';
import evaluateDynamicVector from './helpers/evaluateDynamicVector3';
class ParticleForceField {
    constructor(options) {
        var _a, _b, _c, _d, _e, _f;
        this.position = options.position.clone();
        this.direction = options.direction;
        this.gravity = options.gravity;
        this.rotationSpeed = options.rotationSpeed;
        this.rotationAttraction = options.rotationAttraction;
        this.drag = options.drag;
        this.radius = options.radius;
        this.shape = (_a = options.shape) !== null && _a !== void 0 ? _a : 'sphere';
        this.size = (_c = (_b = options.size) === null || _b === void 0 ? void 0 : _b.clone()) !== null && _c !== void 0 ? _c : new THREE.Vector3(((_d = options.radius) !== null && _d !== void 0 ? _d : 1) * 2, ((_e = options.radius) !== null && _e !== void 0 ? _e : 1) * 2, ((_f = options.radius) !== null && _f !== void 0 ? _f : 1) * 2);
    }
    getForce(particle) {
        if (!this.contains(particle.position))
            return new THREE.Vector3();
        const { time } = particle;
        const force = new THREE.Vector3();
        const toCenter = this.position.clone().sub(particle.position);
        const distanceSq = toCenter.lengthSq();
        if (this.direction !== undefined) {
            force.add(evaluateDynamicVector(this.direction, time));
        }
        if (this.gravity !== undefined && distanceSq > 0) {
            force.add(toCenter.clone().normalize().multiplyScalar(evaluateDynamicNumber(this.gravity, time)));
        }
        if (this.rotationSpeed !== undefined && distanceSq > 0) {
            const rotationAxis = new THREE.Vector3(0, 1, 0);
            const fromCenter = particle.position.clone().sub(this.position);
            const tangent = rotationAxis.cross(fromCenter).normalize();
            force.add(tangent.multiplyScalar(evaluateDynamicNumber(this.rotationSpeed, time)));
        }
        if (this.rotationAttraction !== undefined && distanceSq > 0) {
            force.add(toCenter.clone().normalize().multiplyScalar(evaluateDynamicNumber(this.rotationAttraction, time)));
        }
        if (this.drag !== undefined) {
            force.addScaledVector(particle.velocity, -evaluateDynamicNumber(this.drag, time));
        }
        return force.multiplyScalar(this.getFalloff(particle.position));
    }
    contains(position) {
        if (this.shape === 'box') {
            const local = position.clone().sub(this.position);
            const halfSize = this.size.clone().multiplyScalar(0.5);
            return Math.abs(local.x) <= halfSize.x
                && Math.abs(local.y) <= halfSize.y
                && Math.abs(local.z) <= halfSize.z;
        }
        return position.distanceToSquared(this.position) <= Math.pow(this.getSphereRadius(), 2);
    }
    getFalloff(position) {
        if (this.shape === 'box')
            return 1;
        const radius = this.getSphereRadius();
        if (radius <= 0)
            return 0;
        return 1 - Math.min(position.distanceTo(this.position) / radius, 1);
    }
    getSphereRadius() {
        var _a;
        return (_a = this.radius) !== null && _a !== void 0 ? _a : Math.max(this.size.x, this.size.y, this.size.z) * 0.5;
    }
}
export default ParticleForceField;
