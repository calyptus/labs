var Transform = function(xx, yx, xy, yy, tx, ty){
	var m = this._matrix;
	if (arguments.length == 1){
		m = xx._matrix;
		xx = m.xx;
		yx = m.yx;
		xy = m.xy;
		yy = m.yy;
	}
	//this._matrix = [xx || 0, yx || 0, xy || 0, yy || 0, tx || 0, ty || 0];
	this._matrix = { xx: xx || 0, yx: yx || 0, xy: xy || 0, yy: yy || 0, tx: tx == null ? m.tx : tx, ty: ty == null ? m.ty : ty };
	this.onTransform();
	return this;
};

var translate = function(x, y){
	var m = this._matrix;
	return this.transformTo(m.xx, m.yx, m.xy, m.yy, m.tx + x, m.ty + y);
};

Transform.prototype = {

	_matrix: { xx: 1, xy: 0, yx: 0, yy: 1, tx: 0, ty: 0 },
	
	onTransform: function(){},
	
	transform: function(xx, yx, xy, yy, tx, ty){
		var m = this._matrix;
		return this.transformTo(
			m.xx * xx + m.xy * yx,
			m.yx * xx + m.yy * yx,
			m.xx * xy + m.xy * yy,
			m.yx * xy + m.yy * yy,
			m.xx * tx + m.xy * ty + m.tx,
			m.yx * tx + m.yy * ty + m.ty
		);
	},
	
	transformTo: Transform,
	
	translate: translate,
	move: translate,
	
	scale: function(x, y){
		if (y == null) y = x;
		return this.transform(x, 0, 0, y, 0, 0);
	},
	
	rotate: function(deg, x, y){
		if (x == null || y == null){
			var box = this.measure();
			x = box.left + box.width / 2; y = box.top + box.height / 2;
		}
		var rad = deg * Math.PI / 180, sin = Math.sin(rad), cos = Math.cos(rad);
		
		this.translate(x, y);
		var m = this._matrix;
		return this.transformTo(
			cos * m.xx - sin * m.yx,
			sin * m.xx + cos * m.yx,
			cos * m.xy - sin * m.yy,
			sin * m.xy + cos * m.yy,
			m.tx,
			m.ty
		).translate(-x, -y);
	},
	
	moveTo: function(x, y){
		var m = this._matrix;
		return this.transformTo(m.xx, m.yx, m.xy, m.yy, x, y);
	},
	
	rotateTo: function(deg, x, y){
		var m = this._matrix;
		// TODO: Adjust for flip
		return this.rotate(deg - Math.atan2(m.yx, m.xx) * 180 / Math.PI, x, y)
	},
	
	scaleTo: function(x, y){
		// Normalize
        var m = this._matrix;
        
        var h = Math.sqrt(m.xx * m.xx + m.yx * m.yx);
        m.xx /= h; m.yx /= h;
        
        h = Math.sqrt(m.yy * m.yy + m.xy * m.xy);
        m.yy /= h; m.xy /= h;
        
        // TODO: Adjust for flip
        
        return this.scale(x, y);
	}

};