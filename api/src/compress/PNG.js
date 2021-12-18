const { spawn } = require('child_process');
const sendError = require('../methods/sendError');

// Compresses PNG image with PNGQuant and OptiPNG
const PNG = (compVal) => {
	try {
		if (
			compVal.isLossy === 'false' &&
			compVal.stripMeta === 'false'
		) {
			const compImg = spawn('optipng', [
				'-force',
				'-o2', compVal.inImgPath,
				'-out', compVal.outImgPath
			]);
			return new Promise(resolve => {
				compImg.stdout.on('end', () => { resolve(); });
			});
		} else if (
			compVal.isLossy === 'false' &&
			compVal.stripMeta === 'true'
		) {
			const compImg = spawn('optipng', [
				'-force',
				'-o2', compVal.inImgPath,
				'-strip all',
				'-out',
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
			const compImg = spawn('pngquant', [
				'--speed=1',
				'--quality=1-85',
				compVal.inImgPath,
				'--out',
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
			const compImg = spawn('pngquant', [
				'--speed=1',
				'--quality=1-' + compVal.imgQuality,
				compVal.inImgPath, '--out',
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
			const compImg = spawn('pngquant', [
				'--speed=1',
				'--strip',
				'--quality=1-85',
				compVal.inImgPath,
				'--out',
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
			const compImg = spawn('pngquant', [
				'--speed=1',
				'--strip',
				'--quality=1-' + compVal.imgQuality,
				compVal.inImgPath, '--out',
				compVal.outImgPath
			]);
			return new Promise(resolve => {
				compImg.stdout.on('end', () => { resolve(); });
			});
		}
	}
	catch (err) {
		return sendError(compVal.res, 500, 'Code12, Compressing PNG Failed!');
	}
};

module.exports = PNG;