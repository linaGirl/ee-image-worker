var assert  = require('assert');

var WorkerImage = require('../lib/WorkerImage');

describe('WorkerImage', function(){
    var iimg = new WorkerImage();
    iimg.width = 800;
    iimg.height = 600;

    it('should do a proper setup', function(){
        assert.equal(iimg.top, 0);
        assert.equal(iimg.left, 0);
        assert.equal(iimg.width, 800);
        assert.equal(iimg.height, 600);
    });

    it('should update its values on crop', function(){
        iimg.crop({top: 100, left: 200, width: 300, height: 400});

        assert.equal(iimg.top, 100);
        assert.equal(iimg.left, 200);
        assert.equal(iimg.width, 300);
        assert.equal(iimg.height, 400);

        assert.equal(iimg.length, 1);
    });

    it('should update its values on chained actions', function(){
        var img = new WorkerImage();
        img.width  = 800;
        img.height = 600;

        img.crop({top: 100, left: 200, width: 300, height: 400})
            .crop({top:100, left: 50, width: 200, height: 200});

        assert.equal(img.top, 200);
        assert.equal(img.left, 250);
        assert.equal(img.width, 200);
        assert.equal(img.height, 200);

    });

});