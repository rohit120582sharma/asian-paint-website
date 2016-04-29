/*History Tool*/
var orientationTool=new Object();

orientationTool.MOVE=0;
orientationTool.ZOOM=1;
orientationTool.ROTATE=2;
var OrientationTool={
		
	previousTab:0,
	/* function to show slider */
	initialize:function()
	{ 
		$('#orientationTool').load("modules/orientationTool/template/orientationTool.html",function(){
			var temp=$(".orientationTabs");//.on("click",OrientationTool.handleOrientationTabClicked);
			temp.on("click",OrientationTool.handleOrientationTabClicked);
			$("#joystickController").html($("#moveTemplate").html());	
		});
		
	},
	handleOrientationTabClicked:function(sender){
		var index=$(".orientationTabs").index(sender.target);
		var backgroundImage;
		switch(index){
				case orientationTool.MOVE:{
					ga('create', 'UA-52354973-9', 'auto');
					ga('send', 'event','button','click','Orientation-Move',1);
					ga('send', 'pageview',{'page': '/mainPage','title': 'Main Page'});
					$("#joystickController").html($("#moveTemplate").html());
					background="./assets/images/Orientation/btn_move_over.png";
					
				 }
				 break;
				 case orientationTool.ZOOM:{
					ga('create', 'UA-52354973-9', 'auto');
					ga('send', 'event','button','click','Orientation-Zoom',1);
					ga('send', 'pageview',{'page': '/mainPage','title': 'Main Page'});
					 $("#joystickController").html($("#zoomTemplate").html());
					 background="./assets/images/Orientation/btn_zoom_over.png";
				 }
				 break;
				 case orientationTool.ROTATE:{
					ga('create', 'UA-52354973-9', 'auto');
					ga('send', 'event','button','click','Orientation-Rotate',1);
					ga('send', 'pageview',{'page': '/mainPage','title': 'Main Page'});
					 $("#joystickController").html($("#rotationTemplate").html());
					 background="./assets/images/Orientation/btn_rotate_over.png";
				 }
				 break;
				 default:{}
		}
		$(".orientationTabs").eq(index).css("background","url("+background+")");
		
		switch(OrientationTool.previousTab){
				case orientationTool.MOVE:{
					background="./assets/images/Orientation/btn_move_normal.png";
				 }
				 break;
				 case orientationTool.ZOOM:{
					 background="./assets/images/Orientation/btn_zoom_normal.png";
				 }
				 break;
				 case orientationTool.ROTATE:{
					 background="./assets/images/Orientation/btn_rotate_normal.png";
				 }
				 break;
				 default:{}
		}
		$(".orientationTabs").eq(OrientationTool.previousTab).css("background","url("+background+")");
		OrientationTool.previousTab=index;
		
	},
	handleMove:function(sender,direction){
		switch(direction){
			case 'left':{
				messageObj.addMessage({type:messageType.TranslateTexture,f_val_Translate_X:-1,f_val_Translate_Y:0});
				console.log("left");
			 }
			 break;
			 case 'right':{
				 messageObj.addMessage({type:messageType.TranslateTexture,f_val_Translate_X:1,f_val_Translate_Y:0});
				 console.log("right");
			 }
			 break;
			 case 'down':{
				 messageObj.addMessage({type:messageType.TranslateTexture,f_val_Translate_X:0,f_val_Translate_Y:-1});
				 console.log("down");
			 }
			 break;
			 case 'up':{
				 messageObj.addMessage({type:messageType.TranslateTexture,f_val_Translate_X:0,f_val_Translate_Y:1});
				 console.log("up");
			 }
			 break;
			 default:{}		
		}
		
	},
	handleZoom:function(sender,parameter){
		if(parameter=='in'){
			messageObj.addMessage({type:messageType.ZoomTexture,f_val_Scale_X:-1,f_val_Scale_Y:-1});
			console.log("in");
		}
		else if(parameter=='out'){
			messageObj.addMessage({type:messageType.ZoomTexture,f_val_Scale_X:1,f_val_Scale_Y:1});
			console.log("out");
		}
		
	},
	handleRotation:function(sender,direction){
		if(direction=='left'){
			messageObj.addMessage({type:messageType.RotateTexture ,f_Rotation:-0.1});
			console.log("left");
		}
		else if(direction=='right'){
			messageObj.addMessage({type:messageType.RotateTexture ,f_Rotation:0.1});
			console.log("right");
		}
	}
};