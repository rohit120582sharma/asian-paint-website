var WallFashion = {
		
		// private variables
		vm : "",
		selectedWallFashion : "",
		currentCategory:0,
		isCustomPicker:false,
		initialize : function() {
			var _this = this;
			// load maximized color spectra view
			$('#wallFashion').load("modules/colorSpectra/template/wallFashion.html",function() {
				$('#spectraToolContent').html($("#wallFashion").html());
		    	WallFashion.applyBindings();
				//Webservice.getWallFashionData(WallFashion.success,WallFashion.error);	
				
				
			});
		},
		applyBindings:function(){
			
			ko.applyBindings(WallFashion.vm,document.getElementById('wallFashionContainer'));
			$(".wallFashionCategory").eq(WallFashion.currentCategory).addClass("selected");
			if(WallFashion.currentCategory == 0){
				// Reset condition
				WallFashion.vm.selectWallFashionCategory();
			}
		},
		success: function (response) {
	    	WallFashion.vm = new WallFashion.WallFashionViewModel(response);
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
				WallFashion.initialize();
			}
	    	/*$('#spectraToolContent').html($("#wallFashion").html());
	    	WallFashion.applyBindings();*/
	    },
	    error : function(response){
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
	    applyWallFashion : function(){
		ga('create', 'UA-52354973-9', 'auto');
		ga('send', 'event','button','click','Apply Wallfashion',1);
	    	if(WallFashion.selectedWallFashion){
	    		beforeAfter.wallfashion.push({"name" : WallFashion.selectedWallFashion.WallFashion_Name, "wallFashionImage" : WallFashion.selectedWallFashion.WallFashion_Thumbnail});
	    		textureLib.loadTexture(WallFashion.selectedWallFashion.WallFashion_Name, WallFashion.selectedWallFashion.WallFashion_Image, false, true);
	    	}else{
	    		alert("Please select a WallFashion");
	    	}
    	},
    	
    	deleted : function(name){
    		console.log("deleted : "+ name);
//    		removing deleted wall fashion from before after data
    		for(var i=0; i<beforeAfter.wallfashion.length; i++){
    			if(beforeAfter.wallfashion[i].name == name){
    				beforeAfter.wallfashion.splice(i,1);
    				break;
    			}
    		}
    		console.log(beforeAfter.wallfashion);
    	},
    	customColorSelected:function(data){
		ga('create', 'UA-52354973-9', 'auto');
		ga('send', 'event','button','click','Select Custom Color-Wallfashion',1);
    		WallFashion.isCustomPicker=false;
			if(data){
				//send color to webGL
				messageObj.addMessage({type:messageType.SetWallFashionColor,baseColor:Utils.convertToRGBArray(data.R, data.G, data.B)});
				  
			}	
			SpectraTool.openMinimized();
			//SpectraTool.vm.goToTab(SpectraTool.vm.chosenTabId());
    	},
    	
    	applyWallFashionColor : function(){
		ga('create', 'UA-52354973-9', 'auto');
		ga('send', 'event','button','click','Apply Wallfashion Color-Wallfashion',1);
	    	console.log("applyWallFashionColor");
	    	WallFashion.isCustomPicker=true;
	    	//open color spectra module
			SpectraTool.vm.goToTab("Colour Spectra");
	    	
	    	
    	},
    	
		WallFashionViewModel : function(data){
			var self = this;
			self.wallFashionsCategory = [];
			self.wallFashions = [];
			if (data) {
				for ( var j = 0; j< data.textures.Categories.length; j++) {
					self.wallFashionsCategory.push(data.textures.Categories[j]);
				}
				
				for ( var i = 0; i < data.textures.Categories[0].details[0].wallfashion.length; i++) {
					if(data.textures.Categories[0].details[0].wallfashion[i].WallFashion_Thumbnail != "null"){
						self.wallFashions.push(data.textures.Categories[0].details[0].wallfashion[i]);
					}
				}
			}
			
			
			//click callback for texture selection
			self.selectWallFashionCategory = function(koData, event){
				$(".wallFashionCategory").removeClass("selected");
				
				if(event){
					$(event.target).closest(".wallFashionCategory").addClass("selected");
					WallFashion.currentCategory=$(".wallFashionCategory").index($(event.target).closest(".wallFashionCategory"));
					self.textureIndex = $(event.target).closest('li').index();
				}else{
					// Reset condition
					$(".wallFashionCategory").eq(0).addClass("selected");
					WallFashion.currentCategory = $(".wallFashionCategory")[0];
					self.textureIndex = 0; 
				}
				
				
				
				self.wallFashions.removeAll();
				
				for(var i=0; i<data.textures.Categories[self.textureIndex].details[0].wallfashion.length; i++){
					if(data.textures.Categories[self.textureIndex].details[0].wallfashion[i].WallFashion_Thumbnail != "null"){
						self.wallFashions.push(data.textures.Categories[self.textureIndex].details[0].wallfashion[i]);
					}
				}
				SpectraTool.vm.isDisabled(true);
			};
			
			self.selectWallFashion =  function(koData, event){
				$(".wallFasion").removeClass("selected");
				$(event.target).closest(".wallFasion").addClass("selected");
				WallFashion.selectedWallFashion = self.wallFashions()[$(".wallFasion.selected").index()];
				SpectraTool.vm.isDisabled(false);
			};
			
			// Making observable arrays
			self.wallFashionsCategory = ko.observableArray(self.wallFashionsCategory);
			self.wallFashions = ko.observableArray(self.wallFashions);
		} 
}