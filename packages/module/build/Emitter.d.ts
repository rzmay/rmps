import EmissionShape from './EmissionShape';
import Particle from './Particle';
import InitialParticleValues from './interfaces/InitialParticleValues';
declare type SpawnBurst = {
    time: number;
    count: number;
    fired?: boolean;
};
declare class Emitter {
    source: EmissionShape;
    rate: number;
    duration: number;
    looping: boolean;
    bursts: SpawnBurst[];
    initialValues: Partial<InitialParticleValues>;
    private _lastSpawn;
    private _startTime;
    constructor(initialValues?: Partial<InitialParticleValues>, source?: EmissionShape, bursts?: SpawnBurst[], rate?: number, duration?: number, looping?: boolean);
    update(particles: Particle[]): void;
    private spawnParticle;
}
export default Emitter;
