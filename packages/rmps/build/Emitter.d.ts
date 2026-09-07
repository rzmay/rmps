import * as THREE from 'three';
import EmissionShape from './EmissionShape';
import Particle from './Particle';
import { InitialParticleValues } from './interfaces/InitialParticleValues';
import ParticleSystem from './ParticleSystem';
import { DynamicUntimedValue, DynamicValue } from './types/DynamicValue';
import { Multiple, StrictMultiple } from './types/Multiple';
import { Tag } from './types/Tag';
type SpawnBurst = {
    time: number;
    count: DynamicUntimedValue<number>;
    fired?: boolean;
};
type TagSelectionMethod = 'all' | 'random' | 'distribute';
interface EmitterOptions {
    initialValues: Partial<InitialParticleValues>;
    source: EmissionShape;
    bursts: Multiple<SpawnBurst>;
    rate: DynamicValue<number>;
    duration: number;
    looping: boolean;
    radialSpeed: DynamicValue<number>;
    alignment: DynamicValue<number>;
    tags: StrictMultiple<Tag>;
    tagSelection: TagSelectionMethod;
}
export interface EmissionContext {
    key: string;
    transform: THREE.Matrix4;
    time?: number;
    duration?: number;
    color?: THREE.Color;
    alpha?: number;
    mass?: number;
    tags?: Tag[];
}
declare class Emitter {
    source: EmissionShape;
    rate: DynamicValue<number>;
    duration: number;
    looping: boolean;
    bursts: SpawnBurst[];
    initialValues: Partial<InitialParticleValues>;
    radialSpeed: DynamicValue<number>;
    alignment: DynamicValue<number>;
    tags?: Tag[];
    tagSelection: TagSelectionMethod;
    private _lastSpawn;
    private _startTime;
    private _lastTagIndex;
    private _pausedAt?;
    private _stopped;
    private _contextStates;
    constructor(options?: Partial<EmitterOptions>);
    start(): void;
    pause(): void;
    resume(): void;
    stop(): void;
    setup(particleSystem: ParticleSystem): void;
    update(particles: Particle[]): Particle[];
    updateAt(particles: Particle[], context: EmissionContext): Particle[];
    clearContext(key: string): void;
    private getContextState;
    private spawnParticle;
    private _selectTags;
}
export default Emitter;
