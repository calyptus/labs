Curve.prototype.mutate = function(){

	var width = 200, height = 200;

	var points = this.points,
	    left = this.left,
	    right = this.right,
	    blurs = this.blur;
	    
	var r = Mutator.next();
	
	if ((r < 0.01 && this.points.length < 50) || this.points.length < 2){
		
		var lastPoint = points[points.length - 1], lastLeft = left[points.length - 1], lastRight = right[points.length - 1];
		if (!lastPoint || !lastLeft || !lastRight){
			lastPoint = { x:  Mutator.nextFloat(width), y: Mutator.nextFloat(height) };
			lastLeft = { r: Mutator.next(), g: Mutator.next(), b: Mutator.next() };
			lastRight = { r: Mutator.next(), g: Mutator.next(), b: Mutator.next() };
		}
		//points.push({ x:  Mutator.nextFloat(width), y: Mutator.nextFloat(height) });
		points.push({ x:  Mutator.nextInRange(width, lastPoint.x), y: Mutator.nextInRange(height, lastPoint.y) });
		left.push({ r: Mutator.nextInRange(1, lastLeft.r), g: Mutator.nextInRange(1, lastLeft.g), b: Mutator.nextInRange(1, lastLeft.b) });
		right.push({ r: Mutator.nextInRange(1, lastRight.r), g: Mutator.nextInRange(1, lastRight.g), b: Mutator.nextInRange(1, lastRight.b) });
		blurs.push(Mutator.next() / 100);
	
	} else {
	
		var r = Mutator.next();
	
		var i = Mutator.nextInteger(this.points.length - 1);
		if (r < 0.01){
			//this.left = right;
			//this.right = left;
			//points[i].x = Mutator.nextInRange(512, points[i].x);
			//points[i].y = Mutator.nextInRange(512, points[i].y);
			points.splice(i, 1); // Remove
			left.splice(i, 1); // Remove
			right.splice(i, 1); // Remove
			blurs.splice(i, 1); // Remove
		} else if (r < 0.11)
			left[i].r = Mutator.nextInRange(1, left[i].r);
		else if (r < 0.21)
			left[i].g = Mutator.nextInRange(1, left[i].g);
		else if (r < 0.31)
			left[i].b = Mutator.nextInRange(1, left[i].b);
		else if (r < 0.41)
			right[i].r = Mutator.nextInRange(1, right[i].r);
		else if (r < 0.51)
			right[i].g = Mutator.nextInRange(1, right[i].g);
		else if (r < 0.61)
			right[i].b = Mutator.nextInRange(1, right[i].b);
		else if (r < 0.64)
			blurs[i] = Mutator.nextInRange(0.05, blurs[i]);
		else {
			points[i].x = Mutator.nextInRange(width, points[i].x);
			points[i].y = Mutator.nextInRange(height, points[i].y);
		}
	}
	
	return this;

};

Curve.prototype.clone = function(){
	var c = new Curve();
	c.points = this.points.map(function(p){ return { x: p.x, y: p.y }; });
	c.left = this.left.map(function(c){ return { r: c.r, g: c.g, b: c.b }; });
	c.right = this.right.map(function(c){ return { r: c.r, g: c.g, b: c.b }; });
	c.blur = this.blur.slice(0);
	c.bounds = this.bounds.slice(0);
	return c;
};