"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = require("three");
class LightRenderer {
    constructor(brightness = 1, groupingRadiusRatio = 0.25, decay = 2, count = 50) {
        this.lights = [];
        this.lightContainer = new THREE.Object3D();
        this.brightness = brightness;
        this.groupingRadiusRatio = groupingRadiusRatio;
        this.decay = decay;
        // Start with lights to reduce initialization lag
        for (let i = 0; i < count; i += 1) {
            const light = new THREE.PointLight(0x000000, 0, 0, decay);
            this.lights.push(light);
            this.lightContainer.add(light);
        }
    }
    setup(system) {
        system.add(this.lightContainer);
        this._system = system;
    }
    update(particles) {
        const groups = this._getParticleGroups(particles);
        if (groups.length < this.lights.length) {
            // // Remove unneeded lights
            // this.lights.splice(groups.length).forEach((light) => this._system?.remove(light));
            // this.lights = this.lights.splice(groups.length, this.lights.length - groups.length);
            // To reduce initialization lag, just turn brightness to 0
            [...this.lights].splice(groups.length).forEach((light) => { light.intensity = 0; });
        }
        groups.forEach((group, index) => {
            var _a;
            const light = (_a = this.lights[index]) !== null && _a !== void 0 ? _a : (() => {
                const newLight = new THREE.PointLight();
                this.lightContainer.add(newLight);
                this.lights.push(newLight);
                return newLight;
            })();
            const position = group.reduce((sum, value) => sum.add(value.position), new THREE.Vector3(0, 0, 0)).divideScalar(group.length);
            light.position.set(position.x, position.y, position.z);
            light.color = group.reduce((sum, value) => sum.add(value.color), new THREE.Color(0x000000));
            light.intensity = group.reduce((sum, value) => { var _a; return sum + ((_a = value.data.brightness) !== null && _a !== void 0 ? _a : this.brightness); }, 0) / group.length;
        });
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
}
exports.default = LightRenderer;
