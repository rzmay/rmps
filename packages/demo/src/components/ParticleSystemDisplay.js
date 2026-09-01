import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useFrame, useThree } from '@react-three/fiber';
import { ParticleSystemGUI } from '../gui/ParticleSystemGUI';
import particlePresets from '../presets/particles';
import scenePresets from '../presets/scenes';

function ParticleSystemDisplay({ onCodeChange, onShowCodeChange }) {
  const particleSystem = useRef(null);
  const guiRef = useRef(null);
  const { scene } = useThree();

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      const initialPreset = 'Fire';
      const system = await particlePresets[initialPreset]();

      if (cancelled) return;

      particleSystem.current = system;
      scene.add(system);

      const gui = new ParticleSystemGUI({
        system,
        scene,
        presets: particlePresets,
        scenes: scenePresets,
        initialPreset,
        initialScene: 'Checkerboard',
        title: 'RMPS Demo',
        width: 340,
        onSystemChange: (nextSystem) => {
          particleSystem.current = nextSystem;
        },
        onCodeChange,
      });

      const viewState = { showCode: false };
      gui.gui
        .add(viewState, 'showCode')
        .name('Show code')
        .onChange(onShowCodeChange);

      guiRef.current = gui;
    }

    initialize();

    return () => {
      cancelled = true;
      guiRef.current?.destroy();
      guiRef.current = null;

      if (particleSystem.current) {
        scene.remove(particleSystem.current);
        particleSystem.current = null;
      }
    };
  }, [onCodeChange, onShowCodeChange, scene]);

  useFrame(() => {
    particleSystem.current?.update();
  });

  return null;
}

ParticleSystemDisplay.propTypes = {
  onCodeChange: PropTypes.func.isRequired,
  onShowCodeChange: PropTypes.func.isRequired,
};

export default ParticleSystemDisplay;
