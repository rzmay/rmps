import * as THREE from 'three';

export function getSceneFromObject(object: THREE.Object3D): THREE.Scene | null
{
    let current: THREE.Object3D | null = object;

    while (current)
    {
        if (current instanceof THREE.Scene)
            return current;

        current = current.parent;
    }

    return null;
}
