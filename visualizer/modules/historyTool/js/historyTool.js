/*History Tool*/
	

var HistoryTool={
		
	vm:"",
	/* function to show slider */
	initialize:function()
	{ 
		$('#historyTool').load("modules/historyTool/template/historyTemplate.html",function(){
			HistoryTool.vm=new HistoryTool.HistoryViewModel();
			ko.applyBindings(HistoryTool.vm,document.getElementById('historyToolTemplate'));
			 $("#historyTool").hide();
		});
		
	},
	showHideEffectsHistoy:function(){
		$('#spectraHistory').hide();
		var history=$('#effectsHistory');
		if(history.css('display')=='none'){
			history.show();
		}
		else
			history.hide();
	},
	showHideSpectraHistoy:function(){
		$('#effectsHistory').hide();
		var history=$('#spectraHistory');
		if(history.css('display')=='none'){
			history.show();
		}
		else
			history.hide();
	},
	HistoryViewModel:function() {
	    //data
	    var self=this;
	    self.IsEffectsAdded=false;
	    self.isCustom=ko.observable();
		self.colorSpectra = ko.observable();
		self.currentToolImage = ko.observable("././assets/images/HistoryTool/Chroma.png");
		self.currentTool=ko.observable("Magic Fill");
		self.currentTextureImage = ko.observable();
		self.currentTextureName=ko.observable("No Effects");
		self.currentEffects=ko.observableArray();
		self.historyCombinations=ko.observableArray();
		self.historyColors=ko.observableArray();
		//behavious	 			 
		self.setColorSpectra=function(data,sender){
			self.colorSpectra('#'+data.Hex);
			var match = ko.utils.arrayFirst(self.historyColors(), function(item) {
			    return data.Shade_code === item.Shade_code;
			});

			if (!match) {
				self.historyColors.push(data);
			}else{
				var index = ko.utils.arrayIndexOf(self.historyColors(), match);
				var duplicateVal = self.historyColors.splice(index, 1);
				self.historyColors.push(duplicateVal[0]);
			}
			
		};
		/*self.setCurrentTool=function(data,sender){
			self.colorSpectra(data);					
		};*/
		self.setCurrentEffects=function(textureImage,textureName, effectDetails,width){
			var effectDetails = effectDetails;
			if(effectDetails[0].Shade_code){
				for(var x=0;x<effectDetails.length;x++){
					effectDetails[x].Shade_Code=effectDetails[x].Shade_code;
				}
				
			}
			self.currentTextureImage(textureImage);
			self.currentTextureName(textureName);
			self.currentEffects({"effects":effectDetails,"colorWidth":width});
			
			var match = ko.utils.arrayFirst(self.historyCombinations(), function(item) {
				if(item.effects.compare(self.currentEffects().effects))
				return item;
			});

			if (!match) {
				self.historyCombinations.push({"effects":effectDetails,"colorWidth":width});
			}else{
				var index = ko.utils.arrayIndexOf(self.historyCombinations(), match);
				var duplicateVal = self.historyCombinations.splice(index, 1);
				self.historyCombinations.push(duplicateVal[0]);
			}
			
			//update UI if effects are added
			if(!self.IsEffectsAdded){
				self.IsEffectsAdded=true;
				$("#spectraHistory").css('margin-left', '308px');
				$("#historyToolTemplate").css('margin-left', '500px');
				$("#historyToolContainer").css('width', '463px');
				$("#historyTexture").show();
				$("#historyEffectsCombination").show();
			}
		};
	},
	
	
	/* Hide the History Tool */
	closeHistoryTool:function (sender)
	{
		 $("#historyTool").hide();
	}
};