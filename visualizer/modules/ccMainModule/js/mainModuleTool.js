/*mainModuleTool : Contains all the functions regarding the tools in main EditScreen*/

var toggletoolBool = "advance";
var showMessageType= new Object();
showMessageType.RESET=0;
showMessageType.EXPRESS=1;
showMessageType.ADVANCED=2;
showMessageType.IMAGE=3;
showMessageType.SAVE=4;


var eraserType=new Object();
eraserType.CIRCLE_SMALL=0;
eraserType.CIRCLE_MEDIUM=1;
eraserType.CIRCLE_LARGE=2;
eraserType.SQUARE_SMALL=3;
eraserType.SQUARE_MEDIUM=4;
eraserType.SQUARE_LARGE=5
;

var img_array = new Array();
var img_count = 0;

var MainModuleTool = {	
	previousTab:"",
	previousTools:"",
	initialize:function(){
		//initialize chromma tool
		$("#chromatool").slider({
			orientation : "horizontal",
			range : "min",
			max : 62,
			value : 6,
			change:MainModuleTool.updateChromaValue
		});
		$("#chromatool").css("display", "inline-block");
		$("#chromatool").hide();
		
		//initialize shadow tool
		$("#shadowtool").slider({
			orientation : "horizontal",
			range : "min",
			max : 100,
			value :10,
			slide:MainModuleTool.updateLightValue,
			change:MainModuleTool.updateLightValue
		});
		$("#lighttool").hide();
		
		//initialize layer tool
		$("#layertool").load("modules/ccMainModule/template/layerTool.html",function(){
			LayerTool.initialize();
		 });
		
	},
	updateLightValue:function(sender){
		var shadow=$("#shadowtool").slider("option", "value");
		messageObj.addMessage({type:messageType.ChomaShadowFactor,fShadow:shadow});
		ga('create', 'UA-52354973-9', 'auto');
		ga('send', 'event','button','click','shadow slider',1);
	},
	updateChromaValue:function(sender){
		var chroma=$("#chromatool").slider("option", "value")+2;
		messageObj.addMessage({type:messageType.ChromaThreshHold,iThreshHold:chroma});
		ga('create', 'UA-52354973-9', 'auto');
		ga('send', 'event','button','click','Magic Fill Slider',1);
	},
	setInitialTool:function(){
		//tools=["layer","masking","hideMask","brush","eraser","shadow","perspective"];
		//MainModule.enableDisableTools(tools,true);
		Utils.disable($("#autoMask"));
		SpectraTool.toggleSpectraTool("show");
		//MainModuleTool.chroma();
	},
	setVisible:function(selectedTab,tools){
		//set css for selected element tab
		/*if(this.previousTab!="")
			{ 
				if(!this.previousTab.is(selectedTab))
				{
					this.previousTab.removeClass("mainTabSelected");
				}
				else{
					//same tab pressed again. change to default css and hide control
					selectedTab.removeClass("mainTabSelected");
						this.previousTab="";
						if(tools!=null||tools!=undefined)
							{
								tools.hide();
								this.previousTools="";
							}
							
						return;							
				}
			}*/
		if(this.previousTab!="")
		{ 
			if(!this.previousTab.is(selectedTab))
			{
				this.previousTab.removeClass("mainTabSelected");
			}
			else{
				//same tab pressed again. hide/show control
				if(tools!=null||tools!=undefined)
				{
					if(tools.css('display') == 'inline-block'||tools.css('display') == 'block')
						{
							tools.hide();
							this.previousTools="";
							return;
						}
					
				}
			}
		}
		selectedTab.addClass("mainTabSelected");
		this.previousTab=selectedTab;
		
		//set visibility for selected element's tools
		if(this.previousTools!="")
		{
			this.previousTools.hide();
		}
		if(tools!=null||tools!=undefined)
			{
				tools.show();
				this.previousTools=tools;
			}
		else{		
			this.previousTools="";
		}
						
	},
	closeLayerTool:function(){
		$('#layertool').hide();
		$('#layer').removeClass("mainTabSelected");
		this.previousTab="";
		this.previousTools="";
	},
	
	addLayer:function(){
		
	},	
	// layer implementation
	layer : function(sender) {
		this.setVisible($('#layer'),$("#layertool"));
	},
	
	// Chroma Implementation
	chroma : function() {
		this.setVisible($('#chroma'),$("#chromatool"));	
		//$("#glcanvas").css({"cursor": "url(assets/cursor/magic_fill.cur) 8 20, default"});
		$("#glcanvas").css({"cursor": "url(assets/cursor/magicfill.cur) , default"});
		messageObj.addMessage({type:messageType.SwitchToChroma});
	},
	
	// Masking Implementation
	masking : function() {
		messageObj.addMessage({type:messageType.SwitchToMasking});
		$("#glcanvas").css({"cursor": "url(assets/cursor/mask.cur) 16 16, default"});
		this.setVisible($('#masking'),$("#maskingtool"));
	},
	
	// AutoMask Implementation
	autoMask : function() {
		messageObj.addMessage({type:messageType.SwitchAutoComplete});
		this.setVisible($('#autoMask'));
	},
	hideMask:function(){
		//change css of previously selected tab
		if(this.previousTab!=""){
			this.previousTab.removeClass("mainTabSelected");
			this.previousTab="";
		}
		//hide previously selected
		if(this.previousTools!=""){
			this.previousTools.hide();
			this.previousTools="";
		}		
	
		if($('#hideMask').html()=="HIDE MASK"){
			$('#hideMask').html("SHOW MASK");
		}			
		else
			$('#hideMask').html("HIDE MASK");
		messageObj.addMessage({type:messageType.ToggleMask});
		
		 //adjust margins(because change in width due to changing text)
		 $('#brushtool').css("margin-left",($("#brush")[0].offsetLeft-$("#mainContainer")[0].offsetLeft-25+"px"));
		 $('#erasertool').css("margin-left",($("#eraser")[0].offsetLeft-$("#mainContainer")[0].offsetLeft-23+"px"));
		 $('#shadowtool').css("margin-left",($("#shadow")[0].offsetLeft-$("#mainContainer")[0].offsetLeft+5+"px"));
	}, 
	
	// Brush Implementation
	brush : function() {
		this.setVisible($('#brush'),$("#brushtool"));
		messageObj.addMessage({type:messageType.SwitchToBrush});
	},
	
	// Eraser Implementation
	eraser : function() {
		this.setVisible($('#eraser'),$("#erasertool"));
		messageObj.addMessage({type:messageType.SwitchToEraser});
	},
	// perspective Implementation
	perspective:function(){
		this.setVisible($('#perspective'));
		$("#glcanvas").css("cursor", "url(assets/cursor/perspective_correction.cur), default");
		messageObj.addMessage({type:messageType.SwitchToPerspective});
	},
	
	// shadow Implementation
	shadow : function() {
		this.setVisible($('#shadow'),$("#shadowtool"));
	},
	
	// Reset Implementation
	reset : function() {
		//this.setVisible($('#reset'));
		//show popup to confirm
		this.showMessage(showMessageType.RESET);
	},
	
	// FreeForm and Straightline masking implementation
	subMasking : function(masktype) {
		$("#maskingtool").hide();
		//$('#masking').removeClass("mainTabSelected");
		//this.previousTab="";
		//this.previousTools="";
		switch (masktype) {
		case "straightline": {
			// perform WebGl function
			messageObj.addMessage({type:messageType.MaskPolyLine});
			console.log("straightline");
		}
			break;
		case "freeform": {
			// perform WebGl Function
			messageObj.addMessage({type:messageType.MaskFreeHand });
			console.log("freeform");
		}
			break;
		default: {

		}
		}
	},
	
	// All brush size Implementation
	subBrush : function(brushtype) {
		$("#brushtool").hide();
		//$('#brush').removeClass("mainTabSelected");
		//this.previousTab="";
		//this.previousTools="";
		switch (brushtype) {
		case "squareLargeBrush": {
			// perform WebGl function
			messageObj.addMessage({type:messageType.BrushSquareSize3});
			$("#glcanvas").css("cursor", "url(assets/cursor/square_brush.cur), default");
			//$("#glcanvas").css("cursor", "url(assets/cursor/b-square.cur), default");
			console.log("squareLargeBrush");
		}
			break;
		case "squareMediumBrush": {
			// perform WebGl Function
			messageObj.addMessage({type:messageType.BrushSquareSize2});
			$("#glcanvas").css("cursor", "url(assets/cursor/square_brush.cur), default");
			//$("#glcanvas").css("cursor", "url(assets/cursor/m-square.cur), default");
			console.log("squareMediumBrush");
		}
			break;
		case "squareSmallBrush": {
			// perform WebGl function
			messageObj.addMessage({type:messageType.BrushSquareSize1});
			$("#glcanvas").css("cursor", "url(assets/cursor/square_brush.cur), default");
			//$("#glcanvas").css("cursor", "url(assets/cursor/s-square.cur), default");
			console.log("squareSmallBrush");
		}
			break;
		case "circleLargeBrush": {
			// perform WebGl Function
			messageObj.addMessage({type:messageType.BrushSize3});
			$("#glcanvas").css("cursor", "url(assets/cursor/circular_brush.cur), default");
			//$("#glcanvas").css("cursor", "url(assets/cursor/b-circle.cur), default");
			console.log("circleLargeBrush");
		}
			break;
		case "circleMediumBrush": {
			// perform WebGl function
			messageObj.addMessage({type:messageType.BrushSize2});
			$("#glcanvas").css("cursor", "url(assets/cursor/circular_brush.cur), default");
			//$("#glcanvas").css("cursor", "url(assets/cursor/m-circle.cur), default");
			console.log("cirlcleMediumBrush");
		}
			break;
		case "circleSmallBrush": {
			// perform WebGl Function
			messageObj.addMessage({type:messageType.BrushSize1});
			$("#glcanvas").css("cursor", "url(assets/cursor/circular_brush.cur), default");
			//$("#glcanvas").css("cursor", "url(assets/cursor/s-circle.cur), default");
			console.log("circleSmallBrush");
		}
			break;
		default: {

		}
		}
	},
	// All Eraser size Implementation
	subEraser : function(type) {
		if(type!=null||type!=undefined)
			{
			//hide eraser tool
			$("#erasertool").hide();
			//$('#eraser').removeClass("mainTabSelected");
			//this.previousTab="";
			//this.previousTools="";
			switch (type) {
					case eraserType.SQUARE_LARGE: {
						// perform WebGl function
						messageObj.addMessage({type:messageType.EraserSquareSize3});
						$("#glcanvas").css("cursor", "url(assets/cursor/square_eraser.cur), default");
						//$("#glcanvas").css("cursor", "url(assets/cursor/b-square.cur), default");
					}
						break;
					case eraserType.SQUARE_MEDIUM: {
						// perform WebGl Function
						messageObj.addMessage({type:messageType.EraserSquareSize2});
						$("#glcanvas").css("cursor", "url(assets/cursor/square_eraser.cur), default");
						//$("#glcanvas").css("cursor", "url(assets/cursor/m-square.cur), default");
					}
						break;
					case eraserType.SQUARE_SMALL: {
						// perform WebGl function
						messageObj.addMessage({type:messageType.EraserSquareSize1});
						$("#glcanvas").css("cursor", "url(assets/cursor/square_eraser.cur), default");
						//$("#glcanvas").css("cursor", "url(assets/cursor/s-square.cur), default");
					}
						break;
					case eraserType.CIRCLE_LARGE: {
						// perform WebGl Function
						messageObj.addMessage({type:messageType.EraserSize3});
						$("#glcanvas").css("cursor", "url(assets/cursor/circular_eraser.cur), default");
						//$("#glcanvas").css("cursor", "url(assets/cursor/b-circle.cur), default");
					}
						break;
					case eraserType.CIRCLE_MEDIUM: {
						// perform WebGl function
						messageObj.addMessage({type:messageType.EraserSize2});
						$("#glcanvas").css("cursor", "url(assets/cursor/circular_eraser.cur), default");
						//$("#glcanvas").css("cursor", "url(assets/cursor/m-circle.cur), default");
					}
						break;
					case eraserType.CIRCLE_SMALL: {
						// perform WebGl Function
						messageObj.addMessage({type:messageType.EraserSize1});
						$("#glcanvas").css("cursor", "url(assets/cursor/circular_eraser.cur), default");
						//$("#glcanvas").css("cursor", "url(assets/cursor/s-circle.cur), default");
					}
						break;
					default: {
		
					}
			}
			
			}
	},
	
	// Day View Implementation
	subdayView : function() {
		// perform WebGl Function
		$("#dayviewtool").hide();
		//$('#dayView').removeClass("mainTabSelected");
		this.previousTab="";
		this.previousTools="";
		console.log("day View");
	},
	saveImage:function(image_data, img_height, img_width, img_complete){
	   console.log(image_data);
		// Create a 2D canvas to store the result 
	    var img_canvas = document.createElement('canvas');
	    img_canvas.width = img_width;	//$("#glcanvas").width;
	    img_canvas.height = img_height;	//$("#glcanvas").height;
	    var img_context = img_canvas.getContext('2d');
	    //var buffer=new Array();
	    // Copy the pixels to a 2D canvas
	    var imageData = img_context.createImageData(img_canvas.width, img_canvas.height);
		console.log(image_data.length);
		var len = image_data.length;
		
       // imageData.data.set(image_data);	
         for(var i=0;i<image_data.length;i++)
		 {
		    imageData.data[i]=image_data[i];
		 }
   		// TODO: need to set this parameter										
	    img_context.putImageData(imageData, 0, 0);
	    
	    var img_type = "image/jpeg";
	    var jpeg_img = img_canvas.toDataURL(img_type);					//Returns a data: URL containing a representation of the image
	    // Saving jpeg base64 image data for before after report
	    if(beforeAfter.isAfterImage){
	    	beforeAfter.afterImage = jpeg_img;
	    	beforeAfter.isAfterImage = false;
	    	return;
	    }
	    
	    //var strDownloadMime = "image/octet-stream";
	   // var strData = jpeg_img.replace(img_type, strDownloadMime);
	   // var currentWindow=window.self;
//	    var saveWindow=window.open();
	    //currentWindow.location.href = strData;
	    //save image on client side
		$('#saveimganchor').remove();
	    MainModuleTool.saveImageOnBrowsers(jpeg_img);
	    
//	    currentWindow.focus();
//		setTimeout(function(){
//			var isSavePDF=document.getElementById("saveAsPdfCheckbox").checked;
			//check to save pdf
//			if(isSavePDF){
				
//				initPDF();
//			}
//			saveWindow.close();},10);
	} ,
	
	savePrecutImages:function(image_data, img_height, img_width, img_complete) 
	{
		// Create a 2D canvas to store the result 
	    var img_canvas = document.createElement('canvas');
	    img_canvas.width = img_width;	//$("#glcanvas").width;
	    img_canvas.height = img_height;	//$("#glcanvas").height;
	    var img_context = img_canvas.getContext('2d');
	    
	    // Copy the pixels to a 2D canvas
	    var imageData = img_context.createImageData(img_canvas.width, img_canvas.height);
	   // imageData.data.set(image_data);						// TODO: need to set this parameter		
	    
	    for(var i=0;i<image_data.length;i++)
		 {
		    imageData.data[i]=image_data[i];
		 }
	    img_context.putImageData(imageData, 0, 0);
	    
	    var img_type = "image/jpeg";
	    var jpeg_img = img_canvas.toDataURL(img_type);					//Returns a data: URL containing a representation of the image
	    
	    var strDownloadMime = "image/octet-stream";
	    jpeg_img.replace(img_type, strDownloadMime);
	    
	    var savable = new Image();
	    savable.src = img_canvas.toDataURL();
	    img_array[img_count++] =savable.src.substr(savable.src.indexOf(',')+1);
	    
	    // Flag to Check the last layer
	    if (img_complete)
	    {
		   
			var zip=new JSZip();
			for(var x=0;x<img_array.length;x++){
				if(x==0){
					zip.file("base.jpg",img_array[x], {base64: true} );
				}
				else{
					 zip.file("layer"+(x-1)+".jpg",img_array[x], {base64: true} );
				}
					
			}
			
			//save layer data in a text file
			 var data=[];
			 var layersData=LayerTool.vm.layers();
		    	for(var x=0;x<layersData.length;x++){
		    		var layer={};
		    		layer.colors=layersData[x].colors();
		    		layer.name=layersData[x].name();
		    		layer.coats=layersData[x].coats();
		    		layer.images=layersData[x].images();
		    	 data.push({"layer":layer});	
		    	}
			zip.file("data.txt",JSON.stringify(data));

	        content = zip.generate();        
	        location.href="data:application/zip;base64,"+content;
	    }
	    
	},	
	// main Edit Screen Popup Implementation
	showMessage : function(type) {
		Utils.showOverlay();
		switch (type) {
		case showMessageType.RESET: {
			$("#positiveResponse").attr("src", "assets/images/ok.png");
			$("#negativeResponse").attr("src", "assets/images/cancel.png");
			$('#popuptext').text("Do you want to reset all the changes?");
			$("#popup").show();
		}
			break;
		case showMessageType.EXPRESS: {
			$("#positiveResponse").attr("src", "assets/images/yes.png");
			$("#negativeResponse").attr("src", "assets/images/no.png");
			$('#popuptext').text("Switch to Express mode?");
			$("#popup").show();
		}
			break;
		case showMessageType.ADVANCED: {
			$("#positiveResponse").attr("src", "assets/images/yes.png");
			$("#negativeResponse").attr("src", "assets/images/no.png");
			$('#popuptext').text("Switch to Advanced mode?");
			$("#popup").show();
		}
		    break;
		case showMessageType.IMAGE: {
			$('#imageChangePopupText').text("All the changes made will be lost. Are you sure you want to select another image?");
			$("#imageChangePopup").show();
		}
			break;    
		case showMessageType.SAVE: {
			$("#positiveResponse").attr("src", "assets/images/yes.png");
			$("#positiveResponse").attr("data-save", "yes");
			$("#negativeResponse").attr("src", "assets/images/no.png");
			$('#popuptext').text("Do you want to save this image?");
			$("#popup").show();
		}
			break;    
		default: {

		}
		}
	},
	
	//image save on diffrent browsers
	saveImageOnBrowsers:function(Base64ImageData)
	{
		
		//check for IE and Other Browser
		 
        
	     
			  
			 if (navigator.userAgent.indexOf('Firefox') != -1 && parseFloat(navigator.userAgent.substring(navigator.userAgent.indexOf('Firefox') + 8)) >= 3.6){//Firefox
                  $('body').append("<a href="+Base64ImageData+" id='saveimganchor'  style='display:none' download = 'Asianpaints.png' >download image</a>")
				  $('#saveimganchor')[0].click();
             }else if (navigator.userAgent.indexOf('Chrome') != -1 && parseFloat(navigator.userAgent.substring(navigator.userAgent.indexOf('Chrome') + 7).split(' ')[0]) >= 15){//Chrome
                  $('body').append("<a href="+Base64ImageData+" id='saveimganchor'  style='display:none' download = 'Asianpaints.png' >download image</a>");
				  $('#saveimganchor')[0].click();
             }else if(navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Version') != -1 && parseFloat(navigator.userAgent.substring(navigator.userAgent.indexOf('Version') + 8).split(' ')[0]) >= 5){
			 
			$('body').append("<a href="+Base64ImageData+" id='saveimganchor'  style='display:none' target='_blank'>download image</a>");

             $('#saveimganchor')[0].click();
			  
             }else{
			 
              var win = window.open();
              var img = Base64ImageData ;

              win.document.body.innerHTML= "<img src='" + img + "'></img>" // With correct delimiters
              win.document.close()
              setTimeout('win.document.execCommand("SaveAs")', 1000);
			  
             }
			  
		
	}
	

};