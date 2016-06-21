precision mediump float;
precision mediump sampler2D;

uniform sampler2D map;
uniform sampler2D frame;
uniform float scalar;
uniform vec2 size;

vec4 I(float i, float j) {
	return texture2D(frame, vec2((gl_FragCoord.x + i) / size.x, (gl_FragCoord.y + j) / size.y));
}

void main(void) {	

	vec4 m = texture2D(map, vec2((gl_FragCoord.x) / size.x, (gl_FragCoord.y) / size.y));
	
	float precisionFactor = 100.0;
	
	float d = m.a * precisionFactor;

	if (d > 2.0){
		
		d *= scalar * (80.0 / 100.0);
				
		vec4 l = I(-d, 0.0);
		vec4 r = I(d, 0.0);
		vec4 t = I(0.0, -d);
		vec4 b = I(0.0, d);

		gl_FragColor = (l + r + t + b) / 4.0;
	
	} else {

		gl_FragColor = I(0.0, 0.0);
	
	}	
}