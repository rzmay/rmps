import * as THREE from 'three';
import { Renderer } from '../interfaces/Renderer';
import ParticleSystem from '../ParticleSystem';
import Particle from '../Particle';
declare class LightRenderer implements Renderer {
    lights: THREE.PointLight[];
    groupingRadiusRatio: number;
    brightness: number;
    decay: number;
    private lightContainer;
    private _system;
    constructor(brightness?: number, groupingRadiusRatio?: number, decay?: number, count?: number);
    setup(system: ParticleSystem): void;
    update(particles: Particle[]): void;
    private _getParticleGroups;
    private _getGroupingRadius;
}
export default LightRenderer;
