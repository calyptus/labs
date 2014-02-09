DiffusionCurves.Rasterization = function(gl, viewportWidth, viewportHeight){

	var pointBuffer = gl.createBuffer(),
		directionBuffer = gl.createBuffer(),
		angleBuffer = gl.createBuffer(),
		colorBuffer = gl.createBuffer(),
		blurBuffer = gl.createBuffer(),
		faceBuffer = gl.createBuffer();

	var rasterizer;

	ShaderProgram.load(gl, {
		vertex: 'shaders/Rasterization.vert',
		fragment: 'shaders/Identity.frag',
		attributes: ['point', 'direction', 'angle', 'color', 'blur'],
		uniforms: ['transform', 'projection', 'distance', 'scale', 'spread'],
		onLoad: function(program){ rasterizer = program; }
	});
	
	function buffer(data, buffer, pointer, size){
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
		gl.vertexAttribPointer(pointer, size, gl.FLOAT, false, 0, 0);
	};
	
	function bindBuffers(buffers){
		buffer(buffers.points, pointBuffer, rasterizer.point, 2);
		buffer(buffers.vectors, directionBuffer, rasterizer.direction, 2);

		gl.bindBuffer(gl.ARRAY_BUFFER, angleBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, buffers.angles, gl.STATIC_DRAW);
		gl.vertexAttribPointer(rasterizer.angle, 1, gl.UNSIGNED_SHORT, false, 0, 0);

		buffer(buffers.colors, colorBuffer, rasterizer.color, 3);
		buffer(buffers.blurs, blurBuffer, rasterizer.blur, 1);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, faceBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, buffers.faces, gl.STATIC_DRAW);
		return buffers.faces.length;
	};

	function render(curves, drawbuffer, metabuffer, transform){
		gl.useProgram(rasterizer);

		if (!transform) transform = [1, 0, 0, 0, 1, 0];

		var xx = transform[0], xy = transform[1], tx = transform[2],
			yx = transform[3], yy = transform[4], ty = transform[5];
		
		/*
		if (curves.bounds){
			var l = curves.bounds[0], t = curves.bounds[1],
				r = l + curves.bounds[2], b = t + curves.bounds[3];
			
			l = l * xx + l * xy + tx;
			r = r * xx + r * xy + tx;
			t = t * yy + t * yx + ty;
			b = b * yy + b * yx + ty;
			
			var ll = Math.min(l, r, 0), rr = Math.max(l, r, viewportWidth) - viewportWidth,
				tt = Math.min(t, b, 0), bb = Math.max(t, b, viewportHeight) - viewportHeight;
			
			var spread = Math.max(
				Math.sqrt(Math.pow(ll, 2) + Math.pow(tt, 2)),
				Math.sqrt(Math.pow(rr, 2) + Math.pow(bb, 2))
			) + Math.sqrt(Math.pow(curves.bounds[2], 2) + Math.pow(curves.bounds[3], 2));
		
		} else {
		*/

			var spread = Math.sqrt(viewportWidth * viewportWidth + viewportHeight * viewportHeight);
		
		//}
		
		
		//spread = 724; //Math.floor(Math.sqrt(w * w + h * h));

		
		var offsetX = transform[2], offsetY = transform[5];

		var scale = Math.sqrt((xx + xy) * (xx + xy) + (yy + yx) * (yy + yx)) / Math.sqrt(2);
		
		var sx = 2 / viewportWidth, sy = 2 / viewportHeight;
		
		/*transform = [
			xy * sy, -yy * sy, 0,
			xx * sx, -yx * sx, 0,
			tx * sx - 1, 1 - ty * sy, 1
		];*/
		
		transform = [
			xy, -yy, 0,
			xx, -yx, 0,
			tx, -ty, 1
		];
		
		var projection = [
			sx, 0, 0,
			0, sy, 0,
			-1, 1, 1
		];
		
		gl.uniformMatrix3fv(rasterizer.transform, false, new Float32Array(transform));
		gl.uniformMatrix3fv(rasterizer.projection, false, new Float32Array(projection));
		
		gl.uniform1f(rasterizer.scale, scale);
		gl.uniform1f(rasterizer.spread, spread);
		
		var count = bindBuffers(curves.getVertexBuffers());
		
		gl.uniform1i(rasterizer.distance, true);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, metabuffer, 0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
		
		gl.uniform1i(rasterizer.distance, false);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, drawbuffer, 0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
	};
	
	return {
		render: render
	};
	
};