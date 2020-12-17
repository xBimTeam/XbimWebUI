attribute highp vec2 point;

varying vec2 position;

void main(void) {
    float x = (point.x * 2.0) - 1.0;
    float y = (point.y * 2.0) - 1.0;
	gl_Position = vec4(x, y, 0.0, 1.0);
    position =  point;
}