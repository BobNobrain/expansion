varying vec2 vScreenPos;

void main() {
    vScreenPos = uv;
    gl_Position = vec4(position, 1.0);
}
