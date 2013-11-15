var WorkerImage = require('./lib/WorkerImage'),
    fs          = require('fs');

module.exports = require('./lib/ImageWorker');


//fs.readFile('./images/theband.jpg', function(err, buffer){
//    console.log(err);
//    var img = new WorkerImage(buffer);
//    console.log(img.stat());
//
//});