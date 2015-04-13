var cl = require('./helper').getContextLinksInstance();
	
describe("contextLinks - project and index management", function() {		
	var indexId = 'testIndex_' + Date.now(),
		projectId = 'testProject_' + Date.now();
	
	it("should return all indexes", function(done){
		cl.getListOfIndices(function(err, data){
			(err == null).should.be.true;
			data.number.should.be.a.Number;
			data.index.should.be.an.Array.with.lengthOf(data.number);
			data.index.forEach(function(index){
				index.indexId.should.be.a.String;
				index.name.should.be.a.String;
			});
			done();
		})
		
	})
	
	it("should create the index " + indexId, function(done) {
		this.timeout(30000);
		var parameter = {
			indexId : indexId, 
			name : indexId
		}
		cl.createIndex(parameter, function(err, data){
			(err == null).should.be.true;
			data.should.be.an.Object;
			data.command.should.equal('createIndex');
			data.indexId.should.equal(indexId);
			data.indexName.should.equal(indexId);
			data.isVisible.should.be.a.Boolean.and.be.false;
			data.status.should.equal('created');
			done();
		});
	});
		
	it("should exists", function(done) {
		var parameter = {
			indexId : indexId
		}
		cl.getIndexStatus(parameter, function(err, data){
			(err == null).should.be.true;
			data.should.be.an.Object;
			data.command.should.equal('getIndexStatus');
			data.indexName.should.equal(indexId);
			data.indexId.should.equal(indexId);
			data.isVisible.should.be.false;
			data.numDocs.should.be.a.Number.and.equal(0);
			done();
		})
	});
	
	it('should create a project ' + projectId, function(done){
		var parameter = {
			projectId : projectId,
			name : projectId
		};
		cl.createProject(parameter, function(err, data){
			(err === null).should.be.true;
			data.should.be.an.Object;
			data.projectId.should.equal(projectId);
			data.projectName.should.equal(projectId);
			data.status.should.equal('created');
			data.isVisible.should.be.false;
			done();
		});
	});
	
	it('should be in the list', function(done){
		cl.getListOfProjects(function(err, data){
			(err === null).should.be.true;
			data.should.be.an.Object;
			data.command.should.equal('getListOfProjects');
			data.number.should.be.a.Number;
			data.project.should.be.an.Array.with.lengthOf(data.number);
			
			var foundProject = false;
			
			data.project.forEach(function(project){
				project.projectName.should.be.a.String;
				project.name.should.be.a.String;
				project.projectId.should.be.a.String;

				foundProject  = foundProject || project.projectId === projectId;
			});
			foundProject.should.be.true;
			done();
		});
	});
		
	it('should add a index ' + indexId + ' in project ' + projectId, function(done){
		var parameter = {
			projectId : projectId,
			indexId : indexId
		};
		cl.addIndexToProject(parameter, function(err, data){
			(err === null).should.be.true;
			data.should.be.an.Object;
			data.command.should.equal('addIndexToProject');
			data.projectId.should.equal(projectId);
			data.indexId.should.equal(indexId);
			done();
		});
	});
	
	it('should be the index in the project', function(done){
		cl.getProjectStatus({projectId : projectId}, function(err, data){
			(err === null).should.be.true;
			data.should.be.an.Object;
			data.command.should.equal('getProjectStatus');
			data.projectId.should.equal(projectId);
			data.projectName.should.equal(projectId);
			data.isVisible.should.be.a.Boolean.and.be.false;
			data.searchParameter.should.be.an.Object;
			data.tagCloudParameter.should.be.an.Object;
			data.indices.should.be.an.Object;
			data.indices.number.should.be.a.Number;
			data.indices.index.should.be.an.Array.with.lengthOf(data.indices.number);
			var foundedIndex = false;
			data.indices.index.forEach(function(index){
				index.should.be.an.Object;
				index.name.should.be.a.String;
				index.indexId.should.be.a.String;
				// moresophy bug
				// index.numDocs.should.be.a.Number;
				foundedIndex  = foundedIndex || index.indexId === indexId;
			});
			foundedIndex.should.be.true;
			done();
		});
	});
	
	it('should remove index of project', function(done){
		var parameter = {
			indexId : indexId,
			projectId : projectId
		}
		cl.removeIndexFromProject(parameter, function(err, data){
			(err == null).should.be.tru;
			data.should.be.an.Object;
			data.command.should.equal('removeIndexFromProject');
			data.indexId.should.equal(indexId);
			data.projectId.should.equal(projectId);
			data.status.should.equal('removed');
			done();
		})
	});
	
	it('should remove the project', function(done) {
		var parameter = {
			projectId : projectId
		};
		cl.deleteProject(parameter, function(err, data){
			(err === null).should.be.true;
			data.should.be.an.Object;
			data.command.should.equal('deleteProject');
			data.projectId.should.equal(projectId);
			data.status.should.equal('deleted');
			done();
		});
	});
	
	it("should delete an index " + indexId, function(done) {
		this.timeout(30000);
		var parameter = {
			indexId : indexId
		};
		cl.deleteIndex(parameter, function(err, data){
			(err === null).should.be.true;
			data.should.be.an.Object;
			data.command.should.equal('deleteIndex');
			data.indexId.should.equal(indexId);
			data.status.should.equal('deleted');
			done();
		})
	});
});