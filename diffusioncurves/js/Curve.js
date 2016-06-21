var Curve;

(function(){

function bezier(p0, p1, p2, p3, t){
	var ti = 1 - t;
	return Math.pow(ti, 3) * p0 + 3 * Math.pow(ti, 2) * t * p1 + 3 * ti * Math.pow(t, 2) * p2 + Math.pow(t, 3) * p3;
};

function sampleSegments(controls){

	var points = [], lengths = [], totalLength = 0;
	
	var left = controls[0].x, top = controls[0].y, right = left, bottom = top;

	points.push(controls[0]);
	lengths.push(0);

	// Sample linear segments from cubic bezier control points
	for (var i = 0, l = controls.length - 1; i < l; i += 3){
		var p0 = controls[i],
			p1 = controls[i + 1],
			p2 = controls[i + 2],
			p3 = controls[i + 3];
		
		var precision = Math.ceil(Math.sqrt(Math.pow(p0.x - p3.x, 2) + Math.pow(p0.y - p3.y, 2)) / 5);
		
		precision = 10;
		
		var x = p0.x, y = p0.y;
		for (var a = 1; a < precision; a++){
			var dx = x, dy = y;
			points.push({
				x: x = bezier(p0.x, p1.x, p2.x, p3.x, a / precision),
				y: y = bezier(p0.y, p1.y, p2.y, p3.y, a / precision)
			});
			if (x < left) left = x;
			if (y < top) top = y;
			if (x > right) right = x;
			if (y > bottom) bottom = y;
			dx -= x;
			dy -= y;
			lengths.push(totalLength += Math.sqrt(dx * dx + dy * dy));
		}
		var dx = x - p3.x,
			dy = y - p3.y;
		if (p3.x < left) left = p3.x;
		if (p3.y < top) top = p3.y;
		if (p3.x > right) right = p3.x;
		if (p3.y > bottom) bottom = p3.y;
		points.push(p3);
		lengths.push(totalLength += Math.sqrt(dx * dx + dy * dy));
	};
	
	return {
		points: points,
		bounds: [left, top, right - left, bottom - top],
		lengths: lengths.map(function(l){ return l / totalLength; })
	};
	
};

function sampleColors(colors, lengths){
	var cl = colors.length, result = [];
	
	for (var i = 0, l = lengths.length; i < l; i++){
		var ci = 0;
		while (ci < cl) if (colors[ci++].index > i) break;
		
		var start = colors[ci - 2], end = colors[ci - 1];
		
		var m = (i - start.index) / (end.index - start.index);
		
		var obj = {};
		for (var j = 2, k = arguments.length; j < k; j++){
			var key = arguments[j],
			    value = (((end[key] - start[key]) * m) + start[key]) / 255;
			if (k == 3) obj = value; else obj[key] = value;
		}
		
		result.push(obj);
	}
	return result;
};

/*
function sampleColors(colors, lengths){
	var cl = colors.length, result = [];
	
	for (var i = 0, l = lengths.length; i < l; i++){
		var po = lengths[i], ci = 0;
		while (ci < cl) if (colors[ci++].offset > po) break;
		
		var start = colors[ci - 2], end = colors[ci - 1];
		
		var m = (po - start.offset) / (end.offset - start.offset);
		
		var obj = {};
		for (var j = 2, k = arguments.length; j < k; j++){
			var key = arguments[j],
			    value = (((end[key] - start[key]) * m) + start[key]) / 255;
			if (k == 3) obj = value; else obj[key] = value;
		}
		
		result.push(obj);
	}
	return result;
};
*/

Curve = function(controls, left, right, blur){
	
	if (!controls){
		this.points = [];
		this.left = [];
		this.right = [];
		this.blur = [];
		this.bounds = [0,0,0,0];
		return;
	}
	
	var segments = sampleSegments(controls);
	this.points = segments.points;
	this.bounds = segments.bounds;
	
	this.left = sampleColors(left, segments.lengths, 'r', 'g', 'b');
	this.right = sampleColors(right, segments.lengths, 'r', 'g', 'b');
	this.blur = sampleColors(blur, segments.lengths, 'value');
};

})();

Curve.prototype = {

	getVertexCount: function(){
		if (this.points.length < 2) return 0;
		return this.points.length * 6 + 2;
	},
	
	fillVertexBuffers: function(offset, pointBuffer, vectorBuffer, angleBuffer, colorBuffer, blurBuffer){
		if (this.points.length < 2) return 0;

		var points = this.points,
			leftColors = this.left,
			rightColors = this.right,
			blurs = this.blur;
		
		var o = offset;
		
		function addVertex(point, vector, angle, color, blur){
			var d = o * 2, t = o * 3;
			pointBuffer[d] = point.x;
			pointBuffer[d + 1] = point.y;
			vectorBuffer[d] = vector.x;
			vectorBuffer[d + 1] = vector.y;
			angleBuffer[o] = angle;
			colorBuffer[t] = color.r;
			colorBuffer[t + 1] = color.g;
			colorBuffer[t + 2] = color.b;
			blurBuffer[o] = blur;
			o++;
		};
		
		function intermediateColor(c1, c2){
			c1.r = (c1.r + c2.r) / 2;
			c1.g = (c1.g + c2.g) / 2;
			c1.b = (c1.b + c2.b) / 2;
			return c1;
		};

		var point, nextPoint = points[0], previousDirection, nextDirection, nullDirection = { x: 0, y: 0 };

		for (var i = 0, max = points.length - 1; i <= max; i++){
			
			point = nextPoint;
			nextPoint = points[i + 1];

			previousDirection = nextDirection;
			
			nextDirection = nextPoint && {
				x: nextPoint.x - point.x,
				y: nextPoint.y - point.y
			};
			
			var left = leftColors[i], right = rightColors[i], blur = blurs[i];
			
			if (i == 0){

				// Add a point straight out from the previous line
				var ic = intermediateColor(left, right);
				addVertex(point, nextDirection, 7, ic, ic, blur);

				// Add points on the curve
				addVertex(point, nullDirection, 0, left, blur);
				addVertex(point, nullDirection, 0, right, blur);

				// Add points 45 degrees out from the next line
				addVertex(point, nextDirection, 3, left, blur);
				addVertex(point, nextDirection, 4, right, blur);

				// Add points perpendicular to the next line
				addVertex(point, nextDirection, 1, left, blur);
				addVertex(point, nextDirection, 2, right, blur);

			} else if (i == max){

				// Add points on the curve
				addVertex(point, nullDirection, 0, left, blur);
				addVertex(point, nullDirection, 0, right, blur);

				// Add points perpendicular to the previous line
				addVertex(point, previousDirection, 1, left, blur);
				addVertex(point, previousDirection, 2, right, blur);

				// Add points 45 degrees out from the previous line
				addVertex(point, previousDirection, 5, left, blur);
				addVertex(point, previousDirection, 6, right, blur);

				// Add a point straight out from the previous line
				var ic = intermediateColor(left, right);
				addVertex(point, previousDirection, 8, ic, blur);

			} else {

				// Add points on the curve
				addVertex(point, nullDirection, 0, left, blur);
				addVertex(point, nullDirection, 0, right, blur);

				// Add points perpendicular to the previous line
				addVertex(point, previousDirection, 1, left, blur);
				addVertex(point, previousDirection, 2, right, blur);

				// Add points perpendicular to the next line
				addVertex(point, nextDirection, 1, left, blur);
				addVertex(point, nextDirection, 2, right, blur);

			}
		}
		if (o - offset != this.getVertexCount()) throw new Error('Unexpected vertex count');
		return o - offset;
	},
	
	getFaceCount: function(){
		if (this.points.length < 2) return 0;
		return this.points.length * 6;
	},
	
	fillFaceBuffer: function(offset, triangleBuffer, indexOffset){
		if (this.points.length < 2) return 0;

		var length = this.points.length * 6;
		var o = offset;
		function addTriangle(i1, i2, i3){
			triangleBuffer[o++] = indexOffset + i1;
			triangleBuffer[o++] = indexOffset + i2;
			triangleBuffer[o++] = indexOffset + i3;
		};
		for (var i = 0; i < length; i+=6){
			addTriangle(i == 0 ? 0 : i - 1, i + 1, i + 3);
			addTriangle(i + 1, i + 3, i + 5);
			addTriangle(i + 1, i + 5, i + 7);

			addTriangle(i, i + 2, i + 4);
			addTriangle(i + 2, i + 4, i + 6);
			addTriangle(i + 2, i + 6, i + 8 == length + 2 ? i + 7 : i + 8);
		}
		if ((o - offset) / 3 != this.getFaceCount()) throw new Error('Unexpected face count');
		return o - offset;
	}

};