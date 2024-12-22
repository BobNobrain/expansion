varying vec2 vUv;

float niceExp(float x) {
    return (exp(x) - 1.0) / (exp(1.0) - 1.0);
}

float EPS = 1e-5;
float INNER_ATMOSPHERE_START = 0.8;
float OUTER_ATMOSPHERE_END = 1.2;

float distanceFromLineToOrigin(vec3 lineA, vec3 lineB) {
    vec3 C = lineA;
    vec3 S = lineB;
    vec3 CS = C - S;
    // vec3 cs = normalize(CS);
    // vec3 co = normalize(-C);
    vec3 n = normalize(cross(cross(-C, CS), CS));

    // try xy first
    float det = n.x * CS.y - n.y * CS.x;
    float detU = 0.0;
    if (abs(det) > EPS) {
        detU = C.x * CS.y - C.y * CS.x;
        return detU / det;
    }

    // try xz next
    det = n.x * CS.z - n.z * CS.x;
    if (abs(det) > EPS) {
        detU = C.x * CS.z - C.z * CS.x;
        return detU / det;
    }

    // the final option, yz
    det = n.y * CS.z - n.z * CS.y;
    if (abs(det) > EPS) {
        detU = C.y * CS.z - C.z * CS.y;
        return detU / det;
    }

    // nothing has worked out for some reason
    return -1.0;
}

void main() {
    vec2 screenCoords = vUv * 2.0 - 1.0;
    screenCoords.x *= u_cameraAspect;
    screenCoords *= 0.4663; // TODO: wtf is this constant?
    vec4 camView = vec4(screenCoords, -1.0, 0.0) * viewMatrix;

    vec3 origin = vec3(cameraPosition);
    vec3 forward = origin + normalize(vec3(camView));

    // vec3 towardCenter = normalize(-cameraPosition);
    // float dFromCameraToCenter = length(vec3(cameraPosition));
    // vec3 sight = normalize(vec3(camView));

    // float cosAlpha = dot(sight, towardCenter);
    // float sinAlpha = sqrt(1.0 - cosAlpha * cosAlpha);
    // TODO: for some reason, the math here is wrong
    // and this fact gives birth to some strange magic constants and wrong looks
    float distFromPlanetCenter = distanceFromLineToOrigin(origin, forward) * 1.5;

    if (distFromPlanetCenter < 0.0) {
        gl_FragColor = vec4(1.0, 0.0, 1.0, 0.9);
        return;
    }

    float brightness = 0.0;
    if (INNER_ATMOSPHERE_START < distFromPlanetCenter && distFromPlanetCenter <= 1.0) {
        brightness = (distFromPlanetCenter - INNER_ATMOSPHERE_START) / (1.0 - INNER_ATMOSPHERE_START);
        brightness *= brightness;
    } else if (distFromPlanetCenter > 1.0 && distFromPlanetCenter <= OUTER_ATMOSPHERE_END) {
        brightness = niceExp((OUTER_ATMOSPHERE_END - distFromPlanetCenter) / (OUTER_ATMOSPHERE_END - 1.0));
    }

    gl_FragColor = vec4(1.0, 1.0, 1.0, u_density * brightness);
    // gl_FragColor = vec4(0.0, distFromPlanetCenter, 0.5, 0.9);
    // if (distFromPlanetCenter > 1.0) {
    //     gl_FragColor.g = 1.0 / distFromPlanetCenter;
    // }
}
