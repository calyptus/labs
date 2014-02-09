DiffusionCurves.Blur = function(gl, width, height){

	var fullframe = gl.createBuffer(),
		square = [
			1, -1, 0,
			-1, -1, 0,
			1, 1, 0,
			-1, 1, 0
		];
	gl.bindBuffer(gl.ARRAY_BUFFER, fullframe);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(square), gl.STATIC_DRAW);

	var blur;
	
	ShaderProgram.load(gl, {
		vertex: 'shaders/Identity.vert',
		fragment: 'shaders/Blur.frag',
		attributes: ['position'],
		uniforms: ['frame', 'map', 'iteration', 'horizontal', 'size'],
		onLoad: function(program){ blur = program; }
	});
	
	function render(frame, distanceMap, altframe, outputbuffer){
	
		gl.useProgram(blur);

		gl.uniform2f(blur.size, width, height);

		gl.bindBuffer(gl.ARRAY_BUFFER, fullframe);
		gl.vertexAttribPointer(blur.position, 3, gl.FLOAT, false, 0, 0);

		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, distanceMap);
		gl.uniform1i(blur.map, 1);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, frame);
		gl.uniform1i(blur.frame, 0);
		
		var iterations = 6;

		for (var i = 1; i <= iterations; i++){
		
			if (i == iterations && outputbuffer !== false)
				gl.bindFramebuffer(gl.FRAMEBUFFER, outputbuffer);
			else
				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, altframe, 0);
		
			gl.uniform1f(blur.iteration, iterations - i);
			gl.uniform1i(blur.horizontal, i % 2);
			
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, frame);
			gl.uniform1i(blur.frame, 0);
			
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
						
			var temp = altframe;
			altframe = frame;
			frame = temp;
		}
		
		/*if (outputbuffer === false)
		{
			gl.bindFramebuffer(null);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

		}*/

	};
	
	return {
		render: render
	};

};