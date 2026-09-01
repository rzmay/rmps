import * as THREE from 'three';
export function getSceneFromObject(object) {
    let current = object;
    while (current) {
        if (current instanceof THREE.Scene)
            return current;
        current = current.parent;
    }
    return null;
}
