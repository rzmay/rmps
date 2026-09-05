import createAdditiveSmoke from './additiveSmoke';
import createBubbles from './bubbles';
import createCollision from './collision';
import createCubes from './cubes';
import createFire from './fire';
import createFireball from './fireball';
import createParticleTrail from './particleTrail';
import createRibbonTrail from './ribbonTrail';
import createSmoke from './smoke';
import createSnow from './snow';
import createSpheres from './spheres';
import createSuzanne from './suzanne';
import createSuzannes from './suzanneInstances';

const particlePresets = {
  Fire: createFire,
  Fireball: createFireball,
  Smoke: createSmoke,
  "Additive Smoke": createAdditiveSmoke,
  Snow: createSnow,
  Suzanne: createSuzanne,
  Spheres: createSpheres,
  "Cube Instances": createCubes,
  "Suzanne Instances": createSuzannes,
  "Particle Trail": createParticleTrail,
  "Ribbon Trail": createRibbonTrail,
  Collision: createCollision,
  "Bubbles (Audio)": createBubbles,
};

export default particlePresets;
