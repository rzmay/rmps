import * as THREE from 'three';
export default function isPointInGeometry(point, mesh) {
    const raycaster = new THREE.Raycaster();
    const simulationScene = new THREE.Scene();
    simulationScene.add(mesh);
    // If ray cast intercepts an odd number of sides, point is inside
    raycaster.set(point, new THREE.Vector3(1, 1, 1));
    const intersects = raycaster.intersectObject(mesh);
    return intersects.length % 2 === 1;
}
