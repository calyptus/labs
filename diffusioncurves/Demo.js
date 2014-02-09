var Float32Array = window.Float32Array || window.WebGLFloatArray;
var Uint32Array = window.Uint32Array || window.WebGLUnsignedIntArray;
var Uint16Array = window.Uint16Array || window.WebGLUnsignedShortArray;

function DiffusionCurveRenderer(canvas){

    var curves, viewportWidth = 512, viewportHeight = 512;

	var gl;
    //try {
    gl = canvas.getContext('experimental-webgl', { antialias: false });
    //} catch(x){ }
    if (!gl) throw new Error('No WebGL');
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clearDepth(1.0);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

	var dc = new DiffusionCurves(gl, viewportWidth, viewportHeight);

	function load(url){
		Curves.load(url, function(c){
			curves = c;
			// Fixed for now
			//viewportWidth = c.width;
			//viewportHeight = c.height;
			gl.viewport(0, 0, viewportWidth, viewportHeight);
			canvas.setAttribute('width', viewportWidth);
			canvas.setAttribute('height', viewportHeight);
			step();
		});
	};
	
	var transform = new Transform(1, 0, 0, 1);
	
	function render(){
		/*var r = 0 * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
	
		var scale = (1 + t) * z;
		var t = [
			c * scale, -s * scale, offsetX,
			s * scale, c * scale, offsetY
		];*/
		
		var m = transform._matrix;
		
		m = [
			m.xx * (1 + t), m.yx * (1 + t), m.tx,
			m.xy * (1 + t), m.yy * (1 + t), m.ty
		];
		
		dc.render(curves, m);
		gl.flush();
		gl.finish();
		//if (canvas.toDataURL) setTimeout(function(){ document.getElementById('png').href = canvas.toDataURL('image/png'); }, 100);
	};
	
	var prev, t;
	function step() {
		var d = +new Date();
		if (!prev) prev = d;
		t = (d - prev) / 10000;
		
		t -= 0.5;
		if (t > 0) t = 0;
		
		requestRender();
				
		if (t < 0) setTimeout(step, 25);
	};
	
	var renderRequested, renderTimer;
	
	function checkRender(){
		renderTimer = null;
		if (renderRequested) render();
	};
	
	function requestRender(){
		if (renderTimer){
			renderRequested = true;
		} else {
			render();
			renderRequested = false;
			renderTimer = setTimeout(checkRender, 25);
		}
	};

	canvas.addEventListener('mousewheel', wheel, false);
	canvas.addEventListener('DOMMouseScroll', wheel, false);
	
	var z = 1;
	function wheel(event){
		if (!curves) return;
				
		var x = event.clientX - this.offsetLeft, y = event.clientY - this.offsetTop;
				
		var delta = event.wheelDelta ? event.wheelDelta / 120 : -(event.detail || 0) / 3;
		delta = z * delta / 4;
		if (z + delta < 0.1) delta = 0.1 - z;
		
		var scale = (z + delta) / z;
		
		transform
			.transform(1, 0, 0, 1, x, y)
			.transform(scale, 0, 0, scale, 0, 0)
			.transform(1, 0, 0, 1, -x, -y);

		requestRender();
		
		event.preventDefault();
	};
	
	var offsetX = 0, offsetY = 0;
	
	canvas.addEventListener('mousedown', down, false);
	
	var mouseX, mouseY;
	
	function down(event){
		event.preventDefault();
		mouseX = event.clientX;
		mouseY = event.clientY;
		document.addEventListener('mouseup', up, true);
		document.addEventListener('mousemove', move, true);
	};
	
	function move(event){
		transform.translate(
			event.clientX - mouseX,
			event.clientY - mouseY
		);
		mouseX = event.clientX;
		mouseY = event.clientY;
		requestRender();
	};
	
	function up(){
		document.removeEventListener('mouseup', up, true);
		document.removeEventListener('mousemove', move, true);
	};
	
	
	return load;
};

if (!window.addEventListener) window.attachEvent('onload', load);
else addEventListener('load', load , false);

function load(){

    var canvas = document.getElementById('canvas'),
    	selector = document.getElementById('selector');

	try {
    	var render = DiffusionCurveRenderer(canvas);
    } catch(x){
    	document.getElementById('nowebgl').style.display = 'block';
    	document.getElementById('demo').style.display = 'none';
    	throw x;
    	return;
    }
    
    render(selector.options[selector.selectedIndex].value);
    
    selector.addEventListener('change', function(){ render(this.options[this.selectedIndex].value); }, false);

}
