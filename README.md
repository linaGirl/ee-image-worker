# ee-image

smart, smooth & fast image resizing and cropping with face detection

## installation

	npm install ee-image


## build status

[![Build Status](https://travis-ci.org/eventEmitter/ee-image.png?branch=master)](https://travis-ci.org/eventEmitter/ee-image)


## usage

Initializing the Worker Pool


	var ImageWorker = require('ee-image-worker');


	/**
	 * new ImageWorker() returns an image worker poll instance
	 *
	 * @param <Number> worker, optional, defaults to 10, the number of parallel image workers to run
	 * @param <Number> queue, optional, defaults to 1000, the number of jobs that are waiting 
	 * 				   before starting to fail
	 * @param <String> filter, options, defaults to «lanczos», the filter to use for resizing
	 */
	var workers = new ImageWorker({
		  workers: 	10
		, queue: 	1000
		, filter: 	'lanczos'
	});



Loading an Image

	/**
	 * the loadImage() method returns an new Image instance
	 * Arguments passed to this method can be in any order.
	 *
	 * @param <Buffer> image, raw jpeg / png data
	 * @param <Array> faces, optional, array conataining the faces on the image
	 * @param <String> filter, options, defaults to the value set on the ImageWorker class
	 */
	var image = workers.loadImage(image, faces, filter);


Cropping

	/**
	 * the crop() method returns the reference to the image instance( support for method chaining )
	 * the crop method does not execute immediately, the command gets executed when the «toBuffer»
	 * is called
	 *
	 * @param <Number> top, optional, defaults to 0
	 * @param <Number> left, optional, defaults to 0
	 * @param <Number> height, optional, defaults to image.height
	 * @param <Number> width, optional, defaults to image.width
	 */
	image.crop({
		  top: 70
		, left: 50
		, height: 300
		, width: 400
	});


Resizing

	/**
	 * the resize() method returns the reference to the image instance( support for method chaining )
	 * the resize method does not execute immediately, the command gets executed when the «toBuffer»
	 * is called
	 *
	 * @param <Number> height, optional, defaults to image.height
	 * @param <Number> width, optional, defaults to image.width
	 * @param <String> mode, optional, defaults to face if facedata was passed to the «loadImage»
	 * 				   or crop when there is no face data. 
	 * 				   fit: 	the image is fitted inside a frame, so that there will be transparent 
	 * 							pixels on top & the bottom or on both sides
	 * 				   crop: 	pixels are removed either on top & the bottom or on both sides of 
	 * 							the image
	 * 				   distort: the image is ditortet into the box
	 * 				   face: 	first faces will be detect if no faces were passed to the «loadImage»
	 * 							method, then the image will be cropped at the optimal position so 
	 * 							that the most relevant parts of the images will be on the new image 
	 */
	image.resize({
		  height: 	1000
		, width: 	300
		, mode: 	"fit|crop|distort|face"
	});


Image Stats

	/**
	 * the stat() method returns the image dimensions and additional availabel image meta data
	 */
	image.stat();


Face Detection

	/**
	 * the faces() method returns the reference to the image instance( support for method chaining )
	 * it executes face detection on the image, but only if no face data was passed to the 
	 * «loadImage» method and no prior call to the «faces» method was done.
	 * if the faces method is called more than once all succesive calls will either return the 
	 * cached data or wait until the first call to the «faces» method was executed.
	 *
	 * @param <Function> callback, function(err, faces){}, err = Error, faces = Array
	 */
	image.faces(callback);


Encode Image

	/**
	 * the toBuffer() method returns the reference to the image instance( support for method 
	 * chaining ). it executes all cached commands and calls the callback when finished.
	 * Arguments passed to this method can be in any order.
	 *
	 * @param <String> format, optional, defaults to «jpp», can be one of «png» and «jpg» 
	 * @param <Number> format, optional, defaults to 75, the jpeg quality
	 * @param <Function> callback, function(err, newImage, faces){} err = Error, newImage = buffer, 
	 * 				     faces = Array, faces is only present if face detection was used.
	 */
	image.toBuffer(format, quality, callback);