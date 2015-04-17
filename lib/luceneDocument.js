var luceneDocument = function(options){
	var options = typeof arguments[0] === 'object' ? arguments[0] : {};
	
	this.options = {
		index : typeof options.index === 'object' ? options.index : {},
		store : typeof options.store === 'object' ? options.store : {},
		termVector : typeof options.termVector === 'object' ? options.termVector : {}	
	};
	this.defaultOptions = {
		index : 'untokenized',
		store : 'yes',
		termVector : 'no'
	}
	
	return this;
}

luceneDocument.prototype._getField = function(key, value){
	var field = [
		'<field',
		'name="' + key + '"',
		'store="' + this._getFieldOptions('store', key) + '"',
		'index="' + this._getFieldOptions('index', key) + '"',
		'termVector="' + this._getFieldOptions('termVector', key) + '">'
	].join(' ')
	
	return [field, '<![CDATA[' + value + ']]>', '</field>'];
}

luceneDocument.prototype._getFieldOptions = function(option, key) {
	return typeof this.options[option][key] === 'string' ? this.options[option][key] : this.defaultOptions[option];
}

luceneDocument.prototype.getDocument = function(data){
	var self = this;
	var xml = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<!DOCTYPE luceneDocument SYSTEM "luceneDocument.dtd">',
		'<luceneDocument>'
	];
	
	Object.keys(data).forEach(function(key) {
		xml = xml.concat(self._getField(key, data[key]));
	});
	
	xml.push('</luceneDocument>');
	
	
	return xml
}

module.exports = luceneDocument;

