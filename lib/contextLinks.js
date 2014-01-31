var xml2js = require('xml2js');
var http = require('http');
var constraint = require("./constraint.js");

var contextLinks = function(options){
	this.options = options;
	this.DEFAULT = {
		query : '*'
	};
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
		projectId : data.projectId || this.DEFAULT.projectId,
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
	if (typeof data.length === "number") {
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
	
	// encodeURI ist hier doof, besser mit utf-8 im header oder so, könnte aber einfluss auf contraint haben, bei dem es auch so gemacht wird!
	var parameter = {
		query 		: 
			(typeof data.query !== 'undefined' && data.query !== '') 
			? encodeURI(data.query)
			: this.DEFAULT.query,
		projectId 	: data.projectId || this.DEFAULT.projectId,
		command 	: 'searchDocs'
	}, 	tmpValue;
	
	function buildFacets(facet) {
		var returnValue = {},
			tmpValue = {};
		
		// Set to "true" this parameter indicates that all values of the specified facet fields should be considered
		// when counting the facets. Set to "false" only the first value is considered.
		if (typeof facet.multiValue === 'boolean') {
			tmpValue.multiValue = facet.multiValue;
		}
		// Limits the terms on which to facet to those starting with the given string prefix.
		if (typeof facet.prefix !== 'undefined') {
			tmpValue.prefix = facet.prefix;
		}
		// This parameter determines the ordering of the facet field constraints.
		// The default is count if facet.limit is greater than 0, index otherwise.
		if (typeof facet.sort !== 'undefined') {
			tmpValue.sort = facet.sort;
		} 
		// This parameter indicates the maximum number of constraint counts that should be returned for the facet fields. 
		// A negative value means unlimited.
		// The default value is 100.
		if (typeof facet.limit === 'number') {
			tmpValue.limit = facet.limit;
		}
		// This parameter indicates an offset into the list of constraints to allow paging
		// The default value is 0.
		if (typeof facet.offset === 'number') {
			tmpValue.offset = facet.offset;
		}
		// This parameter indicates the minimum counts for facet fields should be included in the response.
		// The default value is 0.
		if (typeof facet.mincount === 'number') {
			tmpValue.mincount = facet.mincount;
		}
		// Set to "true" this parameter indicates that constraint counts for facet fields should be included
		// even if the count is "0", set to "false" or blank and the "0" counts will be suppressed to save on the amount of 
		// data returned in the response.
		// The default value is "true".
		if (typeof facet.zeros === 'boolean') {
			tmpValue.zeros = facet.zeros;
		}
		
		// Set to "true" this param indicates that in addition to the Term based constraints of a facet field, a count of all 
		// matching results which have no value for the field should be computed
		// The default value is false.
		if (typeof facet.missing === 'boolean') {
			tmpValue.missing = facet.missing;
		}
		if (typeof facet.zeros === 'boolean') {
			tmpValue.zeros = facet.zeros;
		}
		
		for (var i in tmpValue) {
			returnValue['facet.' + i] = tmpValue[i];
		}
		return returnValue;
		
	}
	
	function extendObject(target, source){
		for (var i in source) {
			target[i] = source[i];
		}
		return target;
	}
	
	function doCallback(err, response) {
		if (err) {
			return callback(err);
		}
		else if(typeof response.searchDocuments === 'undefined') {
			return callback('unexpected Error', response);
		}
		response = response.searchDocuments;
		response.document = 
			(typeof response.document === 'undefined')
			? []
			: (response.document instanceof Array)
			? response.document
			: [response.document];
		if (typeof data.facet !== 'undefined') {
			response.facets =  response.facets || {};
			response.facets.fields = 
				(typeof response.facets.fields === 'undefined') 
				? [] 
				: (response.facets.fields.field instanceof Array) 
				? response.facets.fields.field 
				: [response.facets.fields.field];
			response.facets.fields.forEach(function(facet,i){
				if (typeof facet.facet !== 'object') return;
				facet.facet = (facet.facet instanceof Array) ? facet.facet : [facet.facet];
			});
		}		
		callback(err, response);
	}
	
	if (typeof data.length === 'number') {
		parameter.length = data.length;
	} else if(typeof this.DEFAULT.length === 'number') {
		parameter.length = this.DEFAULT.length;
	}
	
	if (typeof data.start === 'number') {
		parameter.start = data.start;
	}
	if (typeof data.facet === 'object') {
		if (typeof data.facet.field !== 'undefined' && data.facet.field instanceof Array) {
			parameter['facet.field'] = data.facet.field;
		}
		extendObject(parameter, buildFacets(data.facet));
		parameter.facet = 'true';
	}
	if (typeof data.f === 'object') {
		for (var facetNames in data.f) {
			if (typeof data.f[facetNames].facet !== 'object') {
				continue;
			}
			tmpValue = buildFacets(data.f[facetNames].facet);
			for (var i in tmpValue){
				parameter['f.' + facetNames + "." + i] = tmpValue[i];
			}
		}
		parameter.facet = 'true';
	}
	if (typeof data.summary === 'object') {
		parameter.summary = true;
		// The maximal wanted length of the summary text.
		if (typeof data.summary.length === 'number') {
			parameter["summary.length"] = data.summary.length;
		}
		// The flag signals, that the hit highlight should be calculated, i.e. found terms or word parts like composite
		// are highlighted in the text with html tags. The value of the parameter may be true/false with default false.
		if (typeof data.summary.highlighting === 'string') {
			parameter["summary.highlighting"] = data.summary.highlighting;
		}
		// his parameter contains the start html tag for the highlighting. The default is <b>.
		if (typeof data.summary.summaryTagHighlightingStart === 'string') {
			parameter["summary.summaryTagHighlightingStart"] = data.summary.summaryTagHighlightingStart;
		}
		// his parameter contains the start html tag for the highlighting. The default is <b>.
		if (typeof data.summary.summaryTagHighlightingEnd === 'string') {
			parameter["summary.summaryTagHighlightingEnd"] = data.summary.summaryTagHighlightingEnd;
		}
		// This parameter defines the list of fields to generate summaries for. The default is title and body.
		// Because the summary calculation relies on the information of the position and offsets of every word in the 
		// full text, it makes sense to store the full text also in the body field which is already tokenized with 
		// positions and offsets.
		if (data.summary.fields) {
			// todo: check
			// parameter["summary.fields"] = data.summary.fields;
		}
		// The flag signals, if all full forms should extracted from the original text. The default is value is false.
		if (data.summary.fullforms) {
			// If the full forms are extracted from the text, this comma separated list of prefixes allows to define with kind 
			// of terms are extracted as full forms, e.g. summary.fullforms.prefix=B_NOUN_ only extracts full forms for nouns.
			if (data.summary.fullforms.prefix) {
				// todo
			}
			//todo
		}
		// If set to true, the summary calculation will consider sentence ends. Note: This will only apply to documents, 
		// that are indexed using the sentence end detection of L4 Linguistics .
		if (data.summary.fullSentences) {
			// todo
		}
	}
	else if (typeof data.summary === 'boolean') {
		parameter.summary = data.summary;
	}
	
	// The flag signals, that the calculated summary should be stored in a cache. 
	// The value may be true/false with default true.
	if (typeof data.summaryUseCache === 'boolean') {
		parameter.summaryUseCache = data.summaryUseCache
	}
	if (typeof data.tagCloud === 'boolean') {
		parameter.tagCloud = data.tagCloud;
	}
	if (typeof data.constraint === 'object') {
		var c = new constraint();
		parameter.constraint = c.parse(data.constraint);
	}
	if (typeof data.fieldList !== 'undefined'){
		parameter.fieldList = 
			(data.fieldList instanceof Array)
			? data.fieldList.join(',')
			: data.fieldList;
	}

	this._request({parameter : parameter}, doCallback);
}

contextLinks.prototype._buildPath = function(data) {
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

contextLinks.prototype._request = function(data, callback){	
	
	var options = {
		host : this.options.host,
		port : this.options.port,
		path : this._buildPath(data.parameter),
		auth : this.options.auth.user + ":" + this.options.auth.password
	}, 	error,
		xmlChunk = [];
	console.log(options.path);
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
