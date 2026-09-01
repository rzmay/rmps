import * as THREE from 'three';
import {
  ColorOverLifetime,
  Emitter,
  MeshRenderer,
  ParticleSystem,
  RotationOverLifetime,
  SpriteRenderer,
} from 'rmps';
import { curvePresets } from '../curvePresets';

export default async function createCubes() {
  const colors = new Set([
    new THREE.Color('#ff3333'),
    new THREE.Color('#33ff66'),
    new THREE.Color('#ffdd22'),
    new THREE.Color('#3388ff'),
  ]);

  const system = new ParticleSystem({
    gravity: new THREE.Vector3(0, 0, 0),
    gravityModifier: 0,

    emitters: [
      new Emitter({
        rate: 12,
        duration: 10,
        looping: true,

        initialValues: {
          lifetime: [4, 8],
          speed: 1,

          color: colors,

          scale: [
            new THREE.Vector3(0.4, 0.4, 0.4),
            new THREE.Vector3(1.0, 1.0, 1.0),
          ],

          radial: 1,

          alpha: 1,
        },
      }),
    ],

    modules: [
      new RotationOverLifetime({
        angularVelocity: [new THREE.Vector3(5, 0, 1), new THREE.Vector3(-1, 0, -5)],
      }),
      new ColorOverLifetime({
        alpha: (t) => curvePresets.fadeOut.evaluate(t)
      })
    ],

    renderers: [
      new MeshRenderer({
        mesh: new THREE.Mesh(
          new THREE.BoxGeometry(0.25, 0.25, 0.25),
          new THREE.MeshStandardMaterial()
        )
      }),
    ],
  });

  system.name = 'Spheres';
  system.position.set(0, 1, 0);

  return system;
}
