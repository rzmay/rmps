import Particle from './Particle';
declare class Module {
    modify: ((particle: Particle, deltaTime: number) => void);
    constructor(modify: ((particle: Particle, deltaTime: number) => void));
}
export default Module;
