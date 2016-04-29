
//declare global variables here		 

var SpectraTool={
	
	 //private variables
		vm:"",
		isRefresh:false,
	initialize:function()
	{
		SpectraTool.vm=new SpectraTool.SpectraToolViewModel();
		//load minimized color spectra view
		 $('#colorSpectraMinimized').load("modules/colorSpectra/template/SpectraToolMinimized.html",function(){
			 $( "#draggableMinimized" ).draggable({containment: "#glcanvas" });
			 ko.applyBindings( SpectraTool.vm,document.getElementById('colorSpectraContainerMinimized'));
			 
			 $(".colorSpectraContainerMinimized").eq(0).attr("title","Apply colours from our range of 1800 shades. Select the colour family and respective colour variant and click apply." );
			 $(".colorSpectraContainerMinimized").eq(1).attr("title", "Apply various effects. Select the type of effect, texture and colour combination and click apply." );
			 $(".colorSpectraContainerMinimized").eq(2).attr("title", "Select the type of wall fashion and click on the desired wall fashion to apply." );
		 });	
		//load maximized color spectra view
		 $('#colorSpectraMaximized').load("modules/colorSpectra/template/SpectraToolMaximized.html",function(){
			 ko.applyBindings( SpectraTool.vm,document.getElementById('spectraTabs'));
			 ko.applyBindings( SpectraTool.vm,document.getElementById('spectraTabButtons'));
			 $( "#draggableMaximized" ).draggable({containment: "#glcanvas" });
			 //initialize color spectra view (default view in spectra tool)
			 ColorSpectra.initialize();
		 });
		 $('#colorSpectraMaximized').hide();
	},
	
	SpectraToolViewModel:function() {
	    //data
	    var self=this;
		self.colorSpectraTabs = ['colour spectra', 'effects', 'wall fashion'];
		self.chosenTabId = ko.observable(self.colorSpectraTabs[0]);
		self.buttonText =ko.observable("Apply Colour");
	    self.isDisabled=ko.observable(true);
		//behavious
		//function to handle color spectra tab click
		 self.goToTab = function(tab) {
			 $("#removeCoatButton").hide();
			 if(!$(".colorSpectraContainerMaximized").eq(0).hasClass('disabledStyle'))
				 {
				 //update chosen tab
				 if(!Effects.isCustomPicker&&!WallFashion.isCustomPicker)
					 {
					 	self.chosenTabId(tab);
					 	if(tab==="Colour Spectra")
					 		self.buttonText("Apply Colour");	
					 	else{
					 		self.buttonText("Apply "+self.chosenTabId());
					 	}
					 	SpectraTool.vm.isDisabled(true);
					 }
					 
				 var content=$('#spectraToolContent');
				 
				 //clear previous bindings
				 ko.cleanNode(content[0]);
				 
				 //update/replace content & apply new bindings based on tab selected
				 switch(tab){
					 case self.colorSpectraTabs[0]:{
						 if(ColorSpectra.vm!=""){
							 content.html($("#colors").html());
							 	ColorSpectra.applyBindings();
							 	if(ColorSpectra.searchString){
							 		$("#colorSpectraSearch").val(ColorSpectra.searchString);
							 	} 
						 }
						 	
						 else{
							 content.html($("#refreshContainer").html());
						 } 	
					 }
					 break;
					 case self.colorSpectraTabs[1]:{
						 if(Effects.vm!=""){
							 if($("#effects").children().length>0){
								 content.html($("#effects").html());
								 Effects.carousalData = "";
//								 $("#texture_Carousal").data(Effects.carousalData);
								 Effects.applyBindings();
							 }
							 else{
								 Effects.initialize();
							 } 
						 }
						 else{
							 content.html($("#refreshContainer").html());
						 } 	 
					 }
					 break;
					 case self.colorSpectraTabs[2]:{
						 if(WallFashion.vm){
							 if($("#wallFashion").children().length>0){
								 content.html($("#wallFashion").html());
								 WallFashion.applyBindings();
							 }
							 else{
								 WallFashion.initialize();
							 } 
						 }
						 else{
							 content.html($("#refreshContainer").html());
						 }
 
					 }
					 break;
					 default:{}
				 }
				 
				 //open view if minimized tab clicked
				 if($('#colorSpectraMaximized').css('display') == 'none')
					 {
					  	SpectraTool.openMaximized();
					 }
				 }
			
			 
			 };
		self.apply=function(tab){
		ga('create', 'UA-52354973-9', 'auto');
		ga('send', 'event','button','click','Apply Color',1);
			if(!$("#applyColorButton").hasClass('disabledStyle'))
				{
					switch(self.chosenTabId()){
					case self.colorSpectraTabs[0]:{
						ColorSpectra.applyColor();
						console.log("apply color..");
					}
					break;
					case self.colorSpectraTabs[1]:{
						Effects.applyEffects();
						console.log("apply effects..");
					}	
					break;
					case self.colorSpectraTabs[2]:{
						WallFashion.applyWallFashion();
						console.log("apply wall fashion..");
					}
					break;
					defalut:{}	
					}
				}
			SpectraTool.openMinimized();
		};
		self.cancel=function(){
			ga('create', 'UA-52354973-9', 'auto');
			ga('send', 'event','button','click','Cancel Color',1);
			if(Effects.isCustomPicker||WallFashion.isCustomPicker){
				$("#applyColorButton").show();
				 $("#closeButton").css('visibility','visible');
				 //enable tabs
				 $('#spectraTabs').show();
				 $("#colorSelectionHeader").hide();
				 if(Effects.isCustomPicker){
					//load back effects module
					 Effects.customPresetSelected();
				 }
				 else if(WallFashion.isCustomPicker){
					//load back previous module 					 
					 WallFashion.customColorSelected();
				 }
				 
			}
			else{
				SpectraTool.openMinimized();
			}
			
		};
		self.removeCoat=function (sender,parameter)
		{
			ga('create', 'UA-52354973-9', 'auto');
			ga('send', 'event','button','click','Remove Coat',1);
			//call webGL function to remove coat
			messageObj.addMessage({type:messageType.RemoveTone});
			Effects.isTextureChanged=false;
			Effects.isRemoveCoat=false;
			$("#removeCoatButton").hide();
		};
		self.refresh=function(sender,parameter){
		ga('create', 'UA-52354973-9', 'auto');
		ga('send', 'event','button','click','Refresh',1);
			SpectraTool.isRefresh=true;
			Utils.showLoader();
			switch(SpectraTool.vm.chosenTabId()){
			case self.colorSpectraTabs[0]:{
				Webservice.getColorSpectraData(ColorSpectra.success, ColorSpectra.error);
				console.log("refresh color..");
			}
			break;
			case self.colorSpectraTabs[1]:{
				Webservice.getEffectsData(Effects.success, Effects.error);
				console.log("refresh effects..");
			}	
			break;
			case self.colorSpectraTabs[2]:{
				Webservice.getWallFashionData(WallFashion.success, WallFashion.error);
				console.log("refresh wall fashion..");
			}
			break;
			defalut:{}	
			}
		};
		
	},
	
	openMaximized:function (sender,parameter)
	{
		//show maximized view and hide minimized view
		 $('#colorSpectraMaximized').show();
		 $('#colorSpectraMinimized').hide();
		 
		/* var maxY=$("#glcanvas").offset();
		 var height=$("#glcanvas").css('height');
		 var containerHeight=$('#draggableMaximized').css('height');
		 
		 $('#draggableMaximized').css('left',sender.pageX - $("#glcanvas").offset().left-332);
		 $('#draggableMaximized').css('top',sender.pageY - $("#glcanvas").offset().top);*/
	},
	openMinimized:function(sender,parameter)
	{
		//show minimized view and hide maximized view
		 $('#colorSpectraMaximized').hide();
		 $('#colorSpectraMinimized').show();
		 
		
	/*	 $('#draggableMinimized').css('left',sender.pageX - $("#glcanvas").offset().left-90);
		 $('#draggableMinimized').css('top',sender.pageY - $("#glcanvas").offset().top);*/
		 
		
	},
	toggleSpectraTool:function(parameter){

		if(parameter=="hide")
			{	$('#colorSpectraMaximized').hide();
				$('#colorSpectraMinimized').hide();
			}
		else if(parameter=="show")
			{
			if($('#colorSpectraMaximized').css('display') == 'none' && $('#colorSpectraMinimized').css('display') == 'none'){
			  	SpectraTool.openMinimized();
			 }
			}
		 
	}, 
	resetShadeCard : function(){
		console.log("resetShadeCard");
		// Resetting color spectra
		ColorSpectra.currentColorFamily = "";
		
		// Resetting effects
		Effects.selectedEffect = "";
		
		//Resetting wallfashion
		WallFashion.currentCategory = 0;
	}
};