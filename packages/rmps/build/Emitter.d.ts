import EmissionShape from './EmissionShape';
import Particle from './Particle';
import { InitialParticleValues } from './interfaces/InitialParticleValues';
import { DynamicValue } from './types/DynamicValue';
import { multiple } from './types/multiple';
type SpawnBurst = {
    time: number;
    count: number;
    fired?: boolean;
};
interface EmitterOptions {
    initialValues: Partial<InitialParticleValues>;
    source: EmissionShape;
    bursts: multiple<SpawnBurst>;
    rate: DynamicValue<number>;
    duration: number;
    looping: boolean;
}
declare class Emitter {
    source: EmissionShape;
    rate: DynamicValue<number>;
    duration: number;
    looping: boolean;
    bursts: SpawnBurst[];
    initialValues: Partial<InitialParticleValues>;
    private _lastSpawn;
    private _startTime;
    constructor(options?: Partial<EmitterOptions>);
    update(particles: Particle[]): void;
    private spawnParticle;
}
export default Emitter;
