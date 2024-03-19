varying vec2 vUv;

vec3 onViewLine(vec3 origin, vec3 forward, float k) {
    return k * forward + (1.0 - k) * origin;
}

float niceExp(float x) {
    return (exp(x) - 1.0) / (exp(1.0) - 1.0);
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

int conform(float x, int loop) {
    int r = int(x) % loop;
    if (r < 0) {
        r += loop;
    }
    return r;
}

float sampleNoiseAtGrid(vec3 gridPoint) {
    const float capf = 65536.0; // 2 ** 16
    int gridX = conform(gridPoint.x, 256);
    int gridY = conform(gridPoint.y, 256);
    int gridZ = conform(gridPoint.z, 256);

    int hash1 = (1327 * gridX % 81733) + (1393 * gridY % 23418) + (3119 * (gridZ + 37) % 7343) + (293 * gridX * gridY % 2913);
    int hash2 = (3229 * gridX + 1937 * gridZ) % 17538 + (889 * gridY % 1129) + (gridX * gridZ * 37) % 189;
    int hash = (hash1 % 256) + ((hash2 % 256) * 256);

    return float(hash) / capf;
}

float weightedSampleNoiseAtGrid(vec3 pt, vec3 gridPoint) {
    float noise = sampleNoiseAtGrid(gridPoint);
    float d = length(gridPoint - pt);
    if (d > 1.0) {
        return 0.0;
    }
    return (1.0 - d) * noise;
}

float sampleNoiseLayer(vec3 pos, float size) {
    vec3 pt = pos / size;
    vec3 fl = floor(pt);
    vec3 cl = ceil(pt);

    float sum = 0.0;
    sum += weightedSampleNoiseAtGrid(pt, fl);
    sum += weightedSampleNoiseAtGrid(pt, vec3(fl.x, fl.y, cl.z));
    sum += weightedSampleNoiseAtGrid(pt, vec3(fl.x, cl.y, fl.z));
    sum += weightedSampleNoiseAtGrid(pt, vec3(fl.x, cl.y, cl.z));
    sum += weightedSampleNoiseAtGrid(pt, vec3(cl.x, fl.y, fl.z));
    sum += weightedSampleNoiseAtGrid(pt, vec3(cl.x, fl.y, cl.z));
    sum += weightedSampleNoiseAtGrid(pt, vec3(cl.x, cl.y, fl.z));
    sum += weightedSampleNoiseAtGrid(pt, cl);

    return sum;
}

float sampleNoise(vec3 pos) {
    float sum = 0.0;
    for (int i = 0; i < N_NOISE_LAYERS; i++) {
        NoiseLayer l = u_noiseLayers[i];
        sum += sampleNoiseLayer(pos, l.gridSize) * l.multiplier;
    }
    return sum;
}

float sampleGalaxyBrightness(vec3 pos) {
    float txX = (pos.x / u_outerR + 1.0) / 2.0;
    float txY = 1.0 - (pos.z / u_outerR + 1.0) / 2.0;
    if (txX < 0.0 || 1.0 < txX || txY < 0.0 || 1.0 < txY) {
        return 0.0;
    }
    vec4 texel = texture2D(u_galaxyTex, vec2(txX, txY));
    return texel.r;
}

float integrateFromTexture(vec3 origin, vec3 forward, vec2 kInterval) {
    float dk = u_samplingGranularity;
    float dkHalf = 0.5 * u_samplingGranularity;

    float result = 0.0;
    float k = kInterval[0] + dkHalf;
    while (k < kInterval[1] && result < 1.0) {
        vec3 pos = onViewLine(origin, forward, k);
        float distanceMultiplier = min(0.1, 0.01 / ((k - kInterval[0]) * (k - kInterval[0])));

        float brightnessFromH = niceExp(1.0 - abs(pos.y) / u_maxH);
        float brightnessFromTx = sampleGalaxyBrightness(pos);

        float noise = 1.0;
        if (u_noiseLayers[0].gridSize > 0.0) {
            noise = 1.0 + (sampleNoise(pos) - 0.5) * 1.0;
        }

        float brightnessAtPos = brightnessFromH * brightnessFromTx * distanceMultiplier * noise;
        result += brightnessAtPos * dk;

        k += dk;
    }

    result *= u_totalBrightness;

    if (result > 1.0) {
        result = 1.0;
    }
    return result;
}

void main() {
    vec2 screenCoords = vUv * 2.0 - 1.0;
    screenCoords.x *= u_cameraAspect;
    screenCoords *= 0.4663; // TODO: wtf is this constant?
    vec4 camView = vec4(screenCoords, -1.0, 0.0) * viewMatrix;

    vec3 origin = vec3(cameraPosition);
    vec3 forward = origin + normalize(vec3(camView));

    vec3 disk = findDiscIntersections(origin, forward, u_outerR, u_maxH);
    if (disk[2] < 0.0) {
        // no valid intersections
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }

    float brightness = integrateFromTexture(origin, forward, vec2(disk[0], disk[1]));
    gl_FragColor = vec4(brightness, brightness, brightness, 1.0);
}
