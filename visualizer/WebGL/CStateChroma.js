// -----------------------------------------------------------------------
// -----------Link-list Structure to Store the selected Region------------
// -----------------------------------------------------------------------
function St_Line()
{
	this.startX = 0;
	this.endX	= 0;
	this.posY	= 0;
	
	this.pNext;	
}

// -----------------------------------------------------------------------
// ---------------------------State Base class----------------------------
// -----------------------------------------------------------------------
function CStateChroma()
{
	// Call the parent constructor
	CCState.call(this, EN_STATE.enChroma);
	
	this.textureTemplate1 = cubeTexture;		// this is the texture that is used on chroma
	this.textureTemplate2;						// this is the texture used by 3 tone shader
	
	this.iPreviousLayerID = 0;				// this is a previous layer on which user might have tapped
	this.iBins = 64;						// this is used to control the threshold values (maximum threshold)
	this.iThreshHold = 8;					// this is the current threshold
		
	this.bLongTouchOccured = false;			// tells if a long press was recorded
	this.bPrevStateMasking = false;			// while entering this state if, the previous state was masking
	this.bChromaActionDone = false;			// has chroma action already been done once on this layer
	this.bWallFashionImplement = false;		// if wall fashion has been implemented or not
	this.bPreviousLayer = false;			// if user tapped on a previous layer
	this.bPreviousLayerID = 0;				// if user tapped on a previous layer
	
	this.inR = 0;							// this is the input color bucket in R
	this.inG = 0;							// this is the input color bucket in G
	this.inB = 0;							// this is the input color bucket in B
	
	this.topLine = null;					// initializing link-list structure to Null
}

// -----------------------------------------------------------------------
// ------------------------inheriting class "CState"----------------------
// -----------------------------------------------------------------------
CStateChroma.prototype = new CCState();

// ------------------------------------------------------------------------------------------------
// -----reinitializing the constructor to it's own class pointer because it points to CCState------
// ------------------------------------------------------------------------------------------------
CStateChroma.prototype.constructor = CStateChroma;

// ------------------------------------------------------------------------
// ----------------entry - point function for Chroma State-----------------
// ------------------------------------------------------------------------
CStateChroma.prototype.processState = function()
{

	if(this.bLongTouchOccured)
	{
		this.bLongTouchOccured = false;
		
		// get the current level value in the level stack
		var iCurrentLevel = rendererClass.iCurrentLevel;
		
		// increment the current level stack
		rendererClass.incrementLevel();
		
		// bind off screen FBO for off screen rendering
		rendererClass.bindOffScreenFBO(rendererClass.texWallUndoRedo[rendererClass.iCurrentLevel]);
		
		// bind the simple texture shader
		gl.useProgram(shaderLib.shaderTex.uiId);
		
		// send in the ortho matrix
		gl.uniformMatrix4fv(shaderLib.shaderTex.uiMVPMatrixLoc, false, rendererClass.matIdentity);
		
		// render the current image on the FBO
		rendererClass.drawFullScreenImage(rendererClass.texWallUndoRedo[iCurrentLevel]);
		
		// this is the screen touch point in OpenGL coordinate system
		var iReadX = rendererClass.touchPoint.elements[0];
		var iReadY = rendererClass.iScreenHeight - rendererClass.touchPoint.elements[1];
		
		// read the screen pixel data
		gl.readPixels(0, 0, rendererClass.iImageW, rendererClass.iImageH, gl.RGBA, gl.UNSIGNED_BYTE, rendererClass.arrImageData);
		
		// get the touch point location in the color buffer
		var iPos = 4*(iReadX + iReadY * rendererClass.iImageW);
		
		// variables to store color values from selected image point
		var iRed = rendererClass.arrImageData[iPos];
		var iGreen = rendererClass.arrImageData[iPos+1];
		var iBlue = rendererClass.arrImageData[iPos+2];
		var iAlpha = rendererClass.arrImageData[iPos+3];
		
		//alert("Red: " + iRed + ", Green: " + iGreen + ", Blue: " + rendererClass.arrImageData[iPos+2] + ", Alpha: " + rendererClass.arrImageData[iPos+3]);
		
		this.bPreviousLayer = false;
		
		// check alpha values of the selected point on the image to identify layer
		if (iAlpha < 254) {									//(iAlpha < 255)
			if (iAlpha != stateCommon.iCurrentLayer) {
				this.bPreviousLayer = true;
				this.bPreviousLayerID = iAlpha;
			}
		}		
		
		// check state for pre-cut mode and layer for the identification i.e. different from base (0th) layer
		if(!rendererClass.b_isPreCutMode && !this.bPreviousLayer)
		{
			var vSelectedColor = Vector.create([iRed/256.0, iGreen/256.0, iBlue/256.0]);
			
			// this is the color histogram into which the selected color will lie
			this.inR = Math.floor(this.iBins * vSelectedColor.elements[0]);
			this.inG = Math.floor(this.iBins * vSelectedColor.elements[1]);
			this.inB = Math.floor(this.iBins * vSelectedColor.elements[2]);
			
			// process the read pixels
			// step 1 is to find the highest intensity pixel for this bucket
			// that is used to preserve the image features when replacing colors
			// here we also try and create a contiguos region aroung the touched point
			this.processPoint(iReadX, iReadY);
			
			// if Line selected in image - area, then performing Raster - Scan
			while (this.topLine) 
			{
				this.processLine(this.popLine());
			}
		
			this.updateTextureMatrix();
		}
		
		// create a texture using this modified layer data
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, rendererClass.iSelectionTex);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, rendererClass.iImageW, rendererClass.iImageH, 0, gl.RGBA, gl.UNSIGNED_BYTE, rendererClass.arrImageData);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		
		this.draw(rendererClass.iSelectionTex);
		rendererClass.bindOriginalFBO();
		
		// mark chroma action done on this layer
		this.bChromaActionDone = true;
		
		// setting layerPainted to true
		stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.bLayerPainted = true;
		
		// save the current level values
		//rendererClass.saveLevel();
	}

	//gl.clear(gl.COLOR_BUFFER_BIT);

	// Render the final result/image on screen
	gl.useProgram(shaderLib.shaderTex.uiId);

	// resets the daylight to slider value
	//glUniform1f(gShaderLib->m_ShaderTex.uiDayLight, gCCRenderer->m_fDayLight);

	// reset the matrix for drawing on screen
	gl.uniformMatrix4fv(shaderLib.shaderTex.uiMVPMatrixLoc, false, rendererClass.matOrtho);
	
	// set current texture unit and then render the full-screen quad with current level
	gl.activeTexture(gl.TEXTURE0);

	rendererClass.drawFullScreenImage(rendererClass.texWallUndoRedo[rendererClass.iCurrentLevel]);				//cubeTexture;
	
	if(stateCommon.bShowMask && stateCommon.pMaskRender)
		stateCommon.pMaskRender();//stateManager.renderMaskPoly();
	var err = gl.getError();
};

// ------------------------------------------------------------------------
// ----------------Raster Scaning of the selected lines--------------------
// ------------------------------------------------------------------------
CStateChroma.prototype.processLine = function(pLine) 
{
	// first start processing the points to the top and bottom of this line
	var i = 0;
	for (i = pLine.startX; i < pLine.endX + 1; i++) {
		if (pLine.posY < rendererClass.iImageH - 1)
			this.processPoint(i, pLine.posY + 1);

		if (pLine.posY > 0)
			this.processPoint(i, pLine.posY - 1);
	}
	pLine = null;
}

// ------------------------------------------------------------------------
// ----------------Getting selected lines back from Stack------------------
// ------------------------------------------------------------------------
CStateChroma.prototype.popLine = function() {
	var pLine = null;
	if (this.topLine) 
	{
		pLine = this.topLine;
		this.topLine = this.topLine.pNext;
	}
	return pLine;
}


// ------------------------------------------------------------------------
// -----------------------frame Rendering function-------------------------
// ------------------------------------------------------------------------
CStateChroma.prototype.draw = function(texID)
{
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D,  stateCommon.iOriginalTex); // to use when switch state is enabled
	
	switch(stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iApplyTexture)
	{
		case 1:
			gl.useProgram(shaderLib.shader2LayerTex.uiId);
			gl.uniform1f(shaderLib.shader2LayerTex.uiIntensity, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iIntensity / 255.0);
			gl.uniform1f(shaderLib.shader2LayerTex.uiShadowFac, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.fShadow);

			// send in the texture matrix
			//glUniformMatrix3fv(gShaderLib->m_Shader2LayerTex.uiTextureMatrix, 1,
			//	GL_FALSE, ST_BOUNDS.matTexture);

			// send in the texture matrix
			gl.uniformMatrix3fv(shaderLib.shader2LayerTex.uiTextureMatrix, false, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.stTextureMatrix.matTexture);

			if (this.bPreviousLayer) 
			{
				gl.uniform1f(shaderLib.shader2LayerTex.uiCurrentLayer, this.bPreviousLayerID);
				this.bPreviousLayer = false;
			} 
			else
				gl.uniform1f(shaderLib.shader2LayerTex.uiCurrentLayer, stateCommon.iCurrentLayer);
 			
 			gl.uniform3fv(shaderLib.shader2LayerTex.uiBaseColor, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.vBaseColor);
			gl.uniform3fv(shaderLib.shader2LayerTex.uiTopColor, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.vTopColor);
			
			gl.uniform1f(shaderLib.shader2LayerTex.uiPerspective, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.fPerspective);

//			glUniform1f(gShaderLib->m_Shader2LayerTex.uiDayLight,gCCRenderer->m_fDayLight);

			// we need to create the new texture with not only the layer data but also with the layer colors
			// so redraw on the current level texture with all the new information

			var tex1 = textureLib.textures[stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iTemplateTexture].texID
			// bind the template texture
			gl.activeTexture(gl.TEXTURE2);
			gl.bindTexture(gl.TEXTURE_2D, tex1);
			break;
			
		case 2:
			gl.useProgram(shaderLib.shader3LayerTex.uiId);
			gl.uniform1f(shaderLib.shader3LayerTex.uiIntensity, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iIntensity / 255.0);
			gl.uniform1f(shaderLib.shader3LayerTex.uiShadowFac, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.fShadow);

			// send in the texture matrix
//			glUniformMatrix3fv(gShaderLib->m_Shader3LayerTex.uiTextureMatrix, 1,
//					GL_FALSE, gCCRenderer->m_stCurrentBound.matTexture.f);

			// send in the texture matrix
			gl.uniformMatrix3fv(shaderLib.shader3LayerTex.uiTextureMatrix, false, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.stTextureMatrix.matTexture);

			if (this.bPreviousLayer) 
			{
				gl.uniform1f(shaderLib.shader3LayerTex.uiCurrentLayer, this.bPreviousLayerID);
				this.bPreviousLayer = false;
			} 
			else
				gl.uniform1f(shaderLib.shader3LayerTex.uiCurrentLayer, stateCommon.iCurrentLayer);

			gl.uniform3fv(shaderLib.shader3LayerTex.uiBaseColor, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.vBaseColor);
			gl.uniform3fv(shaderLib.shader3LayerTex.uiTopColor, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.vTopColor);
			gl.uniform3fv(shaderLib.shader3LayerTex.uiTopColor2, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.vTopColor2);
			gl.uniform1f(shaderLib.shader3LayerTex.uiPerspective, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.fPerspective);
//			glUniform1f(gShaderLib->m_Shader3LayerTex.uiDayLight,gCCRenderer->m_fDayLight);

			// we need to create the new texture with not only the layer data but also with the layer colors
			// so redraw on the current level texture with all the new information

			var tex1 = textureLib.textures[stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iTemplateTexture].texID
			var tex2 = textureLib.textures[stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iTemplateTexture2].texID
			
			// bind the template textures
			gl.activeTexture(gl.TEXTURE2);
			gl.bindTexture(gl.TEXTURE_2D, tex1);

			gl.activeTexture(gl.TEXTURE3);
			gl.bindTexture(gl.TEXTURE_2D, tex2);
			break;
			
		default: 
		{
			gl.useProgram(shaderLib.shaderChroma.uiId);
			gl.uniform1f(shaderLib.shaderChroma.uiIntensity, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iIntensity / 255.0);
			gl.uniform1f(shaderLib.shaderChroma.uiShadowFac, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.fShadow);		//...

			// send in the texture matrix
			// gl.uniformMatrix3fv(shaderLib.shaderChroma.uiTextureMatrix, 1,
			// GL_FALSE,  rendererClass.m_stCurrentBound.matTexture.f);
			
			//var gl_error = gl.getError();
			// send in the texture matrix
			//gl.uniformMatrix3fv(shaderLib.shaderChroma.uiTextureMatrix, false, stateCommon.vLevelValue[rendererClass.iCurrentLevel].stTextureMatrix.matTexture);
			
			if (this.bPreviousLayer) 
			{
				gl.uniform1f(shaderLib.shaderChroma.uiCurrentLayer, this.bPreviousLayerID);
				this.bPreviousLayer = false;
			} 
			else
				gl.uniform1f(shaderLib.shaderChroma.uiCurrentLayer, stateCommon.iCurrentLayer);
 			
 			gl.uniform3fv(shaderLib.shaderChroma.uiBaseColor, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.vBaseColor);
            
			//gl.uniform1i(shaderLib.shaderChroma.iApplyTex, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iApplyTexture);
			//		glUniform1f(shaderLib.shaderChroma.uiDayLight, rendererClass.m_fDayLight);

			break;
		}
	}
	
	gl.activeTexture(gl.TEXTURE1);
	rendererClass.drawFullScreenImage(texID);
	//renderClass.drawFullScreenImage(rendererClass.texWallUndoRedo[rendererClass.iCurrentLevel]);
}

// ------------------------------------------------------------------------
// this function is needed when some parameters a have changed and the current layer has to be rendered again
// no selection change is handled in this function
// ------------------------------------------------------------------------
CStateChroma.prototype.applyChroma = function()
{
	// Current level
	var currentLevel = rendererClass.iCurrentLevel;
	
	// increment the texture level (for undo/redo)
	rendererClass.incrementLevel();
	
	// bind the off screen FBO with current-level texture
	rendererClass.bindOffScreenFBO(rendererClass.texWallUndoRedo[rendererClass.iCurrentLevel]);
	
	// using the image data create the new texture (but this texture has got only the layer data)
	gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, rendererClass.texWallUndoRedo[currentLevel]);
    
   	// Draw Call with Current Level Texture
    this.draw(rendererClass.texWallUndoRedo[currentLevel]);
    
    // bind the original FBO
	rendererClass.bindOriginalFBO();	
}

CStateChroma.prototype.updateTextureMatrix = function() 
{
/*
	#if 0
	float Sx = 2.0f / (gCCRenderer->m_stCurrentBound->fRight - gCCRenderer->m_stCurrentBound->fLeft);
	float Sy = gCCRenderer->m_fAspectRatio*2.0f / (gCCRenderer->m_stCurrentBound->fTop - gCCRenderer->m_stCurrentBound->fBottom);
	float Tx = (gCCRenderer->m_stCurrentBound->fLeft*0.5f + 0.5f)*gCCRenderer->m_fAspectRatio;
	float Ty = gCCRenderer->m_stCurrentBound->fBottom*0.5f + 0.5f;
	#endif
*/
	
	var mat3_Translate = trans_matrix_3(stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.stTextureMatrix.vTranslate);
	var mat3_Scale = scale_matrix_3(stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.stTextureMatrix.vZoom);
	var mat3_Rotate = rotate_matrix_3_Z(stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.stTextureMatrix.fRotation);
	
	var resultant_mat = mult_matrix_3_2D(mat3_Scale, mat3_Rotate);						// 2D Matrix Multiplying: Scale-Matrix * Rotational-Matrix
	resultant_mat = mult_matrix_3_2D(resultant_mat, mat3_Translate);					// 2D Matrix Multiplying: (Scale-Matrix * Rotational-Matrix) * Translation-Matrix 
	
	//ST_BOUNDS.matTexture = mat3_2D_to_1D(resultant_mat);								//Converting 2D matrix to Float32Array in 1-Dimension
	stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.stTextureMatrix.matTexture = mat3_2D_to_1D(resultant_mat);
}

// ------------------------------------------------------------------------
// ----------------------------Message Listener----------------------------
// ------------------------------------------------------------------------
CStateChroma.prototype.processMessage = function(message)
{
	var res = false;
	switch(message.type)
	{
	case messageType.LongTouch:
//		var vfTouchPoint[0] = (2.0*(rendererClass.touchPoint.elements[0] / rendererClass.iImageW) - 1.0);
//		var vfTouchPoint[1] = (2.0*(rendererClass.iScreenHeight - rendererClass.touchPoint.elements[1]) / rendererClass.iImageH - 1.0);
		var touchY = Math.round(rendererClass.touchPoint.elements[1] - rendererClass.iOffsetH);
		if(rendererClass.touchPoint.elements[0] > 0 && rendererClass.touchPoint.elements[0] < rendererClass.iImageW &&
				touchY > rendererClass.iOffsetH && touchY < rendererClass.iScreenHeight - rendererClass.iOffsetH)
		this.bLongTouchOccured = true;
		
		// TODO
		//gCCMain->EnableUndo();
		break;
	
	case messageType.Undo:
		if(stateCommon.bGlobalUndoDone)
			stateCommon.pUndoPolygon();
		break;
	
	case messageType.Redo:
		break;
	
	//Get the ThresHold value
	case messageType.ChromaThreshHold:
	{
		var il_ThresHold = message.iThreshHold;
		this.iThreshHold = il_ThresHold;
		break;
	}
	
	case messageType.ToggleMask:
	{
		stateCommon.bShowMask = !stateCommon.bShowMask;
		break;
	}
	
	//Get the Shadow value
	case messageType.ChomaShadowFactor:
	{
		var il_Shadow = message.fShadow;
		stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.fShadow = il_Shadow/100.0;
		
		if (stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.bLayerPainted)
			this.applyChroma();
		
		// save the current level values
		//rendererClass.saveLevel();
		break;
	}
	
	// Resets the image intesity to default vallue
	case messageType.ResetImage:
	{
		stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iIntensity = 500;
		this.bPrevStateMasking = false;
		this.bChromaActionDone = false;
		this.iThreshHold = 8;
		break;
	}

	//Selects a pregenerated layer/a newly added layer
	case messageType.SetLayerToChroma:
	{
		var pLayer = message.iLayer;
		if (pLayer < 255 && (stateCommon.iCurrentLayer !== pLayer)) {
			setLayer(pLayer);
			rendererClass.resetUndoRedoLevel();
		}
		break;
	}
	
	//Sets the texture for single tone/ two tone coats
	case messageType.LoadedTexture:
	{
		var texIndex = message.texture;
		if (stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iTemplateTexture != texIndex || 
				stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iApplyTexture <= 1)
		{
			stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iTemplateTexture = texIndex;
			
			if(stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iTemplateTexture)
				stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iApplyTexture = 1;
			else
				stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iApplyTexture = 0;
			
//			if (stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.bLayerPainted)
//				this.applyChroma();
		}
		break;
	}
	
	//Sets the texture for 3 tone coats
	case messageType.Loaded3ToneTexture:
	{
		var texIndex = textureLib.multiTextures[1];
		if (stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iTemplateTexture != texIndex || 
				stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iApplyTexture <= 1) {
			stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iTemplateTexture = texIndex;

			texIndex = textureLib.multiTextures[0];
			
			if (stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iTemplateTexture2 != texIndex || 
					stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iApplyTexture <= 1)
				stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iTemplateTexture2 = texIndex;

			stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.vTopColor2 = new Float32Array([1.0, 1.0, 1.0]);

			if(stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iTemplateTexture &&
					stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iTemplateTexture2)
				stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iApplyTexture = 2;
			else
				stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iApplyTexture = 0;
			
//			if (stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.bLayerPainted)
//				this.applyChroma();
		}
		break;
	}
	
	//Sets the colour to be used for shading textures
	case messageType.SetColor:
	{
		var base = message.baseColor;
		var top = message.topColor;
		var top2 = message.top2Color;

		var tmpData = $.extend(true, {}, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData);
		
		stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.oUIData = message.layerData;
		stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.vBaseColor = 
			new Float32Array([base[0]/255, base[1]/255, base[2]/255]);
		
		stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.vTopColor = 
			new Float32Array([top[0]/255, top[1]/255, top[2]/255]);

		if(stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iApplyTexture == 2)
		{
			stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.vTopColor2 = 
				new Float32Array([top2[0]/255, top2[1]/255, top2[2]/255]);
		}
		
		var initial = false;
		if(!stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.bLayerPainted)
			initial = true;
			
		if (stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.bLayerPainted)
			this.applyChroma();
		
		if(!initial)
			stateCommon.vLevelValue[rendererClass.iPrevLevel].oImgData = tmpData;
		break;
	}
	
	//Sets the plain colour to be used without any texture
	case messageType.SetColor2:
	{
		var base = message.baseColor;
		
		var tmpData = $.extend(true, {}, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData);
		
		stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iApplyTexture = 0;
		stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.vBaseColor = 
			new Float32Array([base[0]/255, base[1]/255, base[2]/255]);
		stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.oUIData = message.layerData;
		
		var initial = false;
		if(!stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.bLayerPainted)
			initial = true;
			
		if (stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.bLayerPainted)
			this.applyChroma();
		
		if(!initial)
			stateCommon.vLevelValue[rendererClass.iPrevLevel].oImgData = tmpData;
		break;
	}
	
	// translate the texture
	case messageType.TranslateTexture: 
	{
		var v_Translate = new Array(2);
		v_Translate[0] = message.f_val_Translate_X;
		v_Translate[1] = message.f_val_Translate_Y;
		
		stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.stTextureMatrix.vTranslate[0] += v_Translate[0] * 0.1;
		stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.stTextureMatrix.vTranslate[1] += v_Translate[1] * 0.1;

		this.updateTextureMatrix();
		this.applyChroma();
		break;
	}

	// zoom the texture
	case messageType.ZoomTexture: 
	{
		// add zoom
		var v_Zoom = new Array(2);
		v_Zoom[0] = message.f_val_Scale_X;
		v_Zoom[1] = message.f_val_Scale_Y;
		
		stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.stTextureMatrix.vZoom[0] += v_Zoom[0] * 0.1;
		stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.stTextureMatrix.vZoom[1] += v_Zoom[1] * 0.1;
		
		// set minimum limit to zoom values
		if (stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.stTextureMatrix.vZoom[0] < 0.1)
			stateCommon.vLevelValue[rendererClass.iCurrentLevel].stTextureMatrix.vZoom[0] = stateCommon.vLevelValue[rendererClass.iCurrentLevel].stTextureMatrix.vZoom[1] = 0.1;

		this.updateTextureMatrix();
		this.applyChroma();
		break;
	}

	// rotate the texture
	case messageType.RotateTexture: 
	{
		var f_Rotate = message.f_Rotation;			// getting from UI

		stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.stTextureMatrix.fRotation += f_Rotate;

		this.updateTextureMatrix();
		this.applyChroma();
		break;
	}
	

	// rotate the texture
	case messageType.RemoveTone:
	{
			// forward the events to other states
			stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iApplyTexture = 0;
			if (stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.bLayerPainted)
				stateCommon.pApplyChroma();
							
			break;
	}
	

	case messageType.RemoveTone:
	{
			// forward the events to other states
			stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iApplyTexture = 0;
			if (stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.bLayerPainted)
				stateCommon.pApplyChroma();
							
			break;
	}
	

	default:
		break;
	}
	return res;
};


CStateChroma.prototype.enterState = function(enPrevState)
{
	// Initialize the bounds for this layer
	//gCCRenderer->AddBound();
	
//	rendererClass.resetUndoRedoLevel();
	this.bPrevStateMasking = false;
	var temp_lvlStateValue = new RenderLevelStateValue();
	
	switch(enPrevState)
	{
		// when coming from image correction state then we need to initialize undo/redo list texture
		case EN_STATE.enCorrection:
		{
			// Copying Image From Current Level to Original-Base Texture of StateComman.
			rendererClass.copyTexture(stateCommon.iOriginalTex, rendererClass.texWallUndoRedo[rendererClass.iCurrentLevel]);

			if (rendererClass.b_isPreCutMode)	
			{
				if (!rendererClass.b_isUserPreCut)
				{
					gl.colorMask(false, false, false, false);
					rendererClass.bindOffScreenFBO(rendererClass.texWallUndoRedo[rendererClass.iCurrentLevel]);
					gl.useProgram(shaderLib.shaderRenderLayer.uiId);
					
					gl.activeTexture(gl.TEXTURE0);
					gl.colorMask(false, false, false, true);
					
					for (var i_count = 0; i_count < rendererClass.i_precutLayers; ++i_count) 
					{
						var val = i_count / 255.0;
						gl.uniform1f(shaderLib.shaderRenderLayer.uiColor, val);					
						rendererClass.drawFullScreenImage(textureLib.getTextureAt(i_count+1).texID);
						if(i_count > 0)
						{
							setLayer(i_count);
						}
					}
					gl.colorMask(true, true, true, true);
				}
				else
				{
					rendererClass.copyTexture(stateCommon.iOriginalTex, rendererClass.iSelectionTex);
					
					gl.colorMask(false, false, false, false);
					rendererClass.bindOffScreenFBO(rendererClass.texWallUndoRedo[rendererClass.iCurrentLevel]);
					
					gl.useProgram(shaderLib.shaderRenderUserLayer.uiId);
					
					// binds the original texture
					gl.activeTexture(gl.TEXTURE0);
					//gl.bindTexture(gl.TEXTURE_2D, rendererClass.iSelectionTex);
					
					// bind the layer textures
					//gl.activeTexture(gl.TEXTURE1);
					
					gl.colorMask(true, true, true, true);
					
					var temp_tex;
					for (var i_count = 0; i_count < rendererClass.i_precutLayers; ++i_count) 
					{
						var val = i_count / 255.0;
						gl.uniform1f(shaderLib.shaderRenderUserLayer.uiColor, val);
						rendererClass.drawFullScreenImage(textureLib.getTextureAt(i_count+1).texID);
					
						if(i_count > 0)
						{
							setLayer(i_count);
						}
					}
				}
			
				//stateCommon.iCurrentLayer = rendererClass.i_precutLayers;
			
				if (stateCommon.iCurrentLayer < 255)
				{
					stateCommon.iCurrentLayer++;
				
					// Initialize the bounds for this layer
					rendererClass.addBound();
				
					// reset the perspective value
					//stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.fPerspective = 0.0;
				
					// set this value in the chroma shader
					//gl.useProgram(shaderLib.shaderChroma.uiId);
					//gl.uniform1f(shaderLib.shaderChroma.uiPerspective, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.fPerspective);
				}
			
				stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.bLayerPainted = true;
				//rendererClass.resetUndoRedoLevel();
	
				rendererClass.bindOriginalFBO();
			}
			
			rendererClass.copyTexture(rendererClass.texWallUndoRedo[rendererClass.iCurrentLevel], stateCommon.iOriginalTex);
	
			// PreCut Code 
			break;
		}
		
		// when coming from masking state then need to check while leaving chroma state whether action performed in chroma or not
		case EN_STATE.enMasking:
		{
			if (stateCommon.bMaskingActionDone)
				this.bPrevStateMasking = true;
			else
				this.bPrevStateMasking = false;
			
			this.bChromaActionDone = false;
			
			// Copying Image From Selection-Texture to UndoRedo-Texture Stack.
			rendererClass.copyTexture(rendererClass.texWallUndoRedo[rendererClass.iCurrentLevel], rendererClass.iSelectionTex);
			break;
		}
		
		// when coming from perspective correction state then we need to redraw current layer with this perspective
		case EN_STATE.enPerspective:
		{
			if (stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.bLayerPainted)
				this.applyChroma();
			break;
		}
		
		// updating the values to be used for chroma shader which is similar to brush shader
		case EN_STATE.enBrush:
		{
//			this.iIntensity = temp_lvlStateValue.iIntensity;
//			this.textureTemplate1 = temp_lvlStateValue.iTemplateTexture;
//			this.vBaseColor = temp_lvlStateValue.vBaseColor;
//			this.vTopColor1 = temp_lvlStateValue.vTopColor;
//			this.iApplyTexture = tmpVal1.bApplyTexture;
//			this.textureTemplate2 = temp_lvlStateValue.iTemplateTexture2;
//			this.vTopColor2 = temp_lvlStateValue.vTopColor2;
//			this.bWallFashionImplement = temp_lvlStateValue.bWallFashionImplement;
//			this.fShadow = temp_lvlStateValue.fShadow;
			break;
		}
	}

	//rendererClass.resetUndoRedoLevel();
};

CStateChroma.prototype.leaveState = function()
{
	if (this.bPrevStateMasking)
	{
		// After coming from masking state if no action performed then need to void operation done by masking
		if (!this.bChromaActionDone)
		{
			// Delete Polygon-Array Of Polygons from Masking
			//delete 
			stateCommon.pDelLastMask();
			rendererClass.decreaselevel();
		}
	}
};

CStateChroma.prototype.saveLevel = function(tmpStateValue, isCurrentState)
{};

CStateChroma.prototype.restoreLevel = function(tmpStateValue)
{};

// ------------------------------------------------------------------------
// --------------Processing Every Point of Selected Lines------------------
// --------------------------***Correction***------------------------------
// ------------------------------------------------------------------------
CStateChroma.prototype.processPoint = function(il_posX, il_posY)
{
	var iPos = il_posX + il_posY * rendererClass.iImageW;
	iPos *= 4;																		
	// first process the point itself
	//var iColor = rendererClass.arrImageData[iPos];								//Change - Comment
	
	// Proceed forward only if this point has not already been masked
	// and it passes the color's threshhold limit
	if(this.passesThreshholdAndNotAlreadySelected(iPos))
	{
		rendererClass.arrImageData[iPos + 3] = stateCommon.iCurrentLayer;
	}
	else
		return;
	
	// temporary pointer to stack
	var temp_Line = new St_Line();
	
	temp_Line.startX = il_posX;
	temp_Line.endX	= il_posX;
	temp_Line.posY	= il_posY;
	
	// mask the line segment to left of Click - Position
	while(temp_Line.startX > 0)
	{
		iPos = (temp_Line.startX - 1) + il_posY * rendererClass.iImageW;
		iPos *= 4;
		
		if(this.passesThreshholdAndNotAlreadySelected(iPos))
		{
			rendererClass.arrImageData[iPos + 3] = stateCommon.iCurrentLayer;
			temp_Line.startX--;
		}
		else
			break;
	}
	
	// mask the line segment to right of Click - Position
	while (temp_Line.endX < rendererClass.iImageW - 1)
	{
		iPos = (temp_Line.endX + 1) + il_posY * rendererClass.iImageW;
		iPos *= 4;
		
		if(this.passesThreshholdAndNotAlreadySelected(iPos))
		{
			rendererClass.arrImageData[iPos + 3] = stateCommon.iCurrentLayer;
			temp_Line.endX++;
		}
		else
			break;
	}
	
	this.pushLine(temp_Line);
};


// --------------------------------------------------------------------------------------
// --------------Calculating pixel color of lines as per selected texture----------------
// --------------------------------------------------------------------------------------
CStateChroma.prototype.passesThreshholdAndNotAlreadySelected = function(il_Pos)
{
	var i_Color = new Array();
	
	i_Color[0] = rendererClass.arrImageData[il_Pos+0];
	i_Color[1] = rendererClass.arrImageData[il_Pos+1];
	i_Color[2] = rendererClass.arrImageData[il_Pos+2];
	i_Color[3] = rendererClass.arrImageData[il_Pos+3];
	
	if(i_Color[3] < 254)							//(i_Color[3] < 255)
	{
		return false;
	}
	
		
	// RGB is read as BGR because we get swapped data
	var byteR, byteG, byteB;
	byteR = i_Color[0];
	byteG = i_Color[1];
	byteB = i_Color[2];
	
/*
	byteB = (i_Color << 8) >> 24;
	byteG = (i_Color << 16) >> 24;
	byteR = (i_Color << 24) >> 24;
*/
	
	var outR, outG, outB;
	outR = Math.floor(this.iBins * byteR) / 256.0;
	outG = Math.floor(this.iBins * byteG) / 256.0;
	outB = Math.floor(this.iBins * byteB) / 256.0;
	
	if(	Math.abs(this.inR - outR) < this.iThreshHold &&
		Math.abs(this.inG - outG) < this.iThreshHold &&
		Math.abs(this.inB - outB) < this.iThreshHold)
		{
			//Calc intensity of Color
			var il_intenstiy = byteR + byteG + byteB;
			
			// this pixel lies in the selected bucket of color
			if(il_intenstiy > stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iIntensity)
				stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iIntensity = il_intenstiy;
				
			return true;
		}
		
	return false;
}

// ------------------------------------------------------------------------
// -------------------Filling selected lines into Stack--------------------
// ------------------------------------------------------------------------
CStateChroma.prototype.pushLine = function(pLine) {

	if (this.topLine) 
	{
		pLine.pNext = this.topLine;
		this.topLine = pLine;
	} else {
		this.topLine = pLine;
		//this.topLine.pNext;
	}
}

function setLayer(layer)
{
	var temp;

	if (stateCommon.vLayerValue.length == 0
			|| stateCommon.vLayerValue.length
					< (stateCommon.iCurrentLayer + 1)) 
	{			
	
		if(rendererClass.b_isPreCutMode)
			stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.bLayerPainted = true;
			
		//Current layer added to array for first time
		temp = $.extend(true, {}, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData);
		
		// adding a new layer
		stateCommon.vLayerValue.push(temp);

		//		gCCRenderer->m_uiMaxLayer = m_vLayerData.size();	// To check While working on Pre-Cut
		// Initialize the bounds for this layer
		//		gCCRenderer->AddBound();
		
	} else 
	{
		// Old Layer modified
		stateCommon.vLayerValue[stateCommon.iCurrentLayer] =
			$.extend(true, {}, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData);
	}

	stateCommon.iCurrentLayer = layer;

	
	if( stateCommon.vLayerValue.length > stateCommon.iCurrentLayer)				// Loading Data from array if previosly added layer selected
	{
		stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData =
			$.extend(true, {}, stateCommon.vLayerValue[stateCommon.iCurrentLayer]);
			
		if(rendererClass.b_isPreCutMode)
			stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.bLayerPainted = true;

//		gCCRenderer->m_stCurrentBound = temp.stTextureMatrix;
		
	} else {													// Reseting Level data if Fresh New layer selected
		stateCommon.resetCurrentLevelValueDefault(rendererClass.iCurrentLevel);
	}
}