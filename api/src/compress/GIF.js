const { spawn } = require('child_process');
const sendError = require('../methods/sendError');

// Compresses GIF image with GIFSicle
const GIF = (compVal) => {
	try {
		if (
			compVal.isLossy === 'false' &&
			compVal.stripMeta === 'false'
		) {
			const compImg = spawn('gifsicle', [
				'-O3',
				compVal.inImgPath,
				'-o',
				compVal.outImgPath
			]);
			return new Promise(resolve => {
				compImg.stdout.on('end', () => { resolve(); });
			});
		} else if (
			compVal.isLossy === 'false' &&
			compVal.stripMeta === 'true'
		) {
			const compImg = spawn('gifsicle', [
				'-O3',
				compVal.inImgPath,
				'-o',
				compVal.outImgPath
			]);
			return new Promise(resolve => {
				compImg.stdout.on('end', () => { resolve(); });
			});
		} else if (
			compVal.isLossy === 'true' &&
			compVal.stripMeta === 'false' &&
			compVal.imgQuality === 'default'
		) {
			const compImg = spawn('gifsicle', [
				'-O3',
				'--lossy=85',
				compVal.inImgPath,
				'-o',
				compVal.outImgPath
			]);
			return new Promise(resolve => {
				compImg.stdout.on('end', () => { resolve(); });
			});
		} else if (
			compVal.isLossy === 'true' &&
			compVal.stripMeta === 'false' &&
			compVal.imgQuality !== 'default'
		) {
			const compImg = spawn('gifsicle', [
				'-O3',
				'--lossy=' + compVal.imgQuality,
				compVal.inImgPath, '-o',
				compVal.outImgPath
			]);
			return new Promise(resolve => {
				compImg.stdout.on('end', () => { resolve(); });
			});
		} else if (
			compVal.isLossy === 'true' &&
			compVal.stripMeta === 'true' &&
			compVal.imgQuality === 'default'
		) {
			const compImg = spawn('gifsicle', [
				'-O3',
				'--lossy=85',
				compVal.inImgPath,
				'-o',
				compVal.outImgPath
			]);
			return new Promise(resolve => {
				compImg.stdout.on('end', () => { resolve(); });
			});
		} else if (
			compVal.isLossy === 'true' &&
			compVal.stripMeta === 'true' &&
			compVal.imgQuality !== 'default'
		) {
			const compImg = spawn('gifsicle', [
				'-O3',
				'--lossy=' + compVal.imgQuality,
				compVal.inImgPath,
				'-o',
				compVal.outImgPath
			]);
			return new Promise(resolve => {
				compImg.stdout.on('end', () => { resolve(); });
			});
		}
	}
	catch (err) {
		return sendError(compVal.res, 500, 'Code13, Compressing GIF Failed!');
	}
};

module.exports = GIF;