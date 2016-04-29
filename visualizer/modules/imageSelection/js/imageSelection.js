
var ImageSelection={
	
	 //private variables
	 imageFile:"", //variable to store image file value
	 precutImages:[],
	 isUserPrecut:false, 
	 
	/* function to show slider */
	initialize:function()
	{
		$("#imageSelectionScreen").load("modules/imageSelection/template/imageSelection.html",function(){
			document.getElementById('ImageFileUpload').addEventListener('change', ImageSelection.handleFileSelect, false);
			document.getElementById('ImageFileUpload').addEventListener('click', ImageSelection.blurFileSelect, false);
			document.getElementById('precutFileUpload').addEventListener('change', ImageSelection.handlePrecutSelect, false);
			/*document.getElementById('precutFileUpload').addEventListener('change', ImageSelection.handlePrecutSelect, false);*/
			$(".urlUploadContainer").on("click", ImageSelection.toggeleUrlInput);
			$(".goBtn").on("click", ImageSelection.uploadFromURL);
			
			
			$("#about").on("click", ImageSelection.toggleAbout);
			$("#tnc").on("click", ImageSelection.toggleAbout);
			$(".closeBtn").on("click", ImageSelection.toggleAbout);
			//InspirationWall.initialize();
		 });
		if(!localStorage.isHelpShown){
			//Help.showHelpScreens("imageSelection");
		}
	},
	
	toggleAbout: function(event){
		ga('create', 'UA-52354973-9', 'auto');
		ga('send', 'event','button','click','About',1);
		ga('send', 'pageview',{'page': '/about','title': 'About'});
		Utils.showOverlay();
		var temp=$(event.target).text().toLowerCase();
		if($("#aboutTncPopup").is(":visible")){
			Utils.hideOverlay();
			$("#aboutTncPopup").hide();
			
		}else{
			if($(event.target).text().toLowerCase() == "about"){
				$("#aboutTncPopup").show();
				$("#aboutTncPopup .about").show();
				$("#aboutTncPopup .termsAndCondition").hide();
			}else if($(event.target).text().toLowerCase() == "terms & conditions"){
				$("#aboutTncPopup .about").hide();
				$("#aboutTncPopup .termsAndCondition").show();
				$("#aboutTncPopup").show();
			}else{
				Utils.hideOverlay();
				$("#aboutTncPopup").hide();
			}
		}

		
	},
	
	toggeleUrlInput : function(event){
		$(".urlFileUpload").blur();
		if($(".urlContainer").css("visibility") == "visible"){
			$(".urlContainer").css("visibility", "hidden");
		}else{
			$(".urlContainer").css("visibility", "visible");
			$(".urlInput").focus();
		}
		
	},
	uploadFromURL: function(event){
		var url = $(".urlBox input").val();
		if(!url) return;
		
		if(url.match(/\.(jpeg|jpg|gif|png)$/) != null){
			Utils.showLoader();
			var image=new Image();
			image.name=name;
            image.onload=function(){
            	Utils.hideLoader();
            	ImageSelection.handleURLInput(url);
            };
            image.onerror = function(){
            	Utils.hideLoader();
            	alert("Image could not be uploaded.Invalid URL");
            }
            image.src=url;
			
		}else{
			alert("Image could not be uploaded.Format not supported(jpeg, png & bmp only)");
		}
		
		
	},
	handlePrecutSelect:function(sender){
		var files = sender.target.files;
	      for (var i = 0, f; f = files[i]; i++) {

	        if (f.type !== "application/zip") {
	         console.log("error");
	        }
	        var reader = new FileReader();

	        // Closure to capture the file information.
	        reader.onload = (function(theFile) {
	          return function(e) {
	            try {

	              // read the content of the file with JSZip
	              var zip = new JSZip(e.target.result);
	              var baseImage=zip.file(/BASE_IMAGE/);
	              if(baseImage.length>0){
	            	  //Asian Paints precut
	            	  ImageSelection.isUserPrecut=false;
	            	  
	            	  //find and load base image
	            	  var base=Utils.getMatchingObject(baseImage,"BASE_IMAGE.jpg"); 
	            	  ImageSelection.precutImages.push({"name":base.name,"data":Utils.getBase64EncodedData(base.asBinary())});
	            	  
	            	  //find and load layer images
	            	  var layers=zip.file(/Layer_/);
	            	  var count=0;
	            	  var layerImage;
	            	  do{
	            		  //layerImage=null;
	            		  layerImage= Utils.getMatchingObject(layers,"Layer_"+count+".png")
	            		  if(layerImage!=undefined){
	            			  ImageSelection.precutImages.push({"name":layerImage.name,"data":Utils.getBase64EncodedData(layerImage.asBinary())});
	            		  }
	            		  
	            		  count++;
	            	  }while(layerImage!=undefined)
	            	LayerTool.initializePrecut(ImageSelection.precutImages.length,false);  
	              }
	              else{
	            	  	baseImage=zip.file(/base.jpg/);
	            	  	if(baseImage.length>0){
			            	  //user precut
	            	  		  ImageSelection.isUserPrecut=true;
			            	  $.each(zip.files, function (index, zipEntry) {
				            	  if(zipEntry.name!="data.txt"){
				            		  ImageSelection.precutImages.push({"name":zipEntry.name,"data":Utils.getBase64EncodedData(zipEntry.asBinary())}); 
				            	  }
				            	  else{
				            		  
				            		  LayerTool.initializePrecut(zipEntry.asText(),true);
				            	  }
		
				              });
			              }
	            	  	else{
	            	  		alert("inavalid precut");
	            	  		console.log("not a valid precut");
	            	  	}
	            
	              }

	            } catch(e) {
	            	console.log("error in uploading precut: "+e.toString());
	             
	            }
	          //load precut data
	            ImageSelection.loadImage(ImageSelection.precutImages[0].name, ImageSelection.precutImages[0].data, true, ImageSelection.isUserPrecut);

	          };
	        })(f);
	        // read the file
	        reader.readAsArrayBuffer(f);
	        
	        
	      }
		
	},
	
	blurFileSelect : function(){
		$("#ImageFileUpload").blur();
	},
	handleFileSelect:function(sender){
		ga('create', 'UA-62187190-1', 'auto');
		ga('send', 'event','button','click','File Upload',1);
		ga('send', 'pageview',{'page': '/image_upload','title': 'Image Upload'});
		ImageSelection.imageFile = (sender.target.files)[0];
		var reader = new FileReader();
		 reader.onload = (function(theFile) {
		       ImageSelection.loadImage(ImageSelection.imageFile.name,theFile.target.result, false, false);
		      });
		
	      // Read in the image file as a data URL.
	      reader.readAsDataURL(ImageSelection.imageFile);
		
		
	},
	handleURLInput:function(url){	
	 // var url =	"http://www.gstatic.com/hostedimg/fd099e310fca0a07_landing";
	  var name="myImage";
	  this.loadImage(name, url, false, false);
	},
/*	loadPrecut:function(){
		var isUserPrecut=false;
		var index;
		for(var x=0;x<ImageSelection.precutImages.length;x++){
			if(ImageSelection.precutImages[x].name=="BASE_IMAGE.jpg"){
				isUserPrecut=false;
				index=x;
			}
			else if(ImageSelection.precutImages[x].name=="base.jpg")
				{
					isUserPrecut=true;
					index=x;
				}
		}
		if(index!=undefined){
			ImageSelection.loadImage(ImageSelection.precutImages[index].name, ImageSelection.precutImages[index].data, true, isUserPrecut);
		}
		 
	},*/
	loadImage:function(name, src, isPrecut,isUserPrecut){
        var image=new Image();
        Utils.showLoader();
        $('#mainContainer').load("main/main.html",function(){
			var canvas = document.getElementById('glcanvas');
			if(canvas)
				{
				    canvas.height=canvas.clientHeight;
				    canvas.width=canvas.clientWidth;
				    //initialize webGL modules
				    image.name=name;
                    image.onload=function(){
                    	
                    	/*if(src.indexOf("data:image/jpeg;base64") > -1){
                    		//Resetting before after data 
                    		beforeAfter = {
                    				"wallfashion" : []
                    		};
                    		beforeAfter.beforeImage = src;
                    		beforeAfter.beforeImageHeight = canvas.clientHeight;
                    		beforeAfter.beforeImageWidth = canvas.clientWidth;
                    		
                    	}else{*/
                    		// Saving before image
                        	imgToDataURL(src, function(error, data, height, width){
                        		//Resetting before after data 
                        		beforeAfter = {
                        				"wallfashion" : []
                        		};
                        		beforeAfter.beforeImage = data;
                        		beforeAfter.beforeImageHeight = height;
                        		beforeAfter.beforeImageWidth = width;
                			},'image/jpeg', 1.0);
//                    	}
                    	
                    	
                          start();
                          textureLib.loadImageTexture(image);
                          //textureLib.loadTexture(name,src);
                        if(isPrecut){
                        	var precutImages=[];
                        	//load precut images synchronously
                        	if(ImageSelection.precutImages.length>1)
                        		{
                        		for(var x=1;x<=ImageSelection.precutImages.length;x++)
                            		precutImages[x]=new Image();
                            	
                            	for(var x=1;x<=ImageSelection.precutImages.length;x++){
                            		if(x+1<ImageSelection.precutImages.length)
                        			{
    	                        	  precutImages[x].nextImage=precutImages[x+1];
    	                        	  precutImages[x].ImgData = ImageSelection.precutImages[x+1];
                        			}
                            	  
                            	  precutImages[x].onload=function(){
                            		  textureLib.loadImageTexture(this);
                            		  if(this.nextImage)
                        			  {
    	                        		  this.nextImage.name = this.ImgData.name;
    	                        		  this.nextImage.src =  this.ImgData.data;
                        			  }
                            		  else{
                                      	ImageSelection.initializeWebGL(isPrecut,isUserPrecut);
                                      	ImageEdit.initialize();
                                      }
                            	  };
                            	}
                            	precutImages[1].name=ImageSelection.precutImages[1].name;
                            	precutImages[1].src=ImageSelection.precutImages[1].data;
                        		}
                        	else{
                        		ImageSelection.initializeWebGL(isPrecut,isUserPrecut);
                        		Utils.hideLoader();
                        		ImageEdit.initialize();
                        	}                     	
                        }  
                        else{
                        	ImageSelection.initializeWebGL(isPrecut,isUserPrecut);
                        	Utils.hideLoader();
                        	ImageEdit.initialize();
                        }                      
                    };
                    image.src=src;
			    }
			
		 });
	},
	initializeWebGL:function(isPrecut,isUserPrecut){
		rendererClass.b_isPreCutMode = isPrecut; // Whether a pre cut or not
        rendererClass.b_isUserPreCut = isUserPrecut; // Whether a user saved pre cut or not
        rendererClass.i_precutLayers = ImageSelection.precutImages.length-1;         
        init();
        textureLib.loadTexture("assets/eraser.png");
        textureLib.loadTexture("assets/SquareBrush.png");
        textureLib.loadTexture("assets/laser-dot.png");
        textureLib.loadTexture("assets/Dot.png");
        textureLib.loadTexture("assets/bar_back_all.png");
        textureLib.loadTexture("assets/ic_rotation_orange.png");
        textureLib.loadTexture("assets/wf_selectionbar.png");
	}
};
