var WorkerImage = require('./lib/WorkerImage'),
    fs          = require('fs'),
    picha       = require('picha'),
    log         = require('ee-log');

module.exports = require('./lib/ImageWorker');

fs.readFile('./images/theband.jpg', function(err, buffer){
//    picha.decode(buffer, function(err, result){
//        picha.resize(result, {width: 456, height: 300, filter: 'lanczos'}, function(err, crop){
//            log(crop);
//            var sub = crop.subView(77, 0, 300, 300);
//            var decoded = picha.encodeJpegSync(sub);
//            fs.writeFile('./images/theband_crop.jpg', decoded, function(error){
//                log(error);
//            });
//        });
//    });
    var wi = new WorkerImage(buffer);
    wi.pad({top: 100 }).crop({top: 400, left: 300}).resize({width: 100, height: 100}).toBuffer(function(err, data){
        log(err);
        fs.writeFile('./images/theband_fit.jpg', data, function(error){
            log(error);
        });
    });
});
//fs.readFile('./images/theband.jpg', function(err, buffer){
//    picha.decode(buffer, function(err, result){
//        var additional = 400,
//            rows = [],
//            psize = 4,
//            stride = ((1615 * psize + 3) & ~3),
//            padded;
//        var converted = picha.colorConvertSync(result, {pixel: 'rgba'});
//        var iterations = converted.data.length / converted.stride;
//
//        var emptyLine = new Buffer(stride).fill(0x0);
//        for(var i=0; i<100; i++){
//            rows.push(emptyLine);
//        }
//
//        var left = new Buffer(200*psize).fill(0x0);
//        var right = new Buffer(stride - converted.width * psize - 200 * psize).fill(0x0);
//        for(var i=0; i < iterations; i++){
//            // row does not include the padding!
//            rows.push(Buffer.concat([left, converted.row(i), right]));
//        }
//
//        for(var i=0; i<100; i++){
//            rows.push(emptyLine);
//        }
//        padded = Buffer.concat(rows);
//        var pi = new picha.Image({width:1615, height: 1000, data: padded, pixel: 'rgba'});
//        picha.encodePng(pi, function(error, data){
//            console.log(error);
//            fs.writeFile('./images/padded.png', data, function(err){
//                if(!err){
//                    console.log('Yeah');
//                }
//            });
//        });
//        console.log(padded.length);
//        var pi = new picha.Image({width:1615, height: 800, stride:4848, pixel: 'rgb', data: padded});
//
//    });
//});
/**fs.readFile('./images/theband.jpg', function(err, buffer){
    var img = picha.decode(buffer, function(err, result){
       console.log(result.data.length);
    });
});*/