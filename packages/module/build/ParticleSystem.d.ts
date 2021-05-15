import * as THREE from 'three';
import Particle from './Particle';
import Emitter from './Emitter';
import Module from './Module';
import Renderer from './interfaces/Renderer';
declare class ParticleSystem extends THREE.Object3D {
    particles: Particle[];
    emitters: Emitter[];
    modules: Module[];
    renderers: Renderer[];
    private deltaTime;
    private lastFrame;
    constructor(emitter?: Emitter | Emitter[], renderer?: Renderer | Renderer[], modules?: Module | Module[]);
    private calculateDeltaTime;
    update(): void;
}
export default ParticleSystem;
