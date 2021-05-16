import EmissionShape from './EmissionShape';
import Particle from './Particle';
import InitialParticleValues from './interfaces/InitialParticleValues';
declare type SpawnBurst = {
    time: number;
    count: number;
};
declare class Emitter {
    source: EmissionShape;
    rate: number;
    duration: number;
    looping: boolean;
    bursts: SpawnBurst[];
    initialValues: Partial<InitialParticleValues>;
    private _lastSpawn;
    private _nextBurstIndex;
    private _startTime;
    constructor(initialValues?: Partial<InitialParticleValues>, source?: EmissionShape, bursts?: SpawnBurst[], rate?: number, duration?: number, looping?: boolean);
    get nextBurst(): SpawnBurst;
    update(particles: Particle[]): void;
    private spawnParticle;
}
export default Emitter;