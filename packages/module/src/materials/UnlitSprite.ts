import * as THREE from 'three';
import unlitSpriteVert from '../shaders/UnlitSprite.vert';
import unlitSpriteFrag from '../shaders/UnlitSprite.frag';

interface UnlitSpriteOptions {
  gridSize: {x: number, y: number};
  frames: number;
}

const loader = new THREE.FileLoader();

const vert = loader.loadAsync(unlitSpriteVert);
const frag = loader.loadAsync(unlitSpriteFrag);

const UnlitSprite = async (texture: THREE.Texture, options: Partial<UnlitSpriteOptions> = {}) => new THREE.ShaderMaterial({
  vertexShader: (await vert).toString(),
  fragmentShader: (await frag).toString(),
  uniforms: {
    pointTexture: { value: texture },
    gridSize: { value: options.gridSize },
    n_frames: { value: options.frames },
  },

  depthTest: true,
  depthWrite: false,
  transparent: true,
  vertexColors: true,

  ...options,
});

export default UnlitSprite;
