const config = require('../config/develop');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const mongoose = require('../db/db').mongoose;
const logger = require('../logging/logging').logger;
const grid = require('gridfs-stream');
const aliOssStorage = require('multer-ali-oss');
let OSS = require('ali-oss');
let client = new OSS({
    accessKeyId: 'LTAI98iZQpjrZpDz',
    accessKeySecret: 'HWmBDNZKQ7vIaXIeSurwi5awUxPuFE',
    region: 'oss-cn-hongkong',
    bucket: 'yubaopay',
});
let upload_oss = multer({
    storage: aliOssStorage({
        config: {
            accessKeyId: 'LTAI98iZQpjrZpDz',
            accessKeySecret: 'HWmBDNZKQ7vIaXIeSurwi5awUxPuFE',
            region: 'oss-cn-hongkong',
            bucket: 'yubaopay',
        },
        filename: function (req, file, cb) {
            const filename = (Math.random() * Date.now() * 10).toFixed(0) + '.jpg';
            cb(null, `images/` + filename)
        }
    })
}).single('file');


let gridfs = {};
mongoose.connection.once("open", () => {
    grid.mongo = mongoose.mongo;
    gridfs = grid(mongoose.connection.db);
    if (!gridfs) {
        //console.log("Sorry No Grid FS Object");
    }
    gridfs.collection('images');
});


const storage = new GridFsStorage({
    url: config.url,
    //file: (req, file) => {
    file: () => {
        return new Promise((resolve) => {
            crypto.randomBytes(16, (err) => {
                if (err) {
                    throw err;
                }
                const filename = (Math.random() * Date.now() * 10).toFixed(0) + '.jpg';
                const fileInfo = {
                    filename: filename,
                    bucketName: 'images'
                };
                resolve(fileInfo);
            });
        });
    }
});

const upload = multer({storage, limits: {fileSize: 100000000},}).single('file');
const uploadArray = multer({storage, limits: {fileSize: 100000000},}).array('files');
const upload_new = upload_oss;


exports.getImgs = async (req, res) => {
    try {
        let result = await client.list({
            prefix: `images/`,
            delimiter: '/'
        }, null);

        res.status(200).render(`../views/${req.path}`, {files: result.objects});
    } catch (err) {
        logger.error(`获取图片`, {req: req, error: err});
        return res.status(503).json({error_msg: `503`, error_code: err.message});
    }
};


// exports.getImgs = (req, res) => {
//     gridfs.files.find().toArray((err, files) => {
//         // Check if files
//         if (!files || files.length === 0) {
//             res.render('index', {files: false});
//         } else {
//             files.map(file => {
//                 file.isImage = file.contentType === 'image/jpeg' ||
//                     file.contentType === 'image/png';
//             });
//             res.status(200).render(`../views/${req.path}`, {files: files});
//         }
//     });
// };
exports.uploadImgForEndpoint = async (req, res) => {

    try {

        const [returnReq,] = await uploadImgAsync(req, res);

        logger.info(`uploadImgForEndpoint`, {req: req});

        // if (tool.isEmpty(returnReq.file)) {
        //     return res.status(400).json({error_msg: `图片获取为空`, error_code: "400"});
        // }
        return res.json({
            error_msg: `OK`,
            error_code: "0",
            data: returnReq.file.url
        });

    }
    catch (err) {
        logger.error(`图片上传`, {req: req, error: err});

        return res.status(400).json({error_msg: `400`, error_code: err.message});
    }

};

exports.uploadImgArray = async (req, res, callback) => {

    uploadArray(req, res, (err) => {

        if (err && err.code === `LIMIT_FILE_SIZE`) {
            // An error occurred when uploading
            return res.status(406).json({
                error_msg: "File is too big",
                error_code: "406"
            });

        } else {
            return callback();
        }

    });
};
let uploadImgAsync = (req, res) => {

    return new Promise((resolve, reject) => {
        upload_new(req, res, (err) => {

            if (err) {
                reject(err)
            } else {
                resolve([req, res]);
            }
        });
    });
};
let uploadImgAsyncArray = (req, res) => {

    return new Promise((resolve, reject) => {
        uploadArray(req, res, (err) => {
            if (err) {
                reject(err)
            } else {
                resolve([req, res]);
            }
        });
    });
};
exports.deleteImpsForController = (req, res) => {
    let filename;
    if (req.params.filename) {
        filename = req.params.filename;
    } else if (req.body.filename) {
        filename = req.body.filename;
    } else {
        return res.status(404).json("filename is not here");
    }
    gridfs.remove({filename: filename, root: 'images'}, (err) => {
        if (err) {
            logger.error("deleteImpsForController", {
                level: req.user.role,
                response: `deleteImpsForController Failed`,
                user: req.user.uuid,
                email: req.user.email_address,
                location: (new Error().stack).split("at ")[1],
                body: req.body
            });

            return res.status(404).json({err: err});
        }
        return res.status(200).json({error_msg: `200`, error_code: "OK！"});
    });
};

exports.deleteImgs_new = async (req, res) => {
    let filename;

    if (req.params.filename) {
        filename = req.params.filename;
    } else if (req.body.filename) {
        filename = req.body.filename;
    } else {

        return res.status(404).json("filename is not here");
    }
    filename = filename.replace(`http://yubaopay.oss-cn-hongkong.aliyuncs.com/`, ``);

    try {
        await client.delete(filename);

        return res.status(200).json({
            error_msg: "OK",
            error_code: 0
        });
    } catch (err) {
        return res.status(400).json({
            error_msg: err.message,
            error_code: 400
        });
    }
};
exports.deleteImgs = (req, res, callback) => {
    let filename;
    if (req.params.filename) {
        filename = req.params.filename;
    } else if (req.body.filename) {
        filename = req.body.filename;
    } else {

        return res.status(404).json("filename is not here");
    }

    gridfs.remove({filename: filename, root: 'images'}, (err) => {
        if (err) {
            logger.error("deleteImgs", {
                level: req.user.role,
                response: `deleteImgs Failed`,
                user: req.user.uuid,
                email: req.user.email_address,
                location: (new Error().stack).split("at ")[1],
                body: req.body
            });

            return res.status(404).json({err: err});
        }
        callback();
    });
};


// @route POST /upload
// @desc  Uploads file to DB
exports.uploadImg = (req, res, callback) => {
    if (req.file === null) {
        return res.status(404).json({
            error_msg: "File is empty",
            error_code: "404"
        });
    }
    upload(req, res, (err) => {

        if (err && err.code === `LIMIT_FILE_SIZE`) {
            // An error occurred when uploading
            return res.status(406).json({
                error_msg: "File is too big",
                error_code: "406"
            });

        } else {
            callback();
        }

    });
};

exports.findImgById = (req, res) => {
    gridfs.files.findOne({filename: req.params.filename}, (err, file) => {
        // Check if file
        if (!file || file.length === 0) {
            return res.status(404).json({
                error_status: 404,
                error_msg: 'File not exist!'
            });
        }
        // Check if image
        if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
            // Read output to browser

            const readStream = gridfs.createReadStream(file.filename);
            res.status(200);
            readStream.pipe(res);
        } else {
            res.status(404).json({
                error_status: 404,
                error_msg: 'Not an image'
            });
        }
    })
};

exports.uploadImgAsyncArray = uploadImgAsyncArray;