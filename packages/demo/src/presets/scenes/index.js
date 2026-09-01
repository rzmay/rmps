import loadCheckerboard from './checkerboard';
import loadColorLights from './colorLights';
import loadHdri from './hdri';
import shanghaiBund from 'url:../../assets/images/shanghai_bund_1k.hdr';
import ferndaleStudio from 'url:../../assets/images/ferndale_studio_11_1k.hdr';


const scenePresets = {
  Checkerboard: loadCheckerboard,
  'Shanghai Bund HDRI': loadHdri(shanghaiBund),
  'Ferndale Studio HDRI': loadHdri(ferndaleStudio),
  'Color Lights': loadColorLights,
};

export default scenePresets;
