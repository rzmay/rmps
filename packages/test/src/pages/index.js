import React, { useEffect, useState } from 'react';
import { Canvas, extend } from '@react-three/fiber';
import { Stats } from '@react-three/drei';
import CameraControls from '../components/CameraControls';
import Floor from '../components/Floor';
import ParticleSystemDisplay from '../components/ParticleSystemDisplay';

function IndexPage() {
  return (
    <Canvas
      onCreated={({ gl }) => gl.setClearColor('#202020')}
      shadowMap
    >
      <Stats />
      <pointLight position={[10, 20, 0]} intensity={1} castShadow />
      <ambientLight />
      <CameraControls />
      <ParticleSystemDisplay />
      <Floor width={1000} length={1000} />
    </Canvas>
  );
}

export default IndexPage;
