var canvas;
var gl;

// all these variable are for mouse event handling
var bMouseDown = false;
var timeStampDown;

//
// start
//
// Called when the canvas is created to get the ball rolling.
//
function start() {
	canvas = document.getElementById("glcanvas");
  
  	canvas.addEventListener("mousedown", mouseDown, false);
	canvas.addEventListener("mouseup", mouseUp, false);
	canvas.addEventListener("mousemove", mouseMove, false);
	canvas.addEventListener("dblclick", doubleClick, false);

  // Only continue if WebGL is available and working
  gl = null;
  
  try {
    gl = canvas.getContext("experimental-webgl");
  }
  catch(e) {
  }
  
  // If we don't have a GL context, give up now
  
  	if (!gl) {
    	//alert("Unable to initialize WebGL. Your browser may not support it.");
  	}
  	else
  	{
  		ccMain = new CAppMain();
  		rendererClass = new CRenderer(canvas.width, canvas.height);
  	}
}

function init() {
	if(gl)
	{
		rendererClass.initialize();
  		stateCommon = new CCStateCommon();
	}
}

function mouseDown(event)
{
	/*if($("#footerKitClosed").is(":visible")){
		return;
	}*/
//	if(event.target.id == "glcanvas"){
	if(event.target.id == "glcanvas" && !$("#footerKitClosed").is(":visible")){
		SpectraTool.vm.cancel();
		SpectraTool.openMinimized(event);
	}
	if(event.button==0)
	{
		bMouseDown = true;
		timeStampDown = event.timeStamp;
		elementXPos =  event.offsetX?event.offsetX:(event.pageX - $("#glcanvas").offset().left);
		elementYPos = event.offsetY?event.offsetY:(event.pageY - $("#glcanvas").offset().top);
		messageObj.addMessage({type:messageType.TouchDown, pointX:elementXPos, pointY:elementYPos });
	}
}

function mouseUp(event)
{	
	if(event.button==0)
	{
		bMouseDown = false;
		elementXPos =  event.offsetX?event.offsetX:(event.pageX - $("#glcanvas").offset().left);
		elementYPos = event.offsetY?event.offsetY:(event.pageY - $("#glcanvas").offset().top);
		messageObj.addMessage({type:messageType.TouchUp, pointX:elementXPos, pointY:elementYPos });
	}
}

function doubleClick(event)
{
	/*if($("#footerKitClosed").is(":visible")){
		return;
	}*/
	if(event.button==0)
	{
		//alert("dblclick");
		messageObj.addMessage({type:messageType.LongTouch});
	}
}

function mouseMove(event)
{
	if(bMouseDown && event.button==0)
	{
		elementXPos =  event.offsetX?event.offsetX:(event.pageX - $("#glcanvas").offset().left);
		elementYPos = event.offsetY?event.offsetY:(event.pageY - $("#glcanvas").offset().top);
		messageObj.addMessage({type:messageType.TouchMove, pointX:elementXPos, pointY:elementYPos });
	}
	else
	{
	}
}

function drawScene()
{
	rendererClass.drawFrame();
}