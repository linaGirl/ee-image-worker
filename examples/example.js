
var   fs             = require('fs')
    , log            = require('ee-log')

var eeImage = require('../');

fs.readFile('../test/resources/band.jpg', function(err, buffer){

    /**
     * Work with an image, the image will update its stats. Please do not try to create concurrent
     * applications at this point of development.
     */

    var image = eeImage.createImage(buffer);
    image.crop(800, 600).scale({width: 400}).pad([0x00], 50).toPng(function(err, result){
        // set the focus
        image.focusOn(new eeImage.engines.AbstractEngine.Focus(50, 50)).scale({width: 200, height: 200}, 'crop').toBuffer('png', function(err, result){
            if(err) return log(err);
            fs.writeFileSync('./band-image.png', result);
        });

    });


    /**
     * Work with a transformation, a transformation is reusable and is applied to a buffer.
     * Probably usable for Batch processing.
     */

    var trans = eeImage.createTransformation();
    trans.crop(800, 600).scale({width: 400, height: 200}, 'crop').pad([0x00], 50).toPng(buffer, function(err, result){
        if(err) return log(err);
        fs.writeFileSync('./band-trans-1.png', result);
    });
    //trans.applyTo(buffer...);

    /**
     * The encoding can be added as a fixed step to the pipeline.
     */
    var trans2 = eeImage.createTransformation();
    trans2.crop(800, 600).scale({width: 400, height: 200}, 'fit').pad([0x00], 50).encode('png');
    trans2.applyTo(buffer, function(err, result){
        if(err) return log(err);
        fs.writeFileSync('./band-trans-2.png', result);
    });
});