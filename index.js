var WorkerImage = require('./lib/WorkerImage'),
    fs          = require('fs'),
    picha       = require('picha'),
    log         = require('ee-log');

module.exports = require('./lib/ImageWorker');

fs.readFile('./images/padded.png', function(err, buffer){
    var wi = new WorkerImage(buffer);
    wi.pad({left:30, color:[0xFF, 0x00, 0x00]}).toBuffer('png', function(err, data){
        log(err);
        fs.writeFile('./images/padded_padded.png', data, function(error){
            log(error);
        });
    });
});