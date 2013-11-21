var WorkerImage = require('./lib/WorkerImage'),
    fs          = require('fs'),
    picha       = require('picha');

module.exports = require('./lib/ImageWorker');

//fs.readFile('./images/theband.jpg', function(err, buffer){
//    picha.decode(buffer, function(err, result){
//        var additional = 400,
//            iterations = result.data.length / result.stride,
//            rows = [],
//            stride = ((1615 * 3 + 3) & ~3),
//            padded;
//
//        console.log(stride, result.stride, ((stride-result.stride)/2));
//        for(var i=0; i < iterations; i++){
//            var left = new Buffer(Math.ceil(stride - result.stride)/2).fill(0x0);
//            var right = new Buffer(Math.ceil(stride - result.stride)/2).fill(0x0);
//            rows.push(Buffer.concat([left, result.row(i), right]));
//        }
//        padded = Buffer.concat(rows);
//        console.log(padded.length);
//        var pi = new picha.Image({width:1615, height: 800, stride:4848, pixel: 'rgb', data: padded});
//        picha.encodeJpeg(pi, function(error, data){
//            console.log(error);
//            fs.writeFile('./images/padded.jpg', data, function(err){
//                if(!err){
//                    console.log('Yeah');
//                }
//            });
//        });
//    });
//});
/**fs.readFile('./images/theband.jpg', function(err, buffer){
    var img = picha.decode(buffer, function(err, result){
       console.log(result.data.length);
    });
});*/