var ShaderProgram, VertexShader, FragmentShader;

(function(){

function shader(type){

	var s = function(gl, src, url){
		var shader = gl.createShader(gl[type]);
		gl.shaderSource(shader, src);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw Error(url + '\n' + gl.getShaderInfoLog(shader));
		return shader;
	};
	
	s.load = function(gl, url, callback){
		var request = new XMLHttpRequest();
		request.open('GET', url);
		request.onreadystatechange = function(){
			if (request.readyState == 4)
				callback(new s(gl, request.responseText, url));
		}
		request.send();
	};

	return s;

};

FragmentShader = shader('FRAGMENT_SHADER');
VertexShader = shader('VERTEX_SHADER');

ShaderProgram = function(gl, fragment, vertex){
    var program = gl.createProgram();
    gl.attachShader(program, fragment);
    gl.attachShader(program, vertex);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
	
    gl.useProgram(program);
    return program;
};

ShaderProgram.load = function(gl, options, callback){

	ShaderProgram.pending++;
	
	function onload(){		
		var program = new ShaderProgram(gl, frag, vert)
		
		var attribs = options.attributes;
		if (attribs) attribs.forEach(function(attr){
			program[attr] = gl.getAttribLocation(program, attr);
			gl.enableVertexAttribArray(program[attr]);
		});

		var unis = options.uniforms;
		if (unis) unis.forEach(function(attr){
			program[attr] = gl.getUniformLocation(program, attr);
		});

		ShaderProgram.pending--;
		
		if (options.onLoad) options.onLoad(program);
	};
	
	var frag, vert;
	FragmentShader.load(gl, options.fragment, function(s){
		frag = s;
		if (vert) onload();
	});
	VertexShader.load(gl, options.vertex, function(s){
		vert = s;
		if (frag) onload();
	});
};

ShaderProgram.pending = 0;

})();