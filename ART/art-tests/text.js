addEvent('load', function(){

var art = new ART(1000, 600);

art.inject(document.body);
var group = new ART.Group();

var curve = new ART.Path().move(200, 20).curve(100, 0, 0, 200, 300, 300);

curve.move(-100, -100).line(100, -100).line(100, 100);

var line = new ART.Shape(curve).stroke('#00F', 1).translate(0,0).inject(group);

var txt = "ART is very curvy,\nisn't it? Totally.";

var font = { fontSize: '30pt', fontFamily: 'Impact', fontWeight: 'bold' };

var text = new ART.Text(txt, font, 'left', curve).inject(group);

group.inject(art);


var bb = new ART.Rectangle().inject(group);

var size = text.measure();

text.fillLinear(['#000', 'rgba(0,0,0,0)'], 0);

if (!size.width) return;

bb.translate(size.left, size.top).draw(size.width, size.height);

bb.fill('rgba(0,0,0,0)').stroke('rgba(0, 0, 0, .5)');

new ART.Text('Some other words', 'normal 20pt Arial').stroke('#F00').inject(art);

});