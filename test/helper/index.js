var ContextLinks = require('../../.').contextLinks;
var options = {
	path : "/l4_cl/contextLinks",
	host : process.env.host,
	port : parseInt(process.env.port,10),
	auth : process.env.auth
};
if (typeof process.env.auth === 'string') {
	var auth = process.env.auth.split(':');
	options.auth = {
		user : auth[0],
		password : auth[1]
	}
}

module.exports.getContextLinksInstance = function() {
	var cl = new ContextLinks(options);
	cl.DEFAULT.projectId = process.env.project;
	return cl;
}