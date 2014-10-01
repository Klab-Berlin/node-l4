/*
	CONSTRAINT	-> (CONSTRAINT and CONSTRAINT);
	CONSTRAINT	-> (CONSTRAINT or CONSTRAINT);
	CONSTRAINT	-> ATTR=STRING
	CONSTRAINT	-> ATTR=NUMBER
	STRING		-> [A-Za-z]*
	NUMBER		-> [1-9]+			
*/

var constraint = function(){
	return this;
}

constraint.prototype.parse = function(data) {
	var returnValue = [];
	var attrArray = Object.keys(data);
	var joinParameter = 
		 (attrArray[0] === '$or') ? ' OR ' : 
		 (attrArray[0] === '$and') ? ' AND ': 
		 ' AND ';
	var data = 
		(attrArray[0] === '$or') ?	data.$or :
		(attrArray[0] === '$and') ? data.$and :
		data;

	for (var attr in data){
		if (this[typeof data[attr]] !== 'undefined'){
			returnValue.push(this[typeof data[attr]](attr, data[attr]));
		}
	}
	return "(" + returnValue.join(escape(joinParameter)) + ")";
};

constraint.prototype.$and = function(attr, data) {
	var returnValue = [];
	if (typeof data !== 'object') {
		return "";
	}
	
	for (var i in data) {
		returnValue.push(this[typeof data[i]](attr, data[i]));
	}
	
	return "(" + returnValue.join(escape(' AND ')) + ")";
};

constraint.prototype.$not = function(attr, data) {

	var self = this,
		returnValue = [],
		value = {};

	(Array.isArray(data) ? data : [data]).forEach(function(arrayValue) {
		value[attr] = arrayValue;
		returnValue.push(escape('NOT ') + self.parse(value));
	});

	return returnValue.join(escape(' AND '));
}

constraint.prototype.$or = function(attr, data) {
	var returnValue = [];
	if (typeof data !== 'object') {
		return "";
	}
	
	for (var i in data) {
		returnValue.push(this[typeof data[i]](attr, data[i]));
	}
	
	return "(" + returnValue.join(escape(' OR ')) + ")";
}

constraint.prototype.object = function(attr, arr){

	if (arr instanceof Array){
		return this.array(attr, arr);
	}
	
	if (attr === '$or') {
		return this.parse({$or : arr[i]});
	}
	if (attr === '$and') {
		return this.parse({$and : arr[i]});
	}
	
	var arrAttr = Object.keys(arr)[0];
	
	if (['$or', '$and', '$not'].indexOf(arrAttr) === -1) {
		return ""
	}
	
	return this[arrAttr](attr, arr[arrAttr]);
}

constraint.prototype.array = function(attr, data) {
	var returnValue = [];
	if (['$or', '$and'].indexOf(attr) > -1) {
		return "";
	}
	
	for (var i in data){
		if (this[typeof data[i]] !== 'undefined'){
			returnValue.push(this[typeof data[i]](attr, data[i]));
		}
	}
	
	
	return returnValue.join(escape(' AND '));
}

constraint.prototype.number = function(attr, number) {
	return attr + ":" + number;
}

constraint.prototype.string = function(attr, string) {	
	string = string
	.replace(/\+/g, '\\+')
	.replace(/\-/g, '\\-')
	.replace(/\&\&/g, '\\&\\&')
	.replace(/\|\|/g, '\\|\\|')
	.replace(/\!/g, '\\!')
	.replace(/\(/g, '\\(')
	.replace(/\)/g, '\\)')
	.replace(/\{/g, '\\{')
	.replace(/\}/g, '\\}')
	.replace(/\[/g, '\\[')
	.replace(/\]/g, '\\]')
	.replace(/\^/g, '\\^')
	.replace(/\"/g, '\\"')
	.replace(/\~/g, '\\~')
	.replace(/\*/g, '\\*')
	.replace(/\?/g, '\\?')
	.replace(/\:/g, '\\:')
	// .replace(/\\/g, '\\')
	;

	return attr + ':"' + encodeURI(string) + '"';
}

module.exports=constraint;