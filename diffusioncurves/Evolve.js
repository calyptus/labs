var Float32Array = window.Float32Array || window.WebGLFloatArray;

function DiffusionCurveEvolver(canvas){

	var gl = canvas.getContext('experimental-webgl', { antialias: false });
    if (!gl) throw new Error('No WebGL');
    
    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    gl.clearDepth(1.0);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

	var dc;
	var renderer = new DiffusionCurves(gl, 512, 512);
	var diff;
	
	var curves = new Curves();

	var runner;
	
	var h = document.getElementsByTagName('h1')[0];
	
	var best, bestDNA;
	
	var iteration = 0;
	
	function step() {
	
		iteration++;
		
		curves.mutate();
	
		var f = dc.render(curves, null, false);
		var pixs = diff.render(f, false);
		if (pixs){
			//if (pixs.length != 200 * 200 * 3) throw new Error('Unexpected pixel array length');
			var d = 0;
			for (var i = 0, l = pixs.length; i < l; i+=3){
				var r = 255-pixs[i], g = 255-pixs[i + 1], b = 255-pixs[i + 2];
				d += Math.sqrt(r * r + g * g + b * b);
			}
			//for (var i = 0, l = pixs.length; i < l; i++)
				//d += Math.pow(pixs[i], 4);
				//d += pixs[i];
				
			d /= pixs.length / 3;
			//d = Math.pow(d, 0.25);

			if (best == null || d < best){
				var f = renderer.render(curves, [512 / 200, 0, 0, 0, 512 / 200, 0], null);
				//diff.render(f, true);
				best = d;
				bestDNA = curves.clone();
				console.log(d, curves.curves.length);
				if (d < 1) stop();
			} else {
				curves = bestDNA.clone();
			}
		}
		if (iteration % 10 == 0) h.innerHTML = 'Iteration: ' + iteration + ' Fitness: ' + d;

		//gl.flush();
		//gl.finish();

	};
	
	function start(org){
		//org.width = 512; org.height = 512;
		diff = new DiffusionCurves.Difference(gl, org, Number(org.width), Number(org.height));
		dc = new DiffusionCurves(gl, Number(org.width), Number(org.height));
		best = null;
		bestDNA = null;
		//alert(org.width + ', ' + org.height);
		if (!runner) runner = setInterval(step, 0);
	};
	
	function resume(){
		if (!runner) runner = setInterval(step, 0);
	};
	
	function stop(){
		clearTimeout(runner);
		runner = null;
	};
	
	return {
		start: start,
		resume: resume,
		stop: stop
	};
};

if (!window.addEventListener) window.attachEvent('onload', load);
else addEventListener('load', load , false);

function load(){

    var canvas = document.getElementById('canvas'),
    	original = document.getElementById('original');

	try {
    	var evolver = DiffusionCurveEvolver(canvas);
    } catch(x){
    	document.getElementById('nowebgl').style.display = 'block';
    	document.getElementById('demo').style.display = 'none';
    	throw x;
    	return;
    }
    
    var started = false;
	original.addEventListener('load', function loader(){
		evolver.start(original);
		started = true;
	}, false);

    canvas.addEventListener('click', function(){
    	if (started) evolver.stop(); else evolver.resume();
    	started = !started;
    }, false);
	
	original.src = 'images/mona_lisa.jpg';
}
