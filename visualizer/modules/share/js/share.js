var Share = {
		vm : "",
		initialize : function(){
			$('#shareModule').load("modules/share/template/shareTemplate.html",function(){
				$("#shareModule").hide();
				console.log("share module loaded");
			});
		},
		
}