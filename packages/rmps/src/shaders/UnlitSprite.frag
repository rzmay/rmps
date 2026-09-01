uniform sampler2D pointTexture;
uniform sampler2D alphaMap;
uniform bool hasAlphaMap;
uniform vec2 gridSize;
uniform int n_frames;

varying vec4 vColor;
varying float aspectRatio;
varying float angle;

flat in int fragFrame;

vec2 sprite_coord(vec2 coord, int frame) {
    float f_frame = mod(float(frame), float(n_frames));

    return vec2(
        (coord.x / gridSize.x) + (mod(f_frame, gridSize.x) * (1.0 / gridSize.x)),
        1.0 - ((coord.y / gridSize.y) + (floor(f_frame / gridSize.x) * (1.0 / gridSize.y)))
    );
}

vec2 rotate_vector(vec2 value, float rotation)
{
    return vec2(
        cos(rotation) * value.x
            + sin(rotation) * value.y,

        cos(rotation) * value.y
            - sin(rotation) * value.x
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

    vec2 fromCenter =
        gl_PointCoord - vec2(0.5);

    vec2 rotatedFromCenter =
        rotate_vector(fromCenter, angle);

    vec2 scaledFromCenter =
        rotatedFromCenter * scaleVector;

    vec2 rotatedCoord =
        vec2(0.5) + scaledFromCenter;

    if (
        rotatedCoord.x < 0.0
        || rotatedCoord.x > 1.0
        || rotatedCoord.y < 0.0
        || rotatedCoord.y > 1.0
    )
    {
        discard;
    }

    vec2 spriteCoord = sprite_coord(rotatedCoord, fragFrame);

    vec4 baseColor = gl_FragColor * texture2D(pointTexture, spriteCoord);

    if (hasAlphaMap) {
        baseColor.a *= texture2D(alphaMap, spriteCoord).r;
    }

    gl_FragColor = baseColor;
}
