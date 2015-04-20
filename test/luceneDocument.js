var LuceneDocument = require('../lib/luceneDocument');

describe("lucene Document", function() {
	var luceneDocument, xmlArray = [];
	var data = {
		id : 23248642836,
		language : 'de',
		title : 'Lorem ipsum',
		body : 'Lorem ipsum dolor sit amet...',
		docid : 23248642836
	};
	var options = {
		index : {
			body : "tokenized",
			title : "tokenized"
		},
		termVector : {
			body : 'withPositionsOffsets',
			title : 'withPositionsOffsets'
		}
	};
	
	it("should correct init", function() {
		(new LuceneDocument()).options.should.be.an.Object.with.properties('index', 'store', 'termVector');
		luceneDocument = new LuceneDocument(options);
		xmlArray = luceneDocument.getDocument(data);
		xmlArray.should.be.an.Array;
	});
	
	it('should check all values in xml', function(){
		// header + lucenceDocument + (#dataProperties * 3)
		xmlArray.should.be.an.Array.with.lengthOf(2 + 2 + (5 * 3)); 
	});
	
});