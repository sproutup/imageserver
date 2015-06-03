var express = require('express');
var app = express();
var aws = require('aws-sdk');
var sharp = require('sharp'); 
var ioredis = require('ioredis');

var redis = new ioredis(6379, '192.168.59.103');
var s3 = new aws.S3();
var bucket = 'sproutup-test-upload';

app.get('/image/:key', function (req, res) {
    console.log("key: ", req.params.key);
    console.log("w: ", req.query.w);  
    console.log("h: ", req.query.h);  
    var params = {Bucket: 'sproutup-test-upload', Key: req.params.key};
    var transformer = sharp()
        .resize(300, 200)
        .crop(sharp.gravity.north)
        .on('error', function(err) {
        console.log(err);
    });

    console.log("getting object");

    //redis.set('foo', 'bar');
  
    redis.getBuffer(bucket+':'+req.params.key, function (err, image) {
        if(err){
            console.log(err);
        }
        
        if(image!=null){
            // image found in cache
            console.log('cache hit', image);
            render({res: res, image: image, w: req.query.w, h
                    : req.query.h});
        }
        else{
            // no image found in cache  
            console.log('cache miss');
            s3.getObject(params, function(err, data) {
                if(data!=null){
                    console.log('got s3 image', data);
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

function transform(params, callback){
    console.log('transform...', params.w);
    sharp(params.image)
        .resize(1200,1200)
        .toBuffer(function(err, outputBuffer, info) {
            if (err) {
                console.log(err);
                return callback(err,null);;
            }
            // outputBuffer contains 200px high progressive JPEG image data,
            // auto-rotated using EXIF Orientation tag
            // info.width and info.height contain the dimensions of the resized image
            
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

