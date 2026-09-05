import * as THREE from 'three';
import {
  ExternalForces,
  ParticleForceField,
  ParticleForceFieldHelper,
  ParticleSystem,
} from 'rmps';

export default function createForceFields(scene) {
  const root = new THREE.Group();
  root.name = 'Force Fields Scene';

  /*
   * VORTEX
   *
   * Pulls particles toward its center while accelerating them
   * tangentially around the Y axis.
   */
  const vortex = ParticleForceField.Sphere({
    rotationSpeed: 9,
    rotationAttraction: 5,
    drag: 0.3,
  }, 2);

  vortex.name = 'Vortex';
  vortex.position.set(-4, 3, 0);

  const vortexHelper = new ParticleForceFieldHelper(
    vortex,
    0xa66cff,
  );

  /*
   * WIND TUNNEL
   *
   * A rectangular region applying a directional force.
   */
  const wind = ParticleForceField.Box(
    {
      direction: new THREE.Vector3(6, 2, 0),
      drag: 0.1,
    },
    2, 2, 3,
  );

  wind.name = 'Wind';
  wind.position.set(4, 3, 0);

  const windHelper = new ParticleForceFieldHelper(
    wind,
    0x5edcff,
  );

  /*
   * REPULSOR
   *
   * Negative gravity pushes particles away from the field center.
   */
  const repulsor = ParticleForceField.Sphere({
    gravity: -12,
  }, 2);

  repulsor.name = 'Repulsor';
  repulsor.position.set(0, 3, -4);

  const repulsorHelper = new ParticleForceFieldHelper(
    repulsor,
    0xff655e,
  );

  /*
   * FUNNEL
   *
   * Shows that force-field volumes can use geometry other than a
   * sphere or box.
   */
  const funnel = ParticleForceField.Cone(
    {
      rotationSpeed: 7,
      rotationAttraction: 4,
      direction: new THREE.Vector3(0, 3, 0),
      drag: 0.25,
    },
    2,
    4,
  );

  funnel.name = 'Funnel';
  funnel.position.set(0, 3, 4);

  const funnelHelper = new ParticleForceFieldHelper(
    funnel,
    0x63ff9d,
  );

  root.add(
    vortex,
    vortexHelper,
    wind,
    windHelper,
    repulsor,
    repulsorHelper,
    funnel,
    funnelHelper,
  );

  /*
   * Ground plane to make particle movement easier to read.
   */
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 18),
    new THREE.MeshStandardMaterial({
      color: 0x25252c,
      roughness: 0.85,
      metalness: 0,
    }),
  );

  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -2;
  ground.receiveShadow = true;

  root.add(ground);

  const ambient = new THREE.AmbientLight(
    0xffffff,
    0.4,
  );

  root.add(ambient);

  const light = new THREE.DirectionalLight(
    0xffffff,
    2,
  );

  light.position.set(5, 10, 5);
  root.add(light);

  scene.add(root);

  /*
   * Add ExternalForces specifically for this scene.
   *
   * The module doesn't explicitly reference any of the fields below;
   * it discovers ParticleForceFields from the scene automatically.
   */
  let frameId;
  let removeExternalForcesModule = () => {};
  const refreshExternalForcesModule = () => {
    let particleSystem;
    scene.traverse((obj) => {
      if (obj instanceof ParticleSystem) particleSystem = obj;
    });

    if (!particleSystem.modules.some((module) => module instanceof ExternalForces)) {
      const externalForces = new ExternalForces({});

      particleSystem.addModule(externalForces);

      removeExternalForcesModule = () => particleSystem.removeModule(externalForces);
    }

    frameId = requestAnimationFrame(refreshExternalForcesModule);
  }

  refreshExternalForcesModule()

  return () => {
    cancelAnimationFrame(frameId);
    removeExternalForcesModule();

    scene.remove(root);

    vortexHelper.dispose();
    windHelper.dispose();
    repulsorHelper.dispose();
    funnelHelper.dispose();

    ground.geometry.dispose();
    ground.material.dispose();
  };
}
