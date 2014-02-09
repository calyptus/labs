DiffusionCurves.Diffusion = function(gl, width, height){

	var fullframe = gl.createBuffer(),
		square = [
			1, -1, 0,
			-1, -1, 0,
			1, 1, 0,
			-1, 1, 0
		];
	gl.bindBuffer(gl.ARRAY_BUFFER, fullframe);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(square), gl.STATIC_DRAW);

	var diffusion;
	
	ShaderProgram.load(gl, {
		vertex: 'shaders/Identity.vert',
		fragment: 'shaders/Diffusion.frag',
		attributes: ['position'],
		uniforms: ['frame', 'map', 'scalar', 'size'],
		onLoad: function(program){ diffusion = program; }
	});
	
	function render(frame, distanceMap, altframe){

		gl.useProgram(diffusion);

		gl.uniform2f(diffusion.size, width, height);

		gl.bindBuffer(gl.ARRAY_BUFFER, fullframe);
		gl.vertexAttribPointer(diffusion.position, 3, gl.FLOAT, false, 0, 0);

		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, distanceMap);
		gl.uniform1i(diffusion.map, 1);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, frame);
		gl.uniform1i(diffusion.frame, 0);

		var iterations = 12;

		for (var i = 1; i <= iterations; i++){
		
			gl.uniform1f(diffusion.scalar, (iterations - i) / iterations);

			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, frame);
			gl.uniform1i(diffusion.frame, 0);

			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, altframe, 0);

			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
			
			var temp = altframe;
			altframe = frame;
			frame = temp;
		}

	};
	
	return {
		render: render
	};

};