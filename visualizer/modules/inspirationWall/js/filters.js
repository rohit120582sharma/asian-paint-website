var Filters = {
	vm : "",
	scrollers : [],
	initialize : function() {
		
		var _this = this;
		this.vm = "";
		this.scrollers = [];
		$("#filtersContainer").html("");
		// Loading filters
		$("#filtersContainer").load("modules/inspirationWall/template/filters.html", function() {
			Webservice.getRequest("GET", filterURL, _this.success, _this.error);
					
		});
	},

	success:function(response)
	{
		//parse response
		Filters.vm = new Filters.FiltersViewModel(response);
		ko.cleanNode(document.getElementById('filtersContainer'));
		ko.applyBindings(Filters.vm, document.getElementById('filtersContainer'));
		Filters.applyBindings();
	},
	
	error:function(response){
		console.log("Error : " +response);
	},
	
	filtersToggle : function(){
		if($("#filtersContainer").is(":visible")){
			$("#filtersContainer").hide();
			Utils.hideOverlay();
		}else{
			if($($(".inspirationWallToolbarSelected")[1]).text() == "Interior"){
				Filters.applyInteriorFiltersStyle();
			}else if($($(".inspirationWallToolbarSelected")[1]).text() == "Exterior"){
				Filters.applyExteriorFiltersStyle();
			}
			
			Utils.showOverlay();
			$("#filtersContainer").show();
		}
		
		
		
	},
	
	handleCheckBoxClick : function(e){
		if($(e.target).val() == "All" && $(e.target).is(':checked')){
			$(e.target).parent().parent().find("input[type=checkbox]").prop('checked',true);
		}else if($(e.target).val() == "All" && !$(e.target).is(':checked')){
			$(e.target).parent().parent().find("input[type=checkbox]").prop('checked', false);
		}
	},
	
	applyBindings:function(){
		
		$("#filterLogo").on('click',Filters.filtersToggle);
		$(".applyFilters").on('click',Filters.applyFilters);
		$(".cancelFilters").on('click', Filters.filtersToggle )
		$("#filtersContainer").find("input[type=checkbox]").on('click',Filters.handleCheckBoxClick);
		
		var scrollContainer = $(".filterType");
		for(var i=0; i<scrollContainer.length; i++){
			var myScroll = new IScroll(scrollContainer[i],{
				mouseWheel: true,
			    scrollbars: true,
			    interactiveScrollbars: true,
			});
			
			Filters.scrollers.push(myScroll);
		}
	},
	
	applyInteriorFiltersStyle:function(){
		$(".exteriorFilters").hide();
		$(".interiorFilters").show();
		var interiorFilters = Filters.vm.interiorFilterList().length;
		switch (interiorFilters) {
		case 1:
//			TODO
			break;
		case 2:
			$(".interiorFilters .filterOptions").css("width", "50%");
			$("#filtersContainer").css({"width": "400px","margin-left": -200+"px"});
			break;
		case 3:
			$(".interiorFilters .filterOptions").css("width", "33.33%");
			$("#filtersContainer").css({"width": "600px","margin-left":-300+"px"});
			break;
		case 4:
			$(".interiorFilters .filterOptions").css("width", "25%");
			$("#filtersContainer").css({"width": "800px","margin-left":-400+"px"});
			break;

		default:
			break;
		}
		
		setTimeout(function(){
			Filters.updateScrolls();
		},800);
		
	},
	applyExteriorFiltersStyle:function(){
		$(".exteriorFilters").show();
		$(".interiorFilters").hide();
		var exteriorFilters = Filters.vm.exteriorFilterList().length;
		switch (exteriorFilters) {
		case 1:
			//TODO
			break;
		case 2:
			$(".exteriorFilters .filterOptions").css("width", "50%");
			$("#filtersContainer").css({"width": "400px","margin-left": -200+"px"});
			break;
		case 3:
			$(".exteriorFilters .filterOptions").css("width", "33.33%");
			$("#filtersContainer").css({"width": "600px","margin-left":-300+"px"});
			break;
		case 4:
			$(".exteriorFilters .filterOptions").css("width", "25%");
			$("#filtersContainer").css({"width": "800px","margin-left":-400+"px"});
			break;

		default:
			break;
		}
		setTimeout(function(){
			Filters.updateScrolls();
		},800);
	},
	
	updateScrolls : function(){
		if(Filters.scrollers && Filters.scrollers.length > 0){
			for(var j=0; j<Filters.scrollers.length; j++){
				Filters.scrollers[j].refresh();
			}
		}
	},
	
	applyFilters : function(){
		Utils.hideOverlay();
		Utils.showLoader();
		console.log("applyFilters");
		var uri = "";
		var filterOption = "";
		if($($(".inspirationWallToolbarSelected")[1]).text() == "Interior"){
			var filterTypes = $(".interiorFilters").find(".filterOptions");
			filterOption  = inspirationWall.INTERIOR;
			for(var i=0; i<filterTypes.length; i++){
				var filter = $(filterTypes[i]).find(".filterHeading").text() ;
				if(filter == 'Room Colors'){
					filter = "RoomColor_Id";
				}else{
					filter = filter.split(" ").join("") + "_Id";
				}
				uri += filter +"=";
				var selectedFilters = $(filterTypes[i]).find('input[type=checkbox]:checked');
				for(var j=0; j<selectedFilters.length; j++){
					if($(selectedFilters[j]).val() != "All")
					uri += $(selectedFilters[j]).val().replace(/&/g,"@") +",";
				}
				uri = uri.replace(new RegExp("["+","+"]+$"), "");
				uri += "&";
			}
		}else if($($(".inspirationWallToolbarSelected")[1]).text() == "Exterior"){
			filterOption  = inspirationWall.EXTERIOR;
			var filterTypes = $(".exteriorFilters").find(".filterOptions");
			for(var i=0; i<filterTypes.length; i++){
				var filter = $(filterTypes[i]).find(".filterHeading").text() ;
				if(filter == 'Room Colors'){
					filter = "RoomColor_Id";
				}else{
					filter = filter.split(" ").join("") + "_Id";
				}
				uri += filter +"=";
				var selectedFilters = $(filterTypes[i]).find('input[type=checkbox]:checked');
				for(var j=0; j<selectedFilters.length; j++){
					if($(selectedFilters[j]).val() != "All")
					uri += $(selectedFilters[j]).val().replace(/&/g,"@") +",";
				}
				uri = uri.replace(new RegExp("["+","+"]+$"), "");
				uri += "&";
			}
		}
		uri = uri.substring(0, uri.lastIndexOf('&'));
		console.log("URI: " + uri);
		var filters = {
				"filterUri" : uri,
				"filterOption" : filterOption
				
		}
		// Getting updated data.
		Webservice.getInspirationWallData(inspirationWall.GALLERY,filters,InspirationWall.vm.success,InspirationWall.vm.error);
		$("#filtersContainer").hide();
	},
	
	FiltersViewModel : function(data) {

		var self = this;
		self.interiorFilterList = ko.observableArray();
		self.exteriorFilterList = ko.observableArray();

		for(var i=0; i<data.length; i++){
			if(data[i].Value == "Interior"){
				var temp = data[i];
				for ( var prop in temp) {
					if (temp[prop] instanceof Array && temp[prop].length >0) {
						var filter = prop.split("_")[1].match(/[A-Z][a-z]+/g).join(" ");
						self[filter] = ko.observableArray(temp[prop])
						self[filter].splice(0,0,{"Value" : "All"});
						self.interiorFilterList.push({"name" : filter, values : self[filter]});
					}
				}
			}else if(data[i].Value == "Exterior"){
				var temp = data[i];
				for ( var prop in temp) {
					if (temp[prop] instanceof Array && temp[prop].length >0) {
						var filter = prop.split("_")[1].match(/[A-Z][a-z]+/g).join(" ");
						self[filter] = ko.observableArray(temp[prop])
						self[filter].splice(0,0,{"Value" : "All"});
						self.exteriorFilterList.push({"name" : filter, values : self[filter]});
					}
				}
			}
		}
		
		self.renderedHandler = function(){
//			setTimeout(function(){
//				if(Filters.scrollers && Filters.scrollers.length > 0){
//					for(var j=0; j<Filters.scrollers.length; j++){
//						Filters.scrollers[j].refresh();
//					}
//				}
//			},10000)
		};
	}
};
