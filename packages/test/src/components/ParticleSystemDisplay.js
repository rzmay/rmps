import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { ParticleSystem, NoiseModule } from 'rmps';

function ParticleSystemDisplay() {
  const particleSystem = useRef(null);
  const { scene } = useThree();

  useEffect(() => {
    particleSystem.current = new ParticleSystem();
    particleSystem.current.emitters[0].initialValues.lifetime = 20;
    particleSystem.current.position.set(0, 1, 0);

    particleSystem.current.modules.push(new NoiseModule((particle, dt) => {
      particle.scale = new THREE.Vector3(1, 1, 1).multiplyScalar(particle.data.noise * 4);
    }, { frequency: 5 }));

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
