var requestDone;
var isDataServiceError;
var beforeAfter = {
		"wallfashion" : []
};
$(function() {
	
	//checking if browser is supported.
	var isSupportedBrowser = true;
	
	var gl=null;
	var canvas  = document.createElement('canvas');
	try {
	    gl = canvas.getContext("experimental-webgl")||canvas.getContext('webgl');
	  }
	  catch(e) {}
	
	if(!gl){
		isSupportedBrowser = false;
		}
	else{
		if($.browser.chrome){
			if( $.browser.version.split(".")[0] < 10){
				isSupportedBrowser = false;
			}
		}else if($.browser.msie){
			if( $.browser.version.split(".")[0] < 11){
				isSupportedBrowser = false;
			}
		}else if($.browser.mozilla){
			if( $.browser.version.split(".")[0] < 5){
				isSupportedBrowser = false;
			}
		}else if($.browser.opera){
			if( $.browser.version.split(".")[0] < 15){
				isSupportedBrowser = false;
			}
		}else if($.browser.safari ){
			if( $.browser.version.split(".")[0] < 6){
				isSupportedBrowser = false;
			}
		}
		
	}
	
	
	if(!isSupportedBrowser){
		$("#notSupportedContainer").show();
		return;
	}
	
	//return;
	$('#messageBox').load("main/popup.html",function(){});
	ImageSelection.initialize();
	Main.getDataFromService();
});

var Main = {
	handleCloseKit : function() {
		MainModule.closeKitClick();
	},
	skipImageEditing : function() {
		console.log("skip image editing...");
		ImageEdit.skip();
	},
	gotoHome:function(){
		$('#mainContainer').empty();
		$('#mainContainer').append("<div id='imageSelectionScreen'>");
		
		ImageSelection.initialize();
	},
	showMessage:function(){
		Utils.showOverlay();
		$("#messageBox").show();
	},
	handleMessage:function(sender,parameter){
	
	var index=$(".messagePopupButtons").index(sender.target);
	if(index==0){
		//First option selected
		ga('create', 'UA-52354973-9', 'auto');
		ga('send', 'event','button','click','Refresh Data',1);
		Utils.hideOverlay();
		$("#messageBox").hide();
		Main.getDataFromService();
	}
	else if (index==1){
		//Second option selected
		Utils.hideOverlay();
		$("#messageBox").hide();
	}
	},
	getDataFromService:function()
	{
		Utils.showLoader();
		requestDone=0;
		isDataServiceError=false;
		Webservice.getColorSpectraData(ColorSpectra.success, ColorSpectra.error);
		Webservice.getEffectsData(Effects.success, Effects.error);
		Webservice.getWallFashionData(WallFashion.success, WallFashion.error);
	}
};
function setCanvasDimensions() {
	var w = window.innerWidth;
	var h = window.innerHeight - (57 + 40 + 9);
	// $("#glcanvas").width(w);
	$("#glcanvas").height(h);
}
function detectmob() { 
 if( navigator.userAgent.match(/Android/i)
 || navigator.userAgent.match(/webOS/i)
 || navigator.userAgent.match(/iPhone/i)
 || navigator.userAgent.match(/iPad/i)
 || navigator.userAgent.match(/iPod/i)
 || navigator.userAgent.match(/BlackBerry/i)
 || navigator.userAgent.match(/Windows Phone/i)
 ){
    return true;
  }
 else {
    return false;
  }
}