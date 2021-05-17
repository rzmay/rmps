uniform sampler2D pointTexture;

varying vec4 vColor;
varying float aspectRatio;

void main() {

    gl_FragColor = vColor;

    vec2 scaleVector;
    if (aspectRatio < 1.0/aspectRatio) {
        scaleVector = vec2(1.0, 1.0/aspectRatio);
    } else {
        scaleVector = vec2(aspectRatio, 1.0);
    }

    vec2 fromCenter = gl_PointCoord - vec2(0.5, 0.5);
    vec2 scaledFromCenter = fromCenter * scaleVector;
    vec2 resultCoord = vec2(.5,.5) + scaledFromCenter;

    gl_FragColor = gl_FragColor * texture2D( pointTexture, resultCoord );

}