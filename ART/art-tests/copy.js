var art = new ART(800, 550);
var group = art; //new ART.Group().inject(art);
var pill = new ART.Pill(200, 20).stroke('#ccc').fill('rgba(255, 0, 0, .2)').inject(group);
var text = new ART.Font('Moderna', 'normal', 'Some Text!', 10).translate(20, 5).fill('#000').inject(group);

pill = new ART.Pill(200, 20).fill('rgba(0, 0, 0, .2)').translate(0, 180).inject(group);
text = new ART.Font('Moderna', 'normal', 'Some Text!', 10).translate(20, 185).fill('#000').rotate(-45).inject(group);

new ART.Ellipse(100, 100).translate(50, 50).fill('#0f0').inject(group);
var size = new ART.Shape().draw(new ART.Path().move(0, 0).counterArc(100, 70, 100, 200, false)).translate(50, 50).stroke('#000').fill('#00f').inject(group).measure();
new ART.Rectangle(size.width, size.height).translate(size.left + 49.5, size.top + 49.5).stroke('#c00').inject(group);

var blu = new ART.Wedge(0, 100, 370, 50).fill('#00f').translate(400.5, 0.5).scale(2, 1).rotate(90, 100, 0).inject(group);

var wedge = new ART.Wedge().fill('#00f').translate(200.5, 0.5).stroke('#000').inject(group);
var bb = new ART.Rectangle().stroke('rgba(0, 0, 0, .5)').inject(group);

//group.scale(1, 1).rotate(0, 0, 200).translate(0, 0).scale(1);

new ART.Ellipse(200, 100).fill('#00f').translate(500, 200).inject(group);
new ART.Rectangle(100, 200).fill('#00f').translate(500, 310).stroke('#000').inject(group);

var p = new ART.Path().move(10, 10).line(200, 0).line(-100, 100).line(-10, 0).close().move(10, 10).arc(100, 100).arc(-100, -100).close();
new ART.Shape(p).fill('#00f').translate(100, 310).stroke('#000').inject(group);

setInterval(function(){

	var seconds = (new Date() % 30000) / 30000 * 360;
	wedge.draw(33, 100, 0, Math.round(seconds));
	size = wedge.measure();
	bb.translate(size.left + 200, size.top).draw(size.width, size.height);

}, 50);

var second = 1000,
	minute = second * 60,
	hour = minute * 60,
	day = hour * 24,
	month = day * 30.41,
	year = month * 12;

var timescales = [year, month, day, hour, minute];

var wedges = timescales.map(function(s, i){ return new ART.Wedge().fill('#0f0').translate(640 - i * 10, 40 - i * 10).inject(group); });

setInterval(function(){

	var time = +new Date();

	timescales.each(function(s, i){
		wedges[i].draw(40 + i * 10, 48 + i * 10, 0, (time % s) / s * 360);
	});

}, 50);

function copyART(){
	var range = document.body.createTextRange();
	range.moveToElementText(art.toElement());
	range.select();
	range.execCommand('copy');
	range.collapse();
	range.select();
};

new Element('a', { text: 'Copy ART', styles: { display: 'block', cursor: 'pointer' } })
	.addEvent('click', copyART)
	.addEvent('click', Event.preventDefault)
	.inject(document.body);

art.inject(document.body);
