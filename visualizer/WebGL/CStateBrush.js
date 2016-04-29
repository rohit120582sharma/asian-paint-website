// State Brush class
function CStateBrush()
{
	// Call the parent constructor
	CCState.call(this, EN_STATE.enBrush);
	
	this.M_PI = 3.14159265358979323846;
	this.bBrushed = false;
	this.bSquare = false;
	this.iSwap = textureLib.allocateEmptyScreenSizeTexture();
	this.idTextureLayer = textureLib.allocateEmptyScreenSizeTexture();
	this.vfEraserSize = [20.0, 20.0];
	this.vfEraserPoint = [0.0, 0.0];
	this.vfEraseTexPoint = [0.0, 0.0];
	
	this.brushVerticesBuffer = gl.createBuffer();
	this.brushTexBuffer = gl.createBuffer();
	this.brushTex1Buffer = gl.createBuffer();
	
	this.brushZoomVerticesBuffer = gl.createBuffer();
	this.brushZoomTexBuffer = gl.createBuffer();
	this.brushZoomBoundVertBuffer = gl.createBuffer();
	
	this.brushVert2Buffer = gl.createBuffer();
}

//inherit State
CStateBrush.prototype = new CCState();

//correct the constructor pointer because it points to CCState
CStateBrush.prototype.constructor = CStateBrush;

CStateBrush.prototype.processState = function()
{	
//	rendererClass.copyTexture(textureLib.textures[3].texID, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iTemplateTexture);
	//clear the backbuffer and render the current level texture
	
	gl.useProgram(shaderLib.shaderTex.uiId);

	// reset the matrix for drawing on screen
	gl.uniformMatrix4fv(shaderLib.shaderTex.uiMVPMatrixLoc, false, rendererClass.matOrtho);
	
	gl.activeTexture(gl.TEXTURE0);
	rendererClass.drawFullScreenImage(rendererClass.texWallUndoRedo[rendererClass.iCurrentLevel]);

	if(this.bBrushed)
	{
		stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.bLayerPainted = true;

		///if we are brushing render the selected color/tex using chroma shader on top
		//rendererClass.copyTexture(rendererClass.texWallUndoRedo[rendererClass.iCurrentLevel], this.idTextureLayer);

		var fEraserSize = new Array();
		fEraserSize[0] = this.vfEraserSize.elements[0] * (2.0/rendererClass.iImageW);
		fEraserSize[1] = this.vfEraserSize.elements[1] * (2.0/rendererClass.iImageH);

        // this is the vertex buffer (based on eraser size
        var fVerts = new Array();
        
        //---------X---------													--------Y--------
        fVerts.push(this.vfEraserPoint[0]-fEraserSize[0]);		fVerts.push(this.vfEraserPoint[1]-fEraserSize[1]);
        fVerts.push(this.vfEraserPoint[0]+fEraserSize[0]);		fVerts.push(this.vfEraserPoint[1]-fEraserSize[1]);
        fVerts.push(this.vfEraserPoint[0]-fEraserSize[0]);		fVerts.push(this.vfEraserPoint[1]+fEraserSize[1]);
        fVerts.push(this.vfEraserPoint[0]+fEraserSize[0]);		fVerts.push(this.vfEraserPoint[1]+fEraserSize[1]);

        fEraserSize[0] = this.vfEraserSize.elements[0] * (1.0/rendererClass.iImageW);
		fEraserSize[1] = this.vfEraserSize.elements[1] * (1.0/rendererClass.iImageH);

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

        gl.useProgram(shaderLib.shaderTex.uiId);
    	gl.activeTexture(gl.TEXTURE0);

    	gl.uniformMatrix4fv(shaderLib.shaderTex.uiMVPMatrixLoc, false, rendererClass.matIdentity);

        // first render the read texture on screen as it is
    	rendererClass.drawFullScreenImage(rendererClass.texWallUndoRedo[rendererClass.iCurrentLevel]);

        // now carry out the Brush operation

        // bind the original texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, stateCommon.iOriginalTex);

        // bind the read texture
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, rendererClass.texWallUndoRedo[rendererClass.iCurrentLevel]);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, stateCommon.idBrush);
        
        switch( stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iApplyTexture )
        {
        case 0:
        	gl.useProgram(shaderLib.shaderBrush.uiId);

        	gl.uniform1f(shaderLib.shaderBrush.uiIntensity, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iIntensity/255.0);
            gl.uniform1f(shaderLib.shaderBrush.uiShadowFac, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.fShadow);
            gl.uniform3fv(shaderLib.shaderBrush.uiBaseColor, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.vBaseColor);
            gl.uniform3fv(shaderLib.shaderBrush.uiTopColor, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.vTopColor);
            gl.uniform1i(shaderLib.shaderBrush.uiApplyTex, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iApplyTexture);
            gl.uniform1f(shaderLib.shaderBrush.uiCurrentLayer, stateCommon.iCurrentLayer/255.0);
            gl.uniform1f(shaderLib.shaderBrush.uiPerspective, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.fPerspective);

            // update the texture matrix inside the shader
//            gl.uniformMatrix3fv(shaderLib.shaderBrush.uiTextureMatrix, false, gCCRenderer->m_stCurrentBound.matTexture.f);

            break;
        case 1:

        	var tex1 = textureLib.textures[stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iTemplateTexture].texID
        	
            gl.activeTexture(gl.TEXTURE3);
            gl.bindTexture(gl.TEXTURE_2D, tex1);

            gl.useProgram(shaderLib.shaderBrush2.uiId);

        	gl.uniform1f(shaderLib.shaderBrush2.uiIntensity, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iIntensity/255.0);
            gl.uniform1f(shaderLib.shaderBrush2.uiShadowFac, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.fShadow);
            gl.uniform3fv(shaderLib.shaderBrush2.uiBaseColor, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.vBaseColor);
            gl.uniform3fv(shaderLib.shaderBrush2.uiTopColor, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.vTopColor);
            gl.uniform1i(shaderLib.shaderBrush2.uiApplyTex,stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iApplyTexture);
            gl.uniform1f(shaderLib.shaderBrush2.uiCurrentLayer,stateCommon.iCurrentLayer/255.0);
            gl.uniform1f(shaderLib.shaderBrush2.uiPerspective,stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.fPerspective);

            // update the texture matrix inside the shader
//            gl.uniformMatrix3fv(shaderLib.shaderBrush2.uiTextureMatrix, false, gCCRenderer->m_stCurrentBound.matTexture.f);

        	break;
        case 2:

        	var tex1 = textureLib.textures[stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iTemplateTexture].texID
			var tex2 = textureLib.textures[stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iTemplateTexture2].texID
			
            gl.activeTexture(gl.TEXTURE3);
            gl.bindTexture(gl.TEXTURE_2D, tex1);
            gl.activeTexture(gl.TEXTURE4);
            gl.bindTexture(gl.TEXTURE_2D, tex2);


            gl.useProgram(shaderLib.shaderBrush3.uiId);

        	gl.uniform1f(shaderLib.shaderBrush3.uiIntensity, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iIntensity/255.0);
            gl.uniform1f(shaderLib.shaderBrush3.uiShadowFac, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.fShadow);
            gl.uniform3fv(shaderLib.shaderBrush3.uiBaseColor, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.vBaseColor);
            gl.uniform3fv(shaderLib.shaderBrush3.uiTopColor, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.vTopColor);
            gl.uniform3fv(shaderLib.shaderBrush3.uiTopColor2, stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.vTopColor2);
//            gl.uniform1i(shaderLib.shaderBrush3.uiApplyTex,stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iApplyTexture);
            gl.uniform1f(shaderLib.shaderBrush3.uiCurrentLayer,stateCommon.iCurrentLayer/255.0);
            gl.uniform1f(shaderLib.shaderBrush3.uiPerspective,stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.fPerspective);

            // update the texture matrix inside the shader
//            glUniformMatrix3fv(shaderLib.shaderBrush3.uiTextureMatrix, false, gCCRenderer->m_stCurrentBound.matTexture.f);


        	break;
        }

        gl.enableVertexAttribArray(0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.brushVerticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fVerts), gl.STATIC_DRAW);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        
        gl.enableVertexAttribArray(1);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.brushTexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fTexCoord1), gl.STATIC_DRAW);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
        
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

        //// render a zoomed in view of the eraser site -----------------------------------------------------------------
        var zoomLevel = 3.0;
		var zoomWindowSize = 500.0;
		zoomWindowSize/= (rendererClass.iImageW + rendererClass.iImageH);
		var vSizeZoomWindow = new Array(zoomWindowSize, zoomWindowSize);
		var vPosZoomWindow = new Array(-this.vfEraserPoint[0]*rendererClass.fAspectRatio, -this.vfEraserPoint[1]);

		if(vPosZoomWindow[0] > 0.0)
			vPosZoomWindow[0] = rendererClass.fCanvasW - vSizeZoomWindow[0];
		else
			vPosZoomWindow[0] = -rendererClass.fCanvasW + vSizeZoomWindow[0];

		vPosZoomWindow[1] = 0.0;

		/*if(vPosZoomWindow.x > gCCRenderer->m_fCanvasW - 3.0f*vSizeZoomWindow.x)
			vPosZoomWindow.x -= 2.0f*vSizeZoomWindow.x;
		else
			vPosZoomWindow.x += 2.0f*vSizeZoomWindow.x;

		if(vPosZoomWindow.y > gCCRenderer->m_fCanvasH - 3.0f*vSizeZoomWindow.y)
			vPosZoomWindow.y -= 2.0f*vSizeZoomWindow.y;
		else
			vPosZoomWindow.y += 2.0f*vSizeZoomWindow.y;*/

		var fVerts1 = new Array();
	        
        //---------X---------													--------Y--------
        fVerts1.push(vPosZoomWindow[0]-vSizeZoomWindow[0]);		fVerts1.push(vPosZoomWindow[1]-vSizeZoomWindow[1]);
        fVerts1.push(vPosZoomWindow[0]+vSizeZoomWindow[0]);		fVerts1.push(vPosZoomWindow[1]-vSizeZoomWindow[1]);
        fVerts1.push(vPosZoomWindow[0]-vSizeZoomWindow[0]);		fVerts1.push(vPosZoomWindow[1]+vSizeZoomWindow[1]);
        fVerts1.push(vPosZoomWindow[0]+vSizeZoomWindow[0]);		fVerts1.push(vPosZoomWindow[1]+vSizeZoomWindow[1]);
	        

        var fTexCoord3 = new Array();
        
        //---------X---------																--------Y--------
        fTexCoord3.push(this.vfEraseTexPoint[0]-fEraserSize[0]*zoomLevel);		fTexCoord3.push(this.vfEraseTexPoint[1]-fEraserSize[1]*zoomLevel);
        fTexCoord3.push(this.vfEraseTexPoint[0]+fEraserSize[0]*zoomLevel);		fTexCoord3.push(this.vfEraseTexPoint[1]-fEraserSize[1]*zoomLevel);
        fTexCoord3.push(this.vfEraseTexPoint[0]-fEraserSize[0]*zoomLevel);		fTexCoord3.push(this.vfEraseTexPoint[1]+fEraserSize[1]*zoomLevel);
        fTexCoord3.push(this.vfEraseTexPoint[0]+fEraserSize[0]*zoomLevel);		fTexCoord3.push(this.vfEraseTexPoint[1]+fEraserSize[1]*zoomLevel);
        
//        var fTexCoord3 =
//        [
//    		this.vfEraseTexPoint.i-fEraserSize.i*zoomLevel, this.vfEraseTexPoint.j-fEraserSize.j*zoomLevel,
//    		this.vfEraseTexPoint.i+fEraserSize.i*zoomLevel, this.vfEraseTexPoint.j-fEraserSize.j*zoomLevel,
//    		this.vfEraseTexPoint.i-fEraserSize.i*zoomLevel, this.vfEraseTexPoint.j+fEraserSize.j*zoomLevel,
//    		this.vfEraseTexPoint.i+fEraserSize.i*zoomLevel, this.vfEraseTexPoint.j+fEraserSize.j*zoomLevel,
//        ];

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

        // render the eraser boundary
        gl.useProgram(shaderLib.shaderProgramColor.uiId);

        var fColor = [0.0, 0.0, 0.0];
        gl.uniform3fv(shaderLib.shaderProgramColor.uiColor, fColor);

        var vScale = [1.0, 1.0];
        gl.uniform2fv(shaderLib.shaderProgramColor.uiScale, vScale);

        var fVerts2 = new Array();
        
        //---------X---------													--------Y--------
        fVerts2.push(vPosZoomWindow[0]-vSizeZoomWindow[0]);		fVerts2.push(vPosZoomWindow[1]-vSizeZoomWindow[1]);
        fVerts2.push(vPosZoomWindow[0]+vSizeZoomWindow[0]);		fVerts2.push(vPosZoomWindow[1]-vSizeZoomWindow[1]);
        fVerts2.push(vPosZoomWindow[0]+vSizeZoomWindow[0]);		fVerts2.push(vPosZoomWindow[1]+vSizeZoomWindow[1]);
        fVerts2.push(vPosZoomWindow[0]-vSizeZoomWindow[0]);		fVerts2.push(vPosZoomWindow[1]+vSizeZoomWindow[1]);
        
//        var fVerts2 =
//        [
//            vPosZoomWindow.i-vSizeZoomWindow.i, vPosZoomWindow.j-vSizeZoomWindow.j,
//            vPosZoomWindow.i+vSizeZoomWindow.i, vPosZoomWindow.j-vSizeZoomWindow.j,
//            vPosZoomWindow.i+vSizeZoomWindow.i, vPosZoomWindow.j+vSizeZoomWindow.j,
//            vPosZoomWindow.i-vSizeZoomWindow.i, vPosZoomWindow.j+vSizeZoomWindow.j,
//        ];

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
            
            //---------X---------									--------Y--------
            fVerts3.push(vPosZoomWindow[0]-vRadius[0]);		fVerts3.push(vPosZoomWindow[1]-vRadius[1]);
            fVerts3.push(vPosZoomWindow[0]+vRadius[0]);		fVerts3.push(vPosZoomWindow[1]-vRadius[1]);
            fVerts3.push(vPosZoomWindow[0]+vRadius[0]);		fVerts3.push(vPosZoomWindow[1]+vRadius[1]);
            fVerts3.push(vPosZoomWindow[0]-vRadius[0]);		fVerts3.push(vPosZoomWindow[1]+vRadius[1]);
            
//        	var fVerts3 =
//			[
//				vPosZoomWindow.i-vRadius.i, vPosZoomWindow.j-vRadius.j,
//				vPosZoomWindow.i+vRadius.i, vPosZoomWindow.j-vRadius.j,
//				vPosZoomWindow.i+vRadius.i, vPosZoomWindow.j+vRadius.j,
//				vPosZoomWindow.i-vRadius.i, vPosZoomWindow.j+vRadius.j,
//			];

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
        	// draw a circle in the centre to show eraser bounds
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
};

CStateBrush.prototype.processMessage = function(message)
{
	var res = false;
	switch(message.type)
	{
		case messageType.TouchDown:
		{
			///on touch down save and increment undo stack and start brush operation
//			var srcid = rendererClass.texWallUndoRedo[rendererClass.iCurrentLevel];
			var prevLevel = rendererClass.iCurrentLevel;
			//rendererClass.copyTexture(rendererClass.texWallUndoRedo[rendererClass.iCurrentLevel], this.idTextureLayer);
			rendererClass.incrementLevel();
			rendererClass.copyTexture(rendererClass.texWallUndoRedo[prevLevel], rendererClass.texWallUndoRedo[rendererClass.iCurrentLevel]);
			this.bBrushed = true;
			this.vfEraserPoint[0] = (2.0*(rendererClass.touchPoint.elements[0] / rendererClass.iImageW) - 1.0);
			this.vfEraserPoint[1] = (2.0*(rendererClass.iScreenHeight - rendererClass.touchPoint.elements[1]) / rendererClass.iImageH - 1.0);
			this.vfEraseTexPoint[0] = (rendererClass.touchPoint.elements[0] / rendererClass.iImageW);
			this.vfEraseTexPoint[1] = (rendererClass.iScreenHeight - rendererClass.touchPoint.elements[1]) / rendererClass.iImageH;
	
//			CCStateMasking *tmpMasking =
//					static_cast<CCStateMasking*>(gCCStateManager->GetStateInstance(
//							enMasking));
//			if(!tmpMasking->isGlobalUndoDone())
//				tmpMasking->UndoPolygon();
			break;
		}
		case messageType.TouchMove:
		{
			///update brush location and texture corrds to be used later in rendering
			this.bBrushed = true;
			this.vfEraserPoint[0] = (2.0*(rendererClass.touchPoint.elements[0] / rendererClass.iImageW) - 1.0);
			this.vfEraserPoint[1] = (2.0*(rendererClass.iScreenHeight - rendererClass.touchPoint.elements[1]) / rendererClass.iImageH - 1.0);
			this.vfEraseTexPoint[0] = (rendererClass.touchPoint.elements[0] / rendererClass.iImageW);
			this.vfEraseTexPoint[1] = (rendererClass.iScreenHeight - rendererClass.touchPoint.elements[1]) / rendererClass.iImageH;
			break;
		}
		case messageType.TouchUp:
		{
			this.bBrushed = false;
			break;
		}
		case messageType.BrushSize1:
		{
			stateCommon.idBrush = textureLib.getTexture("assets/eraser.png").texID;
			this.vfEraserSize = Vector.create([10.0, 10.0]);;
			this.bSquare = false;
			break;
		}
		case messageType.BrushSize2:
		{
			stateCommon.idBrush = textureLib.getTexture("assets/eraser.png").texID;
			this.vfEraserSize = Vector.create([20.0, 20.0]);;
			this.bSquare = false;
			break;
		}
		case messageType.BrushSize3:
		{
			stateCommon.idBrush = textureLib.getTexture("assets/eraser.png").texID;
			this.vfEraserSize = Vector.create([30.0, 30.0]);;
			this.bSquare = false;
			break;
		}
		case messageType.BrushSquareSize1:
		{
			stateCommon.idBrush = textureLib.getTexture("assets/SquareBrush.png").texID;
			this.vfEraserSize = Vector.create([10.0, 10.0]);;
			this.bSquare = true;
			break;
		}
		case messageType.BrushSquareSize2:
		{
			stateCommon.idBrush = textureLib.getTexture("assets/SquareBrush.png").texID;
			this.vfEraserSize = Vector.create([20.0, 20.0]);;
			this.bSquare = true;
			break;
		}
		case messageType.BrushSquareSize3:
		{
			stateCommon.idBrush = textureLib.getTexture("assets/SquareBrush.png").texID;
			this.vfEraserSize = Vector.create([30.0, 30.0]);;
			this.bSquare = true;
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
				
//				if (stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.bLayerPainted)
//					stateCommon.applyChroma();
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
				
//				if (stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.bLayerPainted)
//					stateCommon.applyChroma();
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

			stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.vBaseColor = 
				new Float32Array([base[0]/255, base[1]/255, base[2]/255]);
			
			stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.vTopColor = 
				new Float32Array([top[0]/255, top[1]/255, top[2]/255]);

			if(stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.iApplyTexture == 2)
			{
				stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.vTopColor2 = 
					new Float32Array([top2[0]/255, top2[1]/255, top2[2]/255]);
			}
			
			stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.oUIData = message.layerData;

			var initial = false;
			if(!stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.bLayerPainted)
				initial = true;
				
			if (stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.bLayerPainted)
				stateCommon.pApplyChroma();
			
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
				stateCommon.pApplyChroma();
			
			if(!initial)
				stateCommon.vLevelValue[rendererClass.iPrevLevel].oImgData = tmpData;
			break;
		}
		
		case messageType.Undo:
			// checks for global undo for mask
		{
			if(stateCommon.bGlobalUndoDone)
				stateCommon.pUndoPolygon();
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
		
		default:
			break;
	}
	return res;
};

CStateBrush.prototype.enterState = function(enPrevState)
{
	//Sets Default Brush settings
	stateCommon.idBrush = textureLib.getTexture("assets/eraser.png").texID;
	this.vfEraserSize = Vector.create([20.0, 20.0]);;
	this.bSquare = false;
	
	this.bBrushed = false;
};

CStateBrush.prototype.leaveState = function()
{};

CStateBrush.prototype.saveLevel = function(tmpStateValue, isCurrentState)
{};

CStateBrush.prototype.restoreLevel = function(tmpStateValue)
{};