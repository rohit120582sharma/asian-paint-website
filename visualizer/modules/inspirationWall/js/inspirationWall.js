
var inspirationWall=new Object();
/*inspirationWall.MYWALL=0;
inspirationWall.GALLERY=1;
inspirationWall.INTERIOR=2;
inspirationWall.EXTERIOR=3;
inspirationWall.COLOR_INSPIRATIONS=4;*/

inspirationWall.GALLERY=0;
inspirationWall.INTERIOR=1;
inspirationWall.EXTERIOR=2;
inspirationWall.COLOR_INSPIRATIONS=3;


var InspirationWall={
		previousOptionTab:0,// initially set to inspiration wall
		previousFilterTab:1, // initially set to interior
		vm:"",
		inspirationWallData:new Object(),
	/* function to show slider */
	initialize:function()
	{
		$("#inspirationWall").load("modules/inspirationWall/template/inspirationWall.html",function(){
			// Loading filters
				InspirationWall.inspirationWallData=[];
				$(".inspirationWallToolbarTextStyle").on('click',InspirationWall.fetchInspirationWallData);
				InspirationWall.vm=new InspirationWall.InspirationWallViewModel();
				ko.applyBindings(InspirationWall.vm,document.getElementById('inspirationWall'));
				InspirationWall.fetchInspirationWallData();
				Filters.initialize();
				
		 });	
	},
	inspirationWallImageClicked:function(sender){
		imageURL=sender.target.src;
		ImageSelection.handleURLInput(imageURL);
		},
	fetchInspirationWallData:function(sender){
		
//		    var galleryOption=InspirationWall.previousOptionTab;;
		 var galleryOption = inspirationWall.GALLERY;
		    var filterOption={
		    		"filterOption" : InspirationWall.previousFilterTab		
		    };
		    
		    //get index of currently clicked item
			var value=$(".inspirationWallToolbarTextStyle").index(this);
			
			switch(value){
				/*case inspirationWall.MYWAL:{
						galleryOption=0;
						}
				  		break;*/
				/*case inspirationWall.GALLERY:{
						galleryOption=1;
						}
						break;*/
				case inspirationWall.INTERIOR:{
						filterOption.filterOption =  1;
						Filters.applyInteriorFiltersStyle();
						}
						break;
				case inspirationWall.EXTERIOR:{
						filterOption.filterOption = 2;
						Filters.applyExteriorFiltersStyle();
						}
						break;
				/*case inspirationWall.COLOR_INSPIRATIONS:{
					filterOption=;
					}
					break;*/		
				default:{
				}		
			}
			
			//toggle style of previous options
//			$(".inspirationWallToolbarTextStyle").eq(InspirationWall.previousOptionTab).removeClass('inspirationWallToolbarSelected');
			$(".inspirationWallToolbarTextStyle").eq(InspirationWall.previousFilterTab).removeClass('inspirationWallToolbarSelected');
			
			//apply style to current options
			$(".inspirationWallToolbarTextStyle").eq(galleryOption).addClass('inspirationWallToolbarSelected');
			$(".inspirationWallToolbarTextStyle").eq(filterOption.filterOption).addClass('inspirationWallToolbarSelected');
			
			//update value of previous options
//			InspirationWall.previousOptionTab=galleryOption;
			InspirationWall.previousFilterTab=filterOption.filterOption;
			
			//get data for inspiration walls based on options selected
			InspirationWall.vm.getGalleryData(galleryOption, filterOption);
	},	
	ImageModel:function (name, src) {
		var self = this;
		self.name = name;
		self.source = src;
	},
	
	InspirationWallViewModel:function() {
	    //data
	    var self=this;
		self.ImageList = ko.observableArray();	
	    self.index;
		//behavious
		self.getGalleryData=function(galleryOption,filterOption){
		if(InspirationWall.previousOptionTab==inspirationWall.MYWALL){
			if(InspirationWall.previousFilterTab==inspirationWall.INTERIOR)
				self.index=0;
			if(InspirationWall.previousFilterTab==inspirationWall.EXTERIOR){
				self.index=1;
			}
		}	
		if(InspirationWall.previousOptionTab==inspirationWall.GALLERY){
			if(InspirationWall.previousFilterTab==inspirationWall.INTERIOR)
				self.index=2;
			if(InspirationWall.previousFilterTab==inspirationWall.EXTERIOR){
				self.index=3;
			}
		}
		if(InspirationWall.inspirationWallData[self.index])
			{
			  self.success(InspirationWall.inspirationWallData[self.index])
			}
		else{
			Webservice.getInspirationWallData(galleryOption, filterOption, self.success, self.error);
		}
		
			
		};
		self.success=function(data){
			if(requestDone==3){
				Utils.hideLoader();
			}
			var image;
			self.ImageList([]);
			InspirationWall.inspirationWallData[self.index]=data;
			for( var i=0;i<data.length;i++) 
			{
				image= new InspirationWall.ImageModel(data[i].Title,data[i].ImagePath);
				self.ImageList.push(image);
				//InspirationWall.inspirationWallData[self.index].push(image);
			}
		};
		self.error=function(error){
			if(requestDone==3){
				Utils.hideLoader();
			}
			console.log("error while getting inspiration wall data");
//			alert("error while getting inspiration wall data");
			//self.ImageList.push(new ImageModel("",""));

		};
//		self.inspirationWallClicked=function(sender){
//			console.log(sender.toString());
//
//		};
		
	}
};
