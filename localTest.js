var fs          = require('fs'),
    picha       = require('picha'),
    log         = require('ee-log');

/*cv.readImage("./images/theband.jpg", function(err, im){
 im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
 for (var i=0;i<faces.length; i++){
 var x = faces[i]
 im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
 }
 im.save('./images/out.jpg');
 });
 })*/
var thread = function() {
    fs.readFile('/home/em/pics/2048.jpg', function(err, data) {
        if (err) throw err;
        else {
            picha.decode(data, function(err, image) {
                if (err) throw err;
                else {
                    picha.resize(image, {filter: 'lanczos', width: 1500, height: 1000}, function(err, resizedImage) {
                        var croppedImage;

                        if (err) throw err;
                        else {
                            croppedImage = resizedImage.subView(50, 100, 500, 600);
                            picha.encodeJpeg(croppedImage, {quality: 70}, function(err, img) {
                                if (err) throw err;
                                else {
                                    fs.writeFile('./out.jpg', data, function(err) {
                                        if (err) throw err;
                                        thread();
                                    });
                                }
                            });
                        }
                    }.bind(this));                    
                }
            }.bind(this));
        }
    });
}



var i = 20;
while(i--) thread();