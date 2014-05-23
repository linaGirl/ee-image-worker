var WorkerImage = require('./lib/WorkerImage'),
    fs          = require('fs'),
    picha       = require('picha'),
    log         = require('ee-log');

module.exports = require('./lib/ImageWorker');

fs.readFile('./images/padded.png', function(err, buffer){
    var wi = new WorkerImage(buffer);
    wi.resize({height: 300, width: 2400, background: [0xFF, 0x00, 0x00, 0x00], mode: 'fit'}).toBuffer('png', function(err, data){
        log(err);
        console.timeEnd('convert');
        fs.writeFile('./images/padded_padded.png', data, function(error){
            log(error);
        });
    });
});