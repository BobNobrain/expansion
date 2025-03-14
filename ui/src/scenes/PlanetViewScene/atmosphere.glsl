float niceExp(float x) {
    return (exp(x) - 1.0) / (exp(1.0) - 1.0);
}

float EPS = 1e-5;
float INNER_ATMOSPHERE_START = 0.2;
float OUTER_ATMOSPHERE_END = 1.2;

struct LineToOriginDistance {
    float dist;
    vec3 direction;
};

void distanceFromLineToOrigin(vec3 lineA, vec3 lineB, out LineToOriginDistance result) {
    vec3 C = lineA;
    vec3 S = lineB;
    vec3 CS = C - S;
    vec3 n = normalize(cross(cross(-C, CS), CS));

    result.direction = n;
    result.dist = -1.0;

    // try xy first
    float det = n.x * CS.y - n.y * CS.x;
    float detU = 0.0;
    if (abs(det) > EPS) {
        detU = C.x * CS.y - C.y * CS.x;
        result.dist = detU / det;
        return;
    }

    // try xz next
    det = n.x * CS.z - n.z * CS.x;
    if (abs(det) > EPS) {
        detU = C.x * CS.z - C.z * CS.x;
        result.dist = detU / det;
        return;
    }

    // the final option, yz
    det = n.y * CS.z - n.z * CS.y;
    if (abs(det) > EPS) {
        detU = C.y * CS.z - C.z * CS.y;
        result.dist = detU / det;
        return;
    }

    // nothing has worked out for some reason
    return;
}

void main() {
    vec3 origin = getRayOrigin();
    vec3 forward = getRayForward();

    LineToOriginDistance fromPlanetCenter;
    distanceFromLineToOrigin(origin, forward, fromPlanetCenter);

    if (fromPlanetCenter.dist < 0.0) {
        gl_FragColor = vec4(1.0, 0.0, 1.0, 0.9);
        return;
    }

    float brightness = 0.0;
    if (INNER_ATMOSPHERE_START < fromPlanetCenter.dist && fromPlanetCenter.dist <= 1.0) {
        brightness = (fromPlanetCenter.dist - INNER_ATMOSPHERE_START) / (1.0 - INNER_ATMOSPHERE_START);
        brightness *= brightness;
    } else if (fromPlanetCenter.dist > 1.0 && fromPlanetCenter.dist <= OUTER_ATMOSPHERE_END) {
        brightness = niceExp((OUTER_ATMOSPHERE_END - fromPlanetCenter.dist) / (OUTER_ATMOSPHERE_END - 1.0));
    }

    // TODO: proper atmosphere lighting calculations that look nice
    vec3 sunlightDirection = -directionalLights[0].direction;
    float angleToSunCos = dot(normalize(sunlightDirection), normalize(fromPlanetCenter.direction));
    brightness *= max(0.2, min(1.0, angleToSunCos));

    vec3 atmosphereColor = (directionalLights[0].color * brightness + ambientLightColor) * uDensity;
    gl_FragColor = vec4(atmosphereColor, length(atmosphereColor));
}
