var LayerTool={
	
	vm:"",
	layerScroller:"",
	isPrecutData:false,
	precutData:new Object(),
	
	initialize:function(){
		//apply KO bindings
		if(!this.isPrecutData){
			this.vm=new LayerTool.LayerViewModel();			
		}
		else if(MainModule.isReset){
			this.initializePrecut(this.precutData.data,this.precutData.isUserPrecut);
			MainModule.isReset=false;			 
		}
		ko.applyBindings(this.vm,document.getElementById('layers'));
		this.layerScroller= new IScroll('#layers', {
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: 'scale',
			fadeScrollbars: true
		});
		if(!this.isPrecutData){
			this.vm.addLayer();			
		}
		else{
			//this.isPrecutData=false;
			//hide add layer button
			$("#addLayerButton").css('visibility','hidden');
		}
		
	},
	addNewLayer:function()
	{
		LayerTool.vm.addLayer();
		ga('create', 'UA-52354973-9', 'auto');
		ga('send', 'event','button','click','Add New Layer',1);
	},

	layer:function (colors, name,coats,images) {
		 var self = this;
		 self.colors = ko.observableArray(colors);
		 self.name = ko.observable(name);
		 self.coats = ko.observable(coats);
		 self.images=ko.observable(images);
	},

	LayerViewModel:function() {
		//data
		var self=this;
		self.layers = ko.observableArray();
		self.currentLayer; 
		self.addLayer = function(sender) {
			var count=self.layers().length;
			if(count<255)
			{
				self.layers.push(new LayerTool.layer([{"color":"#FF0000","colorWidth":"100%","colorCode":"red"}],"Layer "+count,[],[]));
				
				//refresh scroller to account for newly added layer
				LayerTool.layerScroller.refresh();
				//set current layer to newly added layer
				var item=$('.layersSpacing').eq(count);
				self.setCurrentLayer(item);
			}	
			else
				{
				  alert("no more layers can be added");
				}
			
	    };
	    self.setCurrentLayer=function(data,sender)
	    {
	    	//remove previously selected layer's css
	    	if(self.currentLayer!=undefined){
	    			self.currentLayer.removeClass("layerSelected");
			   }
	    	
	    	//update currentLayer
	    	if(sender){ 
	    		    var index=$('.layersSpacing').index(sender.currentTarget);
	    			self.currentLayer=$('.layersSpacing').eq(index);	    	    	
	    		}
	    	else if(data){
	    		self.currentLayer=data;
	    	}
	    	
	    	//add selected layer's css to current layer
	    	self.currentLayer.addClass("layerSelected");
	    	messageObj.addMessage({type:messageType.SetLayerToChroma,iLayer:$('.layersSpacing').index(self.currentLayer)});
	    };
	    self.changeCurrentLayerData=function(data,width,coats,images,sender){
	    	


	    	if (self.currentLayer!=undefined) {
	    		var index=$('.layersSpacing').index(self.currentLayer);
		    	
		    	var currentLayer = self.layers()[index];
    		  // Update the color property 
	    		if(data.Hex){
	    			// update color 
	    			currentLayer.colors([{"color":'#'+data.Hex,"colorWidth":"100%","colorCode":data.Shade_code}]);
	    			currentLayer.coats(new Array(Utils.convertToRGBArray(data.R, data.G, data.B)));
	    			currentLayer.images([]);
	    		}
	    		else{
	    			//update effects
	    			var colorArray=new Array();
	    			for(var x=0;x<data.length;x++){
	    				colorArray.push({"color":'#'+data[x].Hex,"colorWidth":width,"colorCode":data[x].Shade_Code});
	    			}
	    			currentLayer.colors(colorArray);
	    			currentLayer.coats(coats);
	    			currentLayer.images(images);
	    		}	    		
	    	}
	    };
	    self.getCurrentLayerData=function(){
	    	if (self.currentLayer!=undefined) {
	    		var index=$('.layersSpacing').index(self.currentLayer);
	    		var layer=new Object();
	    		var data=self.layers()[index];
	    		var index=$('.layersSpacing').index(self.currentLayer);   	
		    	layer.data= data.colors();
		    	layer.images= data.images();
		    	layer.coats= data.coats();		    	
		    	return layer;
	    	}
		    	
	    };
	},
	undoRedoLayerPreview:function(layerData){
		if(layerData){
			if(layerData.Hex){
				LayerTool.vm.changeCurrentLayerData(layerData);
			}
			else{
				LayerTool.vm.changeCurrentLayerData(layerData.data,layerData.width,layerData.coats,layerData.images);
			}
			
		}		
	},
	initializePrecut:function(data,isUserPrecut){
		LayerTool.precutData.data=data;
		LayerTool.precutData.isUserPrecut=isUserPrecut;
		
		LayerTool.isPrecutData=true;
		LayerTool.vm=new LayerTool.LayerViewModel();
		if(isUserPrecut){			
			var layerData=JSON.parse(data);			
			for(var x=0;x<layerData.length;x++){
				LayerTool.vm.layers.push(new LayerTool.layer(layerData[x].layer.colors,layerData[x].layer.name,layerData[x].layer.coat,layerData[x].layer.images));
			}
		}
		else{
			for(var x=0;x<data-1;x++){
				LayerTool.vm.layers.push(new LayerTool.layer([{"color":"#FF0000","colorWidth":"100%","colorCode":"red"}],"Layer "+x,[],[]));
			}
			
		}
		/*var layers=LayerTool.vm.layers();
		for(x=0;x<layers.length;x++){
			var colors=layers[x].colors();
			var name=layers[x].name;
			var coats=layers[x].coats;
			var image=layers[x].image;
		}*/
	}
			
		
};