const methods = require('../methods');

const fourofour = (req, res) => {
	return methods.sendError(res, 404, 'Code15, Page Not Found!');
};

module.exports = fourofour;