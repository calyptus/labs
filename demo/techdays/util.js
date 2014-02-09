var on = window.addEventListener ? function(type, fn){ document.body.addEventListener(type, fn, false); } : function(type, fn){ document.body.attachEvent('on' + type, fn); };

String.prototype.camelCase = function(){
	return this.replace(/-\D/g, function(match){
		return match.charAt(1).toUpperCase();
	});
};

var xhr = (function(){

	var XMLHTTP = function(){
		return new XMLHttpRequest();
	};

	var MSXML2 = function(){
		return new ActiveXObject('MSXML2.XMLHTTP');
	};

	var MSXML = function(){
		return new ActiveXObject('Microsoft.XMLHTTP');
	};
	
	try { XMLHTTP(); return XMLHTTP; }
	catch (x){
		try { MSXML2(); return MSXML2; }
		catch (x){
			try { MSXML(); return MSXML; }
			catch (x){
				return null;
			}
		}
	}

})();
