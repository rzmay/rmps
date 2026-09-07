import * as THREE from 'three';
import evaluateDynamicNumber from './helpers/evaluateDynamicNumber';
import evaluateDynamicVector from './helpers/evaluateDynamicVector3';
import isPointInMesh from './helpers/isPointInMesh';
import acceptMultiple from './helpers/acceptMultiple';
import tagsIntersect from './helpers/tagsIntersect';
class ParticleForceField extends THREE.Object3D {
    static Box(options, ...args) {
        return new ParticleForceField(Object.assign(Object.assign({}, options), { geometry: new THREE.BoxGeometry(...args) }));
    }
    static Sphere(options, ...args) {
        return new ParticleForceField(Object.assign(Object.assign({}, options), { geometry: new THREE.SphereGeometry(...args) }));
    }
    static Cone(options, ...args) {
        return new ParticleForceField(Object.assign(Object.assign({}, options), { geometry: new THREE.ConeGeometry(...args) }));
    }
    static Torus(options, ...args) {
        return new ParticleForceField(Object.assign(Object.assign({}, options), { geometry: new THREE.TorusGeometry(...args) }));
    }
    set geometry(value) {
        this._geometry = value;
        this._geometry.computeBoundingBox();
        this._mesh.geometry = value;
    }
    get geometry() {
        return this._geometry;
    }
    constructor(options) {
        var _a;
        super();
        if (options.position) {
            this.position.copy(options.position);
        }
        if (options.scale) {
            this.scale.copy(options.scale);
        }
        this.direction = options.direction;
        this.gravity = options.gravity;
        this.rotationSpeed = options.rotationSpeed;
        this.rotationAttraction = options.rotationAttraction;
        this.drag = options.drag;
        this.tags = acceptMultiple(options.tags);
        this._geometry = (_a = options.geometry) !== null && _a !== void 0 ? _a : new THREE.SphereGeometry();
        this._geometry.computeBoundingBox();
        this._mesh = new THREE.Mesh(this._geometry, ParticleForceField._doubleSidedMaterial);
    }
    getForce(particle) {
        var _a;
        this.updateWorldMatrix(true, false);
        if (!this.contains(particle.position)
            || (this.tags && !tagsIntersect(this.tags, (_a = particle.tags) !== null && _a !== void 0 ? _a : [])))
            return new THREE.Vector3();
        const { time } = particle;
        const force = new THREE.Vector3();
        const center = new THREE.Vector3();
        this.getWorldPosition(center);
        const toCenter = center.clone().sub(particle.position);
        const distanceSq = toCenter.lengthSq();
        if (this.direction !== undefined) {
            const direction = evaluateDynamicVector(this.direction, time).clone();
            const rotation = this.getWorldQuaternion(new THREE.Quaternion());
            direction.applyQuaternion(rotation);
            force.add(direction);
        }
        if (this.gravity !== undefined && distanceSq > 0) {
            force.add(toCenter.clone().normalize().multiplyScalar(evaluateDynamicNumber(this.gravity, time)));
        }
        if (this.rotationSpeed !== undefined && distanceSq > 0) {
            const rotationAxis = new THREE.Vector3(0, 1, 0)
                .applyQuaternion(this.getWorldQuaternion(new THREE.Quaternion()));
            const fromCenter = particle.position.clone().sub(center);
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
        const localPosition = this.worldToLocal(position.clone());
        return isPointInMesh(localPosition, this._mesh);
    }
    getFalloff(position) {
        const localPosition = this.worldToLocal(position.clone());
        if (!this._geometry.boundingBox) {
            this._geometry.computeBoundingBox();
        }
        const size = new THREE.Vector3();
        this._geometry.boundingBox.getSize(size);
        const radius = size.length() * 0.5;
        if (radius <= 0)
            return 0;
        return 1 - Math.min(localPosition.length() / radius, 1);
    }
}
ParticleForceField._doubleSidedMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
export default ParticleForceField;
