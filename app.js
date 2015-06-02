var express = require('express');
var app = express();
var aws = require('aws-sdk');
var sharp = require('sharp'); 

var s3 = new aws.S3();

app.get('/', function (req, res) {
  var params = {Bucket: 'sproutup-test-upload', Key: 'cb4138a1-ca4f-48c0-b6e0-18a5a900a702_4.jpg'};
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

