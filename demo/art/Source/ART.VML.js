/*
---
name: ART.VML
description: "VML implementation for ART"
authors: ["[Simo Kinnunen](http://twitter.com/sorccu)", "[Valerio Proietti](http://mad4milk.net)", "[Sebastian Markbåge](http://calyptus.eu/)"]
provides: [ART.VML, ART.VML.Group, ART.VML.Shape, ART.VML.Text]
requires: [ART, ART.Color, ART.Element, ART.Container, ART.Transform, ART.Path]
...
*/

(function(){

var precision = 100, UID = 0;

var defaultBox = { left: 0, top: 0, width: 500, height: 500 };

// VML Base Class

ART.VML = ART.Class(ART.Element, ART.Container, {
	
	initialize: function(width, height){
		this.vml = document.createElement('vml');
		this.element = document.createElement('av:group');
		this.vml.appendChild(this.element);
		this.children = [];
		if (width != null && height != null) this.resize(width, height);
	},

	eject: function(){
		var element = this.vml, parent = element.parentNode;
		if (parent) parent.removeChild(element);
		return this;
	},
	
	inject: function(element){
		if (element.element) element = element.element;
		element.appendChild(this.vml);
		return this;
	},
	
	resize: function(width, height){
		this.width = width;
		this.height = height;
		
		var style = this.vml.style;
		style.pixelWidth = width;
		style.pixelHeight = height;
		
		style = this.element.style;
		style.width = width;
		style.height = height;
		
		var halfPixel = (0.5 * precision);
		
		this.element.coordorigin = halfPixel + ',' + halfPixel;
		this.element.coordsize = (width * precision) + ',' + (height * precision);

		return this;
	},
	
	toElement: function(){
		return this.vml;
	}
	
});

// VML Initialization

var VMLCSS = 'behavior:url(#default#VML);display:inline-block;position:absolute;left:0px;top:0px;';

var styleSheet, styledTags = {}, styleTag = function(tag){
	if (styleSheet) styledTags[tag] = styleSheet.addRule('av\\:' + tag, VMLCSS);
};

ART.VML.init = function(document){

	var namespaces = document.namespaces;
	if (!namespaces) return false;

	namespaces.add('av', 'urn:schemas-microsoft-com:vml');
	namespaces.add('ao', 'urn:schemas-microsoft-com:office:office');

	styleSheet = document.createStyleSheet();
	styleSheet.addRule('vml', 'display:inline-block;position:relative;overflow:hidden;');
	styleTag('skew');
	styleTag('fill');
	styleTag('stroke');
	styleTag('path');
	styleTag('textpath');
	styleTag('group');

	return true;

};

// VML Element Class

ART.VML.Element = ART.Class(ART.Element, ART.Transform, {
	
	initialize: function(tag){
		this.uid = ART.uniqueID();
		if (!(tag in styledTags)) styleTag(tag);

		var element = this.element = document.createElement('av:' + tag);
		element.setAttribute('id', 'e' + this.uid);
	},
	
	/* dom */

	art_element_inject: ART.Element.prototype.inject,
	
	inject: function(container){
		this.eject();
		this.container = container;
		container.children.push(this);
		this._transform();
		this.art_element_inject(container);
		
		return this;
	},

	art_element_eject: ART.Element.prototype.eject,

	eject: function(){
		if (this.container){
			var siblings = this.container.children,
			    i = siblings.length;
			while (i--)
				if (siblings[i] === this)
					siblings.splice(i, 1);
			this.container = null;
			this.art_element_eject();
		}
		return this;
	},

	// visibility
	
	hide: function(){
		this.element.style.display = 'none';
		return this;
	},
	
	show: function(){
		this.element.style.display = '';
		return this;
	},
	
	// interaction
	
	indicate: function(cursor, tooltip){
		if (cursor) this.element.style.cursor = cursor;
		if (tooltip) this.element.title = tooltip;
		return this;
	}

});

// VML Group Class

ART.VML.Group = ART.Class(ART.VML.Element, ART.Container, {
	
	element_initialize: ART.VML.Element.prototype.initialize,
	
	initialize: function(width, height){
		this.element_initialize('group');
		this.width = width;
		this.height = height;
		this.children = [];
	},
	
	/* dom */

	element_inject: ART.VML.Element.prototype.inject,
	
	inject: function(container){
		this.element_inject(container);
		this._transform();
		return this;
	},

	element_eject: ART.VML.Element.prototype.eject,
	
	eject: function(){
		this.element_eject();
		return this;
	},
	
	_transform: function(){
		var element = this.element;
		element.coordorigin = '0,0';
		element.coordsize = '1000,1000';
		element.style.left = 0;
		element.style.top = 0;
		element.style.width = 1000;
		element.style.height = 1000;
		element.style.rotation = 0;
		
		var container = this.container;
		this._activeTransform = container ? new ART.Transform(container._activeTransform).transform(this) : this;
		var children = this.children;
		for (var i = 0, l = children.length; i < l; i++)
			children[i]._transform();
	}

});

// VML Base Shape Class

ART.VML.Base = ART.Class(ART.VML.Element, {

	element_initialize: ART.VML.Element.prototype.initialize,

	initialize: function(tag){
		this.element_initialize(tag);
		var element = this.element;
		
		var skew = this.skewElement = document.createElement('av:skew');
		skew.on = true;
		element.appendChild(skew);

		var fill = this.fillElement = document.createElement('av:fill');
		fill.on = false;
		element.appendChild(fill);
		
		var stroke = this.strokeElement = document.createElement('av:stroke');
		stroke.on = false;
		element.appendChild(stroke);
	},
	
	/* transform */
	
	_transform: function(){
		var container = this.container;
		
		// Active Transformation Matrix
		var m = container ? new ART.Transform(container._activeTransform).transform(this) : this;
		
		// Box in shape user space
		
		var box = this._boxCoords || this._size || defaultBox;
		
		var originX = box.left || 0,
			originY = box.top || 0,
			width = box.width || 1,
			height = box.height || 1;
				
		// Flipped
	    var flip = m.yx / m.xx > m.yy / m.xy;
		if (m.xx < 0 ? m.xy >= 0 : m.xy < 0) flip = !flip;
		flip = flip ? -1 : 1;
		
		m = new ART.Transform().scale(flip, 1).transform(m);
		
		// Rotation is approximated based on the transform
		var rotation = Math.atan2(-m.xy, m.yy) * 180 / Math.PI;
		
		// Reverse the rotation, leaving the final transform in box space
		var rad = rotation * Math.PI / 180, sin = Math.sin(rad), cos = Math.cos(rad);
		
		var transform = new ART.Transform(
			(m.xx * cos - m.xy * sin),
			(m.yx * cos - m.yy * sin) * flip,
			(m.xy * cos + m.xx * sin) * flip,
			(m.yy * cos + m.yx * sin)
		);

		var rotationTransform = new ART.Transform().rotate(rotation, 0, 0);

		var shapeToBox = new ART.Transform().rotate(-rotation, 0, 0).transform(m).moveTo(0,0);

		// Scale box after reversing rotation
		width *= Math.abs(shapeToBox.xx);
		height *= Math.abs(shapeToBox.yy);
		
		// Place box
		var left = m.x, top = m.y;
		
		// Compensate for offset by center origin rotation
		var vx = -width / 2, vy = -height / 2;
		var point = rotationTransform.point(vx, vy);
		left -= point.x - vx;
		top -= point.y - vy;
		
		// Adjust box position based on offset
		var rsm = new ART.Transform(m).moveTo(0,0);
		point = rsm.point(originX, originY);
		left += point.x;
		top += point.y;
		
		if (flip < 0) left = -left - width;
		
		// Place transformation origin
		var point0 = rsm.point(-originX, -originY);
		var point1 = rotationTransform.point(width, height);
		var point2 = rotationTransform.point(width, 0);
		var point3 = rotationTransform.point(0, height);
		
		var minX = Math.min(0, point1.x, point2.x, point3.x),
		    maxX = Math.max(0, point1.x, point2.x, point3.x),
		    minY = Math.min(0, point1.y, point2.y, point3.y),
		    maxY = Math.max(0, point1.y, point2.y, point3.y);
		
		var transformOriginX = (point0.x - point1.x / 2) / (maxX - minX) * flip,
		    transformOriginY = (point0.y - point1.y / 2) / (maxY - minY);
		
		// Adjust the origin
		point = shapeToBox.point(originX, originY);
		originX = point.x;
		originY = point.y;
		
		// Scale stroke
		var strokeWidth = this._strokeWidth;
		if (strokeWidth){
			// Scale is the hypothenus between the two vectors
			// TODO: Use area calculation instead
			var vx = m.xx + m.xy, vy = m.yy + m.yx;
			strokeWidth *= Math.sqrt(vx * vx + vy * vy) / Math.sqrt(2);
		}
		
		// convert to multiplied precision space
		originX *= precision;
		originY *= precision;
		left *= precision;
		top *= precision;
		width *= precision;
		height *= precision;
		
		// Set box
		var element = this.element;
		element.coordorigin = originX + ',' + originY;
		element.coordsize = width + ',' + height;
		element.style.left = left + 'px';
		element.style.top = top + 'px';
		element.style.width = width;
		element.style.height = height;
		element.style.rotation = rotation.toFixed(8);
		element.style.flip = flip < 0 ? 'x' : '';
		
		// Set transform
		var skew = this.skewElement;
		skew.matrix = [transform.xx.toFixed(4), transform.xy.toFixed(4), transform.yx.toFixed(4), transform.yy.toFixed(4), 0, 0];
		skew.origin = transformOriginX + ',' + transformOriginY;

		// Set stroke
		this.strokeElement.weight = strokeWidth + 'px';
	},
	
	/* styles */

	_createGradient: function(style, stops){
		var fill = this.fillElement;

		// Temporarily eject the fill from the DOM
		this.element.removeChild(fill);

		fill.type = style;
		fill.method = 'none';
		fill.rotate = true;

		var colors = [], color1, color2;

		var addColor = function(offset, color){
			color = ART.Color.detach(color);
			if (color1 == null) color1 = color2 = color;
			else color2 = color;
			colors.push(offset + ' ' + color[0]);
		};

		// Enumerate stops, assumes offsets are enumerated in order
		if ('length' in stops) for (var i = 0, l = stops.length - 1; i <= l; i++) addColor(i / l, stops[i]);
		else for (var offset in stops) addColor(offset, stops[offset]);
		
		fill.color = color1[0];
		fill.color2 = color2[0];
		
		//if (fill.colors) fill.colors.value = colors; else
		fill.colors = colors;

		// Opacity order gets flipped when color stops are specified
		fill.opacity = color2[1];
		fill['ao:opacity2'] = color1[1];

		fill.on = true;
		this.element.appendChild(fill);
		return fill;
	},
	
	_setColor: function(type, color){
		var element = type == 'fill' ? this.fillElement : this.strokeElement;
		if (color == null){
			element.on = false;
		} else {
			color = ART.Color.detach(color);
			element.color = color[0];
			element.opacity = color[1];
			element.on = true;
		}
	},
	
	fill: function(color){
		if (arguments.length > 1){
			this.fillLinear(arguments);
		} else {
			this._boxCoords = defaultBox;
			var fill = this.fillElement;
			fill.type = 'solid';
			fill.color2 = '';
			fill['ao:opacity2'] = '';
			if (fill.colors) fill.colors.value = '';
			this._setColor('fill', color);
		}
		return this;
	},

	fillRadial: function(stops, focusX, focusY, radiusX, radiusY, centerX, centerY){
		var fill = this._createGradient('gradientradial', stops);
		if (focusX == null) focusX = this.left + this.width * 0.5;
		if (focusY == null) focusY = this.top + this.height * 0.5;
		if (radiusY == null) radiusY = radiusX || (this.height * 0.5);
		if (radiusX == null) radiusX = this.width * 0.5;
		if (centerX == null) centerX = focusX;
		if (centerY == null) centerY = focusY;
		
		centerX += centerX - focusX;
		centerY += centerY - focusY;
		
		var box = this._boxCoords = {
			left: centerX - radiusX * 2,
			top: centerY - radiusY * 2,
			width: radiusX * 4,
			height: radiusY * 4
		};
		focusX -= box.left;
		focusY -= box.top;
		focusX /= box.width;
		focusY /= box.height;

		fill.focussize = '0 0';
		fill.focusposition = focusX + ',' + focusY;
		fill.focus = '50%';
		
		this._transform();
		
		return this;
	},

	fillLinear: function(stops, x1, y1, x2, y2){
		var fill = this._createGradient('gradient', stops);
		fill.focus = '100%';
		if (arguments.length == 5){
			var w = Math.abs(x2 - x1), h = Math.abs(y2 - y1);
			this._boxCoords = {
				left: Math.min(x1, x2),
				top: Math.min(y1, y2),
				width: w < 1 ? h : w,
				height: h < 1 ? w : h
			};
			fill.angle = (360 + Math.atan2((x2 - x1) / h, (y2 - y1) / w) * 180 / Math.PI) % 360;
		} else {
			this._boxCoords = null;
			fill.angle = (x1 == null) ? 0 : (90 + x1) % 360;
		}
		this._transform();
		return this;
	},

	fillImage: function(url, width, height, left, top, color1, color2){
		var fill = this.fillElement;
		if (color1 != null){
			color1 = ART.Color.detach(color1);
			if (color2 != null) color2 = ART.Color.detach(color2);
			fill.type = 'pattern';
			fill.color = color1[0];
			fill.color2 = color2 == null ? color1[0] : color2[0];
			fill.opacity = color2 == null ? 0 : color2[1];
			fill['ao:opacity2'] = color1[1];
		} else {
			fill.type = 'tile';
			fill.color = '';
			fill.color2 = '';
			fill.opacity = 1;
			fill['ao:opacity2'] = 1;
		}
		if (fill.colors) fill.colors.value = '';
		fill.rotate = true;
		fill.src = url;
		
		fill.size = '1,1';
		fill.position = '0,0';
		fill.origin = '0,0';
		fill.aspect = 'ignore'; // ignore, atleast, atmost
		fill.on = true;

		if (!left) left = 0;
		if (!top) top = 0;
		this._boxCoords = width ? { left: left + 0.5, top: top + 0.5, width: width, height: height } : null;
		this._transform();
		return this;
	},

	/* stroke */
	
	stroke: function(color, width, cap, join){
		var stroke = this.strokeElement;
		this._strokeWidth = (width != null) ? width : 1;
		stroke.weight = (width != null) ? width + 'px' : 1;
		stroke.endcap = (cap != null) ? ((cap == 'butt') ? 'flat' : cap) : 'round';
		stroke.joinstyle = (join != null) ? join : 'round';

		this._setColor('stroke', color);
		return this;
	}

});

// VML Shape Class

ART.VML.Shape = ART.Class(ART.VML.Base, {

	base_initialize: ART.VML.Base.prototype.initialize,
	
	initialize: function(path, width, height){
		this.base_initialize('shape');

		var p = this.pathElement = document.createElement('av:path');
		p.gradientshapeok = true;
		this.element.appendChild(p);
		
		this.width = width;
		this.height = height;
		
		if (path != null) this.draw(path);
	},
	
	// SVG to VML
	
	draw: function(path, width, height){
		
		if (!(path instanceof ART.Path)) path = new ART.Path(path);
		this._vml = path.toVML(precision);
		this._size = path.measure();
		
		if (width != null) this.width = width;
		if (height != null) this.height = height;
		
		if (!this._boxCoords) this._transform();
		this._redraw(this._prefix, this._suffix);
		
		return this;
	},
	
	// radial gradient workaround

	_redraw: function(prefix, suffix){
		var vml = this._vml || '';

		this._prefix = prefix;
		this._suffix = suffix
		if (prefix){
			vml = [
				prefix, vml, suffix,
				// Don't stroke the path with the extra ellipse, redraw the stroked path separately
				'ns e', vml, 'nf'
			].join(' ');
		}

		this.element.path = vml + 'e';
	},

	fillRadial: function(stops, focusX, focusY, radiusX, radiusY, centerX, centerY){
		var fill = this._createGradient('gradientradial', stops);
		if (focusX == null) focusX = (this.left || 0) + (this.width || 0) * 0.5;
		if (focusY == null) focusY = (this.top || 0) + (this.height || 0) * 0.5;
		if (radiusY == null) radiusY = radiusX || (this.height * 0.5) || 0;
		if (radiusX == null) radiusX = (this.width || 0) * 0.5;
		if (centerX == null) centerX = focusX;
		if (centerY == null) centerY = focusY;

		centerX += centerX - focusX;
		centerY += centerY - focusY;
		
		var cx = Math.round(centerX * precision),
			cy = Math.round(centerY * precision),

			rx = Math.round(radiusX * 2 * precision),
			ry = Math.round(radiusY * 2 * precision),

			arc = ['wa', cx - rx, cy - ry, cx + rx, cy + ry].join(' ');

		this._redraw(
			// Resolve rendering bug
			['m', cx, cy - ry, 'l', cx, cy - ry].join(' '),
			// Draw an ellipse around the path to force an elliptical gradient on any shape
			[
				'm', cx, cy - ry,
				arc, cx, cy - ry, cx, cy + ry, arc, cx, cy + ry, cx, cy - ry,
				arc, cx, cy - ry, cx, cy + ry, arc, cx, cy + ry, cx, cy - ry
			].join(' ')
		);

		this._boxCoords = { left: focusX - 2, top: focusY - 2, width: 4, height: 4 };
		
		fill.focusposition = '0.5,0.5';
		fill.focussize = '0 0';
		fill.focus = '50%';
		
		this._transform();
		
		return this;
	}

});

var fontAnchors = { start: 'left', middle: 'center', end: 'right' };

ART.VML.Text = ART.Class(ART.VML.Base, {

	base_initialize: ART.VML.Base.prototype.initialize,

	initialize: function(text, font, alignment, path){
		this.base_initialize('shape');
		
		var p = this.pathElement = document.createElement('av:path');
		p.textpathok = true;
		this.element.appendChild(p);
		
		p = this.textPathElement = document.createElement("av:textpath");
		p.on = true;
		p.style['v-text-align'] = 'left';
		this.element.appendChild(p);
		
		this.draw.apply(this, arguments);
	},
	
	draw: function(text, font, alignment, path){
		var element = this.element,
		    textPath = this.textPathElement,
		    style = textPath.style;
		
		textPath.string = text;
		
		if (font){
			if (typeof font == 'string'){
				style.font = font;
			} else {
				for (var key in font){
					var ckey = key.camelCase ? key.camelCase() : key;
					if (ckey == 'fontFamily') style[ckey] = "'" + font[key] + "'";
					// NOT UNIVERSALLY SUPPORTED OPTIONS
					// else if (ckey == 'kerning') style['v-text-kern'] = !!font[key];
					// else if (ckey == 'rotateGlyphs') style['v-rotate-letters'] = !!font[key];
					// else if (ckey == 'letterSpacing') style['v-text-spacing'] = Number(font[key]) + '';
					else style[ckey] = font[key];
				}
			}
		}
		
		if (alignment) style['v-text-align'] = fontAnchors[alignment] || alignment;
		
		if (path){
			this.currentPath = path = new ART.Path(path);
			this.element.path = path.toVML(precision);
		} else if (!this.currentPath){
			var i = -1, offsetRows = '\n';
			while ((i = text.indexOf('\n', i + 1)) > -1) offsetRows += '\n';
			textPath.string = offsetRows + textPath.string;
			this.element.path = 'm0,0l1,0';
		}
		
		// Measuring the bounding box is currently necessary for gradients etc.
		
		// Clone element because the element is dead once it has been in the DOM
		element = element.cloneNode(true);
		style = element.style;
		
		// Reset coordinates while measuring
		element.coordorigin = '0,0';
		element.coordsize = '10000,10000';
		style.left = '0px';
		style.top = '0px';
		style.width = '10000px';
		style.height = '10000px';
		style.rotation = 0;
		element.removeChild(element.firstChild); // Remove skew
		
		// Inject the clone into the document
		
		var canvas = new ART.VML(1, 1),
		    group = new ART.VML.Group(), // Wrapping it in a group seems to alleviate some client rect weirdness
		    body = element.ownerDocument.body;
		
		canvas.inject(body);
		group.element.appendChild(element);
		group.inject(canvas);
		
		var ebb = element.getBoundingClientRect(),
		    cbb = canvas.toElement().getBoundingClientRect();
		
		canvas.eject();
		
		this.left = ebb.left - cbb.left;
		this.top = ebb.top - cbb.top;
		this.width = ebb.right - ebb.left;
		this.height = ebb.bottom - ebb.top;
		this.right = ebb.right - cbb.left;
		this.bottom = ebb.bottom - cbb.top;
		
		this._transform();

		this._size = { left: this.left, top: this.top, width: this.width, height: this.height};
		return this;
	}

});

// VML Path Extensions

var path, p, round = Math.round;

function moveTo(sx, sy, x, y){
	path.push('m', round(x * p), round(y * p));
};

function lineTo(sx, sy, x, y){
	path.push('l', round(x * p), round(y * p));
};

function curveTo(sx, sy, p1x, p1y, p2x, p2y, x, y){
	path.push('c',
		round(p1x * p), round(p1y * p),
		round(p2x * p), round(p2y * p),
		round(x * p), round(y * p)
	);
};

function arcTo(sx, sy, ex, ey, cx, cy, r, sa, ea, ccw){
	cx *= p;
	cy *= p;
	r *= p;
	path.push(ccw ? 'at' : 'wa',
		round(cx - r), round(cy - r),
		round(cx + r), round(cy + r),
		round(sx * p), round(sy * p),
		round(ex * p), round(ey * p)
	);
};

function close(){
	path.push('x');
};

ART.Path.prototype.toVML = function(precision){
	if (this.cache.vml == null){
		path = [];
		p = precision;
		this.visit(lineTo, curveTo, arcTo, moveTo, close);
		this.cache.vml = path.join(' ');
	}
	return this.cache.vml;
};

})();