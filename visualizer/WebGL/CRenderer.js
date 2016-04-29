var cubeTexture;
var MAX_UNDO_LEVELS = 10;

//Global var for renderer class
var rendererClass;

// this structure is to hold the Screen-shot state as the functionality of 
// reading pixels will be executed only after the completion of rendering loop
var ScreenShotState =
{
	SS_WAITING:					0,
	SS_TAKE:					1,
	SS_READPIXEL:				2
};

function CRenderer(width, height)
{
	// Boolean variable to switch single or multiple screen-shot
    this.b_switch_screenShot = true;
    
    // Boolean variable to check whether the browser is IE or not
    this.b_isBrowserIE = false;
    if(Object.hasOwnProperty.call(window, "ActiveXObject") && !window.ActiveXObject)
    	this.b_isBrowserIE = true;
    
    // Boolean variable to keep track if user interacted with Wall Fashions
    this.bLongTouchAcceptable = true;
	
	this.b_isPreCutMode = false;
	this.b_isUserPreCut = false;
	this.i_precutLayers = 0;
	
	this.iScreenWidth = width;
	this.iScreenHeight = height;
	
	// calculate the screen aspect ratio
	this.fAspectRatio = this.iScreenWidth/this.iScreenHeight;

	// hardcoded for now
	this.iImageW = 1024;
	this.iImageH = 1024;
	
	 // create the texture library
    textureLib = new CTextureLib();
	
	gl.clearColor(0.058, 0.058, 0.058, 1.0);  // Clear to black, fully opaque
	
	gl.disable(gl.DITHER);
	gl.enable(gl.CULL_FACE);

	// set default blend mode
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	// Sets current viewport
	gl.viewport(0, 0, width, height);
	
	// set the ortho matrix
	this.matOrtho = new Float32Array(makeOrtho(-this.fAspectRatio, this.fAspectRatio, -1.0, 1.0, -1.0, 1.0).flatten());
	this.matIdentity = new Float32Array(Matrix.I(4).flatten());
	this.matTexIdentity = new Float32Array(Matrix.I(3).flatten());
	
	// to track long press
	this.longPress = false;
	this.longPressTime = 0;
	this.touchPoint = Vector.create([0, 0]);
	this.screenTouchPoint = Vector.create([0, 0]);
	
	// Keeps track of the increment level cycle --- Needed for Global Undo/Redo Mask
	this.levelCycle = 0;
	this.bUndoCycle = false;
	
	// Creating Instance for Screen-shot-State
	this.i_screenshot_state = ScreenShotState.SS_WAITING;
	
	// Holds all Wall Fashions and handle them
	this.WFHandler = {};
}

//initialize
//
// Function to initialize the rendering resources

CRenderer.prototype.initialize = function()
{
	this.iImageW = textureLib.textures[0].width;
	this.iImageH = textureLib.textures[0].height;
	
	var fImageAspectRatio = this.iImageW/this.iImageH;

	// adjust the image size so as to fit completely with in the canvas
	if( this.fAspectRatio > fImageAspectRatio )
	{
		this.iImageW *= this.iScreenHeight/this.iImageH;
		this.iImageH = this.iScreenHeight;
	}
	else
	{
		this.iImageH *= this.iScreenWidth/this.iImageW;
		this.iImageW = this.iScreenWidth;
	}
	this.iImageH = Math.round(this.iImageH);
	this.iImageW = Math.round(this.iImageW);

	// offset calculation
	this.iOffsetW = (this.iScreenWidth - this.iImageW)/2;
	this.iOffsetH = (this.iScreenHeight - this.iImageH)/2;
	
	// this is the world space dimensions of drawable area
	this.fCanvasW = this.iImageW/this.iScreenHeight;
	this.fCanvasH = this.iImageH/this.iScreenHeight;
	
	// Screen Image Data to be used for processing
	this.arr_ssImg = new Uint8Array(this.iImageW * this.iImageH * 4);
	
	// Initialize the shader library 
	shaderLib = new CShaderLib();
    
    // create the message class
    messageObj = new CMessage();
    
    // create the state common data
    stateCommon = new CCStateCommon();

    // create the state manager    
    stateManager = new CStateManager();
    
    //Textures
    // temporary texture
	this.iSelectionTex = textureLib.allocateEmptyScreenSizeTexture();
	
	// allocate the wall textures (used for undo-redo)
	this.texWallUndoRedo = new Array();
	for(var i=0; i<MAX_UNDO_LEVELS; i++)
	{
		this.texWallUndoRedo[i] = textureLib.allocateEmptyScreenSizeTexture();
	}
    
	// call to load the offscreen FBO
	this.loadSelectionFBO();
	
    // Here's where we call the routine that builds all the objects
    // we'll be drawing.    
    this.initBuffers();
    
    // Next, load and set up the textures we'll be using.    
    this.initTextures();
    
    // Temporary rendering Buffers for IE support
    this.tempIEVerticesBuffer = gl.createBuffer();
    
    // allocate memory to hold screen data
    this.arrImageData = new Uint8Array(this.iImageW * this.iImageH * 4);
    
    // start simulation time
    this.currentTime = (new Date).getTime();
    this.frameTime = 0;			// to calculate FPS
    this.frames = 0;			// to calculate FPS
    
    // this is the default perspective value
    this.fPerspective = 0.0;
    
    // all this is initialization for undo redo
    this.iCurrentLevel = 0;
    this.iPrevLevel = 0;
    this.iUndoLevel = 0;
    this.iRedoLevel = 0;
    this.bUndoEnabled = false;
    this.bRedoEnabled = false;
    
    // initialize bounds vector
    this.addBound();
    
    // indicates if the render target is FBO or not
    this.bRenderTargetFBO = false;
    
    // Wall Fashion Handler object allocated
    this.WFHandler = new CWallFashionHandler();

    // Set up to draw the scene periodically.
    setInterval(drawScene, 15);
};

//initialize
//
// Function to destroy the rendering resources

CRenderer.prototype.destroy = function()
{
	shaderLib.destroy();
	textureLib.destroy();
    messageObj.destroy();
    stateManager.destroy();
	
	gl.deleteBuffer(this.cubeVerticesBuffer);
	gl.deleteBuffer(this.cubeVerticesTextureCoordBuffer);
	gl.deleteBuffer(this.tempIEVerticesBuffer);
	gl.deleteBuffer(this.tempIETexBuffer);
	gl.deleteFramebuffer(this.fboOffscreen);
};

//initBuffers
//
// This is a callback function which is called upon finished loading
// of a texture

CRenderer.prototype.textureLoaded = function(name, texIndex)
{
	switch(name)
	{
	case "assets/wallfashion.jpg":
//		cubeTexture = texID;
//		stateCommon.iOriginalTex = texID;
//		gl.activeTexture(gl.TEXTURE0);
//		this.copyTexture(texID, this.texWallUndoRedo[this.iCurrentLevel]);
//		gl.flush();
		break;
	case "assets/eraser.png":
//		this.copyTexture(texID, stateCommon.idBrush);
		stateCommon.idBrush = textureLib.textures[texIndex].texID;
		break;
	case "assets/SquareBrush.png":
//		this.copyTexture(texID, stateCommon.idBrush);
//		stateCommon.idBrush = texID;
		break;
	case "assets/laser-dot.png":
		stateCommon.idPointTex = textureLib.textures[texIndex].texID;
		break;
	case "assets/Dot.png":
		stateCommon.idVertexTex = textureLib.textures[texIndex].texID;
		break;
	case "assets/ic_rotation_orange.png":
		stateCommon.rotateWFTex = textureLib.textures[texIndex].texID;
		break;
//	case "assets/Spatula.jpg":
//		stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iTemplateTexture = texID
//		break;
//	case "assets/weaving-1-tex.jpg":
//		stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iTemplateTexture = texID
//		break;
//	case "assets/weaving-2-tex.jpg":
//		stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iTemplateTexture2 = texID
//		break;
	default:
		if(!this.iOriginalTexName)
			this.iOriginalTexName = name;
		else if(messageObj)
		{
			messageObj.addMessage({type:messageType.LoadedTexture, texture:texIndex });
		}
//		cubeTexture = texID;
//		stateCommon.iOriginalTex = texID;
//		gl.activeTexture(gl.TEXTURE0);
//		this.copyTexture(texID, this.texWallUndoRedo[this.iCurrentLevel]);
		gl.flush();
		break;
	}
};

// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just have
// one object -- a simple two-dimensional cube.

CRenderer.prototype.initBuffers = function()
{
	// Create a buffer for the cube's vertices.
  	this.cubeVerticesBuffer = gl.createBuffer();
  
  	// Select the cubeVerticesBuffer as the one to apply vertex
  	// operations to from here out.
  
  	gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVerticesBuffer);
  
  	// Now create an array of vertices for the cube.
  
  	var vertices =
  	[
		-1.0, -1.0,
		1.0, -1.0,
		-1.0, 1.0,
		1.0, 1.0
	];											//Vertices for OpenGL Space

  
  	// Now pass the list of vertices into WebGL to build the shape. We
  	// do this by creating a Float32Array from the JavaScript array,
  	// then use it to fill the current vertex buffer.
  
  	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  	
 // Create a buffer for the cube's vertices.
  	this.screenVerticesBuffer = gl.createBuffer();
  
  	// Select the cubeVerticesBuffer as the one to apply vertex
  	// operations to from here out.
  
  	gl.bindBuffer(gl.ARRAY_BUFFER, this.screenVerticesBuffer);
  
  	// Now create an array of vertices for the cube.
  
  	var vertices2 =
  	[
		-this.fCanvasW, -this.fCanvasH,
		this.fCanvasW, -this.fCanvasH,
		-this.fCanvasW, this.fCanvasH,
		this.fCanvasW, this.fCanvasH
	];											//Vertices for OpenGL Space

  
  	// Now pass the list of vertices into WebGL to build the shape. We
  	// do this by creating a Float32Array from the JavaScript array,
  	// then use it to fill the current vertex buffer.
  
  	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices2), gl.STATIC_DRAW);

  	// Map the texture onto the cube's faces.
  
  	this.cubeVerticesTextureCoordBuffer = gl.createBuffer();
  	gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVerticesTextureCoordBuffer);
  
  	var textureCoordinates =
  	[
		0.0, 0.0,
		1.0, 0.0,
		0.0, 1.0,
		1.0, 1.0
	];											//Texture coordinates

  	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                gl.STATIC_DRAW);

};

// For Flipping Screen
CRenderer.prototype.change_TexCoord_Buffer = function(flag)
{
	gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVerticesTextureCoordBuffer);
	
	if (flag == 1)
	{
		var flip_textureCoordinates =
		  	[
				0.0, 1.0,
				1.0, 1.0,
				0.0, 0.0,
				1.0, 0.0
			];											//Texture coordinates
		
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flip_textureCoordinates),
                gl.STATIC_DRAW);
	}
	else if (flag == 2)
	{
		var orig_textureCoordinates =
		  	[
		  	 	0.0, 0.0,
		  	 	1.0, 0.0,
		  	 	0.0, 1.0,
		  	 	1.0, 1.0
			];											//Texture coordinates
		
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(orig_textureCoordinates),
                gl.STATIC_DRAW);
	}
	  	
	  	var test_error = gl.getError();
}

// initTextures
//
// Initialize the textures we'll be using, then initiate a load of
// the texture images. The handleTextureLoaded() callback will finish
// the job; it gets called each time a texture finishes loading.

CRenderer.prototype.initTextures = function()
{
//	stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iTemplateTexture = textureLib.allocateEmptyScreenSizeTexture();
//	stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iTemplateTexture2 = textureLib.allocateEmptyScreenSizeTexture();
};

//loadSelectionFBO
//
// Loads the offscreen FBO

CRenderer.prototype.loadSelectionFBO = function()
{
	// create and bind the off screen FBO
	this.fboOffscreen = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.fboOffscreen);
	
	// create the render to texture target
	this.texFBO = textureLib.allocateEmptyScreenSizeTexture();
	this.texOrig = textureLib.allocateEmptyScreenSizeTexture();
	
	// attach this texture with the FBO
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texFBO, 0);
	
	// check fro completeness of FBO
	if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE)
	{
		alert("ERROR: Frame buffer not set up correctly");
	}
	
	// remove FBO binding
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};

//
// drawScene
//
// Draw the scene.
//
CRenderer.prototype.drawFrame = function()
{
	// calculate FPS and frame time
	var currentTime = (new Date).getTime();
	var elapsedTime = currentTime - this.currentTime;

	this.frameTime += elapsedTime;
	this.currentTime = currentTime;
	this.frames++;

	// time unit in milli seconds
	if(this.frameTime>1000)
	{
		//console.log(this.frames);
		this.frames = 0;
		this.frameTime = 0;
	}
	
	// check for long press event
	if(this.longPress)
	{
		this.longPressTime += elapsedTime;
		if(this.longPressTime > 700)
		{
			this.longPress = false;
			this.longPressTime = 0;
			messageObj.addMessage({type:messageType.LongTouch});
		}
	}
	
	// process all the messages recorded before this frame
	this.processMessage();
	
	// Clear the canvas before we start drawing on it.
	gl.clear(gl.COLOR_BUFFER_BIT);
  
	stateManager.processState();
	
	this.WFHandler.renderWallFashion();
  
  	// Check for Screen-shot-state!
  	if (this.i_screenshot_state == ScreenShotState.SS_TAKE)
  	{
  		
  		
  		// Change Screen-shot-state to READPIXEL
  		// Wall Fashion Image
  		this.i_screenshot_state = ScreenShotState.SS_READPIXEL;
  		ccMain.img_flag = 0;
  		
  		// Boolean flag (default: FALSE) to check Screen-shot command for single or multiple file.
  		if (!this.b_switch_screenShot)
  		{
  			gl.useProgram(shaderLib.shaderTexNoAlpha.uiId);
  			this.save_screenshot_wallfashion();
  			//this.flipped_draw_offscreen_fbo();
  		}
  		else
  		{
  			// ---------------------------------------------------------
  	  		// ----------------PreCut (Functional)----------------------
  	  		//----------------------------------------------------------
  			
  			gl.useProgram(shaderLib.shaderTexNoAlpha.uiId);
  			this.save_screenshot_wallfashion();
  			//this.flipped_draw_offscreen_fbo(this.texWallUndoRedo[this.iCurrentLevel]);
  	  		
  	  		if(this.b_IsPreCutMode)
  			{
  	  			gl.activeTexture(gl.TEXTURE0);
  	  			gl.useProgram(shaderLib.shaderRenderLayerRGB.uiId);
  				for(i=0; i<this.i_precutLayers - 1;i++)
  				{
  					var val = 0.004;															//	(i/255.0);
  					gl.uniform1f(shaderLib.shaderRenderLayerRGB.uiColor, val);

  					gl.clearColor(0.0, 0.0, 0.0, 0.0);
  					gl.clear(gl.COLOR_BUFFER_BIT);
  					//this.drawFullScreenImage(this.texWallUndoRedo[rendererClass.iCurrentLevel]);

  					//For Last layer - image the flag is going to be 1.
  					if (i == (this.i_precutLayers - 2))							
  						ccMain.img_flag = 1;
  					
  					//gCCMain->SaveScreenshot(i + 1);
  					this.flipped_draw_offscreen_fbo(this.texWallUndoRedo[this.iCurrentLevel]);
  					
  				}
  			}
  	  		else
  			{

  				var layer_len = stateCommon.vLayerValue.length;
  				var curr_layer = stateCommon.iCurrentLayer;
  				
  				gl.activeTexture(gl.TEXTURE0);
  				gl.useProgram(shaderLib.shaderRenderLayerRGB.uiId);
  				// alert("vLevelValue: " + stateCommon.vLayerValue.length);
  				
  				// Loop will go on upto the layers created.
  				for (var i_lyr_lcount = 0; i_lyr_lcount < ((layer_len == curr_layer + 1) ? layer_len : (layer_len + 1)); ++i_lyr_lcount)				
  				{
  					//For Last layer - image the flag is going to be 1.
  					if (i_lyr_lcount == layer_len || (i_lyr_lcount == (layer_len - 1)))				
  						ccMain.img_flag = 1;
  					
  					var layer_alpha = i_lyr_lcount/255.0;
  					gl.uniform1f(shaderLib.shaderRenderLayerRGB.uiColor, layer_alpha);
  					gl.clearColor(0.0, 0.0, 0.0, 0.0);
  					
  					gl.clear(gl.COLOR_BUFFER_BIT);
  					
  					// --------------------------------------------------------------------------------------------------
  			  		// gl.readpixel() will return flipped image.Screen Shot of Current (system provided) Render - Buffer.
  			  		// Image is flipped in Reading pixel. Rendering in OffScreen FBO by changing Co-ordinates.
  			  		// --------------------------------------------------------------------------------------------------				
  					this.flipped_draw_offscreen_fbo(this.texWallUndoRedo[this.iCurrentLevel]);
  				}
  				
  			}

  			//m_pWFHandler->ToggleSelected();
  			//m_pKWHandler->ToggleSelected();
 
  		}
  	}
 
}

var tex_fbo;
CRenderer.prototype.save_screenshot_wallfashion = function()
{	
	//this.bindOffScreenFBO(this.texFBO);
	
	gl.readPixels(this.iOffsetW, this.iOffsetH, this.iImageW, this.iImageH, gl.RGBA, gl.UNSIGNED_BYTE, this.arr_ssImg);
	//MainModuleTool.saveImage(rendererClass.arr_ssImg, rendererClass.iImageH, rendererClass.iImageW, false);
	
	gl.bindTexture(gl.TEXTURE_2D, this.texOrig);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.iImageW, this.iImageH, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.arr_ssImg);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	
	//MainModuleTool.saveImage(rendererClass.arr_ssImg, rendererClass.iImageH, rendererClass.iImageW, false);
	this.flipped_draw_offscreen_fbo(this.texOrig);
}

//--------------------------------------------------------------------------------------------------
// gl.readpixel() will return flipped image.Screen Shot of Current (system provided) Render - Buffer.
// Image is flipped in Reading pixel. Rendering in OffScreen FBO by changing Co-ordinates.
// --------------------------------------------------------------------------------------------------
CRenderer.prototype.flipped_draw_offscreen_fbo = function(tex_id)
{
		gl.bindTexture(gl.TEXTURE_2D, this.texFBO);  		
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.iImageW, this.iImageH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		
		this.bindOffScreenFBO(this.texFBO);
		
		// check completeness of FBO
		if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE)
		{
			alert("ERROR: Frame buffer not set up correctly");
		}
		
		this.change_TexCoord_Buffer(1);
		//gl.viewport(0, 0, this.iScreenWidth, this.iScreenHeight);
		
		//this.draw_wallfashion();
		this.drawFullScreenImage(tex_id);
		ccMain.saveScreenshot(ccMain.img_flag);
		// ---------------------------------------------------------
		
		// Reseting the Texture - Coordinate back to original
		// Binding the Original FBO.
		this.change_TexCoord_Buffer(2);
		this.bindOriginalFBO();
		// ---------------------------------------------------------
}

CRenderer.prototype.drawFullScreenImage = function(uiTexID)
{
	gl.bindTexture(gl.TEXTURE_2D, uiTexID);
	
	if(this.bRenderTargetFBO)
	{
		//Passing and enabling vertex array in shaders
		gl.enableVertexAttribArray(0);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVerticesBuffer);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
	}
	else
	{
		//Passing and enabling vertex array in shaders
		gl.enableVertexAttribArray(0);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.screenVerticesBuffer);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
	}
	//Passing and enabling Texture cordinates array in shaders
	gl.enableVertexAttribArray(1);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVerticesTextureCoordBuffer);
	gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

	//Renders the base for image
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

CRenderer.prototype.processMessage = function()
{
	while(messageObj.messages.length)
	{
		var message = messageObj.messages.shift();
//		console.log(message);
		switch(message.type)
		{
		// mouse down event
		case messageType.TouchDown:
			this.longPress = false;
			this.longPressTime = 0;
			this.touchPoint.elements[0] = Math.round(message.pointX - this.iOffsetW);
			this.touchPoint.elements[1] = Math.round(message.pointY + this.iOffsetH);
			
			this.screenTouchPoint.elements[0] = message.pointX;
			this.screenTouchPoint.elements[1] = message.pointY;
			// send the same message to state manager as well
			if(!this.WFHandler.clickHandler())
				stateManager.processMessage(message);
			break;
			
		// mouse up event
		case messageType.TouchUp:
			this.longPress = false;
			this.touchPoint.elements[0] = Math.round(message.pointX - this.iOffsetW);
			this.touchPoint.elements[1] = Math.round(message.pointY + this.iOffsetH);
			
			this.screenTouchPoint.elements[0] = message.pointX;
			this.screenTouchPoint.elements[1] = message.pointY;
			// send the same message to state manager as well
			stateManager.processMessage(message);
			break;
			
		// mouse moved event
		case messageType.TouchMove:
			this.longPress = false;
			this.touchPoint.elements[0] = Math.round(message.pointX - this.iOffsetW);
			this.touchPoint.elements[1] = Math.round(message.pointY + this.iOffsetH);
			
			this.screenTouchPoint.elements[0] = message.pointX;
			this.screenTouchPoint.elements[1] = message.pointY;
			
			this.bLongTouchAcceptable = false;
			// send the same message to state manager as well
			if(!this.WFHandler.dragHandler())
				stateManager.processMessage(message);
			break;
		
		// long touch event
		case messageType.LongTouch:
			console.log(this.touchPoint.elements);
			if(this.bLongTouchAcceptable)
			{
				// send the same message to state manager as well
				stateManager.processMessage(message);
			}
			break;
			
		// Undo event
		case messageType.Undo:
			if(!stateManager.processMessage(message))
				this.undo();
			break;
			
		// Redo event
		case messageType.Redo:
			if(!stateManager.processMessage(message))
				this.redo();
			break;
		
		// process the chroma Shadow Factor message and move forward
		case messageType.ChomaShadowFactor:
		{
			//gCCStateManager->ProcessMessage(enChomaShadowFactor, gMessage->m_pData);
			//gMessage->m_pData += sizeof(int);
			stateManager.processMessage(message);
			
			break;
		}
	
		// Addition of wall fashion
		case messageType.SetWallFashion:
		{
			var WFTemp = new CWallFashion(message.texture.texID, stateCommon.iCurrentLayer);
			var sizeX = 0.0 + message.texture.width/this.iImageW;
			var sizeY = 0.0 + message.texture.height/this.iImageH;
			WFTemp.setSize(sizeX, sizeY);
			this.WFHandler.addWallFashion(WFTemp);
			
//			if(!m_pWFHandler->IsEmpty())
//				gCCMain->WFSelectionCheck(m_pWFHandler->IsAnySelected());
			break;
		}
		
		case  messageType.SetWallFashionColor:
		// sets WallFashion colours
		{
			// forward the events to other states
			var base = message.baseColor;
			base[0] /= 255;
			base[1] /= 255;
			base[2] /= 255;
			this.WFHandler.setWallFashionColor(base);
//			if(!m_pWFHandler->IsEmpty())
//				gCCMain->WFSelectionCheck(m_pWFHandler->IsAnySelected());
			break;
		}
		
		// process the Reset Image message and move forward
		case messageType.ResetImage:
		{
			// reset the global values that are stored here
//			this.fPerspective = 0.0;
			this.addBound();
			
			// setting layerPainted to true
			stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData = new LayerStateValue();
			
			stateCommon.vLayerValue = new Array();
			
			stateCommon.bGlobalUndoDone = false;
			stateCommon.bMaskingActionDone = false;
			stateCommon.bShowMask = false;
			stateCommon.iCurrentLayer = 0;

			// reset the undo redo levels
			this.resetUndoRedoLevel();

			// Copying Image From Current Level to Original-Base Texture of StateComman.
			rendererClass.copyTexture(stateCommon.iOriginalTex, rendererClass.texWallUndoRedo[rendererClass.iCurrentLevel]);

			// Clears all wall fashion
			this.WFHandler.reset();
//			gCCMain->WFSelectionCheck(m_pWFHandler->IsAnySelected());

			// send the reset message to other states
			stateManager.processMessage(message);
			
			messageObj.addMessage({type:messageType.SwitchToChroma});
			
			if(this.b_isPreCutMode)
				stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.bLayerPainted = true;
			break;
		}
		
		// process the Screen-Shot message of "Save"
		case messageType.TakeScreenshot:
		{
			if (this.i_screenshot_state == ScreenShotState.SS_WAITING)
			{
				//m_pWFHandler->ToggleSelected();
				this.b_switch_screenShot = message.b_setScreenShot;
				this.setScreenShot_State();
			}
			break;
		}
		
		// translate the texture
		case messageType.TranslateTexture:
		{
			// forward the events to other states
			stateManager.processMessage(message);
/*
			gCCStateManager->ProcessMessage(enTranslateTexture, gMessage->m_pData);
			gMessage->m_pData += sizeof(ST_POINT);
*/
			break;
		}

		// zoom the texture
		case messageType.ZoomTexture:
		{
			// forward the events to other states
			stateManager.processMessage(message);
/*
			gCCStateManager->ProcessMessage(enZoomTexture, gMessage->m_pData);
			gMessage->m_pData += sizeof(ST_POINT);
*/
			break;
		}

		// rotate the texture
		case messageType.RotateTexture:
		{
			// forward the events to other states
			stateManager.processMessage(message);
/*
			gCCStateManager->ProcessMessage(enRotateTexture, gMessage->m_pData);
			gMessage->m_pData += sizeof(float);
*/
			break;
		}
		
		default:
			// send the same message to state manager as well
			stateManager.processMessage(message);
			break;
		}
		
		// send the same message to state manager as well
		//stateManager.processMessage(message);
	}
};


// initialize the texture matrix such that scale is one and translation is zero
CRenderer.prototype.addBound = function()
{
	stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.stTextureMatrix.vTranslate[0]		= 0.0; 					// Translation Vector as Array
	stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.stTextureMatrix.vTranslate[1]		= 0.0;
	
	stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.stTextureMatrix.vZoom[0]			= 1.0;					// Zoom Vector as Array
	stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.stTextureMatrix.vZoom[1]			= 1.0;
	
	stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.stTextureMatrix.fRotation			= 0.0;
	
	stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.stTextureMatrix.matTexture		= this.matTexIdentity;
}


CRenderer.prototype.incrementLevel = function()
{
	//Storing Current level image data values before incrementing level
	var tmpData = $.extend(true, {}, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData);
	
	this.iPrevLevel = this.iCurrentLevel;
	// increment the current level
	this.iCurrentLevel++;
	
	if(this.bUndoCycle)
	{
		--this.levelCycle;
		this.bUndoCycle = false;
	}
		

	// in case the current crosses the maximum levels, then reset the current level to 0
	if(this.iCurrentLevel == MAX_UNDO_LEVELS)
	{
		this.iCurrentLevel = 0;
		++this.levelCycle;
	}

	// if current level becomes equal to undo level (this can happen once current level crosses the max value)
	// in that case the undo level has to be re-adjusted
	if(this.iCurrentLevel == this.iUndoLevel)
	{
		this.iUndoLevel = 1;
		this.iUndoLevel += this.iCurrentLevel;

		// in case the undo level crosses the maximum levels then that has to be reset to 0
		if(this.iUndoLevel == MAX_UNDO_LEVELS)
			this.iUndoLevel = 0;
	}

	// assign this new level as the redo-level
	this.iRedoLevel = 1;
	this.iRedoLevel *= this.iCurrentLevel;

	//Restoring the image data from previous level 
	stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData = tmpData;
	
	// always update level array
//	stateManager.saveLevel(this.iCurrentLevel);

	// always enable undo in this case
	// TODO
	ccMain.enableUndo();
	this.bUndoEnabled = true;

	// always disable Redo in this case
	// TODO
	ccMain.disableRedo();
	this.bRedoEnabled = false;
};

CRenderer.prototype.saveLevel = function()
{
	stateManager.saveLevel(this.iCurrentLevel);
};

CRenderer.prototype.decreaselevel = function()
{
	if(this.bUndoEnabled)
	{
		// decrement the current level
		this.iCurrentLevel--;

		// in case the it goes out of bounds (correct it)
		if(this.iCurrentLevel<0)
		{
			this.iCurrentLevel = -1;
			this.iCurrentLevel += MAX_UNDO_LEVELS;
			--this.levelCycle;
		}

		// in case it reaches the the current undo-level
		// that means all the undo's have been exhausted
		if(this.iCurrentLevel == this.iUndoLevel)
		{
			// TODO
			ccMain.disableUndo();
			this.bUndoEnabled = false;
		}

		// always restore for current level
//		stateManager.restoreLevel(this.iCurrentLevel);

		// assign this new level as the redo-level
		this.iRedoLevel = 1;
		this.iRedoLevel *= this.iCurrentLevel;
	}
};

CRenderer.prototype.undo = function()
{
	// decrement the current level
	this.iCurrentLevel--;

	// in case the it goes out of bounds (correct it)
	if(this.iCurrentLevel<0)
	{
		this.iCurrentLevel = -1;
		this.iCurrentLevel += MAX_UNDO_LEVELS;
		this.bUndoCycle = true;
	}

	// in case it reaches the the current undo-level
	// that means all the undo's have been exhausted
	if(this.iCurrentLevel == this.iUndoLevel)
	{
		// TODO
		ccMain.disableUndo();
		this.bUndoEnabled = false;
	}

	// always restore for current level
//	stateManager.restoreLevel(this.iCurrentLevel);
	
	stateCommon.bGlobalUndoDone = true;
	// always disable Redo in this case
	// TODO
	ccMain.enableRedo();
	this.bRedoEnabled = true;
	
	LayerTool.undoRedoLayerPreview(stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.oUIData);
};

CRenderer.prototype.redo = function()
{
	// increment the current level
	this.iCurrentLevel++;

	// in case the current crosses the maximum levels, then reset the current level to 0
	if(this.iCurrentLevel == MAX_UNDO_LEVELS)
	{
		this.iCurrentLevel = 0;
		this.bUndoCycle = false;
	}

	// in case it reaches the the current redo-level
	// that means all the redo's have been exhausted
	if(this.iCurrentLevel == this.iRedoLevel)
	{
		// TODO
		ccMain.disableRedo();
		this.bRedoEnabled = false;
	}

	// always restore for current level
//	stateManager.restoreLevel(this.iCurrentLevel);

	// always enable Undo in such a case
	// TODO
	ccMain.enableUndo();
	this.bUndoEnabled = true;
	
	LayerTool.undoRedoLayerPreview(stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.oUIData);
};

CRenderer.prototype.bindOffScreenFBO = function(iTexId)
{
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.fboOffscreen);

	//Rendering done to Destination texture
	if(iTexId)
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, iTexId, 0);

	// adjust the viewport according to the framebuffer dimensions
	gl.viewport(0, 0, this.iImageW, this.iImageH);
	gl.clear(gl.COLOR_BUFFER_BIT);

	// set the flag which tells what is the current render target
	this.bRenderTargetFBO = true;
};

CRenderer.prototype.bindOriginalFBO = function()
{
	// bind the original FBO
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	// set back the original viewport
	gl.viewport(0, 0, this.iScreenWidth, this.iScreenHeight);

	// set the flag which tells what is the current render target
	this.bRenderTargetFBO = false;
};

CRenderer.prototype.copyTexture = function(texSrc, texDest)
{
	var chck = gl.getError();
	this.bindOffScreenFBO(texDest);

	chck = gl.getError();
	//Rendering source texture
	gl.useProgram(shaderLib.shaderTex.uiId);

	chck = gl.getError();
	// reset the ortho matrix for drawing on FBO
	gl.uniformMatrix4fv(shaderLib.shaderTex.uiMVPMatrixLoc, false, this.matIdentity);

	chck = gl.getError();
	// copy the image
	this.drawFullScreenImage(texSrc);

	chck = gl.getError();
	// reset the matrix for drawing on screen
	gl.uniformMatrix4fv(shaderLib.shaderTex.uiMVPMatrixLoc, false, this.matOrtho);

	chck = gl.getError();
	this.bindOriginalFBO();
};

CRenderer.prototype.initStateUndoRedoButtons = function()
{
	// TODO
	//gCCMain->DisableRedo();
	//gCCMain->DisableUndo();
};

CRenderer.prototype.restoreUndoRedoButtons = function()
{
	// TODO
	/*if(m_bUndoEnabled)
		gCCMain->EnableUndo();
	else
		gCCMain->DisableUndo();

	if(m_bRedoEnabled)
		gCCMain->EnableRedo();
	else
		gCCMain->DisableRedo();*/
};

CRenderer.prototype.resetUndoRedoLevel = function()
{
	// Resets current level as the undo and redo level
	this.iUndoLevel = 1;
	this.iRedoLevel = 1;
	this.iUndoLevel *= this.iCurrentLevel;
	this.iRedoLevel *= this.iCurrentLevel;

	// Reset bool variables for undo/redo buttons
	// Resets status of undo redo buttons
	// TODO
	ccMain.disableRedo();
	this.bRedoEnabled = false;
	ccMain.disableUndo();
	this.bUndoEnabled = false;
};

CRenderer.prototype.copyValue = function(srcObj, destObj)
{
	destObj = srcObj + 0;
}

// Convert the screen-shot-state to SS_TAKE
CRenderer.prototype.setScreenShot_State = function()
{
	this.i_screenshot_state = ScreenShotState.SS_TAKE;
	//glReadPixels(0,0,this->m_iScreenW,this->m_iScreenH,GL_RGBA,GL_UNSIGNED_BYTE,m_pImageData);
}

/* ------------------------------- Workaround Functions for IE -----------------------------------*/
// Draw a line loop with line strip as LINE_LOOP is not supported in IE
CRenderer.prototype.drawLineLoop = function(orgVertices)
{
	gl.disableVertexAttribArray(0);
	vertices = new Array();
	for(var i=0; i < orgVertices.length; i++)
		vertices[i] = orgVertices[i];
	vertices[vertices.length] = vertices[0];
	vertices[vertices.length] = vertices[1];
	// now draw the polygon on screen
	gl.enableVertexAttribArray(0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tempIEVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

	// connect the points with lines
	gl.drawArrays(gl.LINE_STRIP, 0, vertices.length/2);
}

// Draw texture on a point
CRenderer.prototype.drawPointTex = function(vertices, texID)
{
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texID);
	gl.useProgram(shaderLib.shaderTex.uiId);
	
	var xSize = 0.025, ySize = 0.025;
	    
	for(var i = 0; i<vertices.length; i+=2 )
	{
		var fVerts = new Array
		(
			(vertices[i]*this.fCanvasW) - xSize, (vertices[i+1]*this.fCanvasH) - ySize,
			(vertices[i]*this.fCanvasW) + xSize, (vertices[i+1]*this.fCanvasH) - ySize,
			(vertices[i]*this.fCanvasW) - xSize, (vertices[i+1]*this.fCanvasH) + ySize,
			(vertices[i]*this.fCanvasW) + xSize, (vertices[i+1]*this.fCanvasH) + ySize
		);											//Vertices for OpenGL Space

		//Passing and enabling vertex array in shaders
		gl.enableVertexAttribArray(0);
	    gl.bindBuffer(gl.ARRAY_BUFFER, this.tempIEVerticesBuffer);
	    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fVerts), gl.STATIC_DRAW);
	    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
	    
	    gl.enableVertexAttribArray(1);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeVerticesTextureCoordBuffer);
		gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
	    
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.enable(gl.BLEND);
		//Renders the base for image
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		gl.disable(gl.BLEND);
	}
}