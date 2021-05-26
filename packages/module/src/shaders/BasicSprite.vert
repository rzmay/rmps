attribute vec3 scale;
attribute vec3 rotation;

varying vec4 vColor;
varying float aspectRatio;
varying float angle;

varying vec3 N;
varying vec3 v;

void main() {
    vColor = color;
    angle = rotation.x;

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

    aspectRatio = float(scale.y) / float(scale.x);
    gl_PointSize = max(scale.x, scale.y) * ( 300.0 / -mvPosition.z );
    gl_Position = projectionMatrix * mvPosition;

    v = vec3(gl_ModelViewMatrix * gl_Vertex);
    N = normalize(gl_NormalMatrix * gl_Normal);
}