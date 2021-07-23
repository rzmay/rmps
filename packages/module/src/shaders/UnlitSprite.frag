uniform sampler2D pointTexture;
uniform vec2 gridSize;
uniform int n_frames;

varying vec4 vColor;
varying float aspectRatio;
varying float angle;
flat in int fragFrame;

vec2 sprite_coord(vec2 coord, int frame) {
    float f_frame = float(frame);

    return vec2(
        (coord.x / gridSize.x) + (mod(f_frame, gridSize.x) * (1.0 / gridSize.x)),
        1.0 - ((coord.y / gridSize.y) + (floor(f_frame / gridSize.x) * (1.0 / gridSize.y)))
    );
}

vec2 rotate(vec2 uv, float rotation) {
    float mid = 0.5;
    return vec2(
        cos(rotation) * (uv.x - mid) + sin(rotation) * (uv.y - mid) + mid,
        cos(rotation) * (uv.y - mid) - sin(rotation) * (uv.x - mid) + mid
    );
}


void main() {

    gl_FragColor = vColor;

    vec2 scaleVector;
    if (aspectRatio < 1.0/aspectRatio) {
        scaleVector = vec2(1.0, 1.0/aspectRatio);
    } else {
        scaleVector = vec2(aspectRatio, 1.0);
    }

    vec2 spriteCoord = sprite_coord(gl_PointCoord, fragFrame);
    vec2 fromCenter = spriteCoord - vec2(0.5, 0.5);
    vec2 scaledFromCenter = fromCenter * scaleVector;
    vec2 resultCoord = vec2(.5,.5) + scaledFromCenter;

    gl_FragColor = gl_FragColor * texture2D( pointTexture, rotate(resultCoord, angle) );
}
