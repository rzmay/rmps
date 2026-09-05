import * as THREE from 'three';
class ParticleForceFieldHelper extends THREE.Object3D {
    constructor(forceField, color = 0xffff00) {
        super();
        this.forceField = forceField;
        this.color = new THREE.Color(color);
        this.name = `${forceField.name || 'ParticleForceField'}Helper`;
        this.update();
    }
    update() {
        /*
         * Only rebuild the shape geometry if the force field geometry
         * itself changed.
         */
        if (!this.shapeHelper
            || this.sourceGeometry !== this.forceField.geometry) {
            this._disposeShape();
            const material = new THREE.LineBasicMaterial({
                color: this.color,
                transparent: true,
                opacity: 0.5,
                depthTest: false,
                toneMapped: false,
            });
            const geometry = new THREE.WireframeGeometry(this.forceField.geometry);
            this.shapeHelper = new THREE.LineSegments(geometry, material);
            this.shapeHelper.renderOrder = 999;
            this.add(this.shapeHelper);
            this.sourceGeometry = this.forceField.geometry;
        }
        /*
         * Rebuild the directional arrow.
         *
         * We can only show a meaningful static arrow when direction is
         * actually a Vector3. Functional/curve-based DynamicValues don't
         * have one universal direction to visualize.
         */
        this._disposeDirection();
        if (this.forceField.direction instanceof THREE.Vector3) {
            const direction = this.forceField.direction.clone();
            const length = direction.length();
            if (length > 0) {
                direction.normalize();
                this.directionHelper = new THREE.ArrowHelper(direction, new THREE.Vector3(), Math.min(length, 2), this.color);
                /*
                 * Keep the arrow readable even when the force itself is very
                 * weak or very strong.
                 */
                this.directionHelper.setLength(Math.min(Math.max(length, 0.5), 2), 0.35, 0.2);
                this.add(this.directionHelper);
            }
        }
        this._updateTransform();
    }
    setColor(color) {
        var _a, _b;
        this.color.set(color);
        if (((_a = this.shapeHelper) === null || _a === void 0 ? void 0 : _a.material)
            instanceof THREE.LineBasicMaterial) {
            this.shapeHelper.material.color.copy(this.color);
        }
        (_b = this.directionHelper) === null || _b === void 0 ? void 0 : _b.setColor(this.color);
    }
    dispose() {
        this._disposeShape();
        this._disposeDirection();
        this.sourceGeometry = undefined;
    }
    _updateTransform() {
        this.forceField.updateWorldMatrix(true, false);
        this.forceField.getWorldPosition(this.position);
        this.forceField.getWorldQuaternion(this.quaternion);
        this.forceField.getWorldScale(this.scale);
    }
    _disposeShape() {
        if (!this.shapeHelper)
            return;
        this.shapeHelper.removeFromParent();
        /*
         * This is a WireframeGeometry owned by the helper, so disposing it
         * does NOT dispose the ParticleForceField's actual geometry.
         */
        this.shapeHelper.geometry.dispose();
        if (Array.isArray(this.shapeHelper.material)) {
            this.shapeHelper.material.forEach(material => material.dispose());
        }
        else {
            this.shapeHelper.material.dispose();
        }
        this.shapeHelper = undefined;
    }
    _disposeDirection() {
        if (!this.directionHelper)
            return;
        this.directionHelper.removeFromParent();
        this.directionHelper.dispose();
        this.directionHelper = undefined;
    }
    onBeforeRender() {
        this._updateTransform();
    }
}
export default ParticleForceFieldHelper;
