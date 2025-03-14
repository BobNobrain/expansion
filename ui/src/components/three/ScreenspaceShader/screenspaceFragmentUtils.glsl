vec2 getScreenCoords() {
    vec2 screenCoords = vScreenPos * 2.0 - 1.0;
    screenCoords.x *= uCameraAspect;
    // screenCoords *= 0.4663;
    return screenCoords;
}

vec3 getRayOrigin() {
    vec3 origin = vec3(cameraPosition);
    return origin;
}

vec3 getRayForward() {
    vec2 screenCoords = getScreenCoords();
    vec3 origin = vec3(cameraPosition);
    // TODO: find out how the 1.3 constant is related to camera FOV (it works for fov=75)
    vec4 camView = vec4(screenCoords, 1.3, 1.0) * viewMatrix;
    vec3 forward = origin + normalize(vec3(camView));
    return forward;
}
