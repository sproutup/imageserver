var express = require('express');
var app = express();
var aws = require('aws-sdk');
var sharp = require('sharp'); 
var ioredis = require('ioredis');

var redis = new ioredis(6379, '192.168.59.103');
var s3 = new aws.S3();
var bucket = 'sproutup-test-upload';

app.get('/', function (req, res) {
    res.send('image server');
});

app.get('/image/:key', function (req, res) {
    var params = {Bucket: 'sproutup-test-upload', Key: req.params.key};
    var transformer = sharp()
        .resize(300, 200)
        .crop(sharp.gravity.north)
        .on('error', function(err) {
        console.log(err);
    });

    console.log("## request received  ##");

    redis.getBuffer(bucket+':'+req.params.key, function (err, image) {
        if(err){
            console.log(err);
        }
        
        if(image!=null){
            // image found in cache
            console.log('cache hit');
            render({res: res, image: image, w: req.query.w, h
                    : req.query.h});
        }
        else{
            // no image found in cache  
            console.log('cache miss');
            s3.getObject(params, function(err, data) {
                if(data!=null){
                    console.log('got s3 image');
                    redis.set(bucket+':'+req.params.key, data.Body);
                    render({res: res, image: data.Body, w: req.query.w, h
                    : req.query.h});
                }
                else{
                    console.log('failed to get s3 image');
                }
            })
        }    
    });

    //res.setHeader('content-type', "image/jpeg")
    //res.setHeader('content-length',doc.size)
    //s3.getObject(params).createReadStream().pipe(transformer).pipe(res);
});

function toInt(str){
    var min = 5;
    var max = 2000;
    var num = Number(str);
    if(isNaN(num)){
        return num;
    }
    else{        
        if(num >= min && num <= max){
            return num;
        }
        else{
            console.log('number out of range: ', num);
            return NaN;
        }
    }
};    


function transform(params, callback){
    console.log('transform...', params.w);
    sharp(params.image)
        .resize(toInt(params.w), toInt(params.h))
        .interpolateWith(sharp.interpolator.bicubic)
        //.max()
        .toBuffer(function(err, outputBuffer, info) {
            if (err) {
                console.log(err);
                return callback(err,null);;
            }
            console.log('success');
            return callback(null, outputBuffer);
        });
}

function render(params, callback){
    console.log('render...', params.image.length);
    transform({image: params.image, h: params.h, w: params.w},function(err,result){
        params.res.setHeader('content-type', "image/jpeg");
        params.res.end(result);
    })   
}

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});

