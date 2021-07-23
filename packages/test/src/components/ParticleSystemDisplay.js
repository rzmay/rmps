import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import {
  ParticleSystem, NoiseModule, Module,
} from 'rmps';

function ParticleSystemDisplay() {
  const particleSystem = useRef(null);
  const { scene } = useThree();

  useEffect(() => {
    particleSystem.current = new ParticleSystem();
    particleSystem.current.emitters[0].rate = 5;
    particleSystem.current.emitters[0].initialValues.lifetime = 5;
    particleSystem.current.emitters[0].initialValues.scale = new THREE.Vector3(5, 5, 5);
    particleSystem.current.position.set(0, 1, 0);

    particleSystem.current.modules.push(new NoiseModule());
    particleSystem.current.modules.push(new Module((particle, dt) => {
      particle.scale = new THREE.Vector3(1, 1, 1).multiplyScalar(particle.data.noise * 4 * (particle.time + 1));
      particle.alpha = -((2 * particle.time - 1) ** 4) + 1;
    }));

    scene.add(particleSystem.current);
    console.log(particleSystem.current);
  }, [particleSystem, scene]);

  useFrame(() => {
    particleSystem.current?.update();
  });

  return (<></>);
}

export default ParticleSystemDisplay;
