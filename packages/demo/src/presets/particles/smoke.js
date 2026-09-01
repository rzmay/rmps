import * as THREE from 'three';
import {
  ColorOverLifetime,
  Emitter,
  EmissionShape,
  LimitVelocityOverLifetime,
  ParticleSystem,
  RotationOverLifetime,
  SizeOverLifetime,
  SpriteRenderer,
  TransformByNoise,
} from 'rmps';
import defaultSprite from 'url:../../assets/images/default.png';
import smokeAlpha from 'url:../../assets/images/smoke_alpha.jpg';
import { curvePresets } from '../curvePresets';

export default async function createSmoke() {
  const smoke = new ParticleSystem({
    gravityModifier: -0.015,
    emitters: [
      new Emitter({
        source: new EmissionShape({
          geometry: new THREE.ConeGeometry(0.75, 1.2, 24),
        }),
        rate: 36,
        duration: 10,
        looping: true,
        initialValues: {
          lifetime: 4.5,
          speed: 0.55,
          scale: new THREE.Vector3(10, 10, 10),
          color: [new THREE.Color('#4e4d4a'), new THREE.Color('#a7a097')],
          alpha: 0.55,
          velocity: new THREE.Vector3(0, 0.75, 0),
          radial: 0.18,
        },
      }),
    ],
    modules: [
      new TransformByNoise({
        strength: new THREE.Vector3(0.65, 0.35, 0.65),
        frequency: 0.8,
      }),
      new LimitVelocityOverLifetime({
        limit: new THREE.Vector3(1.1, 1.35, 1.1),
        drag: 0.1,
        multiplyDragByVelocity: true,
      }),
      new SizeOverLifetime({
        size: (time) => {
          const size = curvePresets.grow.evaluate(time);
          return new THREE.Vector3(size, size, size);
        },
      }),
      new ColorOverLifetime({
        color: new THREE.Color('#ffffff'),
        alpha: (time) => curvePresets.fadeInOut.evaluate(time),
      }),
      new RotationOverLifetime({
        angularVelocity: [new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 0, 0)],
      }),
    ],
    renderers: [
      new SpriteRenderer(defaultSprite, {
        material: 'basic',
        alphaMap: smokeAlpha,
        materialOptions: {
          roughness: 1,
          normalLighting: 0.5,
          sphericalNormals: true,
        }
      }),
    ],
  });

  smoke.name = 'Smoke';
  smoke.position.set(0, 1, 0);

  return smoke;
}
