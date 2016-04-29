
//declare global variables here		 

var ColorSpectra={
	
	 //private variables
		vm:"",
		currentColorFamily:"",
		currentColorIndex:"",
		currentColorArray:[],
		currentColor:"",
		isCustomPickerMode:"",
		ColorSpectraItems:[],
		searchString:"",
	initialize:function()
	{
			if(this.vm!=""){
				 //load default into container (color spectra)
				 $('#colors').load("modules/colorSpectra/template/colors.html",function(){
					 $('#spectraToolContent').html($("#colors").html());							 
						ColorSpectra.applyBindings();
					 //Webservice.getColorSpectraData(ColorSpectra.success,ColorSpectra.error);			
				 });
				
			}
			else{
				 $('#spectraToolContent').html($("#refreshContainer").html());
			}
			
	},
	success:function(response)
	{
		//parse response
		var color_family=response.color_spectra.Category[0].Color_family;
		color_family.push(response.color_spectra.Category[1].Color_family[0]);
		ColorSpectra.vm=new ColorSpectra.ColorSpectraViewModel(color_family);	
		requestDone+=1;
		if(requestDone==3){
			Utils.hideLoader();
			if(isDataServiceError)
			{
			  Main.showMessage();
			}
		}
		if(SpectraTool.isRefresh)
			{
				SpectraTool.isRefresh=false;
				Utils.hideLoader();
				ColorSpectra.initialize();
			}
		/*$('#spectraToolContent').html($("#colors").html());							 
		ColorSpectra.applyBindings();*/
	},
	error:function(response){
		ga('create', 'UA-52354973-9', 'auto');
			ga('send', 'exception', {
			  'exDescription': response,
			  'exFatal': true
			});
		isDataServiceError=true;
		requestDone+=1;
			if(requestDone==3){
				Utils.hideLoader();
				Main.showMessage();
			}
			if(SpectraTool.isRefresh)
			{
				SpectraTool.isRefresh=false;
				Utils.hideLoader();
			}	
	},
	applyBindings:function(){
		 ko.applyBindings(ColorSpectra.vm,document.getElementById('spectraToolContent'));
		 if(Effects.isCustomPicker||WallFashion.isCustomPicker){
			 //hide apply/cancel buttons and close button
			 $("#applyColorButton").hide();
			 $("#closeButton").css('visibility','hidden');
			 
			 //disable tabs
			 $('#spectraTabs').hide();
			 $("#colorSelectionHeader").show();
			 if(WallFashion.isCustomPicker){
				 $("#colorSelectionHeader").html("Select Color");
				 }
			 else if(Effects.isCustomPicker){
				 $("#colorSelectionHeader").html("Select Custom Color");
			 }
		 }
		 
			 if(ColorSpectra.currentColorFamily==""){
				 	ColorSpectra.currentColorFamily=0;
				 	ColorSpectra.vm.colorFamilySelected();// for resetting color spectra on reset call
				 }
			 $('.colorFamilyDivs').eq(ColorSpectra.currentColorFamily).addClass("selectedStyle");
//			 ColorSpectra.ColorSpectraItems = (ColorSpectra.ColorSpectraItems.length > 0) ? ColorSpectra.ColorSpectraItems : ColorSpectra.vm.allColors;
				$( "#colorSpectraSearch" ).autocomplete({
					 minLength: 0,
				      source: function( request, response ) {
				    	  if(request.term.trim() == ""){
				    		  $(".ui-autocomplete").hide();
				    		  return
				    	  }
				          response( $.grep( ColorSpectra.vm.allColors, function( item ){
				        	  if(item.Shade_code.toLowerCase().indexOf(request.term) > -1 || item.Shade_code.indexOf(request.term) > -1  || item.Shade_name.toLowerCase().indexOf(request.term) > -1 || item.Shade_name.indexOf(request.term) > -1)
				              return  item;
				          }) );
				      },
				      select: function( event, ui ) {
				    	  var index = ui.item.index;
				    	  var matchedItem = {};
				    	  $(event.target).val(ui.item.Shade_name);
				    	  for(var i = 0; i<ColorSpectra.vm.allColors.length; i++){
				    		  if(ColorSpectra.vm.allColors[i].Shade_name == ui.item.Shade_name){
				    			  matchedItem = ColorSpectra.vm.allColors[i];
				    		  }
				    	  }
				    	  ColorSpectra.vm.variations([]);
				    	  ColorSpectra.vm.variations.push(matchedItem);
				    	  
				    	  ColorSpectra.searchString = ui.item.Shade_name;
				    	  
				    	  //Removing selected class from color family
				    	  $('.colorFamilyDivs').removeClass("selectedStyle");
				    	  return false;
				      }
				}).data( "ui-autocomplete" )._renderItem = function( ul, item ) {
		        return $( "<li>" )
		          .append( "<a>" + item.Shade_name +"</br>"+item.Shade_code+ "</a>" )
		          .appendTo( ul );
		      };
	},
	applyColor:function(){
		ga('create', 'UA-52354973-9', 'auto');
		ga('send', 'event','button','click','Apply Color',1);
		if(ColorSpectra.currentColorIndex>=0)
			{
				messageObj.addMessage({type:messageType.SetColor2,baseColor:ColorSpectra.currentColorArray,layerData:ColorSpectra.currentColor});
				HistoryTool.vm.setColorSpectra(ColorSpectra.currentColor);
				LayerTool.vm.changeCurrentLayerData(ColorSpectra.currentColor);
				
			}
		
	},
	ColorSpectraViewModel:function(colorFamily) {
		
	    //data
	    var self=this;
		self.colorFamilyList = ko.observableArray(colorFamily);
		self.variations=ko.observableArray(colorFamily[0].Color);
		self.allColors = [];
		
		for(var i=0;i<colorFamily.length;i++){
			self.allColors = self.allColors.concat(colorFamily[i].Color);
		}
	    
		//behavious	 			 
		//function to bind color family data
		self.colorFamilySelected=function(data,sender){
			var divs=$('.colorFamilyDivs');
			var index = sender ? divs.index(sender.target)  :  0;
			if(index>=0)
				{
					divs.eq(ColorSpectra.currentColorFamily).removeClass("selectedStyle");
					ColorSpectra.currentColorFamily=index;
					divs.eq(ColorSpectra.currentColorFamily).addClass("selectedStyle");
					self.variations(colorFamily[index].Color);
				}
			
			if(ColorSpectra.ColorSpectraItems){
				ColorSpectra.ColorSpectraItems = self.variations();
			}
			SpectraTool.vm.isDisabled(true);
			
			//Removing focus and empting value form autocomplete
			$( "#colorSpectraSearch" ).val("");
			$( "#colorSpectraSearch" ).blur();
		};
		//function to select Color
		self.colorSelected=function(data,sender){
			var divs=$('.variationsDivs');
			
			//define current color array based on data available
			ColorSpectra.currentColorArray=Utils.convertToRGBArray(data.R,data.G,data.B);
			
			if(Effects.isCustomPicker||WallFashion.isCustomPicker){
				//unhide apply/cancel buttons
				$("#applyColorButton").show();
				 $("#closeButton").css('visibility','visible');
				 
				 //enable tabs
				 $('#spectraTabs').show();
				 $("#colorSelectionHeader").hide();
				 if(WallFashion.isCustomPicker){
					 WallFashion.customColorSelected(data);
					 }
				 else if(Effects.isCustomPicker){
					 Effects.customPresetSelected(data);
				 }
				
				
			}
			else{
				SpectraTool.vm.isDisabled(false);
				var index=divs.index(sender.currentTarget);
				divs.eq(ColorSpectra.currentColorIndex).removeClass("selectedStyle");
				ColorSpectra.currentColorIndex=index;
				divs.eq(ColorSpectra.currentColorIndex).addClass("selectedStyle");
				ColorSpectra.currentColor=data;
				
			}
			
				
		};
		
	}
};