var http = require('http');
var xml2js = require('xml2js');

var networker = function(options){
	this.options = options;
	if (typeof this.options.port !== 'number') {
		this.options.port = this.options.host.search(/^https.*/) === 0 ? 443 : 80;
	}
	
	this.DEFAULT = {};
}

networker.prototype.setDefaultValues = function(data) {
	if (typeof data !== 'object') return false;
	
	if (typeof data.projectId !== 'undefined') {
		this.DEFAULT.projectId = data.projectId;
	}
	if (typeof data.modelId !== 'undefined') {
		this.DEFAULT.modelId = data.modelId;
	}
}

networker.prototype.check = function(data, callback) {
	var parameter = {
		command : 'check'
	};
	this._request({parameter : parameter}, function(err, data){
		if (err) return callback(err);
		callback(null, data.check)
	});
}

/*
 * Description:
 *
 * ???
 * http://<server>:<port>/networker/restservices?command=getAllDomains&projectId=<projectId>&modelId=<modelId>
 *
 * Parameter:
 *
 * - projectId
 * - modelId
 * - start - {optional}
 * - length - {optional}
*/
networker.prototype.getAllDomains = function(data, callback){
	// functional Parameter
	var data = arguments.length > 1 ? arguments[0] : {},
		callback = arguments[arguments.length - 1];
	
	// required Parameter
	var parameter = {
		command : 'getAllDomains',
		projectId : data.projectId || this.DEFAULT.projectId,
		modelId : data.modelId || this.DEFAULT.modelId
	};
	
	// optional Parameter
	if (typeof data.start === 'number') parameter.start = data.start;
	if (typeof data.length === 'number') parameter.length = data.length;
	
	this._request({parameter : parameter}, function(err, data){
		var error = err ? err
			: typeof data.getAllDomains !== 'object' ? new Error('unexpected Error')
			: null;

		if (error) return callack(error);

		data = data.getAllDomains;

		data.domain = typeof data.domain !== 'object' ? []
			: !Array.isArray(data.domain) ? [data.domain]
			: data.domain;
		data.size = parseInt(data.size, 10);
		data.length = parseInt(data.length, 10);
		data.start = parseInt(data.start, 10);

		callback(err, data);
	});
}

networker.prototype.getAllTopics = function(data, callback){
	var parameter, 
		data = data,
		callback = callback;
	
	if (arguments.length === 1) {
		callback = (typeof data === 'function') ? data : function(){}; 
		data = (typeof data === 'object') ? data : {};
	}
	var parameter = {
		command : 'getAllTopics',
		projectId : data.projectId || this.DEFAULT.projectId,
		modelId : data.modelId || this.DEFAULT.modelId
	};
	if (typeof data.start !== 'undefined') {
		parameter.start = data.start;
	}
	if (typeof data.length !== 'undefined') {
		parameter.length = data.length;
	}
	if (typeof data.timeout !== 'undefined') {
		parameter.timeout = data.timeout;
	}
	
	this._request({parameter : parameter}, function(err, data){
		if (err) {
			return callback(err);
		}
		else if(typeof data.getAllTopics === 'undefined') {
			return callback('unexpected Error', data);
		}
		data = data.getAllTopics;
		data.topic = 
			(typeof data.topic === 'undefined')
			? []
			: !(data.topic instanceof Array)
			? [data.topic]
			: data.topic;
		callback(err, data);
	});
}

/*
 * Description:
 *
 * http://<server>:<port>/networker/restservices?command=getDomain&projectId=<projectId>&modelId=<modelId>&domainId=<domainId>
 *
 * Parameter:
 *
 * - projectId
 * - modelId
 * - domainId
 *
*/
networker.prototype.getDomain = function(data, callback){
	var parameter = {
		command : 'getDomain',
		projectId : data.projectId || this.DEFAULT.projectId,
		modelId : data.modelId || this.DEFAULT.modelId,
		domainId : data.domainId
	};
	this._request({parameter : parameter}, function(err, data){
		if (err) {
			return callback(err);
		}
		else if(typeof data.getDomain === 'undefined') {
			return callback('unexpected Error', data);
		}
		data = data.getDomain;
		data.topics = 
			(typeof data.topics !== 'object')
			? []
			: (data.topics.topic instanceof Array)
			? data.topics.topic
			: (typeof data.topics.topic === 'object')
			? [data.topics.topic]
			: [];
		data.topic = data.topics;
		delete data.topics;
		data.domains = 
			(typeof data.domains !== 'object')
			? []
			: (data.domains.domain instanceof Array)
			? data.domains.domain
			: (typeof data.domains.domain === 'object')
			? [data.domains.domain]
			: [];
		data.domain = data.domains;
		delete data.domains;
		data.diagrams = 
			(typeof data.diagrams !== 'object')
			? []
			: (data.diagrams.diagram instanceof Array)
			? data.diagrams.diagram
			: (typeof data.diagrams.diagram === 'object')
			? [data.diagrams.diagram]
			: [];
		data.diagram = data.diagrams;
		delete data.diagrams;
		
		callback(err, data);
	});
}

// http://<server>:<port>/networker/restservices?command=getFullCategoryMenu&projectId=<projectId>&modelId=<modelId>&depth=<1..6>&timeout=<timeout>
networker.prototype.getFullCategoryMenu = function(data, callback){
	var parameter = {
		command : 'getFullCategoryMenu',
		projectId : data.projectId || this.DEFAULT.projectId,
		modelId : data.modelId || this.DEFAULT.modelId
	};
	if (typeof data.depth === 'number' && [1,2,3,4,5,6].indexOf(data.depth) > -1) {
		parameter.depth = data.depth;
	}
	if (typeof data.timeout !== 'undefined') {
		parameter.timeout = data.timeout;
	}
	this._request({parameter : parameter}, function(err, data){
		if (err) {
			return callback(err);
		}
		else if(typeof data.getFullCategoryMenu === 'undefined') {
			return callback('unexpected Error', data);
		}
		
		data = data.getFullCategoryMenu;
		data.topic = 
			(typeof data.topics !== 'object')
			? []
			: (data.topics.topic instanceof Array)
			? data.topics.topic
			: (typeof data.topics.topic === 'object')
			? [data.topics.topic]
			: [];
		delete data.topics;
		callback(err, data);
	});
}

/*
 * Description:
 *
 * Returns all information about the defined topic
 *
 * Parameter:
 *
 * - projectId
 * - modelId
 * - topicId
 * - timeout - {optional}
*/
networker.prototype.getTopic = function(data, callback){
	var parameter = {
		command : 'getTopic',
		projectId : data.projectId || this.DEFAULT.projectId,
		modelId : data.modelId || this.DEFAULT.modelId,
		topicId : data.topicId
	};
	if (typeof data.timeout !== 'undefined') {
		parameter.timeout = data.timeout;
	}
	this._request({parameter : parameter}, function(err, data){
		if (err) {
			return callback(err);
		}
		else if(typeof data.getTopic === 'undefined') {
			return callback('unexpected Error', data);
		}
		data = data.getTopic;
		data.topic = 
			(typeof data.topic !== 'object')
			? []
			: (data.topic instanceof Array)
			? data.topic
			: (typeof data.topic === 'object')
			? [data.topic]
			: [];
		callback(err, data);
	});
}

// http://<server>:<port>/networker/restservices?command=getAllDomains&projectId=<projectId>&modelId=<modelId>

networker.prototype._buildPath = function(data) {
	var parameter = [];
	var path = this.options.path.split('/');
	if (path[0] !== "") {
		path = [""].concat(path);
	}
	for (var attr in data) {
		if (data[attr] instanceof Array) {
			for (var i in data[attr]) {
				parameter.push(attr + "=" + data[attr][i]);
			}
		}
		else {
			parameter.push(attr + "=" + data[attr]);
		}
	}
	return path.join("/") + "?" + parameter.join("&");
}

networker.prototype._request = function(data, callback){	
	
	var options = {
		host : this.options.host,
		port : this.options.port,
		path : this._buildPath(data.parameter),
	}, 	error,
		xmlChunk = [];
	
	function getError(e) {
		if (error) return;
		error = e;
		callback(error);
	}
	
	function requestCallback(response){
		response.setEncoding('utf8');
		if (response.statusCode !== 200){
			error = {statusCode : response.statusCode};
		}		
		response
		.on('data', xmlChunk.push.bind(xmlChunk))
		.on('error', getError)
		.on('end',responseEventEnd);
	}
	
	function responseEventEnd () {
		if (error) {
			error.data = xmlChunk.join('');
			return callback(error)
		}
		new xml2js
		.Parser({explicitArray : false})
		.addListener('end', xml2jsEventEnd)
		.parseString(xmlChunk.join(''));
	}

	function xml2jsEventEnd (json) {
		callback(null, json);
	}

	if (typeof this.options.auth === 'object') {
		options.auth = this.options.auth.user + ":" + this.options.auth.password
	}
	
	http
	.request(options, requestCallback)
	.end();
};


module.exports = networker;