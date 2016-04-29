
//render_Image : Parameter is the Array of Image data. (i.e. rendererClass.arr_ssImg)

var saveFile = function() 
{
	// Create a 2D canvas to store the result 
    var img_canvas = document.createElement('canvas');
    img_canvas.width = offscreen_rrt_fbo.width;
    img_canvas.height = offscreen_rrt_fbo.height;
    var img_context = img_canvas.getContext('2d');
    
    // Copy the pixels to a 2D canvas
    var imageData = img_context.createImageData(offscreen_rrt_fbo.width, offscreen_rrt_fbo.height);
    imageData.data.set(render_Image);// TODO: need to set this parameter										
    img_context.putImageData(imageData, 0, 0);
    
    var img = new Image();
    img.src = img_canvas.toDataURL();
    
    var img_type = "image/jpeg";
    var jpeg_img = img_canvas.toDataURL(img_type);					//Returns a data: URL containing a representation of the image
    
    var strDownloadMime = "image/octet-stream";
    
    var strData = jpeg_img.replace(img_type, strDownloadMime);
	document.location.href = strData;
}
