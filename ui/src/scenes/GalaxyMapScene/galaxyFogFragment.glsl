varying vec2 vUv;

vec3 onViewLine(vec3 origin, vec3 forward, float k) {
    return k * forward + (1.0 - k) * origin;
}

vec2 getClosestPointToSight(vec3 origin, vec3 forward, vec3 target) {
    vec3 fo = origin - forward;
    vec3 to = origin - target;
    float k = dot(fo, to) / dot(fo, fo);

    if (k <= 0.0) {
        // clipping off
        return vec2(-1.0, k);
    }

    vec3 closestPoint = k * forward + (1.0 - k) * origin;
    float d = length(closestPoint - target);
    return vec2(d, k);
}

float calcBrightness(vec2 casted) {
    if (casted[1] <= 0.0) {
        return 0.0;
    }

    float exponential = exp(-casted[0] / u_pointSize);
    float scaled = u_pointBrightness * exponential;

    if (casted[1] < 0.1) {
        // smoothing camera clipping
        return scaled * casted[1] / 0.1;
    }

    return scaled;
}

// returns [k1, k2, isValid ? -1 : 1]
vec3 findCylinderIntersections(vec3 origin, vec3 forward, float r) {
    float dx = forward.x - origin.x;
    float dz = forward.z - origin.z;
    float ox = origin.x;
    float oz = origin.z;

    // equation coeffs:
    float a = dx * dx + dz * dz;
    float b = 2.0 * (dx * ox + dz * oz);
    float c = ox * ox + oz * oz - r * r;

    float D = b * b - 4.0 * a * c;
    if (D < 0.0) {
        // no intersections
        return vec3(0.0, 0.0, -1.0);
    }

    float sqrtD = sqrt(D);
    float k1 = (-b + sqrtD) / (2.0 * a);
    float k2 = (-b - sqrtD) / (2.0 * a);
    return vec3(k1, k2, 1.0);
}

// returns [k, isValid ? -1 : 1]
vec2 findYPlaneIntersection(vec3 origin, vec3 forward, float h) {
    float dy = forward.y - origin.y;
    if (abs(dy) < 1e-11) {
        return vec2(0.0, -1.0);
    }
    float k = (h - origin.y) / dy;
    return vec2(k, 1.0);
}

vec3 intersectIntervals(vec2 a, vec2 b) {
    if (max(a.x, a.y) < min(b.x, b.y) || max(b.x, b.y) < min(a.x, a.y)) {
        return vec3(0.0, 0.0, -1.0);
    }
    return vec3(
        min(max(a.x, a.y), max(b.x, b.y)),
        max(min(a.x, a.y), min(b.x, b.y)),
        1.0
    );
}

// returns [kStart, kEnd, isValid ? -1 : 1]
vec3 findDiscIntersections(vec3 origin, vec3 forward, float r, float h) {
    vec3 cyl = findCylinderIntersections(origin, forward, r);
    vec2 upperPlane = findYPlaneIntersection(origin, forward, h);
    vec2 lowerPlane = findYPlaneIntersection(origin, forward, -h);

    float kStart, kEnd;

    if (cyl.z < 0.0) {
        // no intersection with cylinder
        if (origin.x * origin.x + origin.z * origin.z > r * r) {
            // we're outside the cylinder
            return vec3(0.0, 0.0, -1.0);
        }

        // we're inside the cylinder
        kStart = min(upperPlane.x, lowerPlane.x);
        kEnd = max(upperPlane.x, lowerPlane.x);
    } else if (upperPlane.y < 0.0 || lowerPlane.y < 0.0) {
        // no intersection with planes
        if (origin.y < -h || h < origin.y) {
            // we're outside the caps
            return vec3(0.0, 0.0, -1.0);
        }

        kStart = min(cyl.x, cyl.y);
        kEnd = max(cyl.x, cyl.y);
    } else {
        // everything is intersected

        vec3 kInterval = intersectIntervals(vec2(upperPlane.x, lowerPlane.x), vec2(cyl.x, cyl.y));
        if (kInterval[2] < 0.0) {
            return kInterval;
        }

        kStart = min(kInterval[0], kInterval[1]);
        kEnd = max(kInterval[0], kInterval[1]);
    }

    if (kEnd < 0.0) {
        return vec3(0.0, 0.0, -1.0);
    }
    if (kStart < 0.0) {
        kStart = 0.0;
    }

    return vec3(kStart, kEnd, 1.0);
}

void main() {
    vec2 screenCoords = vUv * 2.0 - 1.0;
    screenCoords.x *= u_cameraAspect;
    screenCoords *= 0.4663; // TODO: wtf is this constant?
    vec4 camView = vec4(screenCoords, -1.0, 0.0) * viewMatrix;

    // a & b are 2 points we need to define a line of sight
    vec3 origin = vec3(cameraPosition);
    vec3 forward = origin + normalize(vec3(camView));

    float brightness = 0.0;

    for (int i = 0; i < N_POINTS; i++) {
        vec2 casted = getClosestPointToSight(origin, forward, u_targetPoints[i]);
        float b = calcBrightness(casted);
        brightness += b;
        if (brightness >= 1.0) {
            brightness = 1.0;
            break;
        }
    }

    gl_FragColor = vec4(brightness, brightness, brightness, 1.0);

    vec3 disk = findDiscIntersections(origin, forward, u_outerR, u_maxH);
    if (disk[2] < 0.0) {
        // no valid intersections
        return;
    }
    float distanceTravelled = length(forward - origin) * (disk.y - disk.x);
    gl_FragColor.r = min(1.0, 0.1 * distanceTravelled / u_maxH);
}
