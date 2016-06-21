var PageCurl = function(gl, width, height){

    var frame = gl.createTexture(), img;
    gl.bindTexture(gl.TEXTURE_2D, frame);
	gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);    
	
	var fullframe = gl.createBuffer(),
		square = [
			1, -1, 0,
			-1, -1, 0,
			1, 1, 0,
			-1, 1, 0
		];
	gl.bindBuffer(gl.ARRAY_BUFFER, fullframe);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(square), gl.STATIC_DRAW);

	var curl;
	
	ShaderProgram.load(gl, {
		vertex: 'shaders/Identity.vert',
		fragment: 'shaders/PageCurl.frag',
		attributes: ['position'],
		uniforms: ['frame', 'size', 'amount'],
		onLoad: function(program){ curl = program; }
	});
	
	function render(image, amount){
	
		if (ShaderProgram.pending) return;
		if (image !== img){
			if (!image.width || !image.height) return;
			img = image;
	    	gl.bindTexture(gl.TEXTURE_2D, frame);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		}

		gl.disable(gl.BLEND);
		gl.disable(gl.DEPTH_TEST);

		gl.viewport(0, 0, width, height);

		gl.useProgram(curl);

		gl.uniform2f(curl.size, width, height);

		gl.bindBuffer(gl.ARRAY_BUFFER, fullframe);
		gl.vertexAttribPointer(curl.position, 3, gl.FLOAT, false, 0, 0);

		gl.activeTexture(gl.TEXTURE0);
    	gl.bindTexture(gl.TEXTURE_2D, frame);
		gl.uniform1i(curl.frame, 0);

		gl.uniform1f(curl.amount, amount);
		
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);					
	};

	return {
		render: render
	};

};