/* eslint-disable react/no-unknown-property */
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stats } from '@react-three/drei';
import CameraControls from '../components/CameraControls';
import ParticleSystemDisplay from '../components/ParticleSystemDisplay';

function DemoScene({ onCodeChange, onShowCodeChange }) {
  return (
    <>
      <Stats />
      <CameraControls />
      <ParticleSystemDisplay
        onCodeChange={onCodeChange}
        onShowCodeChange={onShowCodeChange}
      />
    </>
  );
}

function IndexPage() {
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="demo-shell">
      <Canvas
        onCreated={({ gl }) => gl.setClearColor('#202020')}
        shadows
      >
        <DemoScene
          onCodeChange={setCode}
          onShowCodeChange={setShowCode}
        />
      </Canvas>

      {showCode && (
        <pre className="code-panel">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}

export default IndexPage;
