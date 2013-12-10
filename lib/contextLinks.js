var xml2js = require('xml2js');
var http = require('http');

var contextLinks = function(options){
	this.options = options;
	return this;
}

/*
 * Description:
 *
 * The Auto-Complete suggestions are words taken from the indices associated with the given project. Provided words 
 * start with the characters given in the query parameter. Using the prefix parameter the word part-of-speech type of 
 * the returned words can be select, e.g. the prefix B_NOUN_ will only filter nouns.
 *
 * Parameter:
 *
 * - query			the characters all words have to start with
 * - prefix			comma separated list of prefixes of the part-of-speech type of the words to be returned, 
 *					e.g. B_NOUN_, B_VERB_,B_ADJECTIVE,_B_UNKNOWN_,T_
 * - fields			comma separated list of fields to look for words
 * - sort			sort criteria in the form <asc / desc> followed by <score / name>, e.g. desc name. The score is 
 * 					equivalent to the number of occurrences
 * - length			the number of suggestions that should be returned
 * - useStopWords	if the stop words list should be considered
 * - minOccurrences	minimal value of occurrences in the project indices
*/
contextLinks.prototype.suggestions = function(data, callback) {
	var parameter = {
		query : data.query,
		projectId : data.projectId,
		command : 'suggestions'
	}
	
	function doCallback(err, data) {
		if (err) {
			return callback(err);
		}
		else if(typeof data.suggestions === 'undefined') {
			return callback('unexpected Error', data);
		}
		data = data.suggestions;
		data.suggestion = 
			(typeof data.suggestion === 'undefined')
			? []
			: !(data.suggestion instanceof Array)
			? [data.suggestion]
			: data.suggestion;
			
		callback(err, data);
	}
	
	if (typeof data.prefix !== "undefined") {
		parameter.prefix = data.prefix;
	}
	if (typeof data.fields !== "undefined") {
		parameter.fields = data.fields;
	}
	if (typeof data.sort !== "undefined") {
		parameter.sort = data.sort;
	}
	if (typeof data.length !== "undefined") {
		parameter.length = data.length;
	}
	if (typeof data.useStopWords !== "undefined") {
		parameter.useStopWords = data.useStopWords;
	}
	if (typeof data.minOccurrences !== "undefined") {
		parameter.minOccurrences = data.minOccurrences;
	}
	
	this._request({parameter : parameter}, doCallback);
}

contextLinks.prototype.searchDocs = function(data, callback) {
	callback('toDo');
}

contextLinks.prototype._buildPath = function(data) {
	var parameter = [];
	var path = this.options.path.split('/');
	if (path[0] !== "") {
		path = [""].concat(path);
	}
	for (var i in data) {
		parameter.push(i + "=" + data[i]);
	}
	return path.join("/") + "?" + parameter.join("&");
}

contextLinks.prototype._request = function(data, callback){	
	
	var options = {
		host : this.options.host,
		port : this.options.port,
		path : this._buildPath(data.parameter),
		auth : this.options.auth.user + ":" + this.options.auth.password
	}, 	error,
		xmlChunk = [];

	function requestCallback(response){
		response.setEncoding('utf8');
		if (response.statusCode !== 200){
			error = {statusCode : response.statusCode};
		}		
		response
		.on('data',responseEventData)
		.on('end',responseEventEnd);
	}
	
	function responseEventData (chunk) {
		xmlChunk.push(chunk);
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

	
	http
	.request(options,requestCallback)
	.end();
};

module.exports = contextLinks;
