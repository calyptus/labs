var Curves;

(function(){

Curves = function(xml){
	if (!xml){
		this.curves = [];
		return;
	}
	var root = xml.documentElement;
	if (root.nodeName != 'curve_set') throw new Error('Invalid document.');
	var curve = root.firstChild, curves = [], bounds;
	while (curve){
		if (curve.nodeName == 'curve'){
			var c = parseCurve(curve);
			curves.push(c);
			if (!bounds){
				bounds = c.bounds.slice();
				continue;
			}
			if (c.bounds[0] < bounds[0]) bounds[0] = c.bounds[0];
			if (c.bounds[1] < bounds[1]) bounds[1] = c.bounds[1];
			if (c.bounds[0] + c.bounds[2] > bounds[0] + bounds[2]) bounds[2] = c.bounds[2] + c.bounds[0] - bounds[0];
			if (c.bounds[1] + c.bounds[3] > bounds[1] + bounds[3]) bounds[3] = c.bounds[3] + c.bounds[1] - bounds[1];
		}
		curve = curve.nextSibling;
	}
	this.curves = curves;
	this.bounds = bounds || [0,0,0,0];
	this.width = parseInt(root.getAttribute('image_width'), 10);
	this.height = parseInt(root.getAttribute('image_height'), 10);
};

Curves.load = function(url, callback){
	var request = new XMLHttpRequest();
	request.open('GET', url);
	request.onreadystatechange = function(){
		if (request.readyState == 4){
			var xml = request.responseXML;
			if (!xml || !xml.documentElement) xml = new DOMParser().parseFromString(request.responseText, 'text/xml');
			callback(new Curves(xml));
		}
	}
	request.send();
};

function parseCurve(curve){
	var set = curve.firstChild, points, left, right, blur;
	while (set){
		switch (set.nodeName){
			case 'control_points_set': points = parsePoints(set);
			case 'left_colors_set': left = parseColors(set);
			case 'right_colors_set': right = parseColors(set);
			case 'blur_points_set': blur = parseBlur(set);
		}
		set = set.nextSibling;
	}
	return new Curve(points, left, right, blur);
}

function parsePoints(set){
	var point = set.firstChild, result = [];
	while (point){
		if (point.nodeName == 'control_point')
			result.push({
				x: parseFloat(point.getAttribute('x')),
				y: parseFloat(point.getAttribute('y'))
			});
		point = point.nextSibling;
	}
	return result;
}

function parseColors(set){
	var point = set.firstChild, result = []; //, maxOffset = 0;
	while (point){
		if (point.nodeName == 'left_color' || point.nodeName == 'right_color')
			// Assuming offset is in order
			result.push({
				b: parseInt(point.getAttribute('R'), 10),
				g: parseInt(point.getAttribute('G'), 10),
				r: parseInt(point.getAttribute('B'), 10),
				index: parseInt(point.getAttribute('globalID'), 10)
			});
		point = point.nextSibling;
	}
	//result.forEach(function(point){ point.offset /= maxOffset; });
	return result;
}

function parseBlur(set){
	var point = set.firstChild, result = []; //, maxOffset = 0;
	while (point){
		if (point.nodeName == 'best_scale')
			// Assuming offset is in order
			result.push({
				value: parseFloat(point.getAttribute('value')),
				index: parseInt(point.getAttribute('globalID'), 10)
			});
		point = point.nextSibling;
	}
	//result.forEach(function(point){ point.offset /= maxOffset; });
	return result;
}

})();

Curves.prototype = {

	getVertexBuffers: function(){
		if (this.vertexBuffers) return this.vertexBuffers;
		
		var curves = this.curves;

		var j = 0, l = 0;
		curves.forEach(function(c){
			l += c.getVertexCount();
			j += c.getFaceCount();
		});

		var points = new Float32Array(l * 2),
			vectors = new Float32Array(l * 2),
			angles = new Uint16Array(l),
			
			colors = new Float32Array(l * 3),
			opposite = new Float32Array(l * 3),
			blurs = new Float32Array(l),
			
			faces = new Uint16Array(j * 3);
		
		var o = 0, i = 0;

		curves.forEach(function(c){
			o += c.fillFaceBuffer(o, faces, i);
			i += c.fillVertexBuffers(i, points, vectors, angles, colors, blurs);
		});
		
		return this.vertexBuffers = {
			points: points,
			vectors: vectors,
			angles: angles,
			colors: colors,
			blurs: blurs,
			faces: faces
		};
	}

};