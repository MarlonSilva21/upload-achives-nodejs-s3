const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const aws = require('aws-sdk'); //lib to integrate with s3
const multerS3 = require('multer-s3') //multer provider to make storage on s3 instead of local disk

const storageTypes = {

    //storage local
    local: multer.diskStorage({
        destination: (req, file, cb) => {

            //cb is a multer callback function where it returns the error first and then what do you want
            cb(null, path.resolve(__dirname, '..', '..', 'tmp', 'uploads'));
        },
        filename: (req, file, cb) => {

           //generate hashes to save images with different names
            crypto.randomBytes(16, (err, hash) => {
                if(err) cb(err); //if I get an error I pass the error to multer's cb where I can handle it in the controller

                //joining the hash with the image name
                file.key = `${hash.toString('hex')}-${file.originalname}`;

                cb(null, file.key);
            });
        },
    }),

    //storage remoto/s3
    s3: multerS3({
        s3: new aws.S3(), //creating a s3
        bucket: process.env.NAME_BUCKET, //name of your bucket s3
        contentType: multerS3.AUTO_CONTENT_TYPE, //allow it to open the file in the browser instead of forcing it to download
        acl: 'public-read', //making the files in the bucket free to read
        key: (req, file, cb) => {
            crypto.randomBytes(16, (err, hash) => {
                if(err) cb(err);

                const fileName = `${hash.toString('hex')}-${file.originalname}`;

                cb(null, fileName);
            });
        }
    })
}

module.exports = {
    dest: path.resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    storage: storageTypes[process.env.STORAGE_TYPE],
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        //accepted formats for uploading
        const allowedMimes = [
            'image/jpeg',
            'image/pjpeg',
            'image/png',
            'image/gif',
        ];

        if(allowedMimes.includes(file.mimetype)){
            cb(null, true);
        }
        else{
            cb(new Error("invalid file type."));
        }
    }
}
