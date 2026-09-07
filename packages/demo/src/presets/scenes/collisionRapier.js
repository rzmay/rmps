import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { RapierCollisionBackend } from '@rmps/rapier';
import createCollisionObjects from './createCollisionObjects';

export default async function createRapierCollisionTest(scene) {
  await RAPIER.init();

  const world = new RAPIER.World({
    x: 0,
    y: -9.81,
    z: 0,
  });

  const objects = createCollisionObjects(true);
  scene.add(objects.group);

  const bodies = [];

  const addBox = (mesh, type = 'fixed') => {
    const params = mesh.geometry.parameters;

    let bodyDesc;

    switch (type) {
      case 'dynamic':
        bodyDesc = RAPIER.RigidBodyDesc.dynamic();
        break;

      case 'kinematic':
        bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased();
        break;

      default:
        bodyDesc = RAPIER.RigidBodyDesc.fixed();
        break;
    }

    bodyDesc
      .setTranslation(
        mesh.position.x,
        mesh.position.y,
        mesh.position.z,
      )
      .setRotation({
        x: mesh.quaternion.x,
        y: mesh.quaternion.y,
        z: mesh.quaternion.z,
        w: mesh.quaternion.w,
      });

    const body = world.createRigidBody(bodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.cuboid(
      params.width / 2,
      params.height / 2,
      params.depth / 2,
    );

    world.createCollider(colliderDesc, body);

    bodies.push({
      body,
      mesh,
    });

    return body;
  };

  addBox(objects.wall);
  addBox(objects.backWall);
  addBox(objects.ramp);
  addBox(objects.platform);

  const dynamicBodyA =
    addBox(objects.dynamicA, 'dynamic');

  const dynamicBodyB =
    addBox(objects.dynamicB, 'dynamic');

  const movingBody =
    addBox(objects.movingBox, 'kinematic');

  scene.userData.__rmps_activeCollisionBackend =
    new RapierCollisionBackend({
      RAPIER,
      world,
    });

  const syncBody = (mesh, body) => {
    const position = body.translation();
    const rotation = body.rotation();

    mesh.position.set(
      position.x,
      position.y,
      position.z,
    );

    mesh.quaternion.set(
      rotation.x,
      rotation.y,
      rotation.z,
      rotation.w,
    );
  };

  const clock = new THREE.Clock();
  const fixedDelta = 1 / 60;
  let accumulator = 0;
  let elapsed = 0;
  let frameId;

  world.timestep = fixedDelta;

  const animate = () => {
    const frameDelta = Math.min(clock.getDelta(), 0.1);
    accumulator += frameDelta;
    elapsed += frameDelta;

    const x = Math.sin(elapsed) * 2;
    const rotation = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0, elapsed * 0.75, 0),
    );

    while (accumulator >= fixedDelta) {
      movingBody.setNextKinematicTranslation({ x, y: 1, z: 2 });
      movingBody.setNextKinematicRotation({
        x: rotation.x,
        y: rotation.y,
        z: rotation.z,
        w: rotation.w,
      });

      world.step();
      accumulator -= fixedDelta;
    }

    syncBody(objects.movingBox, movingBody);
    syncBody(objects.dynamicA, dynamicBodyA);
    syncBody(objects.dynamicB, dynamicBodyB);

    frameId = requestAnimationFrame(animate);
  };

  animate();

  return () => {
    cancelAnimationFrame(frameId);

    delete scene.userData.__rmps_activeCollisionBackend;

    objects.group.removeFromParent();

    world.free();
  };
}
