import * as THREE from 'three';
import { Renderer } from '../Renderer';
import evaluateDynamicNumber from '../helpers/evaluateDynamicNumber';
import evaluateDynamicColor from '../helpers/evaluateDynamicColor';
import seedrandom from 'seedrandom';
export var TrailMode;
(function (TrailMode) {
    TrailMode[TrailMode["Particle"] = 0] = "Particle";
    TrailMode[TrailMode["Ribbon"] = 1] = "Ribbon";
})(TrailMode || (TrailMode = {}));
;
export var TrailTextureMode;
(function (TrailTextureMode) {
    TrailTextureMode[TrailTextureMode["Stretch"] = 0] = "Stretch";
    TrailTextureMode[TrailTextureMode["Tile"] = 1] = "Tile";
    TrailTextureMode[TrailTextureMode["RepeatPerSegment"] = 2] = "RepeatPerSegment";
    TrailTextureMode[TrailTextureMode["DistributePerSegment"] = 3] = "DistributePerSegment";
})(TrailTextureMode || (TrailTextureMode = {}));
;
class TrailRenderer extends Renderer {
    constructor(options = {}) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
        super();
        this.mode = TrailMode.Particle;
        this.ratio = 1;
        this.lifetime = 1;
        this.minimumVertexDistance = 0.1;
        this.dieWithParticles = true;
        this.ribbonCount = 1;
        this.textureMode = TrailTextureMode.Stretch;
        this.width = 1;
        this.sizeAffectsWidth = false;
        this.sizeAffectsLifetime = false;
        this.inheritParticleColor = true;
        this.colorOverLifetime = new THREE.Color(0xffffff);
        this.widthOverTrail = 1;
        this.colorOverTrail = new THREE.Color(0xffffff);
        this.castShadow = false;
        this.receiveShadow = false;
        this.particles = [];
        this.trails = new Map();
        this.mode = (_a = options.mode) !== null && _a !== void 0 ? _a : this.mode;
        this.ratio = (_b = options.ratio) !== null && _b !== void 0 ? _b : this.ratio;
        this.lifetime = (_c = options.lifetime) !== null && _c !== void 0 ? _c : this.lifetime;
        this.minimumVertexDistance = (_d = options.minimumVertexDistance) !== null && _d !== void 0 ? _d : this.minimumVertexDistance;
        this.dieWithParticles = (_e = options.dieWithParticles) !== null && _e !== void 0 ? _e : this.dieWithParticles;
        this.ribbonCount = (_f = options.ribbonCount) !== null && _f !== void 0 ? _f : this.ribbonCount;
        this.textureMode = (_g = options.textureMode) !== null && _g !== void 0 ? _g : this.textureMode;
        this.width = (_h = options.width) !== null && _h !== void 0 ? _h : this.width;
        this.sizeAffectsWidth = (_j = options.sizeAffectsWidth) !== null && _j !== void 0 ? _j : this.sizeAffectsWidth;
        this.sizeAffectsLifetime = (_k = options.sizeAffectsLifetime) !== null && _k !== void 0 ? _k : this.sizeAffectsLifetime;
        this.widthOverTrail = (_l = options.widthOverTrail) !== null && _l !== void 0 ? _l : this.widthOverTrail;
        this.inheritParticleColor = (_m = options.inheritParticleColor) !== null && _m !== void 0 ? _m : this.inheritParticleColor;
        this.colorOverLifetime = (_o = options.colorOverLifetime) !== null && _o !== void 0 ? _o : this.colorOverLifetime;
        this.colorOverTrail = (_p = options.colorOverTrail) !== null && _p !== void 0 ? _p : this.colorOverTrail;
        this.castShadow = (_q = options.castShadow) !== null && _q !== void 0 ? _q : this.castShadow;
        this.receiveShadow = (_r = options.receiveShadow) !== null && _r !== void 0 ? _r : this.receiveShadow;
        this.geometry = new THREE.BufferGeometry();
        this.material = (_s = options.material) !== null && _s !== void 0 ? _s : new THREE.MeshStandardMaterial(Object.assign({ vertexColors: true, side: THREE.DoubleSide, transparent: true, depthWrite: false }, options.materialOptions));
        this.preprocessMaterial(this.material);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        // Add user data to the mesh so we can recognize it elsewhere
        this.mesh.userData["__rmps_trailRenderer"] = true;
        this.mesh.frustumCulled = false;
    }
    setup(system) {
        system.add(this.mesh);
        this.camera = system.sceneCamera;
    }
    update(particles) {
        this.particles = particles;
        this.mesh.castShadow = this.castShadow;
        this.mesh.receiveShadow = this.receiveShadow;
        if (this.mode === TrailMode.Particle) {
            this.updateParticleTrails(particles);
        }
        if (this.camera) {
            this.rebuildGeometry(this.camera);
        }
    }
    destroy() {
        this.geometry.dispose();
        this.trails.clear();
        this.mesh.removeFromParent();
    }
    updateParticleTrails(particles) {
        const now = Date.now() / 1000;
        const aliveParticles = new Set();
        // Adding new trail points
        particles.forEach((particle) => {
            aliveParticles.add(particle.id);
            if (!this.particleHasTrail(particle.id)) {
                return;
            }
            let trail = this.trails.get(particle.id);
            if (!trail) {
                trail = {
                    particleId: particle.id,
                    points: [],
                    alive: true,
                    headPosition: particle.position.clone(),
                    particleTime: particle.time,
                    particleColor: particle.color.clone(),
                    particleAlpha: particle.alpha,
                    particleSize: this.getParticleSize(particle),
                };
                this.trails.set(particle.id, trail);
                this.addTrailPoint(trail, particle, now);
            }
            trail.alive = true;
            trail.headPosition.copy(particle.position);
            trail.particleTime = particle.time;
            trail.particleColor.copy(particle.color);
            trail.particleAlpha = particle.alpha;
            trail.particleSize = this.getParticleSize(particle);
            const lastPoint = trail.points[trail.points.length - 1];
            if (!lastPoint
                || lastPoint.position.distanceTo(particle.position) >= this.minimumVertexDistance) {
                this.addTrailPoint(trail, particle, now);
            }
        });
        // Disposing of dead trails
        for (const [id, trail] of this.trails) {
            if (!aliveParticles.has(id)) {
                trail.alive = false;
                if (this.dieWithParticles) {
                    this.trails.delete(id);
                    continue;
                }
            }
            while (trail.points.length > 0 && trail.points[0].expiresAt <= now) {
                trail.points.shift();
            }
            if (!trail.alive && trail.points.length === 0) {
                this.trails.delete(id);
            }
        }
    }
    addTrailPoint(trail, particle, now) {
        let vertexLifetime = particle.lifetime * evaluateDynamicNumber(this.lifetime, particle.time, particle.id);
        if (this.sizeAffectsLifetime) {
            vertexLifetime *= this.getParticleSize(particle);
        }
        trail.points.push({
            position: particle.position.clone(),
            createdAt: now,
            expiresAt: now + Math.max(0, vertexLifetime),
        });
    }
    getPaths() {
        if (this.mode === TrailMode.Ribbon) {
            return this.getRibbonPaths();
        }
        return this.getParticlePaths();
    }
    getParticlePaths() {
        const paths = [];
        for (const trail of this.trails.values()) {
            if (trail.points.length === 0) {
                continue;
            }
            const path = trail.points.map((point) => ({
                position: point.position,
                particleTime: trail.particleTime,
                particleColor: trail.particleColor,
                particleAlpha: trail.particleAlpha,
                particleSize: trail.particleSize,
                particleId: trail.particleId,
            }));
            if (trail.alive) {
                const lastPosition = path[path.length - 1].position;
                if (lastPosition.distanceToSquared(trail.headPosition) > 0) {
                    path.push({
                        position: trail.headPosition,
                        particleTime: trail.particleTime,
                        particleColor: trail.particleColor,
                        particleAlpha: trail.particleAlpha,
                        particleSize: trail.particleSize,
                        particleId: trail.particleId,
                    });
                }
            }
            if (path.length >= 2) {
                paths.push(path);
            }
        }
        return paths;
    }
    getRibbonPaths() {
        const ribbonCount = Math.max(1, Math.floor(this.ribbonCount));
        // Ordering based on age
        const particles = this.particles
            .filter((particle) => this.particleHasTrail(particle.id))
            .sort((a, b) => a.startTime - b.startTime);
        const ribbons = Array.from({ length: ribbonCount }, () => []);
        particles.forEach((particle, index) => {
            const ribbonIndex = index % ribbonCount;
            ribbons[ribbonIndex].push({
                position: particle.position,
                particleTime: particle.time,
                particleColor: particle.color,
                particleAlpha: particle.alpha,
                particleSize: this.getParticleSize(particle),
                particleId: particle.id,
            });
        });
        return ribbons.filter((ribbon) => ribbon.length >= 2);
    }
    rebuildGeometry(camera) {
        const paths = this.getPaths();
        const positions = [];
        const normals = [];
        const uvs = [];
        const colors = [];
        const indices = [];
        const cameraPosition = camera.getWorldPosition(new THREE.Vector3());
        this.mesh.worldToLocal(cameraPosition);
        for (const path of paths) {
            this.appendPathGeometry(path, cameraPosition, positions, normals, uvs, colors, indices);
        }
        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        this.geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        this.geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        this.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));
        this.geometry.setIndex(indices);
        if (positions.length > 0) {
            this.geometry.computeBoundingSphere();
        }
        else {
            this.geometry.boundingSphere = null;
        }
    }
    appendPathGeometry(path, cameraPosition, positions, normals, uvs, colors, indices) {
        if (path.length < 2) {
            return;
        }
        const baseVertex = positions.length / 3;
        const distances = new Array(path.length);
        distances[0] = 0;
        for (let i = 1; i < path.length; i++) {
            distances[i] = distances[i - 1] + path[i].position.distanceTo(path[i - 1].position);
        }
        const totalDistance = distances[distances.length - 1];
        let previousSide;
        for (let i = 0; i < path.length; i++) {
            const point = path[i];
            const trailT = totalDistance > 0 ? distances[i] / totalDistance : 0;
            const tangent = this.getTangent(path, i);
            const viewDirection = cameraPosition.clone().sub(point.position);
            if (viewDirection.lengthSq() > 0) {
                viewDirection.normalize();
            }
            else {
                viewDirection.set(0, 0, 1);
            }
            const side = new THREE.Vector3().crossVectors(tangent, viewDirection);
            if (side.lengthSq() < 0.000001) {
                if (previousSide) {
                    side.copy(previousSide);
                }
                else {
                    side.copy(this.getPerpendicular(tangent));
                }
            }
            side.normalize();
            if (previousSide && side.dot(previousSide) < 0) {
                side.negate();
            }
            previousSide = side.clone();
            const normal = new THREE.Vector3()
                .crossVectors(side, tangent)
                .normalize();
            let width = evaluateDynamicNumber(this.width, point.particleTime, point.particleId);
            width *= evaluateDynamicNumber(this.widthOverTrail, trailT, point.particleId);
            if (this.sizeAffectsWidth) {
                width *= point.particleSize;
            }
            const halfWidth = width * 0.5;
            const left = point.position
                .clone()
                .addScaledVector(side, -halfWidth);
            const right = point.position
                .clone()
                .addScaledVector(side, halfWidth);
            positions.push(left.x, left.y, left.z, right.x, right.y, right.z);
            normals.push(normal.x, normal.y, normal.z, normal.x, normal.y, normal.z);
            const u = this.getTextureU(i, path.length, distances[i], totalDistance);
            uvs.push(u, 0, u, 1);
            const lifetimeColor = evaluateDynamicColor(this.colorOverLifetime, point.particleTime, point.particleId).clone();
            const trailColor = evaluateDynamicColor(this.colorOverTrail, trailT, point.particleId).clone();
            const finalColor = lifetimeColor.multiply(trailColor);
            if (this.inheritParticleColor) {
                finalColor.multiply(point.particleColor);
            }
            const alpha = this.inheritParticleColor ? point.particleAlpha : 1;
            colors.push(finalColor.r, finalColor.g, finalColor.b, alpha, finalColor.r, finalColor.g, finalColor.b, alpha);
        }
        // Build tris
        for (let i = 0; i < path.length - 1; i++) {
            const a = baseVertex + i * 2;
            const b = a + 1;
            const c = a + 2;
            const d = a + 3;
            indices.push(a, b, c, b, d, c);
        }
    }
    getTangent(path, index) {
        const tangent = new THREE.Vector3();
        if (index === 0) {
            tangent.subVectors(path[1].position, path[0].position);
        }
        else if (index === path.length - 1) {
            tangent.subVectors(path[index].position, path[index - 1].position);
        }
        else {
            tangent.subVectors(path[index + 1].position, path[index - 1].position);
        }
        /*
         * Duplicate trail positions can otherwise give us an
         * unusable zero-length tangent.
         */
        if (tangent.lengthSq() < 0.000001) {
            if (index > 0) {
                tangent.subVectors(path[index].position, path[index - 1].position);
            }
            if (tangent.lengthSq() < 0.000001 && index < path.length - 1) {
                tangent.subVectors(path[index + 1].position, path[index].position);
            }
        }
        if (tangent.lengthSq() < 0.000001) {
            tangent.set(1, 0, 0);
        }
        return tangent.normalize();
    }
    getPerpendicular(tangent) {
        const reference = Math.abs(tangent.z) < 0.9
            ? new THREE.Vector3(0, 0, 1)
            : new THREE.Vector3(0, 1, 0);
        return new THREE.Vector3()
            .crossVectors(tangent, reference)
            .normalize();
    }
    getTextureU(index, pointCount, distance, totalDistance) {
        switch (this.textureMode) {
            case TrailTextureMode.Tile:
                return distance;
            case TrailTextureMode.RepeatPerSegment:
                return index;
            case TrailTextureMode.DistributePerSegment:
                return pointCount > 1 ? index / (pointCount - 1) : 0;
            case TrailTextureMode.Stretch:
            default:
                return totalDistance > 0 ? distance / totalDistance : 0;
        }
    }
    getParticleSize(particle) {
        return Math.max(Math.abs(particle.scale.x), Math.abs(particle.scale.y), Math.abs(particle.scale.z));
    }
    particleHasTrail(id) {
        const ratio = THREE.MathUtils.clamp(this.ratio, 0, 1);
        if (ratio <= 0) {
            return false;
        }
        if (ratio >= 1) {
            return true;
        }
        const random = seedrandom(id).quick();
        return random < ratio;
    }
    preprocessMaterial(material) {
        if (Array.isArray(material)) {
            material.forEach((item) => this.preprocessMaterial(item));
            return;
        }
        material.vertexColors = true;
        material.transparent = true;
        material.needsUpdate = true;
    }
}
export default TrailRenderer;
