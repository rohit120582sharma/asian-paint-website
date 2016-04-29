//-----------------------------------------------------------------------
//------------Structure to pass uniform Shader Parameters----------------
//-----------------------------------------------------------------------
function CStateCorrection ()
{
	// Call the parent constructor
	CCState.call(this, EN_STATE.enCorrection);
	
	this.fBrightness	= 0.0;					//Range{-1.0, 1.0}
	this.fContrast		= 1.0;					//Range{0.0, 2.0}
	this.fSharpness		= 0.0;					//Range{0.0, 1.0}
	this.bisSkipped		= false;

	/*
	if(this.refImageIndex == textureLib ... )
	{
		this.refImageIndex = 0;
	}
	*/
}

//-----------------------------------------------------------------------
//------------------------inheriting class "CState"----------------------
//-----------------------------------------------------------------------
CStateCorrection.prototype = new CCState();

//------------------------------------------------------------------------------------------------
//-----reinitializing the constructor to it's own class pointer because it points to CCState------
//------------------------------------------------------------------------------------------------
CStateCorrection.prototype.constructor = CStateCorrection;

//-----------------------------------------------------------------------------------------------------
//------------overall functionality of post processing of quads with specific shaders------------------
//-----------------------------------------------------------------------------------------------------
CStateCorrection.prototype.processState = function()
{
	if(!stateCommon.iOriginalTex)
		stateCommon.iOriginalTex = textureLib.allocateEmptyScreenSizeTexture();
	
	rendererClass.bindOffScreenFBO(rendererClass.iSelectionTex);
	
	//alert("Texture Name: "+rendererClass.iOriginalTexName);
	var temp_texture = textureLib.getTextureAt(0);
	
	// bind the simple texture shader
	gl.useProgram(shaderLib.shaderBrightnessContrast.uiId);
	
	gl.uniform1f(shaderLib.shaderBrightnessContrast.uiBrightness, this.fBrightness);
	gl.uniform1f(shaderLib.shaderBrightnessContrast.uiContrast, this.fContrast);
	
	//rendererClass.drawFullScreenImage(cubeTexture);// textureLib.textures[0].texID);										//-textureLib.texture[0].texID
	rendererClass.drawFullScreenImage(temp_texture.texID);
		
	// attach different texture with FBO
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, stateCommon.iOriginalTex, 0);
	
//	if(gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
//	{
//		alert("ERROR: Frame buffer with tex[1] not set up correctly");
//	}
	
	gl.clear(gl.COLOR_BUFFER_BIT);
	var test = 0.1;
	test = 1.0/temp_texture.width;
	
	// Render the final result/image on screen
	gl.useProgram(shaderLib.shaderSharpness.uiId);
	gl.uniform1f(shaderLib.shaderSharpness.uiImageWidth, test);			//-???
	test = 1.0/temp_texture.height;
	gl.uniform1f(shaderLib.shaderSharpness.uiImageHeight, test);			//-???
	gl.uniform1f(shaderLib.shaderSharpness.uiSharpness, this.fSharpness);
	
	rendererClass.drawFullScreenImage(rendererClass.iSelectionTex);

	rendererClass.bindOriginalFBO();
	
	//if skip pressed no need to render full screen
	if(!this.bisSkipped)
	{
		gl.clear(gl.COLOR_BUFFER_BIT);
		
		// draw the original full screen texture
		gl.useProgram(shaderLib.shaderTex.uiId);
		
		// Render the final result/image on screen
		rendererClass.drawFullScreenImage(stateCommon.iOriginalTex);		//Drawing texture rendered by custom FBO
	}
	
}

//function getBrightness()
//{
//	return this.fBrightness;
//}
//
//
//function GetContrast()
//{
//	return this.fContrast;
//}
//
//function GetSharpness()
//{
//	return this.fSharpness;
//}

//-----------------------------------------------------------------------
//-------------initializing local variable for brightness----------------
//-----------------------------------------------------------------------
CStateCorrection.prototype.setBrightness = function(fl_Brightness)
{
	this.fBrightness = fl_Brightness;
}

//-----------------------------------------------------------------------
//--------------initializing local variable for contrast-----------------
//-----------------------------------------------------------------------
CStateCorrection.prototype.setContrast = function(fl_Contrast)
{
	this.fContrast = fl_Contrast;
}

//-----------------------------------------------------------------------
//--------------initializing local variable for sharpness----------------
//-----------------------------------------------------------------------
CStateCorrection.prototype.setSharpness = function(fl_Sharpness)
{
	this.fSharpness = fl_Sharpness;
}

//-----------------------------------------------------------------------------------------------------
//------------------initialization of local variables with specific parameters-------------------------
//-----------------------------------------------------------------------------------------------------
CStateCorrection.prototype.processMessage = function(message)
{
	switch(message.type)
	{
		// process the image correction message
		case messageType.ImageCorrected:
		{
			this.fBrightness	= message.fBrightness;
			this.fContrast		= message.fContrast;
			this.fSharpness		= message.fSharpness;
			break;
		}
		// Parameters set to default
		case messageType.SkipToChroma:
		{			
			this.fBrightness = 0.0;
			this.fContrast = 1.0;
			this.fSharpness = 0.0;
			
			//Skip pressed
			this.bisSkipped = true;				
			
			//Copy Default Image (Without Effect) for further Stages in StateComman-OriginalTex
			rendererClass.copyTexture(textureLib.textures[0].texID, stateCommon.iOriginalTex);
			break;
		}
		//skip not pressed
		case messageType.ProceedToChroma:
		{
			this.bisSkipped = false;
			
			//Copy Current Image (With Effect) for further Stages
			rendererClass.copyTexture(stateCommon.iOriginalTex, rendererClass.texWallUndoRedo[rendererClass.iCurrentLevel]);
			break;
		}
		default:
			break;
	}
	return false;
}

CStateCorrection.prototype.leaveState = function()
{
};