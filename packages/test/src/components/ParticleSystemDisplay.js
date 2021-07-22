import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { ParticleSystem, NoiseModule } from 'rmps';

function ParticleSystemDisplay() {
  const particleSystem = useRef(null);
  const { scene } = useThree();

  useEffect(() => {
    particleSystem.current = new ParticleSystem();
    particleSystem.current.emitters[0].rate = (time) => time * 50;
    particleSystem.current.position.set(0, 1, 0);

    particleSystem.current.modules.push(new NoiseModule((particle, dt) => {
      particle.color = new THREE.Color(particle.data.noise, particle.data.noise4d, 1);
      // particle.scale = new THREE.Vector3(1, 1, 1).multiplyScalar(particle.data.noise4d * 4);
    }, { frequency: 1 }));

    scene.add(particleSystem.current);
    console.log(particleSystem.current);
  }, [particleSystem, scene]);

  useFrame(() => {
    particleSystem.current?.update();
  });

  return (<></>);
}

export default ParticleSystemDisplay;
