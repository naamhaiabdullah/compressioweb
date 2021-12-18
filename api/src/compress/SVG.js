const { spawn } = require('child_process');
const sendError = require('../methods/sendError');

// Compresses SVG image with Scour
const SVG = (compVal) => {
	try {
		if (
			compVal.isLossy === 'false' &&
			compVal.stripMeta === 'false'
		) {
			const compImg = spawn('scour', [
				'-i',
				compVal.inImgPath,
				'--no-line-breaks',
				'--enable-viewboxing',
				'--set-precision=10',
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
			const compImg = spawn('scour', [
				'-i',
				compVal.inImgPath,
				'--remove-descriptive-elements',
				'--enable-comment-stripping',
				'--no-line-breaks',
				'--enable-viewboxing',
				'--set-precision=10',
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
			const compImg = spawn('scour', [
				'-i',
				compVal.inImgPath,
				'--no-line-breaks',
				'--enable-viewboxing',
				'--set-precision=5',
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
			const compImg = spawn('scour', [
				'-i',
				compVal.inImgPath,
				'--no-line-breaks',
				'--enable-viewboxing',
				'--set-precision=' + Math.round(compVal.imgQuality / 10),
				'-o', compVal.outImgPath
			]);
			return new Promise(resolve => {
				compImg.stdout.on('end', () => { resolve(); });
			});
		} else if (
			compVal.isLossy === 'true' &&
			compVal.stripMeta === 'true' &&
			compVal.imgQuality === 'default'
		) {
			const compImg = spawn('scour', [
				'-i',
				compVal.inImgPath,
				'--remove-descriptive-elements',
				'--enable-comment-stripping',
				'--no-line-breaks',
				'--enable-viewboxing',
				'--set-precision=5',
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
			const compImg = spawn('scour', [
				'-i',
				compVal.inImgPath,
				'--remove-descriptive-elements',
				'--enable-comment-stripping',
				'--no-line-breaks',
				'--enable-viewboxing',
				'--set-precision=' + Math.round(compVal.imgQuality / 10),
				'-o',
				compVal.outImgPath
			]);
			return new Promise(resolve => {
				compImg.stdout.on('end', () => { resolve(); });
			});
		}
	}
	catch (err) {
		return sendError(compVal.res, 500, 'Code14, , Compressing SVG Failed!');
	}
};

module.exports = SVG;