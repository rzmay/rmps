import * as THREE from 'three';
import Module from '../Module';
import evaluateDynamicNumber from '../helpers/evaluateDynamicNumber';
import particleRatio from '../helpers/particleRatio';
import acceptMultiple from '../helpers/acceptMultiple';
// TODO: onSpawn sound, onDeath sound
class Audio extends Module {
    constructor(options = {}) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        super((particle) => this._updateParticle(particle), options);
        this.shouldPlay = () => true;
        this.loop = true;
        this._particleAudio = new Map();
        this._eventAudio = new Set();
        this._setupCallbacks = false;
        this.listener = options.listener;
        this.sound = options.sound
            ? acceptMultiple(options.sound)
            : undefined;
        this.onCollisionSound = options.onCollisionSound
            ? acceptMultiple(options.onCollisionSound)
            : undefined;
        this.onSpawnSound = options.onSpawnSound
            ? acceptMultiple(options.onSpawnSound)
            : undefined;
        this.onDeathSound = options.onDeathSound
            ? acceptMultiple(options.onDeathSound)
            : undefined;
        this.shouldPlay = (_a = options.shouldPlay) !== null && _a !== void 0 ? _a : this.shouldPlay;
        this.loop = (_b = options.loop) !== null && _b !== void 0 ? _b : this.loop;
        this.ratio = THREE.MathUtils.clamp((_c = options.ratio) !== null && _c !== void 0 ? _c : 1, 0, 1);
        this.collisionRatio = THREE.MathUtils.clamp((_d = options.collisionRatio) !== null && _d !== void 0 ? _d : this.ratio, 0, 1);
        this.pitch = (_e = options.pitch) !== null && _e !== void 0 ? _e : 1;
        this.volume = (_f = options.volume) !== null && _f !== void 0 ? _f : 1;
        this.sizeAffectsPitch = Math.max(0, (_g = options.sizeAffectsPitch) !== null && _g !== void 0 ? _g : 0);
        this.sizeAffectsVolume = Math.max(0, (_h = options.sizeAffectsVolume) !== null && _h !== void 0 ? _h : 0);
        this.alphaAffectsPitch = Math.max(0, (_j = options.alphaAffectsPitch) !== null && _j !== void 0 ? _j : 0);
        this.alphaAffectsVolume = Math.max(0, (_k = options.alphaAffectsVolume) !== null && _k !== void 0 ? _k : 0);
        this.speedAffectsPitch = Math.max(0, (_l = options.speedAffectsPitch) !== null && _l !== void 0 ? _l : 0);
        this.speedAffectsVolume = Math.max(0, (_m = options.speedAffectsVolume) !== null && _m !== void 0 ? _m : 0);
    }
    prepare(system) {
        this._system = system;
        if (!this._setupCallbacks) {
            system.onCollision((particle, _) => this._handleEvent(particle, this.onCollisionSound));
            system.onDeath((particle) => this._handleEvent(particle, this.onDeathSound));
            system.onSpawn((particle) => this._handleEvent(particle, this.onSpawnSound));
            this._setupCallbacks = true;
        }
        if (!this.listener) {
            // Try to get listener from cache
            if (system.scene)
                this.listener = system.scene.userData["__rmps_audioListener"];
            // Try to get listener from camera
            if (system.sceneCamera) {
                system.sceneCamera.traverse((object) => {
                    if (!this.listener && object instanceof THREE.AudioListener) {
                        this.listener = object;
                    }
                });
                // Add to camera if its not there
                if (!this.listener) {
                    this.listener = new THREE.AudioListener();
                    system.sceneCamera.add(this.listener);
                }
            }
            // If we found a listener, add it to the scene cache
            if (this.listener && system.scene)
                system.scene.userData["__rmps_audioListener"] = this.listener;
        }
        this._cleanParticleAudio(system.particles);
    }
    _updateParticle(particle) {
        if (!this.listener || !this.sound || !this._system)
            return;
        if (!particleRatio(particle, this.ratio) || !this.shouldPlay(particle)) {
            this._removeParticleAudio(particle.id);
            return;
        }
        let state = this._particleAudio.get(particle.id);
        if (!state) {
            const audio = new THREE.PositionalAudio(this.listener);
            const sound = this.sound[Math.floor(Math.random() * this.sound.length)];
            audio.setBuffer(sound);
            audio.setLoop(this.loop);
            this._system.add(audio);
            state = {
                audio,
                buffer: sound,
            };
            this._particleAudio.set(particle.id, state);
            audio.play();
        }
        state.audio.position.copy(particle.position);
        state.audio.setPlaybackRate(this._getPitch(particle));
        state.audio.setVolume(this._getVolume(particle));
    }
    _handleEvent(particle, audio) {
        if (!audio
            || (audio === null || audio === void 0 ? void 0 : audio.length) === 0
            || !particleRatio(particle, this.collisionRatio)
            || !this.shouldPlay(particle)) {
            return;
        }
        this._playOneShot(audio[Math.floor(Math.random() * audio.length)], particle);
    }
    _playOneShot(clip, particle) {
        if (!this.listener || !this._system)
            return;
        const audio = new THREE.PositionalAudio(this.listener);
        audio.setBuffer(clip);
        audio.setLoop(false);
        audio.position.copy(particle.position);
        audio.setPlaybackRate(this._getPitch(particle));
        audio.setVolume(this._getVolume(particle));
        this._system.add(audio);
        this._eventAudio.add(audio);
        audio.play();
        /*
         * THREE.Audio creates a new AudioBufferSourceNode when play() is
         * called. Clean the temporary source up once that playback ends.
         */
        if (audio.source) {
            audio.source.addEventListener('ended', () => {
                this._eventAudio.delete(audio);
                audio.removeFromParent();
            });
        }
    }
    _getPitch(particle) {
        const base = evaluateDynamicNumber(this.pitch, particle.time, particle.id);
        return Math.max(0, base
            * this._getEffect(particle.scale.length(), this.sizeAffectsPitch)
            * this._getEffect(particle.alpha, this.alphaAffectsPitch)
            * this._getEffect(particle.velocity.length() * particle.speed, this.speedAffectsPitch));
    }
    _getVolume(particle) {
        const base = evaluateDynamicNumber(this.volume, particle.time, particle.id);
        return Math.max(0, base
            * this._getEffect(particle.scale.length(), this.sizeAffectsVolume)
            * this._getEffect(particle.alpha, this.alphaAffectsVolume)
            * this._getEffect(particle.velocity.length(), this.speedAffectsVolume));
    }
    // eslint-disable-next-line class-methods-use-this
    _getEffect(value, effect) {
        return Math.pow(Math.max(0, value), effect);
    }
    _cleanParticleAudio(particles) {
        const activeParticles = new Set(particles
            .filter((particle) => particleRatio(particle, this.ratio))
            .map((particle) => particle.id));
        this._particleAudio.forEach((_state, id) => {
            if (!activeParticles.has(id)) {
                this._removeParticleAudio(id);
            }
        });
    }
    _removeParticleAudio(id) {
        const state = this._particleAudio.get(id);
        if (!state)
            return;
        if (state.audio.isPlaying) {
            state.audio.stop();
        }
        state.audio.removeFromParent();
        this._particleAudio.delete(id);
    }
    cleanup() {
        this._particleAudio.forEach((_state, id) => {
            this._removeParticleAudio(id);
        });
        this._eventAudio.forEach((audio) => {
            if (audio.isPlaying) {
                audio.stop();
            }
            audio.removeFromParent();
        });
        this._eventAudio.clear();
    }
}
export default Audio;
