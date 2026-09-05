/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from 'three';
import type {
  ICollisionBackend,
  CollisionHit,
  CollisionQuery,
} from 'rmps';
import {
  AmmoLike,
  AmmoWorldLike,
} from './interfaces';

type AmmoCollisionData = {
  body: any;
};

export interface AmmoCollisionBackendOptions {
  Ammo: any;
  world: any;
}

class AmmoCollisionBackend implements ICollisionBackend {
  private Ammo: AmmoLike;

  private world: AmmoWorldLike;

  constructor(options: AmmoCollisionBackendOptions) {
    this.Ammo = options.Ammo;
    this.world = options.world;
  }

  collide(query: CollisionQuery): CollisionHit | null {
    const shape = new this.Ammo.btSphereShape(query.radius);

    const from = new this.Ammo.btTransform();
    const to = new this.Ammo.btTransform();

    from.setIdentity();
    to.setIdentity();

    const fromPosition = new this.Ammo.btVector3(
      query.start.x,
      query.start.y,
      query.start.z,
    );

    const toPosition = new this.Ammo.btVector3(
      query.end.x,
      query.end.y,
      query.end.z,
    );

    from.setOrigin(fromPosition);
    to.setOrigin(toPosition);

    const callback = new this.Ammo.ClosestConvexResultCallback(
      fromPosition,
      toPosition,
    );

    this.world.convexSweepTest(
      shape,
      from,
      to,
      callback,
    );

    if (!callback.hasHit()) {
      this._destroy(shape, from, to, fromPosition, toPosition, callback);
      return null;
    }

    const hitPoint = callback.get_m_hitPointWorld();
    const hitNormal = callback.get_m_hitNormalWorld();

    const point = new THREE.Vector3(
      hitPoint.x(),
      hitPoint.y(),
      hitPoint.z(),
    );

    const normal = new THREE.Vector3(
      hitNormal.x(),
      hitNormal.y(),
      hitNormal.z(),
    ).normalize();

    const fraction = callback.get_m_closestHitFraction();
    const position = query.start
      .clone()
      .lerp(query.end, fraction)
      .addScaledVector(normal, 1e-4);

    const collisionObject = callback.get_m_hitCollisionObject();

    this._destroy(shape, from, to, fromPosition, toPosition, callback);

    const body = this.Ammo.btRigidBody.upcast(collisionObject);

    return {
      point,
      normal,
      position,
      backendData: { body },
    };
  }

  applyImpulse(
    hit: CollisionHit,
    impulse: THREE.Vector3,
  ): void {
    const data = hit.backendData as AmmoCollisionData | undefined;

    if (!data?.body) return;

    const ammoImpulse = new this.Ammo.btVector3(
      impulse.x,
      impulse.y,
      impulse.z,
    );

    const worldPoint = new this.Ammo.btVector3(
      hit.point.x,
      hit.point.y,
      hit.point.z,
    );

    const center = data.body.getCenterOfMassPosition();

    const relativePosition = new this.Ammo.btVector3(
      worldPoint.x() - center.x(),
      worldPoint.y() - center.y(),
      worldPoint.z() - center.z(),
    );

    data.body.activate(true);

    data.body.applyImpulse(
      ammoImpulse,
      relativePosition,
    );

    this._destroy(ammoImpulse, worldPoint, relativePosition);
  }

  private _destroy(...objects: any[]): void {
    objects.forEach((object) => this.Ammo.destroy(object));
  }
}

export default AmmoCollisionBackend;
