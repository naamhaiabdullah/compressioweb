const findRemoveSync = require('find-remove');

// Deleting images older than one hour from input and output folders
const findRemove = (inParentFolder, outParentFolder) => {
	setInterval(() => {
		findRemoveSync(inParentFolder, { age: { seconds: 3600 }, dir: '*' });
		findRemoveSync(outParentFolder, { age: { seconds: 3600 }, dir: '*' });
	}, 60000);
};

module.exports = findRemove;