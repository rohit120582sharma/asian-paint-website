/*Image Edit (sharpness, brightness, contrast)*/
var ImageEdit={		
	 previousTab:"",	
	/* function to show slider */
	initialize:function()
	{ $('#toolbar').load("modules/imageEdit/template/topToolBar.html",function(){
		$(" #sharpnessController").slider({
			orientation: "horizontal",
			range: "min",
			max: 100,
			value: 0,
			slide:ImageEdit.editImage,
			change:ImageEdit.editImage
		});
		$("#brightnessController" ).slider({
			orientation: "horizontal",
			range: "min",
			max: 200,
			value: 100,
			slide:ImageEdit.editImage,
			change:ImageEdit.editImage
		});
		$("#contrastController" ).slider({
			orientation: "horizontal",
			range: "min",
			max: 200,
			value: 100,
			slide:ImageEdit.editImage,
			change:ImageEdit.editImage
		});
		$("#brightness, #sharpness, #contrast").on('click',ImageEdit.imageEditTabClicked);
	});
	if(!localStorage.isHelpShown){
		//Help.showHelpScreens("imageCorrection");
	}	
	Utils.hideOverlay();
	},
	
	
	/* function to call native webGL function */
	editImage:function (sender)
	{
		var brightness=($("#brightnessController").slider("option", "value")/100)-1;
		var sharpness=$("#sharpnessController").slider("option", "value")/100;
		var contrast=$("#contrastController").slider("option", "value")/100;
		messageObj.addMessage({type:messageType.ImageCorrected,fBrightness:brightness,fContrast:contrast,fSharpness:sharpness});
	},
	/* function to proceed to main module */
	proceed:function (sender)
	{
		messageObj.addMessage({type:messageType.ProceedToChroma});
		MainModule.initialize();
		ga('create', 'UA-52354973-9', 'auto');
		ga('send', 'event','button','click','Proceed - Image Edit',1);
		ga('send', 'pageview',{'page': '/imageEdit','title': 'Image Edit'});
	},
	
	/* call to native webGL function to reset all changes */
	reset:function (sender)
	{
		console.log("reseting all image editing changes...");
		$("#brightnessController").slider("value",100);
		$("#sharpnessController").slider("value",0);
		$("#contrastController").slider("value",100);
		this.editImage();
		ga('create', 'UA-52354973-9', 'auto');
		ga('send', 'event','button','click','Reset - Image Edit',1);
		ga('send', 'pageview',{'page': '/imageEdit','title': 'Image Edit'});
	},
	skip:function(sender)
	{
		messageObj.addMessage({type:messageType.SkipToChroma});
		MainModule.initialize();
		ga('create', 'UA-52354973-9', 'auto');
		ga('send', 'event','button','click','Skip - Image Edit',1);
		ga('send', 'pageview',{'page': '/imageEdit','title': 'Image Edit'});
	},
	/*function to handle tab click*/
	imageEditTabClicked:function (sender)
	{
		var currentTab=$('.mainToolbar').index(this);
		if(ImageEdit.previousTab!="")
			{
			  $('#'+ImageEdit.previousTab).removeClass("mainTabSelected");
			  $('#'+ImageEdit.previousTab+'Controller').hide();
			}
		switch (currentTab){
			case 0:{
				//sharpness
				ga('create', 'UA-52354973-9', 'auto');
				ga('send', 'event','button','click','Sharpness',1);
				ImageEdit.previousTab="sharpness";
				$('#sharpness').addClass("mainTabSelected");
				$('#sharpnessController').show();
			}
			break;
			case 1:{
				//brightness
				ga('create', 'UA-52354973-9', 'auto');
				ga('send', 'event','button','click','Brightness',1);
				ImageEdit.previousTab="brightness";
				$('#brightness').addClass("mainTabSelected");
				$('#brightnessController').show();
			}
			break;
			case 2:{
				//contrast
				ga('create', 'UA-52354973-9', 'auto');
				ga('send', 'event','button','click','Contrast',1);
				ImageEdit.previousTab="contrast";
				$('#contrast').addClass("mainTabSelected");
				$('#contrastController').show();
			}
			break;
			default:{}
		}
		/*var controllerMargin="";
		if(this.previousTab && this.previousSlider)
		{
			 this.previousTab.style.backgroundPosition="0px 0px"; 
			 this.previousSlider.style.display="none"; 
		}
	
		var tabElement=document.getElementById(parameter);
		var sliderElement=document.getElementById(parameter+"Controller");
		var container=document.getElementById("mainContainer");
	
		tabElement.style.backgroundPosition="0px -116px"; 
		sliderElement.style.display="block"; 
	   
		var elements=$(".imageEditTabElements");
		
		
		//setting up slider controllers' margin
		if(tabElement.offsetLeft==elements[0].offsetLeft)
			{	
				//sharpness slider
				controllerMargin= "16px";
			}
			
		else if(tabElement.offsetLeft==elements[1].offsetLeft)
			{	
				//brightness slider
				controllerMargin=elements[0].clientWidth+10+ "px";
			}
			
		else if(tabElement.offsetLeft==elements[2].offsetLeft)
			{
				//contrast slider
				controllerMargin= elements[0].clientWidth+ elements[1].clientWidth+10+ "px";
			}
			
		sliderElement.style.marginLeft=controllerMargin;
	
		this.previousTab=tabElement;
		this.previousSlider=sliderElement;*/
	}
};