const config = require('../config/develop');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const mongoose = require('../db/db').mongoose;

const grid = require('gridfs-stream');

let gridfs = {};
mongoose.connection.once("open", () => {
    grid.mongo = mongoose.mongo;
    gridfs = grid(mongoose.connection.db);
    if (!gridfs) {
        console.log("Sorry No Grid FS Object");
    }
    gridfs.collection('images');
});
const storage = new GridFsStorage({
    url: config.url,
    file: (req, file) => {

        return new Promise((resolve) => {
            crypto.randomBytes(16, (err) => {

                const filename = (Math.random() * Date.now() * 10).toFixed(0);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'images'
                };

                resolve(fileInfo);

            });
        });
    }
});
const upload = multer({storage, limits: {fileSize: 10000000},}).single('file');

exports.getImgs = (req, res) => {
    gridfs.files.find().toArray((err, files) => {
        // Check if files
        if (!files || files.length === 0) {
            res.render('index', {files: false});
        } else {
            files.map(file => {
                file.isImage = file.contentType === 'image/jpeg' ||
                    file.contentType === 'image/png';
            });
            res.render('index', {files: files});
        }
    });
};


exports.deleteImgs = (req, res) => {
    gridfs.remove({_id: req.params.id, root: 'images'}, (err, gridStore) => {
        if (err) {
            return res.status(404).json({err: err});
        }

        res.redirect('/index');
    });
};


// @route POST /upload
// @desc  Uploads file to DB
exports.uploadImg = (req, res) => {

    upload(req, res, (err) => {
        console.log(req.body)
        if (err && err.code === `LIMIT_FILE_SIZE`) {
            // An error occurred when uploading
            return res.status(406).json({
                error_msg: "File is too big",
                error_code: "406"
            });

        } else {

            return res.json({file: req.file});
        }

    });
};

exports.findImgById = (req, res) => {
    gridfs.files.findOne({filename: req.params.filename}, (err, file) => {
        // Check if file
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exists'
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
                err: 'Not an image'
            });
        }
    })
};

