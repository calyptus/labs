/*
---
name: ART.Flash
description: "Flash fallback implementation for ART"
provides: [ART.Flash, ART.Flash.Group, ART.Flash.Shape, ART.Flash.Image, ART.Flash.Text]
requires: [ART, ART.Element, ART.Container, ART.Transform, ART.Path]
...
*/

(function(){

// Flash Base Class

var fps = 1000 / 60;

ART.Flash = ART.Class(ART.Element, ART.Container, {

	initialize: function(width, height){
		var id = this.uid = String.uniqueID(),
		    path = ART.Flash.swf,
		    properties = {},
		    params = {
				quality: 'high',
				allowScriptAccess: 'always',
				wMode: 'transparent'
			};

		if (Browser.ie){
			properties.classid = 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000';
			params.movie = path;
		} else {
			properties.type = 'application/x-shockwave-flash';
		}
		properties.data = path;

		params.flashVars = 'id=' + id;

		var build = '<object id="' + id + '"';
		for (var property in properties) build += ' ' + property + '="' + properties[property] + '"';
		build += '>';
		for (var param in params){
			if (params[param]) build += '<param name="' + param + '" value="' + params[param] + '" />';
		}
		build += '</object>';

		var div = document.createElement('div');
		div.innerHTML = build;
		this.element = div.firstChild;
		this.element.ART = this;

		this._buffer = [];
		this._flush = this._flush.bind(this);

		if (width != null && height != null) this.resize(width, height);
	},

	resize: function(width, height){
		var element = this.element;
		element.setAttribute('width', width);
		element.setAttribute('height', height);
		this.width = width;
		this.height = height;
		return this;
	},

	_flush: function(){
		this.element.CallFunction('<invoke name="c" returntype="javascript"><arguments><string>' + this._buffer.join('') + '</string></arguments></invoke>');
		this._buffer = null;
	},

	_send: function(command){
		var buffer = this._buffer, self;
		if (buffer != null){
			buffer.push(command);
		} else {
			this._buffer = buffer = [];
			buffer.push(command);
			setTimeout(this._flush, fps);
		}
	},

	_batch: function(commands){
		var buffer = this._buffer;
		if (buffer != null){
			buffer.push.apply(buffer, commands);
		} else {
			this._buffer = buffer = [];
			buffer.push.apply(buffer, commands);
			setTimeout(this._flush, fps);
		}
	},

	toElement: function(){
		return this.element;
	}

});

ART.Flash.swf = 'ART.Flash.swf';

ART.Flash.init = function(instanceID){
	var element = document.getElementById(instanceID);
	if (element){
		element.ART._flush();
		delete element.ART;
	}
};

// Flash Element Class

ART.Flash.Element = ART.Class(ART.Transform, {

	initialize: function(){
		this.uid = String.uniqueID();
	},

	inject: function(container){
		this.eject();
		container._send('i' + this.uid + container.uid);
		var buffer = this._buffer;
		if (buffer){
			container._batch(buffer);
			delete this._buffer;
		}
		this.container = container;
		return this;
	},

	eject: function(){
		var container = this.container;
		if (container) container._send('e' + this.uid);
		this.container = null;
		return this;
	},

	_send: function(command){
		var container = this.container;
		if (container){
			container._send(command);
		} else {
			var buffer = this._buffer || (this._buffer = []);
			buffer.push(command);
		}
	},

	_batch: function(commands){
		var container = this.container;
		if (container){
			container._batch(commands);
		} else {
			var buffer = this._buffer || (this._buffer = []);
			buffer.push.apply(buffer, commands);
		}
	},

	// transforms

	_transform: function(){
	},

	blend: function(opacity){
		return this;
	},

	// visibility

	hide: function(){
		return this;
	},

	show: function(){
		return this;
	},

	// interaction

	indicate: function(cursor, tooltip){
		return this;
	}

});

// Flash Group Class

ART.Flash.Group = ART.Class(ART.Flash.Element, ART.Container, {

	initialize: function(width, height){
		this.parent();
		this.width = width;
		this.height = height;
	}

});

// Flash Shape Class

ART.Flash.Base = ART.Class(ART.Flash.Element, {

	initialize: function(){
		this.parent();
	},

	/* styles */

	_addColors: function(gradient, stops){
		// Enumerate stops, assumes offsets are enumerated in order
		// TODO: Sort. Chrome doesn't always enumerate in expected order but requires stops to be specified in order.
		if ('length' in stops) for (var i = 0, l = stops.length - 1; i <= l; i++)
			gradient.addColorStop(i / l, new Color(stops[i]).toString());
		else for (var offset in stops)
			gradient.addColorStop(offset, new Color(stops[offset]).toString());
		return gradient;
	},

	fill: function(color){
		if (arguments.length > 1) return this.fillLinear(arguments);
		else this._fill = color ? new Color(color).toString() : null;
		return this;
	},

	fillRadial: function(stops, focusX, focusY, radiusX, radiusY, centerX, centerY){
		return this;
	},

	fillLinear: function(stops, x1, y1, x2, y2){
		return this;
	},

	fillImage: function(url, width, height, left, top, color1, color2){
		return this;
	},

	stroke: function(color, width, cap, join){
		this._stroke = color ? new Color(color).toString() : null;
		this._strokeWidth = (width != null) ? width : 1;
		this._strokeCap = (cap != null) ? cap : 'round';
		this._strokeJoin = (join != null) ? join : 'round';
		return this;
	}

});

// Flash Shape Class

ART.Flash.Shape = ART.Class(ART.Flash.Base, {

	initialize: function(path, width, height){
		this.parent();
		this.width = width;
		this.height = height;
		if (path != null) this.draw(path);
	},

	draw: function(path, width, height){
		if (!(path instanceof ART.Path)) path = new ART.Path(path);
		if (width != null) this.width = width;
		if (height != null) this.height = height;
		return this;
	}

});

// Flash Image Class

ART.Flash.Image = ART.Class(ART.Flash.Base, {

	initialize: function(src, width, height){
		this.parent();
		if (arguments.length == 3) this.draw.apply(this, arguments);
	},

	draw: function(src, width, height){
		this.width = width;
		this.height = height;
		return this;
	}

});

// Flash Text Class

var fontAnchors = { middle: 'center' };

ART.Flash.Text = ART.Class(ART.Flash.Base, {

	initialize: function(text, font, alignment, path){
		this.parent();
		this.draw.apply(this, arguments);
	},

	draw: function(text, font, alignment, path){
		var em;
		if (typeof font == 'string'){
			em = Number(/(\d+)/.exec(font)[0]);
		} else if (font){
			em = parseFloat(font.fontSize || font['font-size'] || '12');
			font = (font.fontStyle || font['font-style'] || '') + ' ' +
				(font.fontVariant || font['font-variant'] || '') + ' ' +
				(font.fontWeight || font['font-weight'] || '') + ' ' +
				em + 'px ' +
				(font.fontFamily || font['font-family'] || 'Arial');
		} else {
			font = this._font;
		}

		var lines = text && text.split(/\r?\n/);
		this._font = font;
		this._fontSize = em;
		this._text = lines;
		this._alignment = fontAnchors[alignment] || alignment;
		
		/*var context = genericContext;

		context.font = this._font;
		context.textAlign = this._alignment;
		context.textBaseline = 'middle';
		
		var lines = this._text, l = lines.length, width = 0;
		for (var i = 0; i < l; i++){
			w = context.measureText(lines[i]).width;
			if (w > width) width = w;
		}*/
		
		//this.width = width;
		//this.height = l ? l * 1.1 * em : 0;
		return this;
	}

});

})();