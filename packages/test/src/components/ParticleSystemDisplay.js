import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { ParticleSystem, SpriteRenderer } from 'rmps';

function ParticleSystemDisplay() {
  const particleSystem = useRef();
  const { scene } = useThree();

  useEffect(() => {
    particleSystem.current = new ParticleSystem();
    scene.add(particleSystem.current);
    console.log(particleSystem.current);
  }, [scene]);

  useFrame(() => {
    particleSystem.current.update();
  });

  return (<></>);
}

// ParticleSystem.propTypes = {
//   width: PropTypes.number,
//   length: PropTypes.number,
//   material: PropTypes.any,
// };

export default ParticleSystemDisplay;
