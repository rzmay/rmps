import Module from '../Module';
import Particle from '../Particle';
import { DynamicValue } from '../types/DynamicValue';
import { ICollisionBackend, CollisionHit } from '../interfaces/ICollisionBackend';
import ParticleSystem from '../ParticleSystem';
export type CollisionListener = (particle: Particle, collision: CollisionHit) => void;
export interface CollisionOptions {
    backend: ICollisionBackend;
    dampen: DynamicValue<number>;
    bounce: DynamicValue<number>;
    lifetimeLoss: DynamicValue<number>;
    applyImpulses: boolean;
    radiusScale: number;
    minKillSpeed: number;
    maxKillSpeed: number;
    onCollision?: CollisionListener;
}
declare class Collision extends Module {
    backend?: ICollisionBackend;
    dampen: DynamicValue<number>;
    bounce: DynamicValue<number>;
    lifetimeLoss: DynamicValue<number>;
    applyImpulses: boolean;
    radiusScale: number;
    minKillSpeed: number;
    maxKillSpeed: number;
    private collisionListeners;
    private _system?;
    constructor(options?: Partial<CollisionOptions>);
    onCollision(listener: CollisionListener): void;
    removeCollisionListener(listener: CollisionListener): void;
    prepare(system: ParticleSystem, deltaTime: number): void;
    private collide;
    private resolvePosition;
    private resolveVelocity;
    private resolveLifetime;
    private getParticleRadius;
    private killParticle;
}
export default Collision;
