precision mediump float;
precision mediump sampler2D;

uniform sampler2D original;
uniform sampler2D frame;
uniform vec2 size;

void main(void) {
	vec4 f = texture2D(frame, vec2(gl_FragCoord.x / size.x, gl_FragCoord.y / size.y));
	vec4 o = texture2D(original, vec2(gl_FragCoord.x / size.x, 1.0 - gl_FragCoord.y / size.y));
	//gl_FragColor = f;
	gl_FragColor = vec4(1.0 - abs(f.r - o.r), 1.0 - abs(f.g - o.g), 1.0 - abs(f.b - o.b), 1.0);
}