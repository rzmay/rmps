import Particle from './Particle';
import ParticleSystem from './ParticleSystem';
import { Tag } from './types/Tag';
import { StrictMultiple } from './types/Multiple';
import acceptMultiple from './helpers/acceptMultiple';
import tagsIntersect from './helpers/tagsIntersect';

export interface ModuleOptions {
  // -1 runs before movement updates, modules are sorted by priority afterwards
  priority: number;

  tags: StrictMultiple<Tag>;
}

class Module {
  // Sub-modules on which this module depends.
  // Useful for pre-processing or combining priority stages.
  public dependents: Module[] = [];

  tags?: Tag[];

  priority: number = -1;

  constructor(
    public _modify: ((particle: Particle, deltaTime: number) => void),
    options: Partial<ModuleOptions> = {}
  ) {
    this.tags = acceptMultiple(options.tags);
    this.priority = options.priority ?? this.priority;
  }

  public modify(particle: Particle, deltaTime: number): void {
    if (!this.tags || tagsIntersect(this.tags, particle.tags ?? []))
      this._modify(particle, deltaTime);
  }

  // Process into array including self and dependents
  public withDependents(): Module[] {
    // Run dependents before this
    return [
      ...(this.dependents.flatMap(d => d.withDependents())),
      this,
    ]
  }

  // Optional preparation hook called once-per-update rather than per particle
  public prepare(particleSystem: ParticleSystem, deltaTime: number)  {  }

  // Optional clean up hook for modules that require it
  public cleanup() { }
}

export default Module;
