var helper = require('./helper');
var cl = helper.getContextLinksInstance();
	
before(function(){
});

describe("contextLinks - searchDocs", function() {	
	var documents;
	
	it("should get all results", function(done) {
		cl.searchDocs({}, function(err, data){
			(err == null).should.be.true;
			data.should.be.an.Object.and.have.properties('command', 'projectId', 'number', 'start', 'length', 'document');
			data.command.should.equal('searchDocs');
			data.number.should.be.a.Number.and.not.NaN;
			data.start.should.equal(0);
			data.length.should.be.a.Number;
			data.document.should.be.an.Array.with.lengthOf(data.length);
			documents = data.document;
			done();
		});
	});
	
	it('should have correct documents', function(){
		documents.forEach(function(doc){
			doc.should.be.an.Object.and.have.properties('docId', 'score', 'id');
		})
	})
});