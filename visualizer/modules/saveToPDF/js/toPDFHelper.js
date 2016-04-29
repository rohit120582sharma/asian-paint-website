/**
 * Converts an image to
 * a base64 string.
 * 
 * If you want to use the 
 * outputFormat or quality param
 * I strongly recommend you read the docs 
 * @ mozilla for `canvas.toDataURL()`
 * 
 * @param 	{String} 	url
 * @param 	{Function}	callback
 * @param 	{String}	[outputFormat='image/png']
 * @param 	{Float}   	[quality=0.0 to 1.0]
 * @url 	https://gist.github.com/HaNdTriX/7704632/
 * @docs 	https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement#Methods
 * @author 	HaNdTriX
 * @example
 * 			imgToDataURL('http://goo.gl/AOxHAL', function(err, base64Img){
 * 				console.log('IMAGE:',base64Img);
 * 			})
 */
function imgToDataURL(url, callback, outputFormat, quality, index) {
	var canvas = document.createElement('CANVAS'),
		ctx = canvas.getContext('2d'),
		img = new Image();
		img.crossOrigin = '';
		img.onload = function() {
			var dataURL;
			canvas.height = img.height;
			canvas.width = img.width;
			try {
			    ctx.fillStyle = "white";
	            ctx.fillRect(0, 0, img.width, img.height);
				ctx.drawImage(img, 0, 0);
				
				dataURL = canvas.toDataURL(outputFormat, quality);//.slice('data:image/jpeg;base64,'.length);
				if(index){
					callback(null, dataURL, index, img.height, img.width);
				}else{
					callback(null, dataURL, img.height, img.width);
				}
				
			} catch (e) {
				callback(e, null);
			}
		canvas = img = null;
		};
		img.onerror = function() {
			callback(new Error('Could not load image'), null);
		};
		//		if(url.indexOf("data:image/jpeg;base64") > -1){
		//		callback(null, url, index);
		//	}else{
		img.src = url;
		//	}
		
}


/**
 * Create a PDF doc for given layers data
 * 
 * @param 	{Object} 	layersData
 * @param	{string}	before image url
 * @param 	{Function}	callback
 * @author 	Aviral
 * @example
 * 			createPDF({Layers}, success, error)
 */

function initPDF(){
	
	beforeAfter.isAfterImage = true;
	messageObj.addMessage({type:messageType.TakeScreenshot,b_setScreenShot:false});
	
	 var data=[];
	 var thumbnail = 0;
	 var layersData=LayerTool.vm.layers();
    	for(var x=0;x<layersData.length;x++){
    		var layer={};
    		layer.colors=layersData[x].colors();
    		layer.images=layersData[x].images();
    		
    		if(layer.images.thumbnail) thumbnail++;
    		data.push({"layer":layer});	
    	}
    	
    	for(var i=0; i<beforeAfter.wallfashion.length; i++){
    		thumbnail++;
    		data.push({"layer" : {"images": {
    			"thumbnail" : beforeAfter.wallfashion[i].wallFashionImage,
    			"name" : beforeAfter.wallfashion[i].name,
    			
    		}},"wallfashion" : "Wallfashion "+ (i+1)})
    		
    	}
    	
    	var textures = 0;
    	if(thumbnail > 0){
    		for(var j=0; j<data.length; j++){
        		if(data[j].layer.images && data[j].layer.images.thumbnail){
        			var index = j+1;
        			imgToDataURL(data[j].layer.images.thumbnail, function(error, texture, index){
        				data[index-1].layer.images.thumbnail = texture;
        				textures++;
        				if(textures === thumbnail){
        					imgToDataURL("assets/images/pdf/logo.png", function(error, image){
        						beforeAfter.APLogo = image;
        						imgToDataURL("assets/images/pdf/splash.jpg", function(error, image){
        							beforeAfter.splash = image;
        							imgToDataURL("assets/images/pdf/ribbon.jpg", function(error, image){
        								beforeAfter.ribbon = image;
        								createPDF(data);
        							}, 'image/jpeg', 1.0);
        						}, 'image/jpeg', 1.0);
        					}, 'image/jpeg', 1.0);  
        				}
        			}, 'image/jpeg', 1.0, index);
        		}
        	}
    	}else{
    		imgToDataURL("assets/images/pdf/logo.png", function(error, image){
				beforeAfter.APLogo = image;
				imgToDataURL("assets/images/pdf/splash.jpg", function(error, image){
					beforeAfter.splash = image;
					imgToDataURL("assets/images/pdf/ribbon.jpg", function(error, image){
						beforeAfter.ribbon = image;
						createPDF(data);
					}, 'image/jpeg', 1.0);
				}, 'image/jpeg', 1.0);
			}, 'image/jpeg', 1.0);    		
    	}
    	
    		
	
		
	
}

function createPDF(data){
	ga('create', 'UA-52354973-9', 'auto');
	ga('send', 'event','button','click','Save PDF',1);
	ga('send', 'pageview',{'page': '/savePDF','title': 'Save PDF'});
	
	var doc = new jsPDF();
	doc.addImage(beforeAfter.APLogo, 'JPEG', 15, 10, 60, 30);

	// Top right colour splash
	doc.addImage(beforeAfter.splash, 'JPEG', 105, 0, 105, 65);
	
	var before_x, before_y, before_width;
	before_width = (beforeAfter.beforeImageWidth * 100) / beforeAfter.beforeImageHeight;
	before_x = (210 - before_width)/2;
	
	// Before Ribbon
	doc.addImage(beforeAfter.ribbon, 'JPEG', before_x, 55, 30, 10);
	doc.setTextColor(255,255,255);
	doc.text(before_x + 2, 62, 'Before');
	
//	doc.addImage(beforeAfter.beforeImage, 'JPEG', 15, 65, 180, 100);
	doc.addImage(beforeAfter.beforeImage, 'JPEG', before_x, 65, before_width, 100);

	//After ribbon
	doc.addImage(beforeAfter.ribbon, 'JPEG', before_x, 170, 30, 10);
	doc.setTextColor(255,255,255);
	doc.text(before_x + 2, 177, 'After');
	// After Image
	doc.addImage(beforeAfter.afterImage, 'JPEG', before_x, 180, before_width, 100);
	
	// Footer text
	doc.setDrawColor(190,190,190);
	doc.line(15, 285, 195, 285); // horizontal line

	doc.setTextColor(190,190,190);
	doc.setFontSize(10);
	doc.text(15, 292, 'Note: The Colour Shades displayed in this report are indicative and not precise representations of actual paint colours');

	
	
	doc.addPage();
	// Second Page
	doc.addImage(beforeAfter.APLogo, 'JPEG', 15, 10, 60, 30);
	doc.addImage(beforeAfter.splash, 'JPEG', 105, 0, 105, 65);

	doc.addImage(beforeAfter.ribbon, 'JPEG', 15, 55, 30, 10);
	doc.setTextColor(255,255,255);
	doc.text(17, 62, 'Details');
    
    
    // Creating layers
	for(var i=0; i<data.length; i++){
		console.log("data");
		var x = 15 + i*61;
		var y = 65;
		
		if(i > 2){
			x = 15 + 61*((i%3));
			y = 65 + 40*(Math.floor(i/3));
		}
		doc.setDrawColor(190,190,190);
		doc.rect(x, y, 58, 35); 
		
		doc.setTextColor(0,0,0);
		if(data[i].wallfashion){
			doc.text(x+30, y+15, data[i].wallfashion)
		}else{
			doc.text(x+30, y+15, 'Layer ' + (i+1))
		}
	    
		
		if(data[i].layer.images && data[i].layer.images.thumbnail){
			doc.addImage(data[i].layer.images.thumbnail, 'JPEG', x+3, y+2, 15, 18);
		}
	    if(data[i].layer.colors){
	    	for(var j=0; j<data[i].layer.colors.length; j++){
				doc.setDrawColor(255,255,255);
				var fillColor = hexToRgb(data[i].layer.colors[j].color)
			    doc.setFillColor(fillColor.r,fillColor.g,fillColor.b);
				var y = 87 + 5*j;
				if(i > 2){
					y = 87 + 40*(Math.floor(i/3)) + 5*j;
				}
			    doc.circle(x+9, y, 2, 'FD');
			    doc.setFontSize(9);
			    doc.text(x+13, y+1, data[i].layer.colors[j].colorCode);
			}
	    }
		
		
	}
    
	// Footer text
	doc.setDrawColor(190,190,190);
	doc.line(15, 285, 195, 285); // horizontal line

	doc.setTextColor(190,190,190);
	doc.setFontSize(10);
	doc.text(15, 292, 'Note: The Colour Shades displayed in this report are indicative and not precise representations of actual paint colours');
	
	doc.save( 'download.pdf');
	
}


function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}