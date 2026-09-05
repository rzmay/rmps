import * as THREE from 'three';
import ParticleForceField from './ParticleForceField';
declare class ParticleForceFieldHelper extends THREE.Object3D {
    forceField: ParticleForceField;
    color: THREE.Color;
    private shapeHelper?;
    private directionHelper?;
    private sourceGeometry?;
    constructor(forceField: ParticleForceField, color?: THREE.ColorRepresentation);
    update(): void;
    setColor(color: THREE.ColorRepresentation): void;
    dispose(): void;
    private _updateTransform;
    private _disposeShape;
    private _disposeDirection;
    onBeforeRender(): void;
}
export default ParticleForceFieldHelper;
