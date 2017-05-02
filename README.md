# ee-image

[![Greenkeeper badge](https://badges.greenkeeper.io/eventEmitter/ee-image-worker.svg)](https://greenkeeper.io/)

smart, smooth & fast image resizing and cropping

**the library is currently rewritten and under development**

## installation

	npm install ee-image-worker
	
#Usage
U can either create an image or a transformation. An image is basically a transformation bound to data (the original buffer). Instantiate the two using the factory methods:

```Javascript
    var eeImage = require('ee-image-worker');
    var trans = eeImage.createTransformation();
    var image = eeImage.createImage(buffer);
```

Future versions will allow you to inject a processing engine to the factory.

#Basic interface
Both enitities support the following interface (fluent):

##pad(color, left, [ upper ])
Adds padding around the image. The color will be converted to the color format of the image.

   - **color** an array consisting of byte values e.g. `[0x00, 0x00, 0x00]` for rgb black
   - **left** if left is specified as a number it is applied to the left and the right side of the image, left can also be an object of the form {left, right, top, bottom} (then the upper value is ignored)
   - **upper** if upper is specified as a number it is applied to the top and bottom of the image

##crop(width, height, [ offsets ])
Crops the image to width and height.
    - **width** number
    - **height** number
    - **offsets** {top, left, bottom, right} (all are optional, left and top have higher priority)
    
##resize(width, height, [ filter ])
Resizes the image to the specified dimensions.
    - **width** number
    - **height** number
    - **filter** string ('lanczos', 'catmulrom', 'cubic' ... see `picha`)

##scale(dimensions, [ mode ])
Represents specific resizing and cropping actions
    - **dimensions** an object {width: number, height: number} for the default mode (`resize`) you can omit one of them and it is resized proportionally
    - **mode** string, the specific mode
      - _crop_ covers the passed dimensions and crops off overlapping data
      - _fit_ fits the image into the bounds proportionally without removing data
      - _resize_ resizing (proportionally if with or height is omitted)

#Transformations

  - toJpeg(buffer, [options], callback), toPng, toWebp, toTiff (adds a temporary encoding)
  - encode(format, options) this is permanent
  - applyTo(buffer, callback)

#Image

  - toBuffer(format, options, callback)
  - toJpeg([options], callback), toPng, toWebp, toTiff (adds a temporary encoding)
  
#Appendix
The library will be rewritten to support new features.

Focus by default is at the center of the image and will be adjusted according to the chosen strategy.

##Supported image formats
Support depends on the installed libraries

  - jpeg
  - png
  - tiff
  - webp
  
No `.gif` support!

##Error handling
To have a consistent error handling we'll wrap `picha's` errors.

###Unsupported image file
Can be because of an unexpected Buffer format, or a missing library (such as libwebp). We'll probably have to check this
upfront. Introduce error codes to distinguish properly.

##Strategies
We differentiate two image resizing types:

  - `resize(width, height, filter)` applies a change of dimension without taking the image dimensions into account any precomputations
  - `scale(width, height, strategy, options)` applies a change of dimension following a specific strategy. Strategies can be one of the following
    - `resize`  is an ordinary resizing
    - `fit`     scales the image to fit into a bounding box
    - `fill`    scales and crops an image to fill a bounding box
    - `carve`   applies seam carving
    
##Face detection
To detect faces is not as easy as we thought. So i propose a combination of multiple detections (faces and eyes):
First group all faces that somehow intersect (drop all faces that have no intersection, this might kills some good results).