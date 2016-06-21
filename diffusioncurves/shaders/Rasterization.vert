precision mediump float;

attribute vec2 point;
attribute vec2 direction;
attribute float angle;

attribute vec3 color;
attribute float blur;

uniform mat3 projection;
uniform mat3 transform;
uniform float scale;
uniform bool distance;
uniform float spread;

varying vec4 vColor;

float precisionFactor = 100.0;

float s = 707.0 / 1000.0;

mat3 getAngleRotation(float angle){

	if (distance){
		if (angle == 1.0) return mat3(0,-1,0,1,0,0,0,0,1);
		if (angle == 2.0) return mat3(0,1,0,-1,0,0,0,0,1);
		if (angle == 3.0) return mat3(-s,-s,0,s,-s,0,0,0,1);
		if (angle == 4.0) return mat3(-s,s,0,-s,-s,0,0,0,1);
		if (angle == 5.0) return mat3(s,-s,0,s,s,0,0,0,1);
		if (angle == 6.0) return mat3(s,s,0,-s,s,0,0,0,1);
	}

	if (angle == 0.0) return mat3(0,0,0,0,0,0,0,0,0);
	if (angle == 1.0) return mat3(0,1,0,-1,0,0,0,0,1);
	if (angle == 2.0) return mat3(0,-1,0,1,0,0,0,0,1);
	if (angle == 3.0) return mat3(-s,s,0,-s,-s,0,0,0,1);
	if (angle == 4.0) return mat3(-s,-s,0,s,-s,0,0,0,1);
	if (angle == 5.0) return mat3(s,s,0,-s,s,0,0,0,1);
	if (angle == 6.0) return mat3(s,-s,0,s,s,0,0,0,1);
	if (angle == 7.0) return mat3(-1,0,0,0,-1,0,0,0,1);
	return mat3(1,0,0,0,1,0,0,0,1);	
}

void main(void) {
	vec3 d = getAngleRotation(angle) * transform * vec3(direction, 0.0);
	if (angle != 0.0) d = normalize(d);
	vec3 p = projection * (transform * vec3(point, 1.0) + (d * spread));
	
	gl_Position = vec4(p.x, p.y, angle == 0.0 ? 0.0 : 1.0, 1.0);
	vColor = vec4(color, distance ? (angle == 0.0 ? 0.0 : (spread / precisionFactor)) : (1.0 - blur * scale * 255.0 / 16.0));
}
