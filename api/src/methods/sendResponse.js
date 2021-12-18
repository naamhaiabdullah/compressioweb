const fs = require('fs');
const sendError = require('./sendError');

// Send Response in JSON
const sendResponse = async (compValAll, compDetails, res) => {
	try {
		let allowedImgs = compDetails.allowedImgs;
		let uploadedImgs = compDetails.uploadedImgs;
		let allowedSize = compDetails.allowedSize;
		let uploadedSize = compDetails.uploadedSize;
		let responseData = compDetails.responseData;

		for (let i = 0; i < uploadedImgs; i++) {
			let inStats = await new Promise(resolve => {
				fs.stat(compValAll[i].inImgPath, (err, stats) => {
					if (err) {
						return sendError(res, 500, 'Code08, Something Went Wrong!');
					} else { resolve(stats); }
				});
			});
			let inSizeInKB = inStats.size / 1024;
			let sizeBefore = Math.round(inSizeInKB);

			let outStats = await new Promise(resolve => {
				fs.stat(compValAll[i].outImgPath, (err, stats) => {
					if (err) {
						return sendError(res, 500, 'Code09, Something Went Wrong!');
					} else { resolve(stats); }
				});
			});
			let outSizeInKB = outStats.size / 1024;
			let sizeAfter = Math.round(outSizeInKB);

			responseData[i] = {
				imageType: compValAll[i].imgExt,
				isLossy: compValAll[i].isLossy,
				stripMeta: compValAll[i].stripMeta,
				imgQuality: compValAll[i].imgQuality,
				sizeBefore: sizeBefore + ' KB',
				sizeAfter: sizeAfter + ' KB',
				inImgURL: compValAll[i].inImgURL,
				outImgURL: compValAll[i].outImgURL
			};
		}
		res.json({
			allowedImgs: `${allowedImgs} Image`,
			uploadedImgs: `${uploadedImgs} Image`,
			allowedSize: `${Math.round((allowedSize / 1048576) * 100) / 100} MB`,
			uploadedSize: `${Math.round((uploadedSize / 1048576) * 100) / 100} MB`,
			responseData
		});
	}
	catch (err) {
		sendError(res, 500, 'Code10, Something Went Wrong!');
	}
};

module.exports = sendResponse;