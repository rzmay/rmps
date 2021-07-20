import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { ParticleSystem, Module } from 'rmps';

function ParticleSystemDisplay() {
  const particleSystem = useRef(null);
  const { scene } = useThree();

  useEffect(() => {
    particleSystem.current = new ParticleSystem();
    particleSystem.current.position.set(0, 1, 0);

    particleSystem.current.modules.push(new Module((particle, dt) => {
      particle.alpha = (1 - particle.time**3);
      particle.scale = new THREE.Vector3(1, 1, 1).multiplyScalar(particle.time * 4);
    }));

    scene.add(particleSystem.current);
    console.log(particleSystem.current);
  }, [particleSystem, scene]);

  useFrame(() => {
    particleSystem.current?.update();
  });

  return (<></>);
}

// ParticleSystem.propTypes = {
//   width: PropTypes.number,
//   length: PropTypes.number,
//   material: PropTypes.any,
// };

export default ParticleSystemDisplay;
