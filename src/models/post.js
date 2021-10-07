const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const aws = require('aws-sdk');

const { promisify } = require('util');

const s3 = new aws.S3();

const PostSchema = new mongoose.Schema({
    name: String,
    size: Number,
    key: String,
    url: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
});

//checking if i'm using bucket s3 so i can erase the data directly in the bucket
PostSchema.pre('remove', function (){
    if(process.env.STORAGE_TYPE === 's3'){
        return s3.deleteObject({
            Bucket: process.env.NAME_BUCKET,
            Key: this.key,
        }).promise()
    }
    else{
        return promisify(fs.unlink)(path.resolve(__dirname, '..', '..', 'tmp', 'uploads', this.key)
        );
    }
});

//using mongoose middleware to check if the URL is empty and fill it in before persisting in db
PostSchema.pre('save', function (){
    if(!this.url){
        this.url = `${process.env.APP_URL}/files/${this.key}`
    }
});

module.exports = mongoose.model("Post", PostSchema)
