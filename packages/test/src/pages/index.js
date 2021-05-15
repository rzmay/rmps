import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import CameraControls from '../components/CameraControls';
import Floor from '../components/Floor';
import ParticleSystemDisplay from '../components/ParticleSystemDisplay';

function IndexPage() {
  return (
    <Canvas
      onCreated={({ gl }) => gl.setClearColor('#202020')}
      shadowMap
    >
      <pointLight position={[10, 20, 0]} intensity={1} castShadow />
      <ambientLight />
      <CameraControls />
      <ParticleSystemDisplay />
      <Floor width={1000} length={1000} />
    </Canvas>
  );
}

export default IndexPage;
