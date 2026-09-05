import loadCheckerboard from './checkerboard';
import loadColorLights from './colorLights';
import loadHdri from './hdri';
import shanghaiBund from 'url:../../assets/images/shanghai_bund_1k.hdr';
import ferndaleStudio from 'url:../../assets/images/ferndale_studio_11_1k.hdr';
import createCollisionTest from './collisionTest';
import createRapierCollisionTest from './collisionRapier';
import createJoltCollisionTest from './collisionJolt';
import createForceFields from './forceFields';


const scenePresets = {
  Checkerboard: loadCheckerboard,
  'Shanghai Bund HDRI': loadHdri(shanghaiBund),
  'Ferndale Studio HDRI': loadHdri(ferndaleStudio),
  'Color Lights': loadColorLights,
  'Collision (builtin/Octree)': createCollisionTest,
  'Collision (Rapier)': createRapierCollisionTest,
  'Collision (Jolt)': createJoltCollisionTest,
  'Force Fields': createForceFields,
};

export default scenePresets;
