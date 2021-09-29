// Using Strict JavaScript for security
'use strict';

// API dependencies
const { spawn } = require('child_process');
const express = require('express');
const app = express();
const formidable = require('formidable');
const validator = require('validator');
const fs = require("fs");
const uuid = require('uuid');
const cors = require('cors');
const findRemoveSync = require('find-remove');

const server = app.listen(3000, () => {
    console.log(`API Server listening at http://localhost/compress`);
});
server.setTimeout(30 * 1000);
server.keepAliveTimeout = 30 * 1000;
server.headersTimeout = 30 * 1000;

// Global Variables
let inParentFolder = __dirname + '/input/';
let outParentFolder = __dirname + '/output/';

let inURLTemp = 'https://api.example.com/input/';
let outURLTemp = 'https://api.example.com/output/';
let corsOptions = {
    origin: 'https://api.example.com',
    methods: '[POST]'
}

let totalImgs = null;
let compVal = {};
let compValAll = [];
let responseData = [];

// Max Number of Images in a Request
let maxImgs = 10;

// Total Image Size, 50MB Here
let maxSize = 50 * 1024 * 1024;

// Deleting images older than one hour from input and output folders
setInterval(() => {
    findRemoveSync(inParentFolder, { age: { seconds: 3600 }, dir: '*' });
    findRemoveSync(outParentFolder, { age: { seconds: 3600 }, dir: '*' });
}, 60000);

// Creating Server
app.post('/compress', cors(corsOptions), (req, res) => {

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
                        return sendError(res, 500, 'Code01');
                    } else { resolve(); }
                })
            });
            await new Promise(resolve => {
                fs.mkdir(outChildFolder, { recursive: true }, (err) => {
                    if (err) {
                        return sendError(res, 500,  'Code02');
                    } else { resolve(); }
                })
            });

            // Creating Formidable 
            const form = formidable({ multiples: true, maxFileSize: maxSize });
            await new Promise(resolve => {
                form.parse(req, async (err, fields, files) => {

                    // Some Form Error
                    if (err) {
                        return sendError(res, 500, 'Code03');
                    } 
                    
                    // If Image exists?
                    else if (Object.keys(files).length === 0) {
                        return sendError(res, 400, 'Code04');
                    } else if (files.inImgs.size === 0) {
                        return sendError(res, 400, 'Code04');
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
                    totalImgs = Object.keys(files.inImgs).length;
                    if (totalImgs > maxImgs) {
                        return sendError(res, 400, 'Code05');
                    }

                    // Iterating Over All The Images
                    for (let i = 0; i < totalImgs; i++) {

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
                                if (err) { return sendError(res, 500, 'Code06'); }
                                else { resolve(); }
                            })
                        });

                        // Compressing Images
                        if (imgExt === 'JPEG' || imgExt === 'JPG') {
                            await compressJPG(compVal);
                            compValAll[i] = compVal;
                        } else if (imgExt === 'PNG') {
                            await compressPNG(compVal);
                            compValAll[i] = compVal;

                        } else if (imgExt === 'SVG') {
                            await compressSVG(compVal);
                            compValAll[i] = compVal;
                        } else if (imgExt === 'GIF') {
                            await compressGIF(compVal);
                            compValAll[i] = compVal;
                        } else {
                            return sendError(res, 400, 'Image Not Supported!');
                        }
                    }
                    // Resolving Promise on Loop End
                    resolve();
                });
            });

            // Sending Response
            sendResponse(compValAll, totalImgs, res);
        }
        catch (err) {
            sendError(res, 500, 'Code07');
        }
    };
    start();
});


// Send Response in JSON
const sendResponse = async (compValAll, totalImgs, res) => {
    try {
        for (let i = 0; i < totalImgs; i++) {
            let inStats = await new Promise(resolve => {
                fs.stat(compValAll[i].inImgPath, (err, stats) => {
                    if (err) {
                        return sendError(res, 500, 'Code08');
                    } else { resolve(stats); }
                })
            });
            let inSizeInKB = inStats.size / 1024;
            let sizeBefore = Math.round(inSizeInKB);

            let outStats = await new Promise(resolve => {
                fs.stat(compValAll[i].outImgPath, (err, stats) => {
                    if (err) {
                        return sendError(res, 500, 'Code09');
                    } else { resolve(stats); }
                })
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
        res.end(JSON.stringify({ 
            maxImgs: `${maxImgs} Images`,
            maxSize: `${maxSize/1048576} MB`,
            responseData
        }));
    }
    catch (err) {
        sendError(res, 500, 'Code10');
    }
}

// Send Error in JSON
const sendError = (res, respCode, error) => {
    res.status(respCode).end(JSON.stringify({ Error: error }));
}




























// Compresses JPEG image with JPEGOptim
const compressJPG = (compVal) => {
    try {
        if (
            compVal.isLossy === 'false'
            && compVal.stripMeta === 'false'
        ) {
            const compImg = spawn('jpegoptim', [
                compVal.inImgPath,
                '--dest=' + compVal.outChildFolder
            ]);
            return new Promise(resolve => {
                compImg.stdout.on('end', () => { resolve(); })
            });
        } else if (
            compVal.isLossy === 'false' &&
            compVal.stripMeta === 'true'
        ) {
            const compImg = spawn('jpegoptim', [
                '--strip-all',
                compVal.inImgPath,
                '--dest=' + compVal.outChildFolder
            ]);
            return new Promise(resolve => {
                compImg.stdout.on('end', () => { resolve(); })
            });
        } else if (
            compVal.isLossy === 'true' &&
            compVal.stripMeta === 'false' &&
            compVal.imgQuality === 'default'
        ) {
            const compImg = spawn('jpegoptim', [
                '-m85',
                compVal.inImgPath,
                '--dest=' + compVal.outChildFolder
            ]);
            return new Promise(resolve => {
                compImg.stdout.on('end', () => { resolve(); })
            });
        } else if (
            compVal.isLossy === 'true' &&
            compVal.stripMeta === 'false' &&
            compVal.imgQuality !== 'default'
        ) {
            const compImg = spawn('jpegoptim', [
                '-m' + compVal.imgQuality,
                compVal.inImgPath,
                '--dest=' + compVal.outChildFolder
            ]);
            return new Promise(resolve => {
                compImg.stdout.on('end', () => { resolve(); })
            });
        } else if (
            compVal.isLossy === 'true' &&
            compVal.stripMeta === 'true' &&
            compVal.imgQuality === 'default'
        ) {
            const compImg = spawn('jpegoptim', [
                '-m85',
                '--strip-all',
                compVal.inImgPath,
                '--dest=' + compVal.outChildFolder
            ]);
            return new Promise(resolve => {
                compImg.stdout.on('end', () => { resolve(); })
            });
        } else if (
            compVal.isLossy === 'true' &&
            compVal.stripMeta === 'true' &&
            compVal.imgQuality !== 'default'
        ) {
            const compImg = spawn('jpegoptim', [
                '-m' + compVal.imgQuality,
                '--strip-all',
                compVal.inImgPath,
                '--dest=' + compVal.outChildFolder
            ]);
            return new Promise(resolve => {
                compImg.stdout.on('end', () => { resolve(); })
            });
        }
    }
    catch (err) {
        return sendError(compVal.res, 500, 'Code11');
    }
};

// Compresses PNG image with PNGQuant and OptiPNG
const compressPNG = (compVal) => {
    try {
        if (
            compVal.isLossy === 'false' &&
            compVal.stripMeta === 'false'
        ) {
            const compImg = spawn('optipng', [
                '-o2', compVal.inImgPath,
                '-out', compVal.outImgPath
            ]);
            return new Promise(resolve => {
                compImg.stdout.on('end', () => { resolve(); })
            });
        } else if (
            compVal.isLossy === 'false' &&
            compVal.stripMeta === 'true'
        ) {
            const compImg = spawn('optipng', [
                '-o2', compVal.inImgPath,
                '-strip all',
                '-out',
                compVal.outImgPath
            ]);
            return new Promise(resolve => {
                compImg.stdout.on('end', () => { resolve(); })
            });
        } else if (
            compVal.isLossy === 'true' &&
            compVal.stripMeta === 'false' &&
            compVal.imgQuality === 'default'
        ) {
            const compImg = spawn('pngquant', [
                '--skip-if-larger',
                '--speed=1',
                '--quality=1-85',
                compVal.inImgPath,
                '--out',
                compVal.outImgPath
            ]);
            return new Promise(resolve => {
                compImg.stdout.on('end', () => { resolve(); })
            });
        } else if (
            compVal.isLossy === 'true' &&
            compVal.stripMeta === 'false' &&
            compVal.imgQuality !== 'default'
        ) {
            const compImg = spawn('pngquant', [
                '--skip-if-larger',
                '--speed=1',
                '--quality=1-' + compVal.imgQuality,
                compVal.inImgPath, '--out',
                compVal.outImgPath
            ]);
            return new Promise(resolve => {
                compImg.stdout.on('end', () => { resolve(); })
            });
        } else if (
            compVal.isLossy === 'true' &&
            compVal.stripMeta === 'true' &&
            compVal.imgQuality === 'default'
        ) {
            const compImg = spawn('pngquant', [
                '--skip-if-larger',
                '--speed=1',
                '--strip',
                '--quality=1-85',
                compVal.inImgPath,
                '--out',
                compVal.outImgPath
            ]);
            return new Promise(resolve => {
                compImg.stdout.on('end', () => { resolve(); })
            });
        } else if (
            compVal.isLossy === 'true' &&
            compVal.stripMeta === 'true' &&
            compVal.imgQuality !== 'default'
        ) {
            const compImg = spawn('pngquant', [
                '--skip-if-larger',
                '--speed=1',
                '--strip',
                '--quality=1-' + compVal.imgQuality,
                compVal.inImgPath, '--out',
                compVal.outImgPath
            ]);
            return new Promise(resolve => {
                compImg.stdout.on('end', () => { resolve(); })
            });
        }
    }
    catch (err) {
        return sendError(compVal.res, 500, 'Code12');
    }
};

// Compresses GIF image with GIFSicle
const compressGIF = (compVal) => {
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
                compImg.stdout.on('end', () => { resolve(); })
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
                compImg.stdout.on('end', () => { resolve(); })
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
                compImg.stdout.on('end', () => { resolve(); })
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
                compImg.stdout.on('end', () => { resolve(); })
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
                compImg.stdout.on('end', () => { resolve(); })
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
                compImg.stdout.on('end', () => { resolve(); })
            });
        }
    }
    catch (err) {
        return sendError(compVal.res, 500, 'Code13');
    }
};

// Compresses SVG image with Scour
const compressSVG = (compVal) => {
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
                compImg.stdout.on('end', () => { resolve(); })
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
                compImg.stdout.on('end', () => { resolve(); })
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
                compImg.stdout.on('end', () => { resolve(); })
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
                compImg.stdout.on('end', () => { resolve(); })
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
                compImg.stdout.on('end', () => { resolve(); })
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
                compImg.stdout.on('end', () => { resolve(); })
            });
        }
    }
    catch (err) {
        return sendError(compVal.res, 500, 'Code14');
    }
};