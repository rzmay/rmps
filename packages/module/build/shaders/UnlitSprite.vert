attribute vec3 scale;

varying vec4 vColor;
varying float aspectRatio;

void main() {

    vColor = color;

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

    aspectRatio = float(scale.y) / float(scale.x);

    gl_PointSize = max(scale.x, scale.y) * ( 300.0 / -mvPosition.z );

    gl_Position = projectionMatrix * mvPosition;

}