const { spawn } = require('child_process');
const sendError = require('../methods/sendError');

// Compresses JPEG image with JPEGOptim
const JPG = (compVal) => {
	try {
		if (
			compVal.isLossy === 'false'
			&& compVal.stripMeta === 'false'
		) {
			const compImg = spawn('jpegoptim', [
				'--force',
				compVal.inImgPath,
				'--dest=' + compVal.outChildFolder
			]);
			return new Promise(resolve => {
				compImg.stdout.on('end', () => { resolve(); });
			});
		} else if (
			compVal.isLossy === 'false' &&
			compVal.stripMeta === 'true'
		) {
			const compImg = spawn('jpegoptim', [
				'--force',
				'--strip-all',
				compVal.inImgPath,
				'--dest=' + compVal.outChildFolder
			]);
			return new Promise(resolve => {
				compImg.stdout.on('end', () => { resolve(); });
			});
		} else if (
			compVal.isLossy === 'true' &&
			compVal.stripMeta === 'false' &&
			compVal.imgQuality === 'default'
		) {
			const compImg = spawn('jpegoptim', [
				'--force',
				'--max=85',
				compVal.inImgPath,
				'--dest=' + compVal.outChildFolder
			]);
			return new Promise(resolve => {
				compImg.stdout.on('end', () => { resolve(); });
			});
		} else if (
			compVal.isLossy === 'true' &&
			compVal.stripMeta === 'false' &&
			compVal.imgQuality !== 'default'
		) {
			const compImg = spawn('jpegoptim', [
				'--force',
				'--max=' + compVal.imgQuality,
				compVal.inImgPath,
				'--dest=' + compVal.outChildFolder
			]);
			return new Promise(resolve => {
				compImg.stdout.on('end', () => { resolve(); });
			});
		} else if (
			compVal.isLossy === 'true' &&
			compVal.stripMeta === 'true' &&
			compVal.imgQuality === 'default'
		) {
			const compImg = spawn('jpegoptim', [
				'--force',
				'--max=85',
				'--strip-all',
				compVal.inImgPath,
				'--dest=' + compVal.outChildFolder
			]);
			return new Promise(resolve => {
				compImg.stdout.on('end', () => { resolve(); });
			});
		} else if (
			compVal.isLossy === 'true' &&
			compVal.stripMeta === 'true' &&
			compVal.imgQuality !== 'default'
		) {
			const compImg = spawn('jpegoptim', [
				'--force',
				'--max=' + compVal.imgQuality,
				'--strip-all',
				compVal.inImgPath,
				'--dest=' + compVal.outChildFolder
			]);
			return new Promise(resolve => {
				compImg.stdout.on('end', () => { resolve(); });
			});
		}
	}
	catch (err) {
		return sendError(compVal.res, 500, 'Code11, Compressing JPG Failed!');
	}
};

module.exports = JPG;