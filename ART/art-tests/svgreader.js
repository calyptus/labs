var readSVG = function(text, doc){

	var svg = doc.documentElement;
	
	var w = +svg.getAttribute('width'), h = +svg.getAttribute('height');
	w = 500;
	h = 400;

	var art = new ART(w, h);
	art.element.setAttribute('viewBox', svg.getAttribute('viewBox'));
	var root = new ART.Group().inject(art);

	var node = svg;
	var parent = root;

	treewalker: while (node){
		var shape;
		if (node.nodeType == 1){
			if (node.nodeName == 'path'){
				shape = new ART.Shape(node.getAttribute('d')).inject(parent);
			} else if (node.nodeName == 'g'){
				shape = new ART.Group().inject(parent);
			}	
			if (shape && shape.fill && /land/.test(node.getAttribute('class'))){
			   shape.fill('#b9b9b9');
			   //shape.stroke('#ffffff');
			}
		}
		
		if (node.firstChild){
			node = node.firstChild;
			if (shape) parent = shape;
		} else {
			while (!node.nextSibling){
				node = node.parentNode;
				if (!node || node == svg) break treewalker;
				if (node.nodeName == 'path' || node.nodeName =='g') parent = parent.container;
			}
			node = node.nextSibling;
		}
		
	}
	
	var zoom = 1;

	var size = { width: 2700, height: 1500 }; //root.measure();
	var center = { x: 939.74725 / 2, y: 476.7276 / 2 }; //art.width, art.height
	
	var cx = center.x, cy = center.y, width = size.width * zoom, height = size.height * zoom;
	//root.translate(cx - width / 2, cy - height / 3).scale(zoom, zoom);
	art.element.style.position = 'absolute';
	art.element.style.left = (250 - (w / 2) * zoom) + 'px';
	art.element.style.top = (200 - (h / 2) * zoom) + 'px';
	art.element.style.width = w * zoom + 'px';
	art.element.style.height = w * zoom + 'px';


	art.inject($('surface'));
	alert('ready?');
	
	//if (ART instanceof ART.VML){
		
		//root.scale(0.01, 0.01);
		//var e = root.element; // new Element('div', { text: 'My content' }).inject(document.body); // art.element;
		//e.style.zoom = zoom;
		//e.style.position = 'absolute';
		//e.style.filter = "progid:DXImageTransform.Microsoft.Matrix(M11=0.5, M12=0.6, M21=-0.7, M22=0.8, Dy=65)";
		/*e.style.filter = "progid:DXImageTransform.Microsoft.Matrix()";
		e.filters.item(0).M11 = zoom;
		e.filters.item(0).M12 = 0;
		e.filters.item(0).M21 = 0;
		e.filters.item(0).M22 = zoom;*/
		
		//alert('ready?');

		/*var timer = function(){
			zoom *= 1.1;
			cx = center.x; cy = center.y; width = size.width; height = size.height;

			e.filters.item(0).M11 = zoom;
			e.filters.item(0).M12 = 0;
			e.filters.item(0).M21 = 0;
			e.filters.item(0).M22 = zoom;
			
			//e.style.left = (cx - width / 2);
			//e.style.top = (cy - height / 2);
			//e.style.zoom = zoom;
			if (zoom >= 1) $clear(timer);
		}.periodical(40);*/
		
	//} else {
		var timer = function(){
			zoom += 1.1;
			cx = center.x; cy = center.y; width = size.width * zoom; height = size.height * zoom;
			//root.translate(cx - width / 2, cy - height / 3).scale(zoom, zoom);
			
			art.element.style.left = (250 - (w / 2) * zoom) + 'px';
			art.element.style.top = (200 - (h / 2) * zoom) + 'px';
			art.element.style.width = w * zoom + 'px';
			art.element.style.height = w * zoom + 'px';
			//root.scale(zoom, zoom);
			if (zoom >= 10) $clear(timer);
		}.periodical(50);
	//}
};

new Request.XML({ url: 'BlankMap.svg', onSuccess: readSVG }).get();
