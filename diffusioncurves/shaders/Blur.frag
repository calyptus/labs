precision mediump float;

uniform sampler2D map;
uniform sampler2D frame;
uniform bool horizontal;
uniform float iteration;
uniform vec2 size;

vec4 I(float i, float j) {
	return texture2D(frame, vec2((gl_FragCoord.x + i) / size.x, (gl_FragCoord.y + j) / size.y));
}

vec4 blur() {
	vec4 c = I(0.0, 0.0);
	
	float s = (1.0 - c.a) * 16.0;
	s *= pow(2.0, 3.0 / 4.0);
	s *= 1.0 / 10.0;
	if (iteration >= 5.0) s *= 11.0 / 10.0;
	if (iteration <= 1.0) s *= 9.0 / 10.0;
	
	float nn = 1.0;
	for (float n = 1.0; n <= 5.0; n++){
		vec4 p; // = horizontal ? I(n * s, 0.0) : I(0.0, n * s);
		if (horizontal) p = I(n * s, 0.0); else p = I(0.0, n * s);
		float g = (1.0 - p.a) * 255.0;
		if (g < 1.0) break;
		nn++;
		c += p;
	}
	for (float nb = -1.0; nb >= -5.0; nb--){
		vec4 p;
		if (horizontal) p = I(nb * s, 0.0); else p = I(0.0, nb * s);
		float g = (1.0 - p.a) * 255.0;
		if (g < 1.0) break;
		nn++;
		c += p;
	}
	return c / nn;
}


vec4 antiAlias() {
	float sharpness = 3.0;
	vec4 m = texture2D(map, vec2(gl_FragCoord.x / size.x, gl_FragCoord.y / size.y));

	float precisionFactor = 100.0;
	
	float d = m.a * precisionFactor;
	
	vec4 c = I(0.0, 0.0);

	if (d > 1.0) return c;

	// Anti-alias
	float dd = pow(1.0 - d, sharpness) / 2.0;
	vec4 a = ((m - c) * dd) + c;
	
	return a;
	// Baseline blur
/*	
	vec4 l = I(-1.0, 0.0);
	vec4 r = I(1.0, 0.0);
	vec4 t = I(0.0, -1.0);
	vec4 b = I(0.0, 1.0);

	// Merge blur and anti-alias
	return ((a * 10.0) + l + r + t + b) / 14.0;
	*/
}

void main(void) {
	
	vec4 c = I(0.0, 0.0);
	gl_FragColor = c;
	
	float size = (1.0 - c.a) * 16.0;
	
	bool final = iteration == 0.0;
	
	float d;
	
	if (size < 1.0){
		if (final) c = antiAlias();
	} else {
		c = blur();
	}
	
	gl_FragColor = vec4(c.r, c.g, c.b, final ? 1.0 : c.a);

}