/*History Tool*/
var helpScreenNames=["IMAGE SELECTION",
                     "IMAGE CORRECTION",
                     "EXPRESS MODE",
                     "ADVANCED MODE",
                     "SHADE CARD",
                     "ACTION TOOLBAR"];	

var Help={
		
	showHelpScreens:function(currentScreen)
	{ 
		ga('send', 'pageview',{'page': '/help','title': 'Help Page'});
		var self=this;
		$("#mainContainer").hide();	
		$("#helpScreenContainer").show();
		$('#helpScreenContainer').load("modules/help/template/help.html",function(){
			$('#helpScreenSlider').tinycarousel({
				 start:1,
				 animation:false,
				 bullets  : true
				 
			});
			$('#helpScreenSlider').bind("move", function()
				    {
					var current = $('#helpScreenSlider').data("plugin_tinycarousel").slideCurrent;
					$("#currentHelpScreen").html(helpScreenNames[current]);
				    });
			var slider=$('#helpScreenSlider').data("plugin_tinycarousel");
			if(currentScreen=="express"){
				slider.move(2);
			}
			else if(currentScreen=="advanced"){
				slider.move(3);
			}
			else if(currentScreen=="imageCorrection"){
				slider.move(1);
			}
		});
		
	},
	closeHelp:function(){
		$("#helpScreenContainer").hide();
		$("#mainContainer").show();
	}
};