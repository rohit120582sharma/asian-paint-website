/*Main Module*/
//declare global variables here
var bottomToolbar=new Object();	
bottomToolbar.KIT_ICON=0;
bottomToolbar.FULLSCREEN=1;
bottomToolbar.UNDO=2;
bottomToolbar.REDO=3;
bottomToolbar.SAVE=4;
bottomToolbar.SHARE=5;
bottomToolbar.IMAGE=6;
bottomToolbar.CURRENT_TOOLS=7;

var topToolbar=new Object();
topToolbar.LAYER=0;
topToolbar.CHROMA=1;
topToolbar.MASKING=2;
topToolbar.AUTOMASK=3;
topToolbar.HIDEMASK=4;
topToolbar.BRUSH=5;
topToolbar.ERASER=6;
topToolbar.PERSPECTIVE=7;
topToolbar.SHADOW=8;
topToolbar.RESET=9;
topToolbar.HELP=10;
topToolbar.ADVANCED=11;

var mode=new Object();
mode.EXPRESS=0;
mode.ADVANCED=1;

var helpTips=new Object();
helpTips.LAYER="Paint different sections of image with different colours.Click, add a new layer or select an existing layer. ";
helpTips.MASKING="Paint without spreading.Select the type of mask: linear or curved. Click on desired locations & masking lines will be linked. Click on auto complete to close mask. Click on Magic Fill to begin painting.";
helpTips.CHROMA="Start by either selecting the masking tool and mark the area to paint or select from the shade card and double click to fill.";
helpTips.AUTOMASK="Click Auto Complete to complete the mask. Tap on Magic Fill to begin painting.";
helpTips.HIDEMASK="Click to switch the mask on/off";
helpTips.BRUSH="Paint bucket to fill left out areas. Select the size & swipe desired locations to fill. Click on Magic Fill to access other tools.";
helpTips.ERASER="Erase the paints applied. Select the size of the eraser & swipe on desired locations to erase. Click on Magic Fill to begin painting.";
helpTips.PERSPECTIVE="Adjust the perspective of texture with the background. Click on it, a square will appear . Drag  from edges to adjust the perspective . Click on Magic Fill to begin painting.";
helpTips.SHADOW="Increase/Decrease the background shadow retained on surfaces where paint is applied.";

var MainModule={
	
	 //private variables
     currentMode:"",
     vm:"",
     currentTool:"Chroma",
     isReset:false,
	/* function to show slider */
	initialize:function(isReset)
	{
		//load top toolbar
		 $('#toolbar').load("modules/ccMainModule/template/topToolBar.html",function(){
			 
			 MainModule.setMode(mode.EXPRESS);
			 Effects.isRemoveCoat=false;
				$("#removeCoatButton").hide();
			 if(isReset){
				 MainModule.setMode(isReset);				
			 }
			 MainModuleTool.initialize();
			 $(".mainToolbar").on("click",MainModule.handleTabClicked);
			 
			 // add event listner for image select in bottom toolbar
			 document.getElementById('fileUploadFromImage').addEventListener('change', MainModule.changeImage, false);
			 // Event for fullscreen change
			 document.addEventListener("MSFullscreenChange", MainModule.fullscreenChange, false);      
			 document.addEventListener("webkitfullscreenchange", MainModule.fullscreenChange, false);
			 document.addEventListener("mozfullscreenchange", MainModule.fullscreenChange, false);
			 //set initial tool to chroma
			 MainModuleTool.setInitialTool();
			 if(!localStorage.isHelpShown){
					//Help.showHelpScreens("express");
					//localStorage.isHelpShown=true;
				}
			 
			 //setting cursor
			 $("#glcanvas").css({"cursor": "url(assets/cursor/magicfill.cur) , default"});
			 //setting tooltip
			 $("#chroma").attr('title', helpTips.CHROMA );
			 $("#layer").attr('title',  helpTips.LAYER );
			 $("#masking").attr('title',  helpTips.MASKING );
			 $("#autoMask").attr('title', helpTips.AUTOMASK );
			 $("#hideMask").attr('title',  helpTips.HIDEMASK );
			 $("#brush").attr('title',  helpTips.BRUSH );
			 $("#eraser").attr('title',  helpTips.ERASER );
			 $("#perspective").attr('title',  helpTips.PERSPECTIVE );
			 $("#shadow").attr('title',  helpTips.SHADOW );
			 $("#reset").attr('title',  "Reset all the changes on Image." );
			 
			// $(document).tooltip();

		 });
		 
		 //load bottom toolbar
		 $('#bottomToolbar').load("modules/ccMainModule/template/bottomToolbar.html",function(){
			 $('.bottomToolbar').on('click',MainModule.handleBottomToolbarClick);
			 MainModule.vm=new MainModule.MainModuleViewModel();
			 ko.applyBindings(MainModule.vm,document.getElementById('bottomToolbarMainModule'));
			 //load History Tool
			 HistoryTool.initialize();
			 //TODO:remove it after alternate tooltip implementation
			 window.scrollTo(0,200);
			 setTimeout(function(){ window.scrollTo(0,0);},5000);
		 });
		 
		 //load color spectra
		 SpectraTool.initialize();	
		 OrientationTool.initialize();

		 //load Share
		 Share.initialize();
		
	},
	setMode:function(setToMode)
	{
		this.currentMode=setToMode;
		var mainContainerMargin=$("#mainContainer")[0].offsetLeft;
		
		
		if(setToMode== mode.EXPRESS)
			{
			
				  //hide layer, shadow and their controllers
				 //$('#layer').hide();
				 $('#perspective').hide();
				 $('#shadow').hide();
				 $('#layertool').hide();
				 $('#shadowtool').hide();
			
				  //set up screen margins for Express mode	
				 
				 $('#brushtool').css("margin-left",($("#brush")[0].offsetLeft-mainContainerMargin-25+"px"));
				 $('#erasertool').css("margin-left",($("#eraser")[0].offsetLeft-mainContainerMargin-23+"px"));
				 $('#maskingtool').css("margin-left",($("#masking")[0].offsetLeft-mainContainerMargin+5+"px"));
				 $('#chromatool').css("margin-left","10px");	
				 
				 //set mode tab's text
				 $("#advancedExpressTab").html("SWITCH TO ADVANCED");
				

				 
			 
			}
		else if(setToMode== mode.ADVANCED)
			{
				  //show layer, shadow, perspective
				 $('#layer').show();
				 $('#shadow').show();
				 $('#perspective').show();
				    
				  //set up screen margins for Advanced mode	 				 
				 $('#brushtool').css("margin-left",($("#brush")[0].offsetLeft-mainContainerMargin-25+"px"));
				 $('#erasertool').css("margin-left",($("#eraser")[0].offsetLeft-mainContainerMargin-23+"px"));
				 $('#maskingtool').css("margin-left",($("#masking")[0].offsetLeft-mainContainerMargin+5+"px"));
				 $('#chromatool').css("margin-left",($("#chroma")[0].offsetLeft-mainContainerMargin+5+"px"));
				 $('#shadowtool').css("margin-left",($("#shadow")[0].offsetLeft-mainContainerMargin+"px"));
				 
				 //set mode tab's text
				 $("#advancedExpressTab").html("SWITCH TO EXPRESS");
				 
			}		
	},
	handleBottomToolbarClick:function(sender)
	{
		var index=$(".bottomToolbar").index(this);
		switch (index) {
				case bottomToolbar.KIT_ICON: {
					//handle tools closed view
					$("#bottomToolbarMainModuleTools").hide();
					$("#toolsdiv").hide();
					$("#toolbarTemplateMainModule").hide();
					$("#footer").hide();
					$("#footerKitClosed").show();
					$("#orientationTool").hide();
					$('#colorSpectraMaximized').hide();
					$('#colorSpectraMinimized').hide();
					
					$("#shareModule").hide();

				}
					break;
				case bottomToolbar.FULLSCREEN: {
					var elem = document.getElementById("container");
					var senderElement=$(".bottomToolbar").eq(index);
					if(senderElement.html()=="FULLSCREEN")
						{
						//senderElement.html("EXIT FULLSCREEN");
						//go fullscreen
						if (elem.requestFullscreen) {
							  elem.requestFullscreen();
							} else if (elem.mozRequestFullScreen) {
							  elem.mozRequestFullScreen();
							} else if (elem.webkitRequestFullscreen) {
							  elem.webkitRequestFullscreen();
							}
							else if(elem.msRequestFullscreen){
								elem.msRequestFullscreen();	
							}
						
						}
					
					else{
						//senderElement.html("FULLSCREEN");
						//$(document).off("keyup");
						//exit fullscreen
						if (document.exitFullscreen) {
						      document.exitFullscreen();
						    } else if (document.msExitFullscreen) {
						      document.msExitFullscreen();
						    } else if (document.mozCancelFullScreen) {
						      document.mozCancelFullScreen();
						    } else if (document.webkitExitFullscreen) {
						      document.webkitExitFullscreen();
						    }
						//change margins
						//$("#kitIcon").css({marginRight:"45px"});
					}
					
					
				}
					break;	
				case bottomToolbar.UNDO: {
					$("#shareModule").hide();
					$("#saveTooltip").hide();
					$("#historyTool").hide();
					$("#save").removeClass("bottomToolbarSelected");
					$("#share").removeClass("bottomToolbarSelected");
					
					if(!($("#undo").css('cursor')=="auto")){
						//call webGL native function for UNDO
						messageObj.addMessage({type:messageType.Undo});

					}
				}
					break;
				case bottomToolbar.REDO: {
					$("#shareModule").hide();
					$("#saveTooltip").hide();
					$("#historyTool").hide();
					$("#save").removeClass("bottomToolbarSelected");
					$("#share").removeClass("bottomToolbarSelected");
					
					if(!($("#redo").css('cursor')=="auto")){
					//call webGL native function for REDO
					messageObj.addMessage({type:messageType.Redo});
					}
				}
					break;
				case bottomToolbar.SAVE: {
					//handle save
					$("#save").toggleClass("bottomToolbarSelected");
					$("#share").removeClass("bottomToolbarSelected");
					$("#saveTooltip").toggle();
					$("#shareModule").hide();					
					$("#historyTool").hide();
					
				}
					break;
				case bottomToolbar.SHARE: {
					//show share popup
					$("#share").toggleClass("bottomToolbarSelected");
					$("#save").removeClass("bottomToolbarSelected");
					$("#shareModule").toggle();
					$("#saveTooltip").hide();
					$("#historyTool").hide();
					
					
				}
					break;
				case bottomToolbar.IMAGE: {
                     
					//initialize image module
					MainModuleTool.showMessage(showMessageType.IMAGE);
					
				}
					break;	
				case bottomToolbar.CURRENT_TOOLS: {
					//show current tool popup					
					$("#historyTool").toggle();
					$("#shareModule").hide();
					$("#saveTooltip").hide();
					$("#save").removeClass("bottomToolbarSelected");
					$("#share").removeClass("bottomToolbarSelected");
				}
					break;	
				default: {}
		}
	},
	fullscreenChange:function(sender,parameter){
		var element=$("#fullscreen");
		if(element.html()=="FULLSCREEN")
		{
			element.html("EXIT FULLSCREEN");
			$("#kitIcon").css({marginRight:"19px"});
		}
		else{
			element.html("FULLSCREEN");
			$("#kitIcon").css({marginRight:"45px"});
		}
	},
	handleTabClicked:function (sender,parameter)
	{
		$("#glcanvas").css("cursor", "default");
		var tools=[];
		var index=$(".mainToolbar").index(this);
		
		//removing higlight
		if(index != topToolbar.ADVANCED)
		$(".mainToolbar").removeClass("higlightedTool")
		
		
		$('#scrollingText').remove();
		$("#helpTips").append("<div id='scrollingText'></div>");
		/*if(index!=topToolbar.AUTOMASK && index!=topToolbar.ADVANCED){
			Utils.disable($("#autoMask"));
		}
		if(index!=topToolbar.HIDEMASK && index!=topToolbar.ADVANCED){
			Utils.disable($("#hideMask"));
		}*/
		switch (index) {
		case topToolbar.LAYER: {
			MainModuleTool.layer();
			console.log("layer");
			ga('create', 'UA-52354973-9', 'auto');
			ga('send', 'event','button','click','Layer Tool',1);
			$('#scrollingText').html(helpTips.LAYER);
		}
			break;
		case topToolbar.CHROMA: {
			tools=["layer","masking","hideMask","brush","eraser","shadow","perspective"];
			MainModule.enableDisableTools(tools,true);
			Utils.disable($("#autoMask"));
			MainModuleTool.chroma();
			MainModule.currentTool="Magic Fill";
			HistoryTool.vm.currentToolImage("././assets/images/HistoryTool/Chroma.png");
			console.log("chroma");
			SpectraTool.toggleSpectraTool("show");
			$('#scrollingText').html(helpTips.CHROMA);
			ga('create', 'UA-52354973-9', 'auto');
			ga('send', 'event','button','click','Chroma Tool',1); 
			 
		}
			break;
		case topToolbar.MASKING: {
			tools=["layer","hideMask","brush","eraser","shadow","perspective"];
			MainModule.enableDisableTools(tools,false);
			Utils.enable($("#autoMask"),MainModule.handleTabClicked);
			Utils.enable($("#masking"),MainModule.handleTabClicked);
			MainModuleTool.masking();
			MainModule.currentTool="Masking";
			HistoryTool.vm.currentToolImage("././assets/images/HistoryTool/Mask.png");
			console.log("masking");
			SpectraTool.toggleSpectraTool("hide");
			$('#scrollingText').html(helpTips.MASKING);
			$(".mainToolbar").eq(topToolbar.AUTOMASK).addClass("higlightedTool");
			ga('create', 'UA-52354973-9', 'auto');
			ga('send', 'event','button','click','Masking Tool',1);
		}
			break;
		case topToolbar.AUTOMASK: {
			MainModuleTool.autoMask();
			$('#scrollingText').html(helpTips.AUTOMASK);
			console.log("autoMask");
			$(".mainToolbar").eq(topToolbar.CHROMA).addClass("higlightedTool");
			ga('create', 'UA-52354973-9', 'auto');
			ga('send', 'event','button','click','AutoMask Tool',1);
			
		}
			break;
		case topToolbar.HIDEMASK: {
			MainModuleTool.hideMask();
			$('#scrollingText').html(helpTips.HIDEMASK);
			console.log("HideMask");
			ga('create', 'UA-52354973-9', 'auto');
			ga('send', 'event','button','click','HideMask Tool',1);
		}
			break;	
		case topToolbar.BRUSH: {
			tools=["layer","masking","autoMask","hideMask","shadow","perspective"];
			MainModule.enableDisableTools(tools,false);
			Utils.enable($("#eraser"), MainModule.handleTabClicked);
			Utils.enable($("#brush"),MainModule.handleTabClicked);
			MainModuleTool.brush();
			MainModule.currentTool="Brush";
			HistoryTool.vm.currentToolImage("././assets/images/HistoryTool/Brush.png");
			console.log("brush");
			SpectraTool.toggleSpectraTool("show");
			$('#scrollingText').html(helpTips.BRUSH);
			$(".mainToolbar").eq(topToolbar.CHROMA).addClass("higlightedTool");
			ga('create', 'UA-52354973-9', 'auto');
			ga('send', 'event','button','click',' Brush Tool',1);
		}
			break;
		case topToolbar.ERASER: {
			tools=["layer","masking","autoMask","hideMask","shadow","perspective"];
			MainModule.enableDisableTools(tools,false);
			Utils.enable($("#brush"), MainModule.handleTabClicked);
			Utils.enable($("#eraser"), MainModule.handleTabClicked);
			MainModuleTool.eraser();
			MainModule.currentTool="Eraser";
			HistoryTool.vm.currentToolImage("././assets/images/HistoryTool/Eraser.png");
			console.log("eraser");
			SpectraTool.toggleSpectraTool("hide");
			$('#scrollingText').html(helpTips.ERASER);
			$(".mainToolbar").eq(topToolbar.CHROMA).addClass("higlightedTool");
			ga('create', 'UA-52354973-9', 'auto');
			ga('send', 'event','button','click','Eraser Tool',1);
		}
			break;
		case topToolbar.SHADOW: {
			MainModuleTool.shadow();
			console.log("shadow");
			$('#scrollingText').html(helpTips.SHADOW);
			ga('create', 'UA-52354973-9', 'auto');
			ga('send', 'event','button','click','Shadow Tool',1);
		}
			break;
		case topToolbar.PERSPECTIVE: {
			tools=["layer","masking","autoMask","hideMask","brush","eraser","shadow"];
			Utils.enable($("#perspective"), MainModule.handleTabClicked);
			MainModule.enableDisableTools(tools,false);
			MainModuleTool.perspective();
			MainModule.currentTool="Perspective";
			HistoryTool.vm.currentToolImage("././assets/images/HistoryTool/Perspective.png");
			console.log("perspective");
			SpectraTool.toggleSpectraTool("hide");
			$('#scrollingText').html(helpTips.PERSPECTIVE);
			$(".mainToolbar").eq(topToolbar.CHROMA).addClass("higlightedTool");
			ga('create', 'UA-52354973-9', 'auto');
			ga('send', 'event','button','click','Prespective Tool',1);
		}
			break;	
		case topToolbar.RESET: {
			MainModuleTool.reset();
			console.log("reset");
			ga('create', 'UA-52354973-9', 'auto');
			ga('send', 'event','button','click','Reset Tool',1);
		}
			break;
		case topToolbar.HELP: {
			MainModule.showHelp();	
			ga('create', 'UA-52354973-9', 'auto');			
			ga('send', 'event','button','click','Help Tool',1);				
		}
			break;	
		case topToolbar.ADVANCED: {
			MainModule.showMessage();
			console.log("advance");
			ga('create', 'UA-52354973-9', 'auto');	
			ga('send', 'event','button','click','Advanced Tool',1);
		}
			break;
		default: {
			
			console.log("");
		}

		}
		HistoryTool.vm.currentTool(MainModule.currentTool);
		 //bind event for help tips
		 $('#scrollingText').on('marquee',MainModule.marqueHelpTips);
		 $('#scrollingText').trigger('marquee');
	},
	
	enableDisableTools:function(tools,isEnable){
		if(isEnable){
			for(var x=0;x<tools.length;x++){
				Utils.enable($("#"+tools[x]),MainModule.handleTabClicked);
			}
		}
		else {
			for(var x=0;x<tools.length;x++){
				Utils.disable($("#"+tools[x]));
			}
		}
	},
	// Popup buttons function implementation
	popupResponse : function(responsetype) {
		$(".popupOverlay").hide();
		$('#advancedExpressTab').css("backgroundPosition", "0px 0px");
		$("#advanceexpress").css("visibility", "hidden");
		switch (responsetype) {
		//for yes/ok or any other positive response
		case "positiveResponse": {
			//condition for reset-OK 
			if ($("#positiveResponse").attr('src') == "assets/images/ok.png") {
				//Resetting shade card data
				SpectraTool.resetShadeCard();
				beforeAfter.wallfashion =  [];
			    messageObj.addMessage({type:messageType.ResetImage});
			    MainModule.initialize(MainModule.currentMode);
			    MainModule.isReset=true;
				console.log("ok");
				
			}
			// condition for saving image
			else if($("#positiveResponse").attr('data-save') == "yes"){
				//TODO:hardcoded for now-true in case of multiple images
				messageObj.addMessage({type:messageType.TakeScreenshot,b_setScreenShot:true});
				$("#positiveResponse").removeAttr('data-save');
			}
			//condition for ToggleToolbar-Yes
			else if ($("#positiveResponse").attr('src') == "assets/images/yes.png") {
				if(MainModule.currentMode==mode.ADVANCED)
					{						
						MainModule.setMode(mode.EXPRESS);
					}
				else if(MainModule.currentMode==mode.EXPRESS)
					{						
						MainModule.setMode(mode.ADVANCED);
					}
			}
			else if ($("#positiveResponse").attr('src') == "assets/images/imageYesBtn.png") {
				alert("select file");
			}
			
		}
		
			break;
		//for no/cancel or any other negative response
		case "negativeResponse": {
			//condition for reset - Cancel
			if ($("#negativeResponse").attr('src') == "assets/images/cancel.png") {
				console.log("cancel");
				
			}
			//condition for ToggleToolbar - No
			else if ($("#negativeResponse").attr('src') == "assets/images/no.png") {
				console.log("no");
				
			}
		}
			break;
		default: {

		}
	}
		//hide the popup
		$("#popup").hide();	
},
MainModuleViewModel:function(){
	var self=this;
	self.undo=ko.observable(/*rendererClass.bUndoEnabled*/);
	self.redo=ko.observable(/*rendererClass.bRedoEnabled*/);
	/*setInterval(function(){self.undo(rendererClass.bUndoEnabled);
							self.redo(rendererClass.bRedoEnabled);},100);*/
},
	showMessage:function()
	{
		if(MainModule.currentMode==mode.EXPRESS)
			MainModuleTool.showMessage(showMessageType.ADVANCED);
		else if(MainModule.currentMode==mode.ADVANCED)
			MainModuleTool.showMessage(showMessageType.EXPRESS);
				
	},
	changeImage:function(sender){
		ImageSelection.handleFileSelect(sender);
		
	},
	hideImageChangePopup:function()
	{
		Utils.hideOverlay();
		$("#imageChangePopup").hide();	
	},
	showHelp:function(){
		var currentScreen;
		if(MainModule.currentMode==mode.EXPRESS)
			currentScreen="express";
		else currentScreen="advanced";
		Help.showHelpScreens(currentScreen);
		ga('create', 'UA-52354973-9', 'auto');		
		ga('send', 'event','button','click','Show Help',1);
		ga('send', 'pageview',{'page': '/help','title': 'Help'});
	},
	closeKitClick:function(){
		//handle tools closed view
		$("#bottomToolbarMainModuleTools").show();
		$("#toolsdiv").show();
		$("#toolbarTemplateMainModule").show();
		$("#footer").show();
		$(".shareContainer").show();
		$(".arrow-down").show();
		$("#footerKitClosed").hide();
		$("#orientationTool").show();
		$('#colorSpectraMaximized').hide();
		$('#colorSpectraMinimized').show();
		ga('create', 'UA-52354973-9', 'auto');		
		ga('send', 'event','button','click','Close Kit',1);
	},
	saveAsImage:function(){
		messageObj.addMessage({type:messageType.TakeScreenshot,b_setScreenShot:false});
		ga('create', 'UA-52354973-9', 'auto');		
		ga('send', 'event','button','click','Save Image',1);
		ga('send', 'pageview',{'page': '/saveImage','title': 'Save Image'});
	},
	
	marqueHelpTips:function() {
		 var text = $(this);
		 var textWidth = text.width();
		 var containerWidth = text.parent().width();
		 if
		 (textWidth>containerWidth){
			 text.css({ right: -textWidth });
			 text.animate({ right: containerWidth }, 20000, 'linear', function() {
			 text.trigger('marquee');
			 }); 
		 }
	}
};