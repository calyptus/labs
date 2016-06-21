var Float32Array = window.Float32Array || window.WebGLFloatArray;
var Uint32Array = window.Uint32Array || window.WebGLUnsignedIntArray;
var Uint16Array = window.Uint16Array || window.WebGLUnsignedShortArray;

function PageCurlRenderer(canvas){

    var curves, viewportWidth = 512, viewportHeight = 512;

	var gl;
    //try {
    gl = canvas.getContext('experimental-webgl', { antialias: false });
    //} catch(x){ }
    if (!gl) throw new Error('No WebGL');
    
    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    gl.clearDepth(1.0);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

	var curl = new PageCurl(gl, viewportWidth, viewportHeight);
	var img, amount = 0;

	function load(url){
		img = new Image();
		img.onload = requestRender;
		img.src = url;
		if (img.width) requestRender();
	};
	
	function render(){
		if (ShaderProgram.pending) return setTimeout(requestRender, 25);
		curl.render(img, amount);
		gl.flush();
		gl.finish();
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

	canvas.addEventListener('mousemove', move, false);

	function move(event){
				
		var x = event.clientX - this.offsetLeft + document.body.scrollLeft, y = event.clientY - this.offsetTop + document.body.scrollTop;
		x = 1 - x / 512;
		y = 1 - y / 512;
		amount = Math.sqrt(x * x + y * y) / 1.42;

		requestRender();
		
		event.preventDefault();
	};
	
	return load;
};

if (!window.addEventListener) window.attachEvent('onload', load);
else addEventListener('load', load , false);

function load(){

    var canvas = document.getElementById('canvas'),
    	selector = document.getElementById('selector');

	try {
    	var render = PageCurlRenderer(canvas);
    } catch(x){
    	document.getElementById('nowebgl').style.display = 'block';
    	document.getElementById('demo').style.display = 'none';
    	throw x;
    	return;
    }
    
    render(selector.options[selector.selectedIndex].value);
    
    selector.addEventListener('change', function(){ render(this.options[this.selectedIndex].value); }, false);

}
