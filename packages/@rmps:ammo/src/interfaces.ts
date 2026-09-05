/* eslint-disable @typescript-eslint/no-explicit-any */
export interface AmmoVector3Like {
  x(): number;
  y(): number;
  z(): number;
}

export interface AmmoRigidBodyLike {
  activate(forceActivation?: boolean): void;
  applyImpulse(
    impulse: AmmoVector3Like,
    relativePosition: AmmoVector3Like,
  ): void;
  getCenterOfMassPosition(): AmmoVector3Like;
}

export interface AmmoLike {
  btSphereShape: new (radius: number) => any;
  btTransform: new () => any;
  btVector3: new (
    x: number,
    y: number,
    z: number,
  ) => AmmoVector3Like;

  ClosestConvexResultCallback: new (
    from: AmmoVector3Like,
    to: AmmoVector3Like,
  ) => any;

  btRigidBody: {
    upcast(object: any): AmmoRigidBodyLike;
  };

  destroy(object: unknown): void;
}

export interface AmmoWorldLike {
  convexSweepTest(
    shape: any,
    from: any,
    to: any,
    callback: any,
  ): void;
}
