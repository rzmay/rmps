import * as THREE from 'three';
import { Renderer } from '../Renderer';
import evaluateDynamicNumber from '../helpers/evaluateDynamicNumber';
class LightRenderer extends Renderer {
    get count() {
        return this._count;
    }
    set count(value) {
        const next = Number.isFinite(value)
            ? Math.max(0, Math.floor(value))
            : 0;
        if (next === this._count)
            return;
        this._count = next;
        this._syncLightCount();
    }
    constructor(options = {}) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        super();
        this.lights = [];
        this.lightContainer = new THREE.Object3D();
        this._count = 0;
        this.brightness = (_a = options.brightness) !== null && _a !== void 0 ? _a : 1;
        this.rangeMultiplier = (_b = options.rangeMultiplier) !== null && _b !== void 0 ? _b : 1;
        this.groupingRadiusRatio = (_c = options.groupingRadiusRatio) !== null && _c !== void 0 ? _c : 0.25;
        this.lightOptions = (_d = options.lightOptions) !== null && _d !== void 0 ? _d : {};
        this.decay = (_f = (_e = options.decay) !== null && _e !== void 0 ? _e : this.lightOptions.decay) !== null && _f !== void 0 ? _f : 2;
        this.count = (_g = options.count) !== null && _g !== void 0 ? _g : 50;
        this.ratio = Math.min(Math.max((_h = options.ratio) !== null && _h !== void 0 ? _h : 1, 0), 1);
        this.randomDistribution = (_j = options.randomDistribution) !== null && _j !== void 0 ? _j : true;
        this.useParticleColor = (_k = options.useParticleColor) !== null && _k !== void 0 ? _k : true;
        this.sizeAffectsRange = (_l = options.sizeAffectsRange) !== null && _l !== void 0 ? _l : false;
        this.alphaAffectsIntensity = (_m = options.alphaAffectsIntensity) !== null && _m !== void 0 ? _m : false;
    }
    setup(system) {
        system.add(this.lightContainer);
    }
    update(particles) {
        const lightParticles = this._getLightParticles(particles);
        const groups = this._getParticleGroups(lightParticles).slice(0, this.count);
        if (groups.length < this.lights.length) {
            // To reduce initialization lag, just turn intensity to 0
            [...this.lights].splice(groups.length).forEach((light) => { light.intensity = 0; });
        }
        groups.forEach((group, index) => {
            var _a, _b;
            const light = this.lights[index];
            if (!light)
                return;
            const position = group.reduce((sum, value) => sum.add(value.position), new THREE.Vector3(0, 0, 0)).divideScalar(group.length);
            light.position.set(position.x, position.y, position.z);
            const color = new THREE.Color((_a = this.lightOptions.color) !== null && _a !== void 0 ? _a : 0xffffff);
            if (this.useParticleColor) {
                color.multiply(group.reduce((sum, value) => sum.add(value.color), new THREE.Color(0x000000)).multiplyScalar(1 / group.length));
            }
            light.color = color;
            light.decay = (_b = this.lightOptions.decay) !== null && _b !== void 0 ? _b : this.decay;
            light.distance = this._getDistance(group);
            light.intensity = group.reduce((sum, value) => sum + this._getIntensity(value), 0) / group.length;
        });
    }
    _createLight() {
        var _a, _b;
        const light = new THREE.PointLight((_a = this.lightOptions.color) !== null && _a !== void 0 ? _a : 0xffffff, 0, (_b = this.lightOptions.distance) !== null && _b !== void 0 ? _b : 0, this.decay);
        if (this.lightOptions.power !== undefined)
            light.power = this.lightOptions.power;
        return light;
    }
    _getIntensity(particle) {
        var _a;
        let intensity = ((_a = this.lightOptions.intensity) !== null && _a !== void 0 ? _a : 1)
            * evaluateDynamicNumber(this.brightness, particle.time, particle.id);
        if (this.alphaAffectsIntensity) {
            intensity *= particle.alpha;
        }
        return intensity;
    }
    _getDistance(group) {
        var _a;
        const distance = (_a = this.lightOptions.distance) !== null && _a !== void 0 ? _a : 0;
        if (distance === 0)
            return 0;
        return group.reduce((sum, particle) => {
            let range = distance * evaluateDynamicNumber(this.rangeMultiplier, particle.time, particle.id);
            if (this.sizeAffectsRange) {
                range *= (particle.scale.x + particle.scale.y + particle.scale.z) / 3;
            }
            return sum + range;
        }, 0) / group.length;
    }
    _getLightParticles(particles) {
        if (this.ratio <= 0)
            return [];
        if (this.ratio >= 1)
            return particles;
        if (this.randomDistribution) {
            return particles.filter((particle) => this._getParticleRatioValue(particle) < this.ratio);
        }
        const step = Math.max(1, Math.round(1 / this.ratio));
        return particles.filter((particle, index) => index % step === 0);
    }
    // eslint-disable-next-line class-methods-use-this
    _getParticleRatioValue(particle) {
        let hash = 0;
        for (let i = 0; i < particle.id.length; i += 1) {
            // eslint-disable-next-line no-bitwise
            hash = (hash * 31 + particle.id.charCodeAt(i)) >>> 0;
        }
        return hash / 0xffffffff;
    }
    _getParticleGroups(particles) {
        if (particles.length === 0)
            return [];
        // Group particle
        let particlesCopy = [...particles];
        const radius = this._getGroupingRadius(particles);
        const groups = [[particlesCopy[0]]];
        particlesCopy.splice(0, 1);
        while (particlesCopy.length > 0) {
            // Get group
            const group = particlesCopy.filter((p) => particlesCopy[0].position.distanceTo(p.position) <= radius);
            // Remove group from particlesCopy
            particlesCopy = particlesCopy.filter((p) => particlesCopy[0].position.distanceTo(p.position) > radius);
            groups.push(group);
        }
        return groups;
    }
    _getGroupingRadius(particles) {
        const range = particles.reduce((highest, next) => (highest > next.position.length() ? highest : next.position.length()), 0) * 2;
        return this.groupingRadiusRatio * range;
    }
    _syncLightCount() {
        while (this.lights.length < this._count) {
            const light = this._createLight();
            this.lights.push(light);
            this.lightContainer.add(light);
        }
        if (this.lights.length > this._count) {
            const removed = this.lights.splice(this._count);
            removed.forEach((light) => {
                light.removeFromParent();
            });
        }
    }
    destroy() {
        this.lightContainer.removeFromParent();
    }
}
export default LightRenderer;
