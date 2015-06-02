var express = require('express');
var app = express();
var aws = require('aws-sdk');
var sharp = require('sharp'); 

var s3 = new aws.S3();

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

  res.setHeader('content-type', "image/jpeg")
  //res.setHeader('content-length',doc.size)
  s3.getObject(params).createReadStream().pipe(transformer).pipe(res);
});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});

