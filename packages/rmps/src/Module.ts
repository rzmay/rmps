import * as THREE from 'three';
import Particle from './Particle';
import ParticleSystem from './ParticleSystem';

class Module {
  // Sub-modules on which this module depends.
  // Useful for pre-processing or combining priority stages.
  public dependents: Module[] = [];

  constructor(
    public modify: ((particle: Particle, deltaTime: number) => void),
    public priority: number = -1, // -1 runs before movement updates, modules are sorted by priority afterwards
  ) {}

  // Process into array including self and dependents
  public withDependents(): Module[] {
    return [
      this,
      ...(this.dependents.flatMap(d => d.withDependents()))
    ]
  }

  // Optional preparation hook called once-per-update rather than per particle
  public prepare(particleSystem: ParticleSystem, deltaTime: number)  {  }

  // Optional clean up hook for modules that require it
  public cleanup() { }
}

export default Module;
