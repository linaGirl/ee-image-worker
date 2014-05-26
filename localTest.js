var fs          = require('fs'),
    picha       = require('picha'),
    log         = require('ee-log'),
    cv          = require('opencv');

/*cv.readImage("./images/theband.jpg", function(err, im){
 im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
 for (var i=0;i<faces.length; i++){
 var x = faces[i]
 im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
 }
 im.save('./images/out.jpg');
 });
 })*/
fs.readFile('./images/paddded.jpg', function(err, buffer){
    var wi = new WorkerImage(buffer);
    console.time('convert');
    wi.resize({height: 50, width: 50}).toBuffer('png', function(err, data){
        log(err);
        console.timeEnd('convert');
        fs.writeFile('./images/croppy.png', data, function(error){
            log(error);
        });
    });
});