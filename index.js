var WorkerImage = require('./lib/WorkerImage'),
    fs          = require('fs'),
    picha       = require('picha'),
    log         = require('ee-log');

module.exports = require('./lib/ImageWorker');

fs.readFile('./images/padded.png', function(err, buffer){
    console.time('convert');
    var wi = new WorkerImage(buffer);
    wi.pad({left:300, color:[0xFF, 0]}).toBuffer('png', function(err, data){
        log(err);
        console.timeEnd('convert');
        fs.writeFile('./images/padded_padded.png', data, function(error){
            log(error);
        });
    });
});

/*function asColor(color, model){
    if(!color.length){
        return null;
    }

    var alpha   = 0xFF,
        index   = color.length - 1;
    // if it has an alpha value, sanitize it
    if(color.length % 2 == 0){
        var oldAlpha = color[index];
        alpha = (oldAlpha <= 1) ? oldAlpha * 0xFF : oldAlpha;
    }
    // mapping between the color models
    var models      = [ 'gray', 'graya', 'rgb', 'rgba' ],
        weights     = { gray: 1, rgb: 2, graya:4, rgba:8 },             // assign a weight to every model
        diff        = weights[model] - weights[models[color.length-1]], // to compute a unique value
        newColor    = color;

    // inappropriate combination, need to convert the target instead of the source
    if( diff < 0 ){
        return null;
    }
    switch(diff){
        case 0:  // already right form
            return color;
        case 1: // gray to rgb
        case 4: // graya to rgba
        case 7: // gray to rgba
            return [color[0], color[0], color[0], alpha];
        case 6: // rgb to rgba
        case 3: // gray to graya
            newColor.push(alpha);
            return newColor;
        default: // unknown case
            return null;
    }
}

function convertColor(color, toModel){
    var targetLength            = {gray: 1, graya: 2, rgb: 3, rgba: 4}[toModel] || 4,
        targetHasAlpha          = (targetLength % 2 == 0),

        colorLength             = color.length,
        colorLast               = colorLength - 1,
        colorHasAlpha           = (colorLength % 2 == 0),
        colorNew                = color,

        diff                    = targetLength - colorLength,
        needConversion          = diff < 0 || (colorHasAlpha && !targetHasAlpha),
        alpha                   = (colorHasAlpha) ? color[colorLast] : 0xFF;

    // not able to convert
    if(needConversion) { return null; }

    // sanitize alpha
    if(targetHasAlpha) {
        alpha = (alpha<=1) ? alpha * 0xFF : 0xFF;
        if(colorHasAlpha){
            colorNew[colorLast] = alpha;
        } else {
            colorNew.push(alpha);
        }
    }
    // already good
    if(diff == 0) { return colorNew; }
    // gray values to rgb
    if(diff>1) {
        colorNew.unshift(colorNew[0]);
        colorNew.unshift(colorNew[0]);
    }

    return colorNew;
}


var colors = {
        rgb: [0xFF, 0x00, 0x00],
        rgba: [0xFF, 0x00, 0x00, 0xCC],
        gray: [0xCC],
        graya: [0xDD, 0xFF]
    },
    models = ['rgb', 'rgba', 'graya', 'gray'];

for(var i=0; i<models.length; i++){
    var color = colors[models[i]];
    for(var j=0; j<models.length; j++){
        var colmod = models[j];
        console.log(convertColor(color, colmod) == asColor(color, colmod));
    }
}

var cc = [],
    ac = [];

console.time('convertColor');
for(var m=0; m<100000; m++){
for(var i=0; i<models.length; i++){
    var color = colors[models[i]];
    for(var j=0; j<models.length; j++){
        var colmod = models[j];
        convertColor(color, colmod);
    }
}
}
console.timeEnd('convertColor');
console.time('asColor');
for(var m=0; m<100000; m++){
for(var i=0; i<models.length; i++){
    var color = colors[models[i]];
    for(var j=0; j<models.length; j++){
        var colmod = models[j];
        asColor(color, colmod);
    }
}
}
console.timeEnd('asColor');*/

/*log(sanitizeColor(rgb, rgb));
log(sanitizeColor(rgb, gray));
log(sanitizeColor(rgb, rgba));
log(sanitizeColor(rgb, graya));*/
