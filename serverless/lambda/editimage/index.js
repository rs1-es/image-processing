const AWS = require('aws-sdk');
let fs = require('fs');
let request = require('request');
let s3 = new AWS.S3();
let rekognition = new AWS.Rekognition();
let textract = new AWS.Textract();
const sharp = require('sharp');
const BUCKETNAME = '';

function makeResponse(statusCode, body) {
    const response = {
        statusCode: statusCode,
        isBase64Encoded: false,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: body
    };
    return response;
}

let getFile = async (key) => {
    let response;

    await s3.getObject({
        Key: key,
        Bucket: BUCKETNAME
    }).promise()
        .then((data) => {
            response = data;
        }).catch((error) => {
            console.log(error);
        })

    return response;
}

let downloadToTemp = async (inputPath, fileContent) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(inputPath, fileContent.Body, (fserr) => {
            if (fserr) {
                console.log(fserr);
                reject(fserr)
            } else {
                resolve();
            }
        })
    });
}

let changeQuality = async (inputPath, outputPath, qValue) => {
    return new Promise((resolve, reject) => {
        console.log('Changing quality...');
        sharp(inputPath)
            .rotate()
            .jpeg({
                quality: parseInt(qValue, 10),
                chromaSubsampling: '4:4:4'
            })
            .toFile(outputPath, (err, info) => {
                if (err) {
                    console.log(err);
                    let response = makeResponse(500, JSON.stringify(err));
                    console.log(response);
                    resolve(response);
                } else {
                    let response = makeResponse(200, JSON.stringify({
                        message: 'OK QUALITY'
                    }));
                    resolve(response);
                }
            });
    });
}

let resize = async (inputPath, outputPath, dimensions) => {
    return new Promise((resolve, reject) => {
        let resizeObj = {};
        if (dimensions.height) {
            resizeObj.height = parseInt(dimensions.height, 10);
        }
        if (dimensions.width) {
            resizeObj.width = parseInt(dimensions.width, 10);
        }
        console.log('Changing size...');
        sharp(inputPath)
            .rotate()
            .resize(resizeObj)
            .toFile(outputPath, (err, info) => {
                if (err) {
                    console.log(err);
                    let response = makeResponse(500, JSON.stringify(err));
                    console.log(response);
                    resolve(response);
                } else {
                    let response = makeResponse(200, JSON.stringify({
                        message: 'OK RESIZE'
                    }));
                    resolve(response);
                }
            });
    });
}

let thumbnail = async (inputPath, outputPath, width) => {
    return new Promise((resolve, reject) => {
        console.log('Creating thumbnail...');
        sharp(inputPath)
            .rotate()
            .resize({
                width: width,
                height: width,
                fit: 'cover'
            })
            .toFile(outputPath, (err, info) => {
                if (err) {
                    console.log(err);
                    let response = makeResponse(500, JSON.stringify(err));
                    console.log(response);
                    resolve(response);
                } else {
                    let response = makeResponse(200, JSON.stringify({
                        message: 'OK THUMBNAIL'
                    }));
                    resolve(response);
                }
            });
    });
}

let detectLabels = async (key) => {
    let response;
    await rekognition.detectLabels({
        Image: {
            S3Object: {
                Bucket: BUCKETNAME,
                Name: key
            }
        },
        MaxLabels: 10
    }).promise().then((data) => {
        response = makeResponse(200, JSON.stringify(data))
    })
    return response;
}

let extractTextV2 = async (key) => {
    let response;
    await textract.detectDocumentText({
        Document: {
            S3Object: {
                Bucket: BUCKETNAME,
                Name: key
            }
        }
    }).promise().then((data) => {
        response = makeResponse(200, JSON.stringify(data))
    })
    return response;
}

let removeBackground = async (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        request.post({
            url: 'https://api.remove.bg/v1.0/removebg',
            formData: {
                image_file: fs.createReadStream(inputPath),
                size: 'auto',
                format: 'png'
            },
            headers: {
                'X-Api-Key': ''
            },
            encoding: null
        }, (error, res, body) => {
            if (error) {
                console.error('Request failed:', error);
                reject();
            } else {
                if (res.statusCode != 200) {
                    console.error('Error:', res.statusCode, body.toString('utf8'));
                    reject();
                }
                fs.writeFileSync(outputPath, body);
                let response = makeResponse(200, JSON.stringify({
                    message: 'OK THUMBNAIL'
                }));
                resolve(response);
            }
        });
    })
}

function searchQuality(item) {
    return item.name == 'quality';
}

function searchResize(item) {
    return item.name == 'resize';
}

function searchThumbnail(item) {
    return item.name == 'thumbnail';
}

function searchLabels(item) {
    return item.name == 'labels';
}

function searchExtractText(item) {
    return item.name == 'extract-text';
}

function searchRemoveBackground(item) {
    return item.name == 'remove-background';
}


let applyChanges = async (inputPath, filename, transformations) => {
    let response;
    let randomNumber = parseInt(Math.random() * 100000, 10);
    if (transformations.find(searchThumbnail) != undefined) {
        console.log('Thumbnail selected');
        let thumbnailParams = transformations.find(searchThumbnail);
        let outputPathThumbnail = '/tmp/th-' + filename;
        await thumbnail(inputPath, outputPathThumbnail, thumbnailParams.value);
        response = outputPathThumbnail;
    } else if (transformations.find(searchResize) != undefined) {
        console.log('Size selected');
        let resizeParams = transformations.find(searchResize);
        let outputPathResize = '/tmp/res-' + filename;
        await resize(inputPath, outputPathResize, resizeParams.value).then(async (res) => {
            if (transformations.find(searchQuality) != undefined) {
                console.log('Quality selected');
                let qualityParams = transformations.find(searchQuality);
                let outputPathQuality = '/tmp/q-' + randomNumber + '.jpg';
                await changeQuality(outputPathResize, outputPathQuality, qualityParams.value);
                response = outputPathQuality;
            } else {
                response = outputPathResize;
            }
        });
    } else if (transformations.find(searchQuality) != undefined) {
        let qualityParams = transformations.find(searchQuality);
        let outputPathQuality = '/tmp/q-' + randomNumber + '.jpg';
        await changeQuality(inputPath, outputPathQuality, qualityParams.value);
        response = outputPathQuality;
    } else if (transformations.find(searchRemoveBackground) != undefined) {
        let outputPathRemoveBg = '/tmp/rbg-' + randomNumber + '.png';
        await removeBackground(inputPath, outputPathRemoveBg);
        response = outputPathRemoveBg;
    }

    return response;
}

let uploadFile = async (filename, outputPath, contentType) => {
    let response;
    let folder = parseInt(Math.random() * 100000, 10);
    let newkey = 'files/output/' + folder.toString() + '/' + filename;
    if (outputPath != undefined) {
        await s3.putObject({
            Bucket: BUCKETNAME,
            Key: newkey,
            Body: fs.createReadStream(outputPath),
            ContentType: contentType
        }).promise()
            .then((data) => {
                response = makeResponse(200, JSON.stringify({
                    newkey: newkey
                }))
            });
    } else {
        response = makeResponse(500, JSON.stringify({
            message: 'You must select one or more transformations'
        }))
    }

    return response;
}

let removeLocalFiles = async (inputPath, outputArray) => {
    return new Promise((resolve, reject) => {
        let exec = require('child_process').exec, child;
        let command = 'rm "' + inputPath + '"';
        for (let outputPath of outputArray) {
            command += ' ' + outputPath;
        }
        child = exec(command, (err, stdout, stderr) => {
            if (err != null) {
                console.log(err);
                console.log(stderr);
                let response = makeResponse(502, JSON.stringify({ message: 'Error with exec' }));
                reject(response);
            } else {
                resolve();
            }
        })
    })
}

let main = async (key, transformations) => {
    let response;
    let key_split = key.split('/');
    let filename = key_split[key_split.length - 1];
    filename = filename.replace(/\s/g, '-');
    if (transformations.find(searchLabels) != undefined) {
        console.log('Detect labels selected');
        response = await detectLabels(key);
    } else {
        let fileContent = await getFile(key);
        let outputContentType;
        if (transformations.find(searchQuality) != undefined){
            outputContentType = 'image/jpeg';
        } else if (transformations.find(searchRemoveBackground)!= undefined) {
            outputContentType = 'image/png';
        } else {
            outputContentType =  fileContent.ContentType;
        }
        let inputPath = '/tmp/i-' + filename;
        console.log(inputPath);
        await downloadToTemp(inputPath, fileContent);
        if (transformations.find(searchExtractText) != undefined) {
            console.log('Extract text selected');
            response = await extractTextV2(key);
            //await removeLocalFiles(inputPath, []);
        } else {
            if (transformations.find(searchQuality) != undefined) {
                filename = filename.replace(/(\.png)/, '.jpg');
            }
            let outputPath = await applyChanges(inputPath, filename, transformations);
            if (transformations.find(searchRemoveBackground) != undefined) {
                filename = filename.replace(/(.jpg)|(.jpeg)/, '.png');
            }
            response = await uploadFile(filename, outputPath, outputContentType);
            await removeLocalFiles(inputPath, [outputPath]);
        }
    }

    return response;
}

exports.handler = async (event) => {
    let event_body = JSON.parse(event.body);
    let key = event_body.key;
    let transformations = event_body.transformations;
    return await main(key, transformations);
}
