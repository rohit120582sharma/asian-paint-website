//---------------------------------------
//----------State Eraser Class-----------
//---------------------------------------
function CStateEraser()
{
	// Call the parent constructor
	CCState.call(this, EN_STATE.enEraser);
	
	//texture ids for base texture , eraser texture and the texture to be erased
	this.idBaseTex	= 0;
	this.idToErase	= 0;
	this.idEraser	= false;
	this.brushVerticesBuffer 	= gl.createBuffer();
	this.brushTexBuffer 		= gl.createBuffer();
	this.brushTex1Buffer 		= gl.createBuffer();
	
	this.bErase = false;
	this.vfEraserSize 		= new Array(20.0,20.0);
	this.vfErasePoint 		= new Array(2);
	this.vfEraseTexPoint 	= new Array(2);
	this.M_PI = 3.14159265358979323846;
	
	this.eraserTextureName = "assets/eraser.png";
	this.eraserSquareTextureName = "assets/SquareBrush.png";
	
	this.brushZoomVerticesBuffer = gl.createBuffer();
	this.brushZoomTexBuffer = gl.createBuffer();
	this.brushZoomBoundVertBuffer = gl.createBuffer();
	
	this.brushVert2Buffer = gl.createBuffer();
	
	this.bSquare = false;
}

//-----------------------------------------------------------------------
//------------------------inheriting class "CState"----------------------
//-----------------------------------------------------------------------
CStateEraser.prototype = new CCState();

//------------------------------------------------------------------------------------------------
//-----reinitializing the constructor to it's own class pointer because it points to CCState------
//------------------------------------------------------------------------------------------------
CStateEraser.prototype.constructor = CStateEraser;

CStateEraser.prototype.processState = function()
{
	// Applying General Texture Shader
	gl.useProgram(shaderLib.shaderTex.uiId);						
	
	// resets the daylight to slider value
	//glUniform1f(gShaderLib->m_ShaderTex.uiDayLight, gCCRenderer->m_fDayLight);
	
	// reset the matrix for drawing on screen
	gl.uniformMatrix4fv(shaderLib.shaderTex.uiMVPMatrixLoc, false, rendererClass.matOrtho);
	
	gl.activeTexture(gl.TEXTURE0);
	
	// Render the Screen with Base Texture	
	rendererClass.drawFullScreenImage(rendererClass.texWallUndoRedo[rendererClass.iCurrentLevel]);
	
	//if we are erasing we render the eraser using eraser shader which will perform the erasing on the image rendered in above draw call
	if(this.bErase)
	{
		stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.bLayerPainted = true;
		
		///if we are brushing render the selected color/tex using chroma shader on top
		//rendererClass.copyTexture(rendererClass.texWallUndoRedo[rendererClass.iCurrentLevel], this.idTextureLayer);
		
		var fEraserSize = new Array(2);
		fEraserSize[0] = this.vfEraserSize.elements[0] * (2.0/rendererClass.iImageW);
		fEraserSize[1] = this.vfEraserSize.elements[1] * (2.0/rendererClass.iImageH);
		
		// this is the vertex buffer based on Eraser size
        var fVerts = new Array();
        
        fVerts.push(this.vfErasePoint[0]-fEraserSize[0]);							// ---------X(LU) 	
        fVerts.push(this.vfErasePoint[1]-fEraserSize[1]);							// ---------Y(LU)  
        fVerts.push(this.vfErasePoint[0]+fEraserSize[0]);							// ---------X(RU) 
        fVerts.push(this.vfErasePoint[1]-fEraserSize[1]);							// ---------Y(RU)
        fVerts.push(this.vfErasePoint[0]-fEraserSize[0]);							// ---------X(LD)		
        fVerts.push(this.vfErasePoint[1]+fEraserSize[1]);							// ---------Y(LD)
        fVerts.push(this.vfErasePoint[0]+fEraserSize[0]);							// ---------X(RD)
        fVerts.push(this.vfErasePoint[1]+fEraserSize[1]);							// ---------Y(RD)

        fEraserSize[0] = this.vfEraserSize.elements[0] * (1.0/rendererClass.iImageW);
		fEraserSize[1] = this.vfEraserSize.elements[1] * (1.0/rendererClass.iImageH);
		
		// Array to store Texture Coordinate (UV Maps)
		var fTexCoord1 = new Array();
        for(var i = 0; i<8; i++)
        	fTexCoord1.push((fVerts[i] + 1.0) / 2.0);
        
        var fTexCoord2 =
            [
                0.0, 0.0,
                1.0, 0.0,
                0.0, 1.0,
                1.0, 1.0,
            ];
        
        rendererClass.bindOffScreenFBO(rendererClass.iSelectionTex);
        
        // Applying General Texture Shader
        gl.useProgram(shaderLib.shaderTex.uiId);
    	gl.activeTexture(gl.TEXTURE0);
    	
    	gl.uniformMatrix4fv(shaderLib.shaderTex.uiMVPMatrixLoc, false, rendererClass.matIdentity);    	
    	
        // render the painted texture from undo-redo stack.
    	rendererClass.drawFullScreenImage(rendererClass.texWallUndoRedo[rendererClass.iCurrentLevel]);    	
       
        // now carry out the Eraser operation
        // bind the original texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, stateCommon.iOriginalTex);
        
        // bind the painted texture (changed Texture)
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, rendererClass.texWallUndoRedo[rendererClass.iCurrentLevel]);

        // bind the eraser texture
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, stateCommon.idBrush);  
        
        // Applying Eraser Shader
		gl.useProgram(shaderLib.shaderEraser.uiId);		
		gl.uniformMatrix4fv(shaderLib.shaderEraser.uiMVPMatrixLoc, false, rendererClass.matIdentity);

		// Attaching attribute for Eraser - Quad
        gl.enableVertexAttribArray(0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.brushVerticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fVerts), gl.STATIC_DRAW);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        
        // Attaching attribute for Original Texture Coordinate in Background - Quad
        gl.enableVertexAttribArray(1);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.brushTexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fTexCoord1), gl.STATIC_DRAW);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
        
        // Attaching attribute for Eraser Texture Coordinate
        gl.enableVertexAttribArray(2);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.brushTex1Buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fTexCoord2), gl.STATIC_DRAW);
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);
        
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);        

        // bind the original FBO
        rendererClass.bindOriginalFBO();
        gl.activeTexture(gl.TEXTURE0);
                
        // swap the read/write textures
        rendererClass.copyTexture(rendererClass.iSelectionTex, rendererClass.texWallUndoRedo[rendererClass.iCurrentLevel]);
        
        
        // ----------------------------------------------
        // render a zoomed window view of the eraser site 
        // ----------------------------------------------
        var zoomLevel = 3.0;
		var zoomWindowSize = 500.0;
		zoomWindowSize/= (rendererClass.iImageW + rendererClass.iImageH);
		var vSizeZoomWindow = new Array(zoomWindowSize, zoomWindowSize);
		var vPosZoomWindow = new Array(-this.vfErasePoint[0]*rendererClass.fAspectRatio, -this.vfErasePoint[1]);

		if(vPosZoomWindow[0] > 0.0)
			vPosZoomWindow[0] = rendererClass.fCanvasW - vSizeZoomWindow[0];
		else
			vPosZoomWindow[0] = -rendererClass.fCanvasW + vSizeZoomWindow[0];

		vPosZoomWindow[1] = 0.0;
		
		var fVerts1 = new Array();        
        													
        fVerts1.push(vPosZoomWindow[0]-vSizeZoomWindow[0]);					// ---------X	
        fVerts1.push(vPosZoomWindow[1]-vSizeZoomWindow[1]);					// ---------Y
        fVerts1.push(vPosZoomWindow[0]+vSizeZoomWindow[0]);					// ---------X
        fVerts1.push(vPosZoomWindow[1]-vSizeZoomWindow[1]);					// ---------Y
        fVerts1.push(vPosZoomWindow[0]-vSizeZoomWindow[0]);					// ---------X
        fVerts1.push(vPosZoomWindow[1]+vSizeZoomWindow[1]);					// ---------Y
        fVerts1.push(vPosZoomWindow[0]+vSizeZoomWindow[0]);					// ---------X
        fVerts1.push(vPosZoomWindow[1]+vSizeZoomWindow[1]);					// ---------Y

        var fTexCoord3 = new Array();
        
        fTexCoord3.push(this.vfEraseTexPoint[0]-fEraserSize[0]*zoomLevel);		// ---------X
        fTexCoord3.push(this.vfEraseTexPoint[1]-fEraserSize[1]*zoomLevel);		// ---------Y
        fTexCoord3.push(this.vfEraseTexPoint[0]+fEraserSize[0]*zoomLevel);		// ---------X
        fTexCoord3.push(this.vfEraseTexPoint[1]-fEraserSize[1]*zoomLevel);		// ---------Y
        fTexCoord3.push(this.vfEraseTexPoint[0]-fEraserSize[0]*zoomLevel);		// ---------X
        fTexCoord3.push(this.vfEraseTexPoint[1]+fEraserSize[1]*zoomLevel);		// ---------Y
        fTexCoord3.push(this.vfEraseTexPoint[0]+fEraserSize[0]*zoomLevel);		// ---------X
        fTexCoord3.push(this.vfEraseTexPoint[1]+fEraserSize[1]*zoomLevel);		// ---------Y
                
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, rendererClass.texWallUndoRedo[rendererClass.iCurrentLevel]);

        gl.useProgram(shaderLib.shaderTex.uiId);
        gl.uniformMatrix4fv(shaderLib.shaderTex.uiMVPMatrixLoc, false, rendererClass.matOrtho);

        gl.enableVertexAttribArray(0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.brushZoomVerticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fVerts1), gl.STATIC_DRAW);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        
        gl.enableVertexAttribArray(1);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.brushZoomTexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fTexCoord3), gl.STATIC_DRAW);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
        
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        
        // ------------------------------------------
        // render the boundary of Zoom Eraser Window.
        // ------------------------------------------
        gl.useProgram(shaderLib.shaderProgramColor.uiId);

        var fColor = [0.0, 0.0, 0.0];
        gl.uniform3fv(shaderLib.shaderProgramColor.uiColor, fColor);

        var vScale = [1.0, 1.0];
        gl.uniform2fv(shaderLib.shaderProgramColor.uiScale, vScale);

        var fVerts2 = new Array();
        
        fVerts2.push(vPosZoomWindow[0]-vSizeZoomWindow[0]);			//---------X		
        fVerts2.push(vPosZoomWindow[1]-vSizeZoomWindow[1]);			//---------Y
        fVerts2.push(vPosZoomWindow[0]+vSizeZoomWindow[0]);			//---------X
        fVerts2.push(vPosZoomWindow[1]-vSizeZoomWindow[1]);			//---------Y
        fVerts2.push(vPosZoomWindow[0]+vSizeZoomWindow[0]);			//---------X
        fVerts2.push(vPosZoomWindow[1]+vSizeZoomWindow[1]);			//---------Y
        fVerts2.push(vPosZoomWindow[0]-vSizeZoomWindow[0]);			//---------X
        fVerts2.push(vPosZoomWindow[1]+vSizeZoomWindow[1]);			//---------Y
        
        gl.enableVertexAttribArray(0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.brushZoomBoundVertBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fVerts2), gl.STATIC_DRAW);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        
        gl.lineWidth(2.0);
        if(rendererClass.b_isBrowserIE)
    		rendererClass.drawLineLoop(fVerts2);
    	else
    		gl.drawArrays(gl.LINE_LOOP, 0, 4);

        var vRadius = new Array(vSizeZoomWindow[0]/zoomLevel, vSizeZoomWindow[1]/zoomLevel);
        
        
        if(this.bSquare)
        {
        	var fVerts3 = new Array();
            
            fVerts3.push(vPosZoomWindow[0]-vRadius[0]);			//---------X
            fVerts3.push(vPosZoomWindow[1]-vRadius[1]);			//---------Y
            fVerts3.push(vPosZoomWindow[0]+vRadius[0]);			//---------X		
            fVerts3.push(vPosZoomWindow[1]-vRadius[1]);			//---------Y
            fVerts3.push(vPosZoomWindow[0]+vRadius[0]);			//---------X
            fVerts3.push(vPosZoomWindow[1]+vRadius[1]);			//---------Y
            fVerts3.push(vPosZoomWindow[0]-vRadius[0]);			//---------X
            fVerts3.push(vPosZoomWindow[1]+vRadius[1]);			//---------Y
            
			gl.enableVertexAttribArray(0);
	        gl.bindBuffer(gl.ARRAY_BUFFER, this.brushVert2Buffer);
	        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fVerts3), gl.STATIC_DRAW);
	        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
			
			gl.lineWidth(2.0);
			if(rendererClass.b_isBrowserIE)
	    		rendererClass.drawLineLoop(fVerts3);
	    	else
	    		gl.drawArrays(gl.LINE_LOOP, 0, 4);
        }
        else
        {
        	// -------------------------------------------------
        	// draw a circle in the centre to show eraser bounds
        	// -------------------------------------------------
			var iVerts = 20;
			var f2Verts = new Array();
			var fTheta = this.M_PI * 2.0 / iVerts;
			for(var i=0; i<iVerts; i++)
			{
				f2Verts[2*i] = vPosZoomWindow[0] + vRadius[0]*Math.cos(fTheta*i);
				f2Verts[2*i+1] = vPosZoomWindow[1] + vRadius[1]*Math.sin(fTheta*i);
			}

			gl.enableVertexAttribArray(0);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.brushVert2Buffer);
	        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(f2Verts), gl.STATIC_DRAW);
			gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
			
			if(rendererClass.b_isBrowserIE)
	    		rendererClass.drawLineLoop(f2Verts);
	    	else
	    		gl.drawArrays(gl.LINE_LOOP, 0, iVerts);
        }
	}

}

//-----------------------------------------------------------------------------------------------------
//------------------initialization of local variables with specific parameters-------------------------
//-----------------------------------------------------------------------------------------------------
CStateEraser.prototype.processMessage = function(message)
{
	var res = false;
	this.prevpoint = new Array(100.0, 100.0);
	switch(message.type)
	{
		// Working on touch
		case messageType.TouchDown:
		{
			// on each touch down we need to save and increment undo stack
			// GLuint srcid = gCCRenderer->m_uiWallTex[gCCRenderer->m_iCurrentLevel];
			
			var prevLevel = rendererClass.iCurrentLevel;								
			rendererClass.incrementLevel();
			rendererClass.copyTexture(rendererClass.texWallUndoRedo[prevLevel], rendererClass.texWallUndoRedo[rendererClass.iCurrentLevel]);
			//gCCRenderer->CopyTexture(srcid,gCCRenderer->m_uiWallTex[gCCRenderer->m_iCurrentLevel]);
			
			this.bErase = true;
			
			//to store Eraser - position
			this.vfErasePoint[0] = (2.0*(rendererClass.touchPoint.elements[0] / rendererClass.iImageW) - 1.0);
			this.vfErasePoint[1] = (2.0*(rendererClass.iScreenHeight - rendererClass.touchPoint.elements[1]) / rendererClass.iImageH - 1.0);
			
			//to store Texture Eraser position
			this.vfEraseTexPoint[0] = (rendererClass.touchPoint.elements[0] / rendererClass.iImageW);
			this.vfEraseTexPoint[1] = (rendererClass.iScreenHeight - rendererClass.touchPoint.elements[1]) / rendererClass.iImageH;
			
//				CCStateMasking *tmpMasking = static_cast<CCStateMasking*>(gCCStateManager->GetStateInstance(enMasking));
//				if(!tmpMasking->isGlobalUndoDone())
//					tmpMasking->UndoPolygon();
			
			break;
		}
		// Working on touch move
		case messageType.TouchMove:
		{
			this.bErase = true;
			
			//during touch move we will update the eraser and its texture corrdinates to be used later during rendering
			this.vfErasePoint[0] = (2.0 * (rendererClass.touchPoint.elements[0] / rendererClass.iImageW) - 1.0);
			this.vfErasePoint[1] = (2.0 * (rendererClass.iScreenHeight - rendererClass.touchPoint.elements[1]) / rendererClass.iImageH - 1.0);

			if( (this.vfErasePoint - this.prevpoint).length < (5.0 / rendererClass.iScreenHeight )  )
				return false;

			this.vfEraseTexPoint[0] = (rendererClass.touchPoint.elements[0] / rendererClass.iImageW);
			this.vfEraseTexPoint[1] = (rendererClass.iScreenHeight - rendererClass.touchPoint.elements[1]) / rendererClass.iImageH;
			this.bErase = true;
			this.prevpoint = this.vfErasePoint;
			break;
		}
		case messageType.TouchUp:
		{
			// eraser operation complete
			this.bErase = false;
			break;
		}
		// Eraser Circular Brush Size - 1 (as small)
		case messageType.EraserSize1:
		{
			stateCommon.idBrush = textureLib.getTexture(this.eraserTextureName).texID;
			this.vfEraserSize = Vector.create([10.0, 10.0]);
			this.bSquare = false;
			break;
		}
		// Eraser Circular Brush Size - 2 (as medium)
		case messageType.EraserSize2:
		{
			stateCommon.idBrush = textureLib.getTexture(this.eraserTextureName).texID;;
			this.vfEraserSize = Vector.create([20.0, 20.0]);
			this.bSquare = false;
			break;
		}
		// Eraser Circular Brush Size - 3 (as large)
		case messageType.EraserSize3:
		{
			stateCommon.idBrush = textureLib.getTexture(this.eraserTextureName).texID;;
			this.vfEraserSize = Vector.create([30.0, 30.0]);
			this.bSquare = false;
			break;
		}
		// Eraser Rectangular Brush Size - 1 (as small)
		case messageType.EraserSquareSize1:
		{
			stateCommon.idBrush = textureLib.getTexture(this.eraserSquareTextureName).texID;
			this.vfEraserSize = Vector.create([10.0, 10.0]);
			this.bSquare = true;
			break;
		}
		// Eraser Rectangular Brush Size - 2 (as medium)
		case messageType.EraserSquareSize2:
		{
			stateCommon.idBrush = textureLib.getTexture(this.eraserSquareTextureName).texID;
			this.vfEraserSize = Vector.create([20.0, 20.0]);
			this.bSquare = true;
			break;
		}
		// Eraser Rectangular Brush Size - 3 (as large)
		case messageType.EraserSquareSize3:
		{
			stateCommon.idBrush = textureLib.getTexture(this.eraserSquareTextureName).texID;
			this.vfEraserSize = Vector.create([30.0, 30.0]);
			this.bSquare = true;
			break;
		}
		
		case messageType.Undo:
			// checks for global undo for mask
		{
			if(stateCommon.bGlobalUndoDone)
				stateCommon.pUndoPolygon();
			break;
		}
/*
		case messageType.LoadedNewTexture:
		case messageType.LoadedOldTexture:
			// gets texture ID for texture paint
		{
			var TexID = message.texID;
			if (stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iTemplateTexture != TexID ||
					stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iApplyTexture <= 1)
			{
				stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iTemplateTexture = TexID;
			
				if (!stateCommon.vLevelValue[rendererClass.iCurrentLevel].bWallFashionImplement)
					stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iApplyTexture = 1;
				else
					stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iApplyTexture = 2;
				
				if (stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.bLayerPainted)
					stateCommon.pApplyChroma();
			}
			break;
		}
		case messageType.Loaded3ToneTexture:
			// gets texture ID for texture paint /// Commenting for integration later
//		{
//			var TexID = gTexHandler->getTextureAt(gTexHandler->getMutliTexLayerAt(0))->mTextureID;
//			if (m_uiTemplateTexture != TexID || m_bApplyTexture <= 1) {
//				m_uiTemplateTexture = TexID;
//
//				TexID = gTexHandler->getTextureAt(gTexHandler->getMutliTexLayerAt(1))->mTextureID;
//				if (m_uiTemplateTexture2 != TexID || m_bApplyTexture <= 1)
//					m_uiTemplateTexture2 = TexID;
//
//				m_vTopColor2 = PVRTVec3(INIT_COLOR_WHITE);
//
//				m_bApplyTexture = 2;
//				gTexHandler->resetMultiTexID();
//				if (stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.bLayerPainted)
//					stateCommon.pApplyChroma();
//			}
			break;
//		}
		case messageType.SetColor:
			// sets the colours to be used to paint walls
		{
			var colourPack = message.colour;

			if ((stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.vTopColor != colourPack.top)
					|| (stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.vBaseColor != colourPack.base1)) {
				
				stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.vTopColor = colourPack.top;
				stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.vBaseColor = colourPack.base1;

				if(stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iApplyTexture == 2)
				{
					if (stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.vTopColor2 != colourPack.base2)
					{
						stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.vTopColor2 = colourPack.base2;
					}
				}
	//			if (!m_bWallFashionImplement)
	//				m_iApplyTexture = 1;
	//			else
	//				m_iApplyTexture = 2;

				if (stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.bLayerPainted)
					stateCommon.pApplyChroma();
			}
			break;
		}
	
		case messageType.SetColor2:
			// sets the colours to be used to paint walls
		{
			var colourPack = message.colour;
			if (!stateCommon.vLevelValue[rendererClass.iCurrentLevel].bWallFashionImplement)
				stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iApplyTexture = 0;
			else
				stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iApplyTexture = 1;
			
			stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.vBaseColor = colourPack.base1;
			
			if (stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.bLayerPainted)
				stateCommon.pApplyChroma();
			
			break;
		}
*/
		default:
			break;
	}
	
	return res;
}

CStateEraser.prototype.enterState = function(enPrevState)
{
	// this.idEraser = false;
	
	stateCommon.idBrush = textureLib.getTexture(this.eraserTextureName).texID;
	this.vfEraserSize = Vector.create([20.0, 20.0]);
	this.bSquare = false;
}

CStateEraser.prototype.leaveState = function()
{
}

CStateEraser.prototype.saveLevel = function(tmpRenderLvlStateValue, isCurrentState)
{
}

CStateEraser.prototype.restoreLevel = function(tmpRenderLvlStateValue)
{
}