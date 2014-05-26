var fs          = require('fs'),
    picha       = require('picha'),
    log         = require('ee-log'),
    cv          = require('opencv'),
    WorkerImage = require('./lib/WorkerImage');

/*cv.readImage("./images/theband.jpg", function(err, im){
 im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
 for (var i=0;i<faces.length; i++){
 var x = faces[i]
 im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
 }
 im.save('./images/out.jpg');
 });
 })*/
fs.readFile('./images/pancelo.png', function(err, buffer){
    var wi = new WorkerImage(buffer);
    console.time('convert');
    wi.resize({height: '207', width: '40', mode: 'crop'}).toBuffer(function(err, data){
        console.timeEnd('convert');
        fs.writeFile('./images/vergissedernamenid.png', data, function(error){
            log(error);
        });
    });
});