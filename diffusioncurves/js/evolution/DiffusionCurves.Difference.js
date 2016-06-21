DiffusionCurves.Difference = function(gl, original, width, height){

    var orgframe = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, orgframe);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, original);
	gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	
	var output = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, output);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.GL_RGBA4, width, height);

	var fullframe = gl.createBuffer(),
		square = [
			1, -1, 0,
			-1, -1, 0,
			1, 1, 0,
			-1, 1, 0
		];
	gl.bindBuffer(gl.ARRAY_BUFFER, fullframe);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(square), gl.STATIC_DRAW);
	
	var pixels = new Uint8Array(width * height * 3);

	var difference;
	
	ShaderProgram.load(gl, {
		vertex: 'shaders/Identity.vert',
		fragment: 'shaders/Difference.frag',
		attributes: ['position'],
		uniforms: ['size', 'frame', 'original'],
		onLoad: function(program){ difference = program; }
	});
	
	function render(frame, display){
		
		if (!difference) return;

		gl.useProgram(difference);
		
		gl.uniform2f(difference.size, width, height);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, fullframe);
		gl.vertexAttribPointer(difference.position, 3, gl.FLOAT, false, 0, 0);

		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, orgframe);
		gl.uniform1i(difference.original, 1);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, frame);
		gl.uniform1i(difference.frame, 0);

		if (display) gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		else gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, output);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

		if (!display){
			gl.readPixels(0, 0, width, height, gl.RGB, gl.UNSIGNED_BYTE, pixels)
			return pixels;
		}
	
	};
	
	return {
		render: render
	};

};