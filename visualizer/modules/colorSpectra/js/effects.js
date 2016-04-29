//declare global variables here		 

var Effects = {

		// private variables
		vm : "",
		isCustomPicker:false,//for custom colors
		currentPresetIndex:"",//for custom colors
		selectedEffect : "",
		selectedPresetIndex : "",
		selectedTexture:{},
		selcetedPreset:[],
		isTextureChanged:false,
		isRemoveCoat:false,
		carousalData : "",
		
		initialize : function() {
			var _this = this;
			// load maximized color spectra view
			$('#effects').load("modules/colorSpectra/template/effects.html",function() {
				$('#spectraToolContent').html($("#effects").html());						 
				Effects.applyBindings();
				//Webservice.getEffectsData(Effects.success, Effects.error);
			});
		},
		success:function(response)
		{
			//parse response
			Effects.vm = new Effects.EffectsViewModel(response.textures.Categories);
			Effects.vm.setTextureDetails(response.textures.Categories[0].details[0].texture);
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
				Effects.initialize();
			}
			/*$('#spectraToolContent').html($("#effects").html());						 
			Effects.applyBindings();*/
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
		
		createOrUpdateCarousal : function(setFirst){
			if(!Effects.carousalData){
				$("#texture_Carousal").tinycarousel({
			        axis   : "y",
			        animationTime : 500
			    });
				Effects.carousalData = $("#texture_Carousal").data("plugin_tinycarousel");
				Effects.carousalData.update();
				if(setFirst){
					Effects.carousalData.move(0);
				}
			}else{
				Effects.carousalData.update();
				if(setFirst){
					Effects.carousalData.move(0);
				}
			}
		},
		applyBindings:function(){
			ko.applyBindings(Effects.vm,document.getElementById('effectsContainerMaximized'));
//			Effects.carousalData = $("#texture_Carousal").data("plugin_tinycarousel");
			
			Effects.createOrUpdateCarousal();
			
			
			if(Effects.vm.textureIndex){
				$($(".textureBox")[Effects.vm.textureIndex]).addClass("selected");
				$(".selectedTextureName").text(Effects.selectedTexture.Texture_Name + " Combinations");
			}else{
				$(".textureBox:first").addClass("selected");
				Effects.selectedTextureName=$(".textureBox:first .textureName").text();
				$(".selectedTextureName").text(Effects.vm.textures()[0].Texture_Name + " Combinations");
			}
			
			if(Effects.selectedPresetIndex){
//				$($(".preset")[Effects.selectedPresetIndex]).addClass("selected");
			}
			if(Effects.selectedEffect){
				$(".effectsDropdown > [value='"+ Effects.selectedEffect +"']").prop("selected", "true");
			}else{
				$(".effectsDropdown > [value='"+ Effects.vm.availableTextures()[0] +"']").prop("selected", "true");
				Effects.vm.selectionChanged();
			}
			
			if(Effects.isRemoveCoat){
				 $("#removeCoatButton").show();
			}
								
		},
		applyEffects:function(){
			ga('create', 'UA-52354973-9', 'auto');
			ga('send', 'event','button','click','Apply Effects',1);
			var width;
			var baseCoat;
			var topCoat;
			var topCoat2;
			var textureImage1=new Image();
			textureImage1.crossOrigin='';
			
			var layer=new Object();
			var coats=new Object();//to pass to layer object to be saved as a part of precut
			var images=new Object();
			images.thumbnail=Effects.selectedTexture.Texture_Image;
			images.image1=Effects.selectedTexture.Layers[0].Layer_Image;
			
			switch(Effects.selectedTexture.Tone){
				case "1":{
						width="100%";
						//single tone texture
						baseCoat=Utils.convertToRGBArray(Effects.selcetedPreset[0].R, Effects.selcetedPreset[0].G, Effects.selcetedPreset[0].B);
						topCoat=Utils.convertToRGBArray(Effects.selcetedPreset[0].R*.75, Effects.selcetedPreset[0].G*.75, Effects.selcetedPreset[0].B*.75);//make shade lighter
						
						//populate coats and layer data
						coats.baseCoat=baseCoat;coats.topCoat=topCoat;
						
						layer.coats=coats;
						layer.images=images;
						layer.data=Effects.selcetedPreset;
						layer.width=width;
				
						
						
						//loading Image
						if(!Effects.isTextureChanged)
							{
								Utils.showLoader();
								textureImage1.onload=function(){
									Utils.hideLoader();	
									textureLib.loadImageTexture(textureImage1);
									messageObj.addMessage({type:messageType.SetColor, baseColor:baseCoat, topColor: topCoat,layerData:layer});
							};
							}
						else{
							messageObj.addMessage({type:messageType.SetColor, baseColor:baseCoat, topColor: topCoat,layerData:layer});
							}
						textureImage1.src=Effects.selectedTexture.Layers[0].Layer_Image;
						
						
					}
					break;
				case "2":{
					width="50%";
					//two tone texture
					baseCoat=Utils.convertToRGBArray(Effects.selcetedPreset[0].R, Effects.selcetedPreset[0].G, Effects.selcetedPreset[0].B);
					topCoat=Utils.convertToRGBArray(Effects.selcetedPreset[1].R, Effects.selcetedPreset[1].G, Effects.selcetedPreset[1].B);
					
					//populate coats and layer data
					coats.baseCoat=baseCoat;coats.topCoat=topCoat;
					
					layer.coats=coats;
					layer.images=images;
					layer.data=Effects.selcetedPreset;
					layer.width=width;
					
					
					//loading Image
					if(!Effects.isTextureChanged)
						{
							Utils.showLoader();
							textureImage1.onload=function(){
								Utils.hideLoader();	
								textureLib.loadImageTexture(textureImage1);
								messageObj.addMessage({type:messageType.SetColor, baseColor:baseCoat, topColor: topCoat,layerData:layer});
						};
						}
					else{
						messageObj.addMessage({type:messageType.SetColor, baseColor:baseCoat, topColor: topCoat,layerData:layer});
						}
					textureImage1.src=Effects.selectedTexture.Layers[0].Layer_Image;

				}
					break;
				case "3":{
					width="33.33%";
					//three tone texture
					var textureImage2=new Image();
					textureImage2.crossOrigin=''; 
					
					baseCoat=Utils.convertToRGBArray(Effects.selcetedPreset[0].R, Effects.selcetedPreset[0].G, Effects.selcetedPreset[0].B);
					topCoat=Utils.convertToRGBArray(Effects.selcetedPreset[1].R, Effects.selcetedPreset[1].G, Effects.selcetedPreset[1].B);
					topCoat2=Utils.convertToRGBArray(Effects.selcetedPreset[2].R, Effects.selcetedPreset[2].G, Effects.selcetedPreset[2].B);
					
					//populate coats and layer data
					coats.baseCoat=baseCoat;coats.topCoat=topCoat;coats.topCoat2=topCoat2;
					images.image2=Effects.selectedTexture.Layers[1].Layer_Image;
					
					layer.coats=coats;
					layer.images=images;
					layer.data=Effects.selcetedPreset;
					layer.width=width;
					
					//loading Images
					if(!Effects.isTextureChanged)
					{ 
						Utils.showLoader();
					
					textureImage1.onload=function(){
						textureLib.loadImageTexture(textureImage1, true);
						textureImage2.src=Effects.selectedTexture.Layers[1].Layer_Image;
						
					};
					textureImage2.onload=function(){
							Utils.hideLoader();
							textureLib.loadImageTexture(textureImage2, true);
							messageObj.addMessage({type:messageType.Loaded3ToneTexture});
							messageObj.addMessage({type:messageType.SetColor, baseColor:baseCoat, topColor:topCoat, top2Color:topCoat2,layerData:layer});	
					};
					textureImage1.src=Effects.selectedTexture.Layers[0].Layer_Image;
					
					}
					else
						{
						messageObj.addMessage({type:messageType.SetColor, baseColor:baseCoat, topColor:topCoat, top2Color:topCoat2,layerData:layer});
						}
					images.image2=Effects.selectedTexture.Layers[1].Layer_Image;
					
				}
					break;
				default:{}	
			}

			//update History and Layer preview
			HistoryTool.vm.setCurrentEffects(Effects.selectedTexture.Texture_Image,Effects.selectedTexture.Texture_Name,Effects.selcetedPreset,width);
			LayerTool.vm.changeCurrentLayerData(Effects.selcetedPreset,width,coats,images);
			
			
			Effects.isTextureChanged=true;
			
			//show remove coat button
			$("#removeCoatButton").show();
			Effects.isRemoveCoat=true;
		},
		customPresetSelected:function(data){
			ga('create', 'UA-52354973-9', 'auto');
			ga('send', 'event','button','click','Custom Color Selected',1);
			Effects.isCustomPicker=false;
			$('#spectraToolContent').html($("#effects").html());
			if(data){
				Effects.vm.addShadeCodes()[Effects.currentPresetIndex]=data;	
			}			
			Effects.applyBindings();
			
			var shades=Effects.vm.addShadeCodes();
			for(var i=0;i<shades.length;i++){
				if(shades[i].Shade_code=="Custom Colour"){
				   return;
				  }
			}
			//set selected texture
			Effects.selectedTexture=Effects.vm.textures()[Effects.vm.textureIndex];
			
			//set selected preset
			Effects.selcetedPreset=	Effects.vm.addShadeCodes();
			//change selected preset in UI
			$(".preset").removeClass("selected");
			$("#customPreset").addClass("selected");
			Effects.selectedPresetIndex = $(".preset").index($(".preset.selected"));
			SpectraTool.vm.isDisabled(false); 
			
		},
		EffectsViewModel : function(data) {
			var self = this;
			
			// Making observable arrays
			self.availableTextures = ko.observableArray();
			self.textures = ko.observableArray();
			self.presetCombination = ko.observableArray();
			self.addShadeCodes =  ko.observableArray();
			// data			
			self.textureIndex = 0,
			self.selectedCategory = 0,
			self.tone;

			
			
			//initializing data
			// For select options
			for ( var i = 0; i < data.length; i++) {
				self.availableTextures.push(data[i].category);
			}
	
			//set default view for a particular texture
			self.setTextureDetails=function(texture){
				
				//set tone
				self.tone=texture[0].Tone;
				
				//set textures and presets
				self.textures(texture);
				
				if(self.tone==1){
					if(texture[0].Combinations[0].comb_layers.length!=1){
						
						for(var x=0;x<texture[0].Combinations.length;x++){
						   for(var y=0;y<texture[0].Combinations[x].comb_layers.length;y++){
						      if(texture[0].Combinations[x].comb_layers[y].Layer_No=="1"){
						    	  texture[0].Combinations[x].comb_layers.splice(y, 1);
						      }
								
							}
						}
					}
				}
				self.presetCombination(texture[0].Combinations);
				
				//update scroller
//				var box = $("#texture_Carousal").data("plugin_tinycarousel");
//				if(box){box.update();}
				
				//setting custom presets to default
				for(i=0; i<self.tone; i++){
					self.addShadeCodes.push({
  	            	   "Shade_code":"Custom Colour",
 	            	   "Hex":"666666"
	            		});
				}
				
			};
			// selection change callback for dropdown
			self.selectionChanged = function(koViewModel,sender){
				
				// Resetting texture, presets, custom shades list
				self.textures([]);
				self.presetCombination([]);
				self.addShadeCodes([]);
				$(".preset").removeClass("selected");
				//updating textures with new value
				var textureCategories=self.availableTextures();
				var effectCategory = sender ? sender.target.value : Effects.vm.availableTextures()[0];
				for ( var i = 0; i < textureCategories.length; i++) {
					if(textureCategories[i] === effectCategory){
							self.setTextureDetails(data[i].details[0].texture);					
						}
					}
																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																														
				self.textureIndex = 0;
				$(".selectedTextureName").text(self.textures()[0].Texture_Name + " Combinations");
				$(".textureBox:first").addClass("selected");
				Effects.selectedEffect = effectCategory;//$(sender.target.selectedOptions).val();
				Effects.isTextureChanged=false;
//				var box = $("#texture_Carousal").data("plugin_tinycarousel");
//				box.update();
//				box.move(0);
				
				Effects.carousalData = "";
				Effects.createOrUpdateCarousal(true);
				SpectraTool.vm.isDisabled(true); 
				
			};
			
			//click callback for texture selection
			self.selectTexture = function(data,sender){
				$(".preset").removeClass("selected");
				
				//set Tone
				self.tone=data.Tone;
			
				// Resetting presets and custom shades list
				self.presetCombination([]);
				self.addShadeCodes([]);
				
				//updating presets with new value
				if(self.tone==1){
					if(data.Combinations[0].comb_layers.length!=1){
						
						for(var x=0;x<data.Combinations.length;x++){
						   for(var y=0;y<data.Combinations[x].comb_layers.length;y++){
						      if(data.Combinations[x].comb_layers[y].Layer_No=="1"){
						      	data.Combinations[x].comb_layers.splice(y, 1);
						      }
								
							}
						}
					}
				}
				
				self.presetCombination(data.Combinations);
				
				
	
				//setting custom presets to default
				for(i=0; i<self.tone; i++){
					self.addShadeCodes.push({
  	            	   "Shade_code":"Custom Colour",
 	            	   "Hex":"666666"
	            		});
				}
				$(".textureBox").removeClass("selected");
				$(sender.target).closest(".textureBox").addClass("selected");
				Effects.selectedTextureName = data.Texture_Name;
				$(".selectedTextureName").text(Effects.selectedTextureName + " Combinations");				
				self.textureIndex = $(sender.target).closest('li').index();
				Effects.selectedTexture = data;
				Effects.isTextureChanged=false;
				SpectraTool.vm.isDisabled(true); 
			};
			// click callback for presets selections
			self.selectPresets = function(data, sender){
				
				//empty preset data
				Effects.selcetedPreset=[];
				Effects.selectedTexture=[];
				
				//set selected preset texture
				if(data.comb_layers){
					Effects.selcetedPreset=data.comb_layers;
				}
				else{
					var shades=self.addShadeCodes();
					for(var i=0;i<shades.length;i++){
						if(shades[i].Shade_code=="Custom Colour"){
						   return;
						  }
					}
					Effects.selcetedPreset=	self.addShadeCodes();
				}
				
				//set selected texture
				Effects.selectedTexture=self.textures()[self.textureIndex];

				/*if(data.comb_layers){
					colorArray=data.comb_layers;
				}
				else{
					colorArray=	self.addShadeCodes();
				}*/
				/*switch(colorArray.length){
				case 1:{width="100%";}break;
				case 2:{width="50%";}break;
				case 3:{width="33.33%";}break;
				default:{}
				}*/
				/*if(colorArray.length==1){}
				for(var x=0;x<colorArray.length;x++)
					{
					  if(colorArray[x].Shade_Code){
						  shades.push({color:colorArray[x].Shade_Code,colorWidth:width,code:colorArray[x].Shade_Code});
					  }
					  else{
						  if(colorArray[x].name()=="Custom Color")
							  {
							   return;
							  }
						  shades.push({color:colorArray[x].Hex(),colorWidth:width,code:colorArray[x].name()});
					  }
					  
					}*/
				/*for(x=0;x<shades.length;x++){
					Effects.currentPreset.colorArray[x]=Utils.getRGBArray(shades[x].color);
				}*/
				//TODO:hardcoded texture images for now
				/*if(shades.length==2){
					Effects.currentPreset.imageArray[0]={"name":"Spatula.jpg","src":"assets/Spatula.jpg"};
				}
				else if(shades.length==3){
					//3 tone texture
					Effects.currentPreset.imageArray[0]={"name":"weaving-1-tex.jpg","src":"assets/weaving-1-tex.jpg"};
					Effects.currentPreset.imageArray[1]={"name":"weaving-2-tex.jpg","src":"assets/weaving-2-tex.jpg"};
				}
				Effects.currentPreset.colors=shades;*/
				
				//change selected preset in UI
				$(".preset").removeClass("selected");
				$(sender.currentTarget).closest(".preset").addClass("selected");
				Effects.selectedPresetIndex = $(".preset").index($(".preset.selected"));
				SpectraTool.vm.isDisabled(false);
			};
			
			self.setWidth = function(){
				switch(self.tone){
				case "1":{return "full";}
						break;
				case "2":{return "half";}
						break;
				case "3":{return "third";}
						break;
				default:{}
				}
				
			};
			
			self.addCustomPresetColor=function(data,event){
				Effects.isCustomPicker=true;
				var context = ko.contextFor(event.target);
				Effects.currentPresetIndex=context.$index();
				//open color spectra module
					SpectraTool.vm.goToTab("Colour Spectra");
			};				
							
		}
};