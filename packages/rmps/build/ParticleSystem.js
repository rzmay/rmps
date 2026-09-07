import * as THREE from 'three';
import Emitter from './Emitter';
import acceptMultiple from './helpers/acceptMultiple';
import SpriteRenderer from './renderers/SpriteRenderer';
import evaluateDynamicNumber from './helpers/evaluateDynamicNumber';
import particleRatio from './helpers/particleRatio';
class ParticleSystem extends THREE.Object3D {
    get simulationSpace() {
        return this._simulationSpace;
    }
    set simulationSpace(value) {
        if (value === this._simulationSpace)
            return;
        this.convertParticlesToSimulationSpace(value);
        this._simulationSpace = value;
        this.subSystems.forEach((_options, subSystem) => {
            subSystem.simulationSpace = value;
        });
        this.syncRendererParents();
    }
    get scene() { return this._scene; }
    get sceneCamera() { return this._camera; }
    get sceneRenderer() { return this._renderer; }
    get isSubSystem() { return !!this._subSystemParent; }
    constructor(options = {}) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        super();
        this.particles = [];
        this.emitters = [];
        this.modules = [];
        this.renderers = [];
        this.subSystems = new Map();
        this._simulationSpace = 'local';
        this.deltaTime = 0;
        this._deathListeners = [];
        this._spawnListeners = [];
        this._collisionListeners = [];
        this._emissionRuns = [];
        this._nextEmissionRunId = 0;
        this._playing = true;
        this._paused = false;
        this._rendererObjects = new Set();
        this._worldRendererRoot = new THREE.Group();
        this.emitters = (_b = acceptMultiple((_a = options.emitters) !== null && _a !== void 0 ? _a : new Emitter())) !== null && _b !== void 0 ? _b : [];
        this.renderers = (_d = acceptMultiple((_c = options.renderers) !== null && _c !== void 0 ? _c : new SpriteRenderer())) !== null && _d !== void 0 ? _d : [];
        this.modules = (_e = acceptMultiple(options.modules)) !== null && _e !== void 0 ? _e : [];
        // If gravity is passed in, gravityModifier will be set to 1.
        // In effect, this means gravity will be turned off by default,
        // but if either gravity or gravityModifier are specified, they will be used.
        this.gravity = (_f = options.gravity) !== null && _f !== void 0 ? _f : new THREE.Vector3(0, -9.81, 0);
        this.gravityModifier = (_g = options.gravityModifier) !== null && _g !== void 0 ? _g : (options.gravity ? 1 : 0);
        this._simulationSpace = (_h = options.simulationSpace) !== null && _h !== void 0 ? _h : this._simulationSpace;
        this._worldRendererRoot.name = 'ParticleSystem World Renderers';
        this.lastFrame = Date.now();
        this.emitters.forEach((e) => e.setup(this));
        this.renderers.forEach((r) => r.setup(this));
        // Store these here so that other renderers/modules can access easily
        // Dummy mesh that renders nothing allows us to catch the onBeforeRender hook
        const dummy = new THREE.Mesh();
        this.add(dummy);
        dummy.onBeforeRender = (renderer, scene, camera) => {
            this._renderer = renderer;
            this._scene = scene;
            this._camera = camera;
        };
        // Cleanup on remove from scene. Anything done here should not be permanent.
        // If the system is removed from one scene and added to another, it should
        // still function.
        this.addEventListener('removed', () => this.cleanup());
    }
    /*
      * PROCESSING
    */
    update() {
        // Subsystems are owned and ticked by parent, avoid double update
        if (this._subSystemParent)
            return;
        // Check for pauses
        if (this._paused)
            return;
        this.syncRendererParents();
        this._calculateDeltaTime();
        if (this._playing)
            this.emitters.forEach((emitter) => {
                const particles = emitter.update(this.particles, this.getEmitterContext());
                particles.forEach((p) => this._notifySpawn(p));
            });
        // Particle processing
        this._processParticles();
        // Subsystems
        this._updateSubSystems();
    }
    _calculateDeltaTime() {
        this.deltaTime = (Date.now() - this.lastFrame) / 1000;
        this.lastFrame = (Date.now());
    }
    _processParticles() {
        // Moudle preparation
        this.modules
            .flatMap((module) => module.withDependents())
            .forEach((module) => module.prepare(this, this.deltaTime));
        this.particles.forEach((particle, index) => {
            this.modules
                .flatMap((module) => module.withDependents())
                .filter((module) => module.priority < 0)
                .forEach((module) => module.modify(particle, this.deltaTime));
            particle.velocity.addScaledVector(this.gravity, this.deltaTime * evaluateDynamicNumber(this.gravityModifier, particle.time, particle.id));
            particle.update(this.deltaTime);
            this.modules
                .flatMap((module) => module.withDependents())
                .filter((module) => module.priority >= 0)
                .sort((a, b) => a.priority - b.priority)
                .forEach((module) => module.modify(particle, this.deltaTime));
            if (Date.now() - particle.startTime > particle.lifetime * 1000) {
                this._notifyDeath(particle);
                this.particles.splice(index, 1);
                this.subSystems.forEach((_options, subSystem) => {
                    subSystem.emitters.forEach((emitter) => emitter.clearContext(particle.id));
                });
            }
        });
        this.renderers.forEach((renderer) => {
            renderer.update(this.particles, this);
        });
    }
    _updateSubSystems() {
        this.subSystems.forEach((options, subSystem) => {
            subSystem._updateAsSubSystem(this.particles, options);
        });
    }
    _updateAsSubSystem(parentParticles, options) {
        if (!this._playing || this._paused)
            return;
        this.syncRendererParents();
        this._calculateDeltaTime();
        if (options.emitContinuous) {
            parentParticles
                .filter((particle) => this._canEmitForParticle(particle, options))
                .forEach((particle) => {
                const transform = this._particleEmissionTransform(particle, options.inheritScale);
                this.emitters.forEach((emitter) => {
                    const particles = emitter.updateAt(this.particles, {
                        key: particle.id,
                        transform,
                        time: options.inheritLifetime ? particle.time : undefined,
                        duration: options.inheritLifetime ? particle.lifetime : undefined,
                        color: options.inheritColor ? particle.color : undefined,
                        alpha: options.inheritAlpha ? particle.alpha : undefined,
                        mass: options.inheritMass ? particle.mass : undefined,
                        tags: particle.tags,
                    });
                    particles.forEach((p) => this._notifySpawn(p));
                });
            });
        }
        this._updateEmissionRuns(options);
        this._processParticles();
        this._updateSubSystems();
    }
    _updateEmissionRuns(options) {
        const now = Date.now();
        for (let i = this._emissionRuns.length - 1; i >= 0; i -= 1) {
            const run = this._emissionRuns[i];
            let finished = true;
            this.emitters.forEach((emitter) => {
                var _a;
                const duration = (_a = run.duration) !== null && _a !== void 0 ? _a : emitter.duration;
                const elapsed = (now - run.startTime) / 1000;
                const startTime = 0;
                const time = startTime + (elapsed / duration);
                // Ignore looping emitters
                if (time < 1) {
                    finished = false;
                    const newParticles = emitter.updateAt(this.particles, {
                        key: run.id,
                        transform: run.transform,
                        time,
                        duration,
                        color: options.inheritColor ? run.particle.color : undefined,
                    });
                    newParticles.forEach((particle) => this._notifySpawn(particle));
                }
                else {
                    emitter.clearContext(run.id);
                }
            });
            if (finished) {
                this._emissionRuns.splice(i, 1);
            }
        }
    }
    _canEmitForParticle(particle, options) {
        var _a;
        if (!particleRatio(particle, (_a = options.ratio) !== null && _a !== void 0 ? _a : 1))
            return false;
        return typeof options.shouldEmit === 'function'
            ? options.shouldEmit(particle)
            : options.shouldEmit;
    }
    _startEmissionRunAtParticle(particle, options) {
        const now = Date.now();
        this._emissionRuns.push({
            id: `event_${this._nextEmissionRunId++}`,
            transform: this._particleEmissionTransform(particle),
            startTime: now,
            // If lifetime is inherited, use the parent's lifetime instead
            // of the subsystem emitter's configured duration.
            duration: options.inheritLifetime
                ? particle.lifetime
                : undefined,
            // Pass particle info -- clone so reference doesn't get destroyed
            particle: {
                position: particle.position.clone(),
                rotation: particle.rotation.clone(),
                scale: particle.scale.clone(),
                color: particle.color.clone(),
                tags: particle.tags ? [...particle.tags] : undefined,
                alpha: particle.alpha,
                lifetime: particle.lifetime,
                mass: particle.mass,
            },
        });
    }
    _particleEmissionTransform(particle, inheritScale = false) {
        const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(particle.rotation.x, particle.rotation.y, particle.rotation.z));
        return new THREE.Matrix4().compose(particle.position, quaternion, inheritScale ? particle.scale : new THREE.Vector3(1, 1, 1));
    }
    /*
      * CONTROL
    */
    // Start emitting
    start() {
        this._playing = true;
        this._paused = false;
        this.lastFrame = Date.now();
        this.emitters.forEach((emitter) => {
            emitter.start();
        });
        this.subSystems.forEach((_options, subSystem) => {
            subSystem.start();
        });
        this._emissionRuns.forEach((run) => {
            this.emitters.forEach((emitter) => emitter.clearContext(run.id));
        });
        this._emissionRuns.length = 0;
    }
    // Pause emission and simulation
    pause() {
        if (!this._playing || this._paused)
            return;
        this._paused = true;
        this.emitters.forEach((emitter) => {
            emitter.pause();
        });
        this.subSystems.forEach((_options, subSystem) => {
            subSystem.pause();
        });
    }
    resume() {
        if (!this._playing || !this._paused)
            return;
        this._paused = false;
        this.lastFrame = Date.now();
        this.emitters.forEach((emitter) => {
            emitter.resume();
        });
        this.subSystems.forEach((_options, subSystem) => {
            subSystem.resume();
        });
    }
    // Stop emission and optionally clear particles
    stop(clearParticles) {
        this._playing = false;
        this._paused = false;
        this.emitters.forEach((emitter) => {
            emitter.stop();
        });
        this.subSystems.forEach((_options, subSystem) => {
            subSystem.stop(clearParticles);
        });
        this._emissionRuns.forEach((run) => {
            this.emitters.forEach((emitter) => {
                emitter.clearContext(run.id);
            });
        });
        this._emissionRuns.length = 0;
        if (clearParticles)
            this.clearParticles();
    }
    // Clear particles
    clearParticles() {
        this.particles.length = 0;
        this.renderers.forEach((renderer) => {
            renderer.update(this.particles, this);
        });
        this.subSystems.forEach((_options, subSystem) => {
            subSystem.clearParticles();
        });
    }
    /*
      * ACCESSING
    */
    addEmitter(emitter) {
        this.emitters.push(emitter);
        emitter.setup(this);
        return this;
    }
    removeEmitter(emitter) {
        const index = this.emitters.indexOf(emitter);
        if (index !== -1) {
            this.emitters.splice(index, 1);
            this.remove(emitter.source);
        }
        return this;
    }
    addModule(module) {
        this.modules.push(module);
        return this;
    }
    removeModule(module) {
        const index = this.modules.indexOf(module);
        if (index !== -1) {
            this.modules.splice(index, 1);
            module.cleanup();
        }
        return this;
    }
    addRenderer(renderer) {
        this.renderers.push(renderer);
        renderer.setup(this);
        this.syncRendererParents();
        return this;
    }
    removeRenderer(renderer) {
        const index = this.renderers.indexOf(renderer);
        if (index !== -1) {
            this.modules.splice(index, 1);
            renderer.destroy();
        }
        return this;
    }
    addRendererObject(object) {
        this._rendererObjects.add(object);
        this.getRendererParent().add(object);
    }
    addSubSystem(subSystem, options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        // No adding recursive self
        if (subSystem === this)
            return this;
        // Replace existing parent
        if (subSystem._subSystemParent && subSystem._subSystemParent !== this) {
            subSystem._subSystemParent.removeSubSystem(subSystem);
        }
        // Configure emission condition
        const emitOnCollision = (_a = options.emitOnCollision) !== null && _a !== void 0 ? _a : false;
        const emitOnSpawn = (_b = options.emitOnSpawn) !== null && _b !== void 0 ? _b : false;
        const emitOnDeath = (_c = options.emitOnDeath) !== null && _c !== void 0 ? _c : false;
        const emitContinuous = (_d = options.emitContinuous) !== null && _d !== void 0 ? _d : !(emitOnCollision || emitOnDeath || emitOnSpawn);
        this.subSystems.set(subSystem, {
            shouldEmit: (_e = options.shouldEmit) !== null && _e !== void 0 ? _e : true,
            ratio: THREE.MathUtils.clamp((_f = options.ratio) !== null && _f !== void 0 ? _f : 1, 0, 1),
            emitContinuous,
            emitOnCollision,
            emitOnSpawn,
            emitOnDeath,
            inheritScale: (_g = options.inheritScale) !== null && _g !== void 0 ? _g : true,
            inheritLifetime: (_h = options.inheritLifetime) !== null && _h !== void 0 ? _h : emitContinuous,
            inheritColor: (_j = options.inheritColor) !== null && _j !== void 0 ? _j : true,
            inheritAlpha: (_k = options.inheritAlpha) !== null && _k !== void 0 ? _k : true,
            inheritMass: (_l = options.inheritMass) !== null && _l !== void 0 ? _l : true,
        });
        subSystem._subSystemParent = this;
        subSystem.simulationSpace = this.simulationSpace;
        // Identity local transform makes the subsystem share this system's space.
        subSystem.position.set(0, 0, 0);
        subSystem.rotation.set(0, 0, 0);
        subSystem.scale.set(1, 1, 1);
        this.add(subSystem);
        return this;
    }
    removeSubSystem(subSystem) {
        if (!this.subSystems.delete(subSystem))
            return this;
        subSystem._subSystemParent = undefined;
        if (subSystem.parent === this)
            this.remove(subSystem);
        return this;
    }
    /*
      * LISTENERS
    */
    onDeath(listener) {
        this._deathListeners.push(listener);
        return this;
    }
    removeDeathListener(listener) {
        this._deathListeners = this._deathListeners.filter((value) => value !== listener);
        return this;
    }
    onSpawn(listener) {
        this._spawnListeners.push(listener);
        return this;
    }
    removeSpawnListener(listener) {
        this._spawnListeners = this._spawnListeners.filter((value) => value !== listener);
        return this;
    }
    onCollision(listener) {
        this._collisionListeners.push(listener);
        return this;
    }
    removeCollisionListener(listener) {
        this._collisionListeners = this._collisionListeners.filter((value) => value !== listener);
        return this;
    }
    // Called by Collision after a hit is found.
    notifyCollision(particle, collision) {
        this._collisionListeners.forEach((listener) => listener(particle, collision));
        this.subSystems.forEach((options, subSystem) => {
            if (options.emitOnCollision && this._canEmitForParticle(particle, options)) {
                subSystem._startEmissionRunAtParticle(particle, options);
            }
        });
    }
    _notifyDeath(particle) {
        this._deathListeners.forEach((listener) => listener(particle));
        this.subSystems.forEach((options, subSystem) => {
            if (options.emitOnDeath && this._canEmitForParticle(particle, options)) {
                subSystem._startEmissionRunAtParticle(particle, options);
            }
        });
    }
    _notifySpawn(particle) {
        this._spawnListeners.forEach((listener) => listener(particle));
        this.subSystems.forEach((options, subSystem) => {
            if (options.emitOnSpawn && this._canEmitForParticle(particle, options)) {
                subSystem._startEmissionRunAtParticle(particle, options);
            }
        });
    }
    cleanup() {
        this.modules
            .flatMap((module) => module.withDependents())
            .forEach((module) => module.cleanup());
        this._worldRendererRoot.removeFromParent();
    }
    getEmitterContext() {
        if (this.simulationSpace !== 'world')
            return undefined;
        this.updateWorldMatrix(true, false);
        return {
            transform: this.matrixWorld.clone(),
        };
    }
    getRendererParent() {
        if (this.simulationSpace !== 'world')
            return this;
        return this._worldRendererRoot;
    }
    syncRendererParents() {
        const worldRendererParent = this.getWorldRendererParent();
        if (this.simulationSpace === 'world') {
            if (worldRendererParent && this._worldRendererRoot.parent !== worldRendererParent) {
                worldRendererParent.add(this._worldRendererRoot);
            }
        }
        else if (this._worldRendererRoot.parent) {
            this._worldRendererRoot.removeFromParent();
        }
        const parent = this.getRendererParent();
        this._rendererObjects.forEach((object) => {
            if (object.parent !== parent)
                parent.add(object);
        });
    }
    getWorldRendererParent() {
        let parent = this.parent;
        while (parent instanceof ParticleSystem) {
            parent = parent.parent;
        }
        return parent !== null && parent !== void 0 ? parent : undefined;
    }
    convertParticlesToSimulationSpace(space) {
        this.updateWorldMatrix(true, false);
        if (space === 'world') {
            this.particles.forEach((particle) => {
                this.localToWorld(particle.position);
                this.localDirectionToWorld(particle.velocity);
                this.localDirectionToWorld(particle.acceleration);
                this.localDirectionToWorld(particle.scalarVelocity);
                this.localDirectionToWorld(particle.scalarAcceleration);
                particle.cacheStartValues();
            });
        }
        else {
            const normalMatrix = new THREE.Matrix3().getNormalMatrix(this.matrixWorld).invert();
            this.particles.forEach((particle) => {
                this.worldToLocal(particle.position);
                particle.velocity.applyMatrix3(normalMatrix);
                particle.acceleration.applyMatrix3(normalMatrix);
                particle.scalarVelocity.applyMatrix3(normalMatrix);
                particle.scalarAcceleration.applyMatrix3(normalMatrix);
                particle.cacheStartValues();
            });
        }
    }
    localDirectionToWorld(vector) {
        vector.applyMatrix3(new THREE.Matrix3().getNormalMatrix(this.matrixWorld));
    }
}
export default ParticleSystem;
