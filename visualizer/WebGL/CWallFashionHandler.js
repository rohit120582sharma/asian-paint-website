var BUTTON_WIDTH     = 21.0;
var BUTTON_HEIGHT    = 0.0475;
var BUTTON_PADX    	 = 3.5;
var GROUP_BOUNDARY	 = 0.9;
var GROUP_RADIUS	 = 0.7;

function CWallFashionHandler()
{
	this.vStencilList = new Array();
	this.vGroup = new Array();
	this.vmLayerGroup = new Array();
	this.vLastTouchPos = new Array();
	
	this.bWFClosed = false;
	
	this.verticesBuffer = gl.createBuffer();
	
	
	if(rendererClass.fCanvasH < 1.0)
		BUTTON_HEIGHT    *= rendererClass.fAspectRatio;
	
	this.init();
}

CWallFashionHandler.prototype.init = function()
{
	this.vStencilList.splice(0, this.vStencilList.length);
	this.vGroup.splice(0, this.vGroup.length);
	this.vmLayerGroup.splice(0, this.vmLayerGroup.length);
	
	this.iSelectedStencil = this.vStencilList.length - 1;
	this.bIsAnySelected = false;
	this.bIsDraggable = false;
	this.bIsPerspectiveChange = false;
	this.bIsRotate = false;

	this.fPerspectivLeftX = 0.0;
	this.fPerspectivRightX = 0.0;
	this.fPerspectivLeftY = 0.0;
	this.fPerspectivRightY = 0.0;
	this.fRotAngle = 0.0;
	this.vRotateCtrlPos = new Array(GROUP_RADIUS*Math.cos(this.fRotAngle), GROUP_RADIUS*Math.sin(this.fRotAngle));

	this.iPointID = 0;
	this.iGroupSize = 0;
}

CWallFashionHandler.prototype.addWallFashion = function(tmpFashion)
{
	if(this.bIsAnySelected)
		this.vStencilList[this.iSelectedStencil].bIsSelected = false;		// Unselecting previous selected

	// Checking whether any wall fashion has been added on current layer ever
	if(this.vmLayerGroup[stateCommon.iCurrentLayer] != null)
	{
		if(this.vmLayerGroup[stateCommon.iCurrentLayer])		// If current layer wallfashions are gouped
		{
			tmpFashion.bIsGrouped = true;					// Add the latest to group
			var index = 0 + this.vStencilList.length;
			this.vGroup.push(index);			// Added to group list
			this.iGroupSize = this.vGroup.length;
		}
	}
	else
		this.vmLayerGroup[stateCommon.iCurrentLayer] = false;		// Initializes group status for new layer

	//Adds latest wall fashion to list and select it
	this.vStencilList.push(tmpFashion);
	this.iSelectedStencil = this.vStencilList.length - 1;
	this.vStencilList[this.iSelectedStencil].bIsSelected = true;
	this.bIsAnySelected = true;
}

CWallFashionHandler.prototype.renderWallFashion = function()
{
	if(this.vStencilList.length !== 0)
	{
		for(var i = 0;i < this.vStencilList.length;i++)
		{
			this.vStencilList[i].renderWallFashionStencil();
		}
		if(this.vmLayerGroup[stateCommon.iCurrentLayer] && this.bIsAnySelected && (this.vStencilList[this.iSelectedStencil].uiLayerLevel == stateCommon.iCurrentLayer)
				&& rendererClass.i_screenshot_state != ScreenShotState.SS_TAKE)
		{
			this.renderGroupBoundary();
		}
	}
}

CWallFashionHandler.prototype.renderGroupBoundary = function()
{
	switch(this.vStencilList[this.iSelectedStencil].enSelectionMode)
	{
		case enWFMode.enWFPerspective:
		{
			var fVerts = new Array
			(
				-GROUP_BOUNDARY, -GROUP_BOUNDARY - this.fPerspectivLeftY,
				 GROUP_BOUNDARY, -GROUP_BOUNDARY - this.fPerspectivRightY,
				 GROUP_BOUNDARY,  GROUP_BOUNDARY + this.fPerspectivRightY,
				-GROUP_BOUNDARY,  GROUP_BOUNDARY + this.fPerspectivLeftY
			);											//Vertices for OpenGL Space

			gl.useProgram(shaderLib.shaderProgramColor.uiId);
			// apply the draw color
			var vColor = [1.0, 1.0, 1.0];
			gl.uniform3fv(shaderLib.shaderProgramColor.uiColor, vColor);

//			var vScale = [1.0, 1.0];
			var vScale = new Array(rendererClass.fCanvasW, rendererClass.fCanvasH);
			gl.uniform2fv(shaderLib.shaderProgramColor.uiScale, vScale);

			gl.uniformMatrix4fv(shaderLib.shaderProgramColor.uiMVPMatrixLoc, false, rendererClass.matOrtho);

			gl.enableVertexAttribArray(0);
		    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
		    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fVerts), gl.STATIC_DRAW);
		    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

		    gl.lineWidth(2.0);
		    if(rendererClass.b_isBrowserIE)
				rendererClass.drawLineLoop(fVerts);
			else
				gl.drawArrays(gl.LINE_LOOP, 0, 4 );

		    /* ------- Perspective Disabled --------- */
			// bind the texture for Dot
//			gl.bindTexture(gl.TEXTURE_2D, stateCommon.idVertexTex);
//
//			// bind the shader for point sprite rendering
//			gl.useProgram(shaderLib.shaderSprite.uiId);
//			gl.uniform2fv(shaderLib.shaderSprite.uiScale, vScale);
//
//			// enable blending and draw the points
//			gl.enable(gl.BLEND);
//		    gl.drawArrays(gl.POINTS, 0, 4);
//			gl.disable(gl.BLEND);
			break;
		}

		case enWFMode.enWFRotate:
		{
			// draw a circle
			var iVerts = 40;
			var f2Verts = new Array();
			var fTheta = Math.PI * 2.0 / iVerts;
			for(var j=0; j<iVerts; j++)
			{
				f2Verts[2*j] = GROUP_RADIUS*Math.cos(fTheta*j);
				f2Verts[2*j+1] = GROUP_RADIUS*Math.sin(fTheta*j);
			}

			var fVerts = new Array
			(
				this.vRotateCtrlPos[0], this.vRotateCtrlPos[1]
			);											//Vertices for OpenGL Space

			if(rendererClass.b_isBrowserIE)
			{
				fVerts[0]=fVerts[0]/rendererClass.fCanvasW;
				fVerts[1]=fVerts[1]/rendererClass.fCanvasH;
			}
			
			gl.useProgram(shaderLib.shaderProgramColor.uiId);
			// apply the draw color
			var vColor = [1.0, 1.0, 1.0];
			gl.uniform3fv(shaderLib.shaderProgramColor.uiColor, vColor);

			var vScale = [1.0, 1.0];
			gl.uniform2fv(shaderLib.shaderProgramColor.uiScale, vScale);

			gl.enableVertexAttribArray(0);
		    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
		    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(f2Verts), gl.STATIC_DRAW);
		    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

			gl.lineWidth(2.0);
			if(rendererClass.b_isBrowserIE)
				rendererClass.drawLineLoop(f2Verts);
			else
				gl.drawArrays(gl.LINE_LOOP, 0, iVerts );

			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fVerts), gl.STATIC_DRAW);
		    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

		    if(rendererClass.b_isBrowserIE)
	    		rendererClass.drawPointTex(fVerts, stateCommon.rotateWFTex);
	    	else
    		{
				// bind the texture for Dot
			    gl.bindTexture(gl.TEXTURE_2D, stateCommon.rotateWFTex);
	
				// bind the shader for point sprite rendering
			    gl.useProgram(shaderLib.shaderSprite.uiId);
				gl.uniform2fv(shaderLib.shaderSprite.uiScale, vScale);
	
				// enable blending and draw the points
				gl.enable(gl.BLEND);
			    gl.drawArrays(gl.POINTS, 0, 1);
				gl.disable(gl.BLEND);
    		}
			break;
		}
	}
}

CWallFashionHandler.prototype.optionsClickHandler = function(vTouchPoint)
{
	if(vTouchPoint[1] >= (this.vStencilList[this.iSelectedStencil].vOptionPos[1] - 0.005 - BUTTON_HEIGHT) &&
			vTouchPoint[1] <= (this.vStencilList[this.iSelectedStencil].vOptionPos[1] - 0.005 + BUTTON_HEIGHT))
	{
		if(rendererClass.screenTouchPoint.elements[0] >= (this.vStencilList[this.iSelectedStencil].vOptionScreenPos[0] - 2*BUTTON_PADX - 4*BUTTON_WIDTH) &&
			rendererClass.screenTouchPoint.elements[0] <= (this.vStencilList[this.iSelectedStencil].vOptionScreenPos[0] - 2*BUTTON_PADX - 2*BUTTON_WIDTH))
		{
			//Color Change
			console.log("Change WFColor");
			this.vStencilList[this.iSelectedStencil].bIsColorSelection = !this.vStencilList[this.iSelectedStencil].bIsColorSelection;
			if(this.vStencilList[this.iSelectedStencil].bIsColorSelection)
				WallFashion.applyWallFashionColor();
			return true;
		}
		else if(rendererClass.screenTouchPoint.elements[0] >= (this.vStencilList[this.iSelectedStencil].vOptionScreenPos[0] + 0*BUTTON_PADX - 2*BUTTON_WIDTH) &&
				rendererClass.screenTouchPoint.elements[0] <= (this.vStencilList[this.iSelectedStencil].vOptionScreenPos[0] + 0*BUTTON_PADX + 0*BUTTON_WIDTH))
		{
			//Rotation mode Change .... To be implemented after aspect ratio correction
			console.log("Toggle Mode");
			this.vStencilList[this.iSelectedStencil].bIsColorSelection = false;
			switch(this.vStencilList[this.iSelectedStencil].enSelectionMode)
			{														// Group to be integrated
			case enWFMode.enWFPerspective:
				if(this.vmLayerGroup[stateCommon.iCurrentLayer] && this.vStencilList[this.iSelectedStencil].uiLayerLevel == stateCommon.iCurrentLayer)
				{
					for(var i = 0;i<this.vGroup.length;i++)
						this.vStencilList[this.vGroup[i]].enSelectionMode = enWFMode.enWFRotate;
				}
				else if(!this.vStencilList[this.iSelectedStencil].bIsGrouped)
					this.vStencilList[this.iSelectedStencil].enSelectionMode = enWFMode.enWFRotate;
				break;
			case enWFMode.enWFRotate:
				if(this.vmLayerGroup[stateCommon.iCurrentLayer] && this.vStencilList[this.iSelectedStencil].uiLayerLevel == stateCommon.iCurrentLayer)
				{
					for(var i = 0;i<this.vGroup.length;i++)
						this.vStencilList[this.vGroup[i]].enSelectionMode = enWFMode.enWFPerspective;
				}
				else if(!this.vStencilList[this.iSelectedStencil].bIsGrouped)
					this.vStencilList[this.iSelectedStencil].enSelectionMode = enWFMode.enWFPerspective;
				break;
			default:
				break;
			}
			return true;
		}
		else if(rendererClass.screenTouchPoint.elements[0] >= (this.vStencilList[this.iSelectedStencil].vOptionScreenPos[0] + 2*BUTTON_PADX + 0*BUTTON_WIDTH) &&
				rendererClass.screenTouchPoint.elements[0] <= (this.vStencilList[this.iSelectedStencil].vOptionScreenPos[0] + 2*BUTTON_PADX + 2*BUTTON_WIDTH))
		{
			//Group
			console.log("Toggle Group");
			this.vStencilList[this.iSelectedStencil].bIsColorSelection = false;
			if(this.vStencilList[this.iSelectedStencil].uiLayerLevel == stateCommon.iCurrentLayer)
				if(this.isGroupable())
					this.vmLayerGroup[stateCommon.iCurrentLayer] = !this.vmLayerGroup[stateCommon.iCurrentLayer];
	
			this.updateGroupList();
			return true;
		}
		else if(rendererClass.screenTouchPoint.elements[0] >= (this.vStencilList[this.iSelectedStencil].vOptionScreenPos[0] + 4*BUTTON_PADX + 2*BUTTON_WIDTH) &&
				rendererClass.screenTouchPoint.elements[0] <= (this.vStencilList[this.iSelectedStencil].vOptionScreenPos[0] + 4*BUTTON_PADX + 4*BUTTON_WIDTH))
		{
			//Close
			console.log("Close");
			if(this.vmLayerGroup[stateCommon.iCurrentLayer])
			{
				var eraseFlag = false;
				for(var i = 0;i<this.vGroup.length;i++)
				{
					if(!eraseFlag && this.vGroup[i] == this.iSelectedStencil)
					{
						this.vGroup.splice(i, 1);
						eraseFlag = true;
						this.vGroup[i]-=1;
					}
					else if(eraseFlag)
						this.vGroup[i]-=1;
				}
			}
			this.iGroupSize = 0;
//			gCCRenderer->WallFashionClosed((*m_itSelectedStencil)->m_uiTemplateTexture);
			var WFname = textureLib.getTextureNameByID(this.vStencilList[this.iSelectedStencil].texID);
			if(WFname)
				WallFashion.deleted(WFname);
			this.vStencilList.splice(this.iSelectedStencil, 1);
			this.iSelectedStencil = this.vStencilList.length;
			this.bIsAnySelected = false;
			if(this.vmLayerGroup[stateCommon.iCurrentLayer] && !this.isGroupable())
			{
				this.vmLayerGroup[stateCommon.iCurrentLayer] = false;
				this.updateGroupList();
			}
			this.bWFClosed = true;
			return true;
		}
	}
	return false;
}

CWallFashionHandler.prototype.boundaryClickHandler = function(vTouchPoint)
{
	switch(this.vStencilList[this.iSelectedStencil].enSelectionMode)
	{
		case enWFMode.enWFPerspective:
		{
//			if(this.vmLayerGroup[stateCommon.iCurrentLayer] && this.vStencilList[this.iSelectedStencil].uiLayerLevel == stateCommon.iCurrentLayer)
//			{
//				var temp1 = new Array(vTouchPoint[0] + GROUP_BOUNDARY,
//						vTouchPoint[1] + GROUP_BOUNDARY + this.fPerspectivLeftY);
//				var temp2 = new Array(vTouchPoint[0] - GROUP_BOUNDARY,
//						vTouchPoint[1] + GROUP_BOUNDARY + this.fPerspectivRightY);
//				var temp3 = new Array(vTouchPoint[0] - GROUP_BOUNDARY,
//						vTouchPoint[1] - GROUP_BOUNDARY - this.fPerspectivRightY);
//				var temp4 = new Array(vTouchPoint[0] + GROUP_BOUNDARY,
//						vTouchPoint[1] - GROUP_BOUNDARY - this.fPerspectivLeftY);
//				
//				if(lenSquare(temp1) < TOUCH_ERROR)
//				{
//					this.vStencilList[this.iSelectedStencil].bIsColorSelection = false;
//					this.iPointID = 1;
//					this.bIsPerspectiveChange = true;
//					return true;
//				}
//				else if(lenSquare(temp2) < TOUCH_ERROR)
//				{
//					this.vStencilList[this.iSelectedStencil].bIsColorSelection = false;
//					this.iPointID = 2;
//					this.bIsPerspectiveChange = true;
//					return true;
//				}
//				else if(lenSquare(temp3) < TOUCH_ERROR)
//				{
//					this.vStencilList[this.iSelectedStencil].bIsColorSelection = false;
//					this.iPointID = 3;
//					this.bIsPerspectiveChange = true;
//					return true;
//				}
//				else if(lenSquare(temp4) < TOUCH_ERROR)
//				{
//					this.vStencilList[this.iSelectedStencil].bIsColorSelection = false;
//					this.iPointID = 4;
//					this.bIsPerspectiveChange = true;
//					return true;
//				}
//			}
//			else if(!this.vStencilList[this.iSelectedStencil].bIsGrouped)
//			{
//				for( var i=0; i<4; i++)
//				{
//					var temp1 = new Array(vTouchPoint[0] - this.vStencilList[this.iSelectedStencil].vPoints[2*i],
//							vTouchPoint[1] - this.vStencilList[this.iSelectedStencil].vPoints[2*i + 1]);
//					if(lenSquare(temp1) < TOUCH_ERROR)
//					{
//						this.vStencilList[this.iSelectedStencil].bIsColorSelection = false;
//						this.iPointID = i+1;
//						this.bIsPerspectiveChange = true;
//						return true;
//					}
//				}
//			}
			break;
		}

		case enWFMode.enWFRotate:
		{
			var vTouch = new Array(vTouchPoint[0]*rendererClass.fCanvasW, vTouchPoint[1]*rendererClass.fCanvasH);
//			vTouch[0] *= gCCRenderer->m_fCanvasW;
//			vTouch[1] *= gCCRenderer->m_fCanvasH;
			if(this.vmLayerGroup[stateCommon.iCurrentLayer] && this.vStencilList[this.iSelectedStencil].uiLayerLevel == stateCommon.iCurrentLayer)
			{
				var temp1 = new Array(vTouch[0] - this.vRotateCtrlPos[0],
						vTouch[1] - this.vRotateCtrlPos[1]);
				if(lenSquare(temp1) < 1.4*TOUCH_ERROR)
				{
					this.vStencilList[this.iSelectedStencil].bIsColorSelection = false;
					this.bIsRotate = true;
					return true;
				}
			}
			else if(!this.vStencilList[this.iSelectedStencil].bIsGrouped)
			{
				var temp1 = new Array(vTouchPoint[0] - (this.vStencilList[this.iSelectedStencil].vRotateCtrlPos[0]/rendererClass.fCanvasW) - this.vStencilList[this.iSelectedStencil].vScreenPos[0],
						vTouchPoint[1] - (this.vStencilList[this.iSelectedStencil].vRotateCtrlPos[1]/rendererClass.fCanvasH) - this.vStencilList[this.iSelectedStencil].vScreenPos[1]);
				
				if(lenSquare(temp1) < 1.4*TOUCH_ERROR)
				{
					this.vStencilList[this.iSelectedStencil].bIsColorSelection = false;
					this.bIsRotate = true;
					return true;
				}
			}
			break;
		}
	}
	return false;
}

CWallFashionHandler.prototype.clickHandler = function()
{
	var handled = false;
	if(!this.bWFClosed)
		rendererClass.bLongTouchAcceptable = true;
	this.bWFClosed = false;
	if(this.vStencilList.length != 0)
	{
		var touch = new Array();
		touch[0] = (2.0*(rendererClass.touchPoint.elements[0] / rendererClass.iImageW) - 1.0);
		touch[1] = (2.0*(rendererClass.iScreenHeight - rendererClass.touchPoint.elements[1]) / rendererClass.iImageH - 1.0);
//		touch[0] = (2.0*(Math.round(rendererClass.touchPoint.elements[0] + rendererClass.iOffsetW) / rendererClass.iScreenWidth) - 1.0);
//		touch[1] = (2.0*(rendererClass.iScreenHeight - Math.round(rendererClass.touchPoint.elements[1] - rendererClass.iOffsetH)) / rendererClass.iScreenHeight - 1.0);
		this.vLastTouchPos = touch;
		
		this.bIsDraggable = false;
		this.bIsPerspectiveChange = false;
		this.bIsRotate = false;

		if(this.bIsAnySelected)
		{
			if(!this.optionsClickHandler(touch))
			{
				if(!this.boundaryClickHandler(touch))
				{
					// Check whether intention is to move
					if(this.vStencilList[this.iSelectedStencil].clickedOn(touch))
					{
						this.vStencilList[this.iSelectedStencil].bIsColorSelection = false;
						this.bIsDraggable = true;
						this.vLastScreenTouchPos = new Array(rendererClass.screenTouchPoint.elements[0], rendererClass.screenTouchPoint.elements[1]);
						handled = true;
					}
					else			// Check whether other stencil is selected
					{
						for(var i = 0;i<this.vStencilList.length;i++)
						{
							if(this.vStencilList[i].clickedOn(touch))
							{
								this.vStencilList[this.iSelectedStencil].bIsColorSelection = false;
								this.vStencilList[this.iSelectedStencil].bIsSelected = false;
								this.iSelectedStencil = i;
								this.vStencilList[this.iSelectedStencil].bIsSelected = true;
								this.bIsAnySelected = true;
								handled = true;
								break;
							}
							else
							{
								this.vStencilList[i].bIsColorSelection = false;
								this.vStencilList[i].bIsSelected = false;
								this.bIsAnySelected = false;
							}
						}
					}
				}
				else
				{
					handled = true;
					rendererClass.bLongTouchAcceptable = false;
//					LOG_INFO("Boundary Handled ");
				}
			}
			else
			{
				handled = true;
				rendererClass.bLongTouchAcceptable = false;
//				LOG_INFO("OptionBar Handled ");
			}
		}
		else
		{
			// No stencil selected yet
			for(var i = 0;i<this.vStencilList.length;i++)
			{
				if(this.vStencilList[i].clickedOn(touch))
				{
					this.iSelectedStencil = i;
					this.vStencilList[this.iSelectedStencil].bIsSelected = true;
					this.bIsAnySelected = true;
					handled = true;
					break;
				}
				else if(this.iSelectedStencil < this.vStencilList.length)
				{
					this.vStencilList[this.iSelectedStencil].bIsSelected = false;
					this.bIsAnySelected = false;
				}
			}
		}
	}
	return handled;
}

CWallFashionHandler.prototype.dragHandler = function()
{
	var handled = false;
	if(this.vStencilList.length > 0)
	{
		if(this.bIsAnySelected)
		{
			// Moving the wall fashion
			if(this.bIsDraggable)
			{
				rendererClass.bWFOptionsHandled = false;
				var touch = new Array();
				touch[0] = (2.0*(rendererClass.touchPoint.elements[0] / rendererClass.iImageW) - 1.0);
				touch[1] = (2.0*(rendererClass.iScreenHeight - rendererClass.touchPoint.elements[1]) / rendererClass.iImageH - 1.0);

				// get the position change compared to last touch move event
				var diff = new Array(touch[0] - this.vLastTouchPos[0], touch[1] - this.vLastTouchPos[1]);
				var screenDiff = new Array(rendererClass.screenTouchPoint.elements[0] - this.vLastScreenTouchPos[0], rendererClass.screenTouchPoint.elements[1] - this.vLastScreenTouchPos[1]);
				this.vLastTouchPos = touch;
				this.vLastScreenTouchPos = new Array(rendererClass.screenTouchPoint.elements[0], rendererClass.screenTouchPoint.elements[1]);

				this.vStencilList[this.iSelectedStencil].vScreenPos[0] += diff[0];
				this.vStencilList[this.iSelectedStencil].vScreenPos[1] += diff[1];
				this.vStencilList[this.iSelectedStencil].vOptionPos[0] += diff[0];
				this.vStencilList[this.iSelectedStencil].vOptionPos[1] += diff[1];
				this.vStencilList[this.iSelectedStencil].vOptionScreenPos[0] += screenDiff[0];
				this.vStencilList[this.iSelectedStencil].vOptionScreenPos[1] += screenDiff[1];
				this.vStencilList[this.iSelectedStencil].checkOptionPos();

				mat4.identity(this.vStencilList[this.iSelectedStencil].matPosTrans); 			// Set to identity
				mat4.translate(this.vStencilList[this.iSelectedStencil].matPosTrans, new Array(this.vStencilList[this.iSelectedStencil].vScreenPos[0]*rendererClass.fCanvasW, 
						this.vStencilList[this.iSelectedStencil].vScreenPos[1]*rendererClass.fCanvasH, 0)); 	// Calculate: Translate to screenPos
				mat4.identity(this.vStencilList[this.iSelectedStencil].matNegTrans); 			// Set to identity
				mat4.translate(this.vStencilList[this.iSelectedStencil].matNegTrans, new Array(-this.vStencilList[this.iSelectedStencil].vScreenPos[0]*rendererClass.fCanvasW, 
						-this.vStencilList[this.iSelectedStencil].vScreenPos[1]*rendererClass.fCanvasH, 0)); 	// Calculate: Translate to -screenPos
//				this.vStencilList[this.iSelectedStencil].matPosTrans = PVRTMat4::Translation((*m_itSelectedStencil)->m_vScreenPos.x*gCCRenderer->m_fCanvasW, (*m_itSelectedStencil)->m_vScreenPos.y*gCCRenderer->m_fCanvasH, 0.0f);
//				this.vStencilList[this.iSelectedStencil].matNegTrans = PVRTMat4::Translation(-(*m_itSelectedStencil)->m_vScreenPos.x*gCCRenderer->m_fCanvasW, -(*m_itSelectedStencil)->m_vScreenPos.y*gCCRenderer->m_fCanvasH, 0.0f);
				handled = true;
			}
			// Setting Perspective
			else if(this.bIsPerspectiveChange)
			{
				var touch = new Array();
				touch[0] = (2.0*(rendererClass.touchPoint.elements[0] / rendererClass.iImageW) - 1.0);
				touch[1] = (2.0*(rendererClass.iScreenHeight - rendererClass.touchPoint.elements[1]) / rendererClass.iImageH - 1.0);

				// get the position change compared to last touch move event
				var diff = new Array(touch[0] - this.vLastTouchPos[0], touch[1] - this.vLastTouchPos[1]);
				this.vLastTouchPos = touch;

				var perspectiveLeft, perspectiveRight, perspectiveLeftX, perspectiveRightX, perspective, wfWidth, limit, hLimit, limitX, hLimitX;

				if(this.vmLayerGroup[stateCommon.iCurrentLayer])
				{
					perspectiveLeft = this.fPerspectivLeftY;
					perspectiveRight = this.fPerspectivRightY;
					perspectiveLeftX = this.fPerspectivLeftX;
					perspectiveRightX = this.fPerspectivRightX;
					perspective = this.fPerspective;
					limit = GROUP_BOUNDARY*rendererClass.fCanvasH;
					hLimit = 0.0;
					limitX = GROUP_BOUNDARY;
					hLimitX = 0.0;
					wfWidth = 2*GROUP_BOUNDARY;
				}
				else
				{
					perspectiveLeft = this.vStencilList[this.iSelectedStencil].fPerspectivLeftY;
					perspectiveRight = this.vStencilList[this.iSelectedStencil].fPerspectivRightY;
					perspectiveLeftX = this.vStencilList[this.iSelectedStencil].fPerspectivLeftX;
					perspectiveRightX = this.vStencilList[this.iSelectedStencil].fPerspectivRightX;
					perspective = this.vStencilList[this.iSelectedStencil].fPerspective;
					limit = this.vStencilList[this.iSelectedStencil].vSize[1];
					hLimit = 1000.0;
					limitX = this.vStencilList[this.iSelectedStencil].vSize[0];
					hLimitX = 1000.0;
					wfWidth = 2 * this.vStencilList[this.iSelectedStencil].vSize[0];
				}

				switch(this.iPointID)
				{
				case 1:
					if( diff[1] > 0 )
					{
						if(perspectiveLeft - diff[1] > -limit)
						{
							perspectiveLeft -= diff[1];
						}
						else
						{
							perspectiveLeft = -limit;
						}
					}
					else
					{
						if(perspectiveLeft - diff[1] < hLimit)
						{
							perspectiveLeft -= diff[1];
						}
						else
						{
							perspectiveLeft = hLimit;
						}
					}
					if( diff[0] > 0 )
					{
						if(perspectiveLeftX - diff[0] > -limitX)
						{
							perspectiveLeftX -= diff[0];
						}
						else
						{
							perspectiveLeftX = -limitX;
						}
					}
					else
					{
						if(perspectiveLeftX - diff[0] < hLimitX)
						{
							perspectiveLeftX -= diff[0];
						}
						else
						{
							perspectiveLeftX = hLimitX;
						}
					}
				break;
				case 2:
					if( diff[1] > 0 )
					{
						if(perspectiveRight - diff[1] > -limit)
						{
							perspectiveRight -= diff[1];
						}
						else
						{
							perspectiveRight = -limit;
						}
					}
					else
					{
						if(perspectiveRight - diff[1] < hLimit)
						{
							perspectiveRight -= diff[1];
						}
						else
						{
							perspectiveRight = hLimit;
						}
					}
					if( diff[0] < 0 )
					{
						if(perspectiveRightX + diff[0] > -limitX)
						{
							perspectiveRightX += diff[0];
						}
						else
						{
							perspectiveRightX = -limitX;
						}
					}
					else
					{
						if(perspectiveRightX + diff[0] < hLimitX)
						{
							perspectiveRightX += diff[0];
						}
						else
						{
							perspectiveRightX = hLimitX;
						}
					}
				break;
				case 3:
					if( diff[1] < 0 )
					{
						if(perspectiveRight + diff[1] > -limit)
						{
							perspectiveRight += diff[1];
						}
						else
						{
							perspectiveRight = -limit;
						}
					}
					else
					{
						if(perspectiveRight + diff[1] < hLimit)
						{
							perspectiveRight += diff[1];
						}
						else
						{
							perspectiveRight = hLimit;
						}
					}
					if( diff.x < 0 )
					{
						if(perspectiveRightX + diff[0] > -limitX)
						{
							perspectiveRightX += diff[0];
						}
						else
						{
							perspectiveRightX = -limitX;
						}
					}
					else
					{
						if(perspectiveRightX + diff[0] < hLimitX)
						{
							perspectiveRightX += diff[0];
						}
						else
						{
							perspectiveRightX = hLimitX;
						}
					}
				break;
				case 4:
					if( diff[1] < 0 )
					{
						if(perspectiveLeft + diff[1] > -limit)
						{
							perspectiveLeft += diff[1];
						}
						else
						{
							perspectiveLeft = -limit;
						}
					}
					else
					{
						if(perspectiveLeft + diff[1] < hLimit)
						{
							perspectiveLeft += diff[1];
						}
						else
						{
							perspectiveLeft = hLimit;
						}
					}
					if( diff.x > 0 )
					{
						if(perspectiveLeftX - diff[0] > -limitX)
						{
							perspectiveLeftX -= diff[0];
						}
						else
						{
							perspectiveLeftX = -limitX;
						}
					}
					else
					{
						if(perspectiveLeftX - diff[0] < hLimitX)
						{
							perspectiveLeftX -= diff[0];
						}
						else
						{
							perspectiveLeftX = hLimitX;
						}
					}
				break;
				}
				// Calculating perspective (NOTE: perspectiveLeft and perspectiveRight range: (-limit,0))
				perspective = Math.abs(limit + perspectiveRight);	// add the right side length
				perspective -= Math.abs(limit + perspectiveLeft);	// subtract the left side length
				// normalize change according to length
				perspective /= limit;
				// get the correct ratio by diving by horizontal length
				perspective /= wfWidth;
				// make sure that the perspective value is adjusted according to render width
				perspective *= rendererClass.fCanvasH/rendererClass.fCanvasW;

				if(perspective > 0.4)
					perspective = 0.4;
				else if(perspective < -0.4)
					perspective = -0.4;

				if(this.vmLayerGroup[stateCommon.iCurrentLayer])
				{
					this.fPerspectivLeftY = perspectiveLeft;
					this.fPerspectivRightY = perspectiveRight;
					this.fPerspectivLeftX = perspectiveLeftX;
					this.fPerspectivRightX = perspectiveRightX;
					this.fPerspective = perspective;
				}
				else
				{
					this.vStencilList[this.iSelectedStencil].fPerspectivLeftY = perspectiveLeft;
					this.vStencilList[this.iSelectedStencil].fPerspectivRightY = perspectiveRight;
					this.vStencilList[this.iSelectedStencil].fPerspectivLeftX = perspectiveLeftX;
					this.vStencilList[this.iSelectedStencil].fPerspectivRightX = perspectiveRightX;
					this.vStencilList[this.iSelectedStencil].fPerspective = perspective;
				}
				
				handled = true;
			}
			else if(this.bIsRotate)
			{
				var touch = new Array();
				touch[0] = (2.0*(rendererClass.touchPoint.elements[0] / rendererClass.iImageW) - 1.0);
				touch[1] = (2.0*(rendererClass.iScreenHeight - rendererClass.touchPoint.elements[1]) / rendererClass.iImageH - 1.0);

				if(this.vmLayerGroup[stateCommon.iCurrentLayer] && (this.vStencilList[this.iSelectedStencil].uiLayerLevel == stateCommon.iCurrentLayer))
				{
					var tempVec1 = new Array(GROUP_RADIUS - 0.0, 0.0 - 0.0);
					var tempVec2 = new Array(touch[0] - 0.0, touch[1] - 0.0);
					this.fRotAngle = 0.0 + Math.atan2(tempVec2[1], tempVec2[0]) - Math.atan2(tempVec1[1], tempVec1[0]);
					this.vRotateCtrlPos[0] = GROUP_RADIUS*Math.cos(this.fRotAngle);
					this.vRotateCtrlPos[1] = GROUP_RADIUS*Math.sin(this.fRotAngle);
					
					for(var i = 0; i < this.vGroup.length; i++)
					{
						this.vStencilList[this.vGroup[i]].fRotAngle = this.fRotAngle;
						this.vStencilList[this.vGroup[i]].updateRotPoint();
					}
				}
				else if(!this.vStencilList[this.iSelectedStencil].bIsGrouped)
				{
					var tempVec1 = new Array(this.vStencilList[this.iSelectedStencil].vScreenPos[0] + this.vStencilList[this.iSelectedStencil].fFashionButtonRadius - this.vStencilList[this.iSelectedStencil].vScreenPos[0], 
							this.vStencilList[this.iSelectedStencil].vScreenPos[1] -this.vStencilList[this.iSelectedStencil].vScreenPos[1]);
					var tempVec2 = new Array(touch[0] - this.vStencilList[this.iSelectedStencil].vScreenPos[0], 
							touch[1] - this.vStencilList[this.iSelectedStencil].vScreenPos[1]);
					this.vStencilList[this.iSelectedStencil].fRotAngle = Math.atan2(tempVec2[1], tempVec2[0]) - Math.atan2(tempVec1[1], tempVec1[0]);
					this.vStencilList[this.iSelectedStencil].updateRotPoint();
				}
				handled = true;
			}

			if(this.vmLayerGroup[stateCommon.iCurrentLayer] && (this.vStencilList[this.iSelectedStencil].uiLayerLevel == stateCommon.iCurrentLayer))
			{
				for(var i = 0; i < this.vGroup.length; i++)
				{
					this.vStencilList[this.vGroup[i]].fPerspectivLeftY = (this.fPerspectivLeftY/GROUP_BOUNDARY)*this.vStencilList[this.vGroup[i]].vSize[1];
					this.vStencilList[this.vGroup[i]].fPerspectivRightY = (this.fPerspectivRightY/GROUP_BOUNDARY)*this.vStencilList[this.vGroup[i]].vSize[1];
					this.vStencilList[this.vGroup[i]].updateCoords();
				}
			}
			else
			{
				this.vStencilList[this.iSelectedStencil].updateCoords();
				this.vStencilList[this.iSelectedStencil].updateRotPoint();
			}
		}
	}
	return handled;
}

CWallFashionHandler.prototype.setWallFashionColor = function(color)
{
	if(this.bIsAnySelected)
	{
		this.vStencilList[this.iSelectedStencil].vTopColor = new Float32Array(color);
		this.vStencilList[this.iSelectedStencil].bIsColorSelection = false;
	}
}

CWallFashionHandler.prototype.updateGroupList = function()
{
	var i = 0;
	if(this.vmLayerGroup[stateCommon.iCurrentLayer] !== null)
	{
		if(this.vmLayerGroup[stateCommon.iCurrentLayer])		// If current layer wallfashions are gouped
		{
			this.vGroup.splice(0, this.vGroup.length);
			for(;i<this.vStencilList.length;i++)
			{
				if(this.vStencilList[i].uiLayerLevel == stateCommon.iCurrentLayer)
				{
					var temp = 0 + i;
					this.vGroup.push(temp);
					this.vStencilList[i].bIsGrouped = true;
				}
			}
			this.iGroupSize = this.vGroup.length;
		}
		else
		{
			for(;i<this.vGroup.length;i++)
				this.vStencilList[this.vGroup[i]].bIsGrouped = false;
		}
	}
	else
		this.vGroup.splice(0, this.vGroup.length);
}

CWallFashionHandler.prototype.isEmpty = function()
{
	if(this.vStencilList.length == 0)
		return true;
	else 
		return false;
}

CWallFashionHandler.prototype.toggleSelected = function()
{
	if(this.bIsAnySelected)
		this.vStencilList[this.iSelectedStencil].bIsSelected = !this.vStencilList[this.iSelectedStencil].bIsSelected;
}

CWallFashionHandler.prototype.reset = function()
{
	this.init();
}

CWallFashionHandler.prototype.isGroupable = function()
{
	var minNumber = 0, i = 0;
	for(;i < this.vStencilList.length;i++)
	{
		if(this.vStencilList[i].uiLayerLevel == stateCommon.iCurrentLayer)
		{
			++minNumber;
		}
		if(minNumber > 1)
			return true;
	}
	return false;
}