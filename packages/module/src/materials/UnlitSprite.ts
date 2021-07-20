import * as THREE from 'three';
import unlitSpriteVert from '../shaders/UnlitSprite.vert';
import unlitSpriteFrag from '../shaders/UnlitSprite.frag';

const loader = new THREE.FileLoader();

const vert = loader.loadAsync(unlitSpriteVert);
const frag = loader.loadAsync(unlitSpriteFrag);

const UnlitSprite = async (texture: THREE.Texture, props?: any) => new THREE.ShaderMaterial({
  vertexShader: await vert,
  fragmentShader: await frag,
  uniforms: {
    pointTexture: { value: texture },
  },

  depthTest: true,
  depthWrite: false,
  transparent: true,
  vertexColors: true,

  ...props,
});

export default UnlitSprite;
