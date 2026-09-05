import Module from '../Module';
import Particle from '../Particle';
import { DynamicValue } from '../types/DynamicValue';
import { ICollisionBackend, CollisionHit } from '../interfaces/ICollisionBackend';
import ParticleSystem from '../ParticleSystem';
export interface CollisionOptions {
    backend?: ICollisionBackend;
    dampen?: DynamicValue<number>;
    bounce?: DynamicValue<number>;
    lifetimeLoss?: DynamicValue<number>;
    radiusScale?: number;
    minKillSpeed?: number;
    maxKillSpeed?: number;
    onCollision?: (particle: Particle, collision: CollisionHit) => void;
}
declare class Collision extends Module {
    backend?: ICollisionBackend;
    dampen: DynamicValue<number>;
    bounce: DynamicValue<number>;
    lifetimeLoss: DynamicValue<number>;
    radiusScale: number;
    minKillSpeed: number;
    maxKillSpeed: number;
    onCollision?: (particle: Particle, collision: CollisionHit) => void;
    constructor(options: CollisionOptions);
    prepare(system: ParticleSystem, deltaTime: number): void;
    private collide;
    private resolvePosition;
    private resolveVelocity;
    private resolveLifetime;
    private getParticleRadius;
    private killParticle;
}
export default Collision;
