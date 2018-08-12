const config = require('../config/develop');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const gfs = require('../db/db').gfs;

const storage = new GridFsStorage({
    url: config.url,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString() + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'images'
                };
                resolve(fileInfo);
            });
        });
    }
});
const upload = multer({storage});


// @route POST /upload
// @desc  Uploads file to DB
// app.post('/upload', upload.single('file'), (req, res) => {
//     // res.json({ file: req.file });
//     res.redirect('/');
// });
// exports.uploadImg = (req, res)=>{
//
//     res.redirect('/');
//
// };
exports.getImgs = (req, res) => {
    gfs.files.find().toArray((err, files) => {
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

exports.findImgById = (req, res) => {
    gfs.files.findOne({filename: req.params.filename}, (err, file) => {
        // Check if file
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exists'
            });
        }
        // Check if image
        if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
            // Read output to browser

            const readStream = gfs.createReadStream(file.filename);
            res.status(200);
            readStream.pipe(res);
        } else {
            res.status(404).json({
                err: 'Not an image'
            });
        }
    })
};