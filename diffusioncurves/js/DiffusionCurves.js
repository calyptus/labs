var DiffusionCurves = function(gl, width, height){

	var rasterization = new DiffusionCurves.Rasterization(gl, width, height);
	var diffusion = new DiffusionCurves.Diffusion(gl, width, height);
	var blur = new DiffusionCurves.Blur(gl, width, height);
	
	var depthBuffer = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

	var frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
	
	var distanceMap = gl.createTexture();
    setTextureParameters(distanceMap);
	
	var frame = gl.createTexture();
    setTextureParameters(frame);
	
	var altframe = gl.createTexture();
	setTextureParameters(altframe);
    
    function setTextureParameters(tex){
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    };
	
	function render(curves, transform, outputBuffer){
		if (!curves || ShaderProgram.pending) return;

		gl.viewport(0, 0, width, height);

		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
		gl.disable(gl.BLEND);
				
		gl.enable(gl.DEPTH_TEST);
		rasterization.render(curves, frame, distanceMap, transform);
		gl.disable(gl.DEPTH_TEST);
		diffusion.render(frame, distanceMap, altframe);
		blur.render(altframe, distanceMap, frame, outputBuffer);
		return frame;
	};

	return {
		render: render
	};

};