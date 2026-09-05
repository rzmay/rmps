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
    private _scene?;
    get scene(): THREE.Scene<THREE.Object3DEventMap> | undefined;
    private _camera?;
    get sceneCamera(): THREE.Camera | undefined;
    private _renderer?;
    get sceneRenderer(): THREE.WebGLRenderer | undefined;
    private deltaTime;
    private lastFrame;
    constructor(options?: Partial<ParticleSystemOptions>);
    private calculateDeltaTime;
    update(): void;
    addModule(module: Module): this;
    removeModule(module: Module): this;
    private cleanup;
}
export default ParticleSystem;
