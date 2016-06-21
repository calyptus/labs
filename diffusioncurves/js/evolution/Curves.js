Curves.prototype.mutate = function(){
	this.vertexBuffers = null;
	var r = Mutator.next();
	if ((r < 0.01 && this.curves.length < 10) || this.curves.length < 5){
		this.curves.push(new Curve().mutate().mutate().mutate()); // Add
	} else {
		var i = Mutator.nextInteger(this.curves.length - 1);
		//if (r < 0.011) this.curves.splice(i, 1); // Remove
		//else
		this.curves[i].mutate(); // Change
	}
	return this;
};

Curves.prototype.clone = function(){
	var n = new Curves();
	n.curves = this.curves.map(function(c){ return c.clone(); });
	if (this.bounds) n.bounds = this.bounds.slice(0);
	n.width = this.width;
	n.height = this.height;
	return n;
};