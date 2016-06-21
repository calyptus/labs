var Mutator = function(){

};

Mutator.next = function(){
	return Math.random();
};

Mutator.nextFloat = function(max){
	return Math.random() * max;
};

Mutator.nextInteger = function(max){
	return Math.round(Math.random() * max);
};

var iii = 0;
Mutator.nextInRange = function(range, current){
	var r = Math.random(), v;
	return current + (range / 10 * r) - (range / 20);
	if (r < 0.5)
		v = Math.abs((current + ((range / 5) * (Math.pow(r * 2, 2) + 0.1))) % (range * 2));
	else
		v = Math.abs((current - ((range / 5) * (Math.pow((r - 0.5) * 2, 2) + 0.1))) % (range * 2));
	if (v > range) v = range - (v - range);
	//if (range == 1 && (iii++) % 10 == 0) console.log(v);
	return v;
};

Mutator.prototype = {

	mutate: function(){
		
	}

};