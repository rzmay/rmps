import * as THREE from 'three';
import Particle from './Particle';
import Emitter from './Emitter';
import Module from './Module';
import { Renderer } from './Renderer';
import { multiple } from './types/multiple';
import { DynamicValue } from './types/DynamicValue';
interface ParticleSystemOptions {
    emitters: multiple<Emitter>;
    renderers: multiple<Renderer>;
    modules: multiple<Module>;
    gravity: THREE.Vector3;
    gravityModifier: DynamicValue<number>;
}
declare class ParticleSystem extends THREE.Object3D {
    particles: Particle[];
    emitters: Emitter[];
    modules: Module[];
    renderers: Renderer[];
    gravity: THREE.Vector3;
    gravityModifier: DynamicValue<number>;
    private deltaTime;
    private lastFrame;
    constructor(options?: Partial<ParticleSystemOptions>);
    private calculateDeltaTime;
    update(): void;
}
export default ParticleSystem;
