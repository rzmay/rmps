import * as THREE from 'three';
import Particle from './Particle';

class Module {
  constructor(public modify: ((particle: Particle, deltaTime: number) => void)) {}
}

export default Module;
