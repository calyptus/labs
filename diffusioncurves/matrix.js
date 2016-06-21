addEvent('load', function(){

	var art = new ART(1000, 600).inject(document.body);
	
	var line = new ART.Shape()
		.stroke('#000')
		.inject(art);
		
	var box = new ART.Rectangle(150, 110)
		.stroke('#CCC')
		.inject(art);
	
	var pline = new ART.Shape()
		.stroke('#F00')
		.inject(art);

	var p2line = new ART.Shape()
		.stroke('#00F')
		.inject(art);
		
	setInterval(step, 1000);
	
	function step(){
	
		var xx = Math.random() * 2 - 1,
			xy = Math.random() * 2 - 1,
			yx = Math.random() * 2 - 1,
			yy = Math.random() * 2 - 1;
		
		//xx = yy = 0.5;
		//xy = yx = 1;
		//xx = -0.9;
		
		var tx = 50, ty = 10;
		
		var x = 100, y = 100;
		
		var d = Math.sqrt(x * x + y * y);
		
		var px = y / d, py = -x / d;

		var px2 = -y / d, py2 = x / d;
		
		x += tx;
		y += ty;

		var t = x * xx + y * xy;
		y = y * yy + x * yx;
		x = t;
		
		var t = tx * xx + ty * xy;
		ty = ty * yy + tx * yx;
		tx = t;
		
		box.transformTo(xx, yx, xy, yy, 300, 200);

		draw(tx, ty, x, y);
		
		var dx = Math.sqrt(xx * xx + xy * xy);
		var dy = Math.sqrt(yy * yy + yx * yx);
		
		xx /= dx; xy /= dx;
		yy /= dy; yx /= dy;
		
		t = px * yy + py * -yx;
		py = py * xx + px * -xy;
		px = t;

		t = px2 * yy + py2 * -yx;
		py2 = py2 * xx + px2 * -xy;
		px2 = t;
		
		var dx = x - tx, dy = y - ty;
		
		var d = Math.sqrt(dx * dx + dy * dy);		
		dx /= d; dy /= d;
		
		pdraw(tx, ty, dy * 20, -dx * 20);

		p2draw(tx, ty, -dy * 20, dx * 20);
	
	};

	function draw(tx, ty, x, y){
		var path = new ART.Path().move(300 + tx, 200 + ty).lineTo(300 + x, 200 + y);
		line.draw(path);
	};

	function pdraw(tx, ty, x, y){
		var path = new ART.Path().move(300 + tx, 200 + ty).line(x, y);
		pline.draw(path);
	};

	function p2draw(tx, ty, x, y){
		var path = new ART.Path().move(300 + tx, 200 + ty).line(x, y);
		p2line.draw(path);
	};

});