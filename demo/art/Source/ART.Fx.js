(function(){

// Interpolator factories

var path = function(from, to){
		
	},
	
	color = function(from, to){
		
	},
	
	number = function(from, to){
		
	},
	
	fixed = function(from, to){
		
	};

// Timer

var interval = Math.round(1000 / 60), instances = [], timer;

var loop = function(){
	var time = +new Date();
	for (var i = 0; i < instances.length; i++) instances[i].step(time);
};

var addInstance = function(instance){
	instances.push(instance);
	if (!timer) timer = setInterval(loop, interval);
};

var removeInstance = function(instance){
	instances.erase(instance);
	if (!instances.length && timer) timer = clearInterval(timer);
};

// Fx

var Fx = {

	tween: function(duration){
		var base = this._base || this;
		Keyframe.prototype = base;
		var frame = new Keyframe(base, duration);
		Keyframe.prototype = null; // Cleanup memory
		return this.tweenTo(frame);
	},
	
	tweenTo: function(keyframe){
		this.next = keyframe;
		return keyframe;
	},
	
	stop: function(){
		return this.tweenTo(this);
	},
	
	start: function(){
		this.startTime = +new Date();
	},
	
	step: function(time){
		
	}

};

var Keyframe = function(base, duration){
	this._base = base;
	this.duration = duration;
};

var Group = ART.Group, Shape = ART.Shape, Text = ART.Text;

ART.Group = new Class({

	Extends: ART.Group,
	
	Implements: Fx

});

ART.Shape = new Class({

	Extends: ART.Shape,
	
	Implements: Fx,
	
	draw: function(path){
		if (!this._base) return this.parent.apply(this, arguments);
	}

});

ART.Text = new Class({

	Extends: ART.Text,
	
	Implements: Fx,
	
	draw: function(text, font, align, path){
		if (!this._base) return this.parent.apply(this, arguments);
	}

});








})();