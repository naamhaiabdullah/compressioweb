const compress = require('../compress');
const methods = require('../methods');
const formidable = require('formidable');
const validator = require('validator');
const fs = require('fs');
const uuid = require('uuid');
const path = require('path');

let inParentFolder = path.join(__dirname, '../../input/');
let outParentFolder = path.join(__dirname, '../../output/');

// Deleting images older than one hour.
setInterval(() => {
	methods.findRemove(inParentFolder, outParentFolder);
}, 60000);


const reqHandCompress = (req, res) => {

	let inURLTemp = 'https://compressio.app/api/input/';
	let outURLTemp = 'https://compressio.app/api/output/';

	let uploadedImgs = null;
	let uploadedSize = null;
	let allowedImgs = 10;
	let allowedSize = 50 * 1024 * 1024;

	let compVal = {};
	let compValAll = [];
	let responseData = [];

	//Setting Headers
	res.setHeader('Content-Type', 'application/json');

	// Cleaning Response Data
	responseData = [];

	// Creating Unique In/Out Subdirectory
	let uniqueUUID = uuid.v4();
	let inChildFolder = inParentFolder + uniqueUUID;
	let outChildFolder = outParentFolder + uniqueUUID;

	const start = async () => {

		try {
			// Creating Unique In/Out Subdirectory
			await new Promise(resolve => {
				fs.mkdir(inChildFolder, { recursive: true }, (err) => {
					if (err) {
						return methods.sendError(res, 500, 'Code01, Something Went Wrong!');
					} else { resolve(); }
				});
			});
			await new Promise(resolve => {
				fs.mkdir(outChildFolder, { recursive: true }, (err) => {
					if (err) {
						return methods.sendError(res, 500, 'Code02, Something Went Wrong!');
					} else { resolve(); }
				});
			});

			// Creating Formidable 
			const form = formidable({ multiples: true, maxFileSize: allowedSize });
			await new Promise(resolve => {
				form.parse(req, async (err, fields, files) => {

					uploadedSize = form.bytesReceived;

					// Some Form Error
					if (err) {
						return methods.sendError(res, 500, 'Code03, Something Went Wrong!');
					}

					// If Image exists?
					else if (Object.keys(files).length === 0) {
						return methods.sendError(res, 400, 'Code04, No Image Provided!');
					} else if (files.inImgs.size === 0) {
						return methods.sendError(res, 400, 'Code04, No Image Provided!');
					}

					// If Single Image, Convert Object to Array.
					else if (files.inImgs.size > 0) {
						files.inImgs = [files.inImgs];
					}

					// If stripMeta Exists?
					if (
						typeof fields.stripMeta === 'undefined' ||
						fields.stripMeta.trim() === 'true'
					) {
						fields.stripMeta = 'true';
					} else {
						fields.stripMeta = 'false';
					}

					// If isLossy Exists?
					if (
						typeof fields.isLossy === 'undefined' ||
						fields.isLossy.trim() === 'true'
					) {
						fields.isLossy = 'true';
					} else {
						fields.isLossy = 'false';
					}

					// If imgQuality Exists and Is Between 1-100?
					if (
						typeof fields.imgQuality === 'undefined' ||
						isNaN(parseInt(fields.imgQuality.trim()))
					) {
						fields.imgQuality = 'default';
					} else {
						let imgQualityTemp = parseInt(fields.imgQuality.trim());
						fields.imgQuality = 'default';

						// Checking If imgQuality Is In Range 1-100
						if (((imgQualityTemp - 1) * (imgQualityTemp - 100) <= 0)) {
							fields.imgQuality = imgQualityTemp;
						}
					}

					// If Total Images > 10, Send Error.
					uploadedImgs = Object.keys(files.inImgs).length;
					if (uploadedImgs > allowedImgs) {
						return methods.sendError(res, 400, 'Code05, Images More Than 10!');
					}

					// Iterating Over All The Images
					for (let i = 0; i < uploadedImgs; i++) {

						// Variables
						let tempImg = files.inImgs[i].path;
						let imgName = validator.escape(files.inImgs[i].name.trim());
						let imgExt = imgName.split('.').pop().toUpperCase();
						let stripMeta = fields.stripMeta;
						let isLossy = fields.isLossy;
						let imgQuality = fields.imgQuality;

						// Input/Output Image Path with Full Name
						let inImgPath = inChildFolder + '/' + imgName;
						let outImgPath = outChildFolder + '/' + imgName;

						// Input/Output Image Public HTTP URL
						let inImgURL = inURLTemp + uniqueUUID + '/' + imgName;
						let outImgURL = outURLTemp + uniqueUUID + '/' + imgName;

						// Data Object
						compVal = {
							isLossy: isLossy,
							stripMeta: stripMeta,
							imgQuality: imgQuality,
							inImgPath: inImgPath,
							outImgPath: outImgPath,
							outChildFolder: outChildFolder,
							res: res,
							imgExt: imgExt,
							inImgURL: encodeURI(inImgURL),
							outImgURL: encodeURI(outImgURL)
						};

						// Moving Images from Temp to Input Folder
						await new Promise(resolve => {
							fs.rename(tempImg, inImgPath, (err) => {
								if (err) { return methods.sendError(res, 500, 'Code06, Something Went Wrong!'); }
								else { resolve(); }
							});
						});

						// Compressing Images
						if (imgExt === 'JPEG' || imgExt === 'JPG') {
							await compress.JPG(compVal);
							compValAll[i] = compVal;
						} else if (imgExt === 'PNG') {
							await compress.PNG(compVal);
							compValAll[i] = compVal;

						} else if (imgExt === 'SVG') {
							await compress.SVG(compVal);
							compValAll[i] = compVal;
						} else if (imgExt === 'GIF') {
							await compress.GIF(compVal);
							compValAll[i] = compVal;
						} else {
							return methods.sendError(res, 400, 'Image Not Supported!');
						}
					}
					// Resolving Promise on Loop End
					resolve();
				});
			});

			// Sending Response
			let compDetails = {
				uploadedImgs: uploadedImgs,
				uploadedSize: uploadedSize,
				responseData: responseData,
				allowedImgs: allowedImgs,
				allowedSize: allowedSize
			};
			methods.sendResponse(compValAll, compDetails, res);
		}
		catch (err) {
			methods.sendError(res, 500, 'Code07, Something Went Wrong!');
		}
	};
	start();
};

module.exports = reqHandCompress;
