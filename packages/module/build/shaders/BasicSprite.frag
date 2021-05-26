uniform sampler2D pointTexture;

varying vec4 vColor;
varying float aspectRatio;
varying float angle;

varying vec3 N;
varying vec3 v;

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

    vec2 fromCenter = gl_PointCoord - vec2(0.5, 0.5);
    vec2 scaledFromCenter = fromCenter * scaleVector;
    vec2 resultCoord = vec2(.5,.5) + scaledFromCenter;

    vec3 N = normalize(vN);
    vec4 finalColor = vec4(0.0, 0.0, 0.0, 0.0);

    for (int i=0;i<MAX_LIGHTS;i++)
    {
        vec3 L = normalize(gl_LightSource[i].position.xyz - v);
        vec3 E = normalize(-v); // we are in Eye Coordinates, so EyePos is (0,0,0)
        vec3 R = normalize(-reflect(L,N));

        //calculate Ambient Term:
        vec4 Iamb = gl_FrontLightProduct[i].ambient;
        //calculate Diffuse Term:
        vec4 Idiff = gl_FrontLightProduct[i].diffuse * max(dot(N,L), 0.0);
        Idiff = clamp(Idiff, 0.0, 1.0);

        // calculate Specular Term:
        vec4 Ispec = gl_FrontLightProduct[i].specular
        * pow(max(dot(R,E),0.0),0.3*gl_FrontMaterial.shininess);
        Ispec = clamp(Ispec, 0.0, 1.0);

        finalColor += Iamb + Idiff + Ispec;
    }

    vec4 baseColor = (gl_FragColor * texture2D( pointTexture, rotate(resultCoord, angle) ));
    gl_FragColor = (gl_FragColor * texture2D( pointTexture, rotate(resultCoord, angle) ));
}