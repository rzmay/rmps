import createAdditiveSmoke from './additiveSmoke';
import createCubes from './cubes';
import createFire from './fire';
import createFireball from './fireball';
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
};

export default particlePresets;
