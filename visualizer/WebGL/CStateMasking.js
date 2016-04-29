////enum to track state of masking
var EN_MASKSTATE =
{
	MSTATE_POLYLINE: 0,			// Poly line mode 
	MSTATE_FREEHAND: 1,			// Freehand mode
};

var MAX_VERTS = 100;

// State Masking class
function CStateMasking()
{
	// Call the parent constructor
	CCState.call(this, EN_STATE.enMasking);
	
	this.touchState;
	this.touchPos = [0.0, 0.0];
	this.pPolygon = new Array(new Array());
	
	this.maskVerticesBuffer = gl.createBuffer();
	
	this.bGlobalUndoDone = true;
	
	this.iNumPoly = 0;
	
	this.iNumVerts = new Array();
	this.iPolyLevel = new Array();
	
	this.M_PI = 3.14159265358979323846;
	
	this.maskZoomVerticesBuffer = gl.createBuffer();
	this.maskZoomTexBuffer = gl.createBuffer();
	
	this.initMask();
}

//inherit State
CStateMasking.prototype = new CCState();

//correct the constructor pointer because it points to CCState
CStateMasking.prototype.constructor = CStateMasking;

CStateMasking.prototype.initMask = function()
{
//	this.idPrev = 0;
	this.idPrev = rendererClass.iCurrentLevel;
	this.idCurrent = 0;
	this.enMaskState = EN_MASKSTATE.MSTATE_POLYLINE;

	///redo isn't needed in masking
//	gCCMain->DisableRedo();

	this.iDragIndex = -1;
	this.iNumVerts[this.iNumPoly] = 0;
	this.iRedoMaxIndex = 0;
	this.bClosed = false;
	this.touchState = messageType.None;
	
	this.pPolygon[this.iNumPoly] = null;
	this.pPolygon[this.iNumPoly] = new Array();;

//	this.iCurrLayer = stateCommon.iCurrentLayer;
}

CStateMasking.prototype.processState = function()
{
	//check if we can do undo and update buttons accordingly
//	if( this.iNumVerts[this.iNumPoly] > 0 )
//		gCCMain->EnableUndo();
//	else
//		gCCMain->DisableUndo();

	//// render previous level texture which will contain all the work done before entering to masking
	gl.useProgram(shaderLib.shaderTex.uiId);

	gl.uniformMatrix4fv(shaderLib.shaderTex.uiMVPMatrixLoc, false, rendererClass.matOrtho);
    // resets the daylight to slider value
//	glUniform1f(gShaderLib->m_ShaderTex.uiDayLight, gCCRenderer->m_fDayLight);

	gl.activeTexture(gl.TEXTURE0);
	rendererClass.drawFullScreenImage(rendererClass.texWallUndoRedo[this.idPrev]);
	
	if(this.enMaskState == EN_MASKSTATE.MSTATE_POLYLINE)
		this.renderPolyline();
	else
		this.renderFreeHand();

	this.renderZoomWindow();

	//render all polys made till now
	this.renderPreviousPolys();
}

CStateMasking.prototype.renderPolyline = function(renderAlpha)
{
	gl.lineWidth(2.0);

	//////for displaying dots on screen we will use shaderprogramcolor and no alpha operation will be performed
	////in masking leave state we have to write only alpha to the texture for which renderalpha will be true and shadermasking alpha will be used
	var vScale = new Array(rendererClass.fCanvasW, rendererClass.fCanvasH);
	if(renderAlpha)
	{
		gl.useProgram(shaderLib.shaderMaskingAlpha.uiId);
		// apply the draw color
		var vColor = 1.0;
		vColor = stateCommon.iCurrentLayer/255;
		gl.uniform1f(shaderLib.shaderMaskingAlpha.uiColor, vColor);
	}
	else
	{
		gl.useProgram(shaderLib.shaderProgramColor.uiId);
		// apply the draw color
		var vColor = [1.0, 0.0, 0.0];
		gl.uniform3fv(shaderLib.shaderProgramColor.uiColor, vColor);

		gl.uniform2fv(shaderLib.shaderProgramColor.uiScale, vScale);
	}

	if(this.iNumVerts[this.iNumPoly] != 0)
	{
		var test = new Array();//Float32Array(this.pPolygon[this.iNumPoly]);
		for(var i = 0; i<(this.iNumVerts[this.iNumPoly] * 2); i+=2)
		{
			test[i] = this.pPolygon[this.iNumPoly][i/2][0];
			test[i+1] = this.pPolygon[this.iNumPoly][i/2][1];
		}
		gl.enableVertexAttribArray(0);
	    gl.bindBuffer(gl.ARRAY_BUFFER, this.maskVerticesBuffer);
	    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(test), gl.STATIC_DRAW);
	    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
	    
	    if(this.bClosed)
    	{
	    	if(rendererClass.b_isBrowserIE)
	    		rendererClass.drawLineLoop(test);
	    	else
	    		gl.drawArrays(gl.LINE_LOOP, 0, this.iNumVerts[this.iNumPoly]);
    	}
	    else
	    	gl.drawArrays(gl.LINE_STRIP, 0, this.iNumVerts[this.iNumPoly]);
	    
	   ////when we are rendering the polygon on alpha chaneel we dnt need to render the points
	    if(!renderAlpha)
	    {
	    	if(rendererClass.b_isBrowserIE)
	    		rendererClass.drawPointTex(test, stateCommon.idPointTex);
	    	else
    		{
		    	gl.activeTexture(gl.TEXTURE0);
		    	gl.bindTexture(gl.TEXTURE_2D, stateCommon.idPointTex);
		    	gl.useProgram(shaderLib.shaderSprite.uiId);
		
				// set the vertex scale
				gl.uniform2fv(shaderLib.shaderSprite.uiScale, vScale);
		
		//	    glEnableVertexAttribArray(VERTEX_ARRAY);
		//
		//	    glVertexAttribPointer(VERTEX_ARRAY, 2, GL_FLOAT, GL_FALSE, 0, this->m_ppPolygon[this->m_nCurrLayer]);
		
			    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
				gl.enable(gl.BLEND);
			    gl.drawArrays(gl.POINTS, 0, this.iNumVerts[this.iNumPoly]);
				gl.disable(gl.BLEND);
    		}
	    }
	}
}

CStateMasking.prototype.renderFreeHand = function(renderAlpha)
{
	gl.lineWidth(2.0);
	var vScale = new Array(rendererClass.fCanvasW, rendererClass.fCanvasH);
	if(renderAlpha)
	{
		gl.useProgram(shaderLib.shaderMaskingAlpha.uiId);
		// apply the draw color
		var vColor = 1.0;
		vColor = stateCommon.iCurrentLayer/255;
		gl.uniform1f(shaderLib.shaderMaskingAlpha.uiColor, vColor);
	}
	else
	{
		gl.useProgram(shaderLib.shaderProgramColor.uiId);
		// apply the draw color
		var vColor = [1.0, 0.0, 0.0];
		gl.uniform3fv(shaderLib.shaderProgramColor.uiColor, vColor);

		gl.uniform2fv(shaderLib.shaderProgramColor.uiScale, vScale);
	}

	if(this.iNumVerts[this.iNumPoly] != 0)
	{
		var test = new Array();//Float32Array(this.pPolygon[this.iNumPoly]);
		for(var i = 0; i<(this.iNumVerts[this.iNumPoly] * 2); i+=2)
		{
			test[i] = this.pPolygon[this.iNumPoly][i/2][0];
			test[i+1] = this.pPolygon[this.iNumPoly][i/2][1];
		}
		gl.enableVertexAttribArray(0);
	    gl.bindBuffer(gl.ARRAY_BUFFER, this.maskVerticesBuffer);
	    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(test), gl.STATIC_DRAW);
	    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
	    
	    if(this.bClosed)
    	{
	    	if(rendererClass.b_isBrowserIE)
	    		rendererClass.drawLineLoop(test);
	    	else
	    		gl.drawArrays(gl.LINE_LOOP, 0, this.iNumVerts[this.iNumPoly]);
    	}
	    else
	    	gl.drawArrays(gl.LINE_STRIP, 0, this.iNumVerts[this.iNumPoly]);
	}
}

CStateMasking.prototype.renderZoomWindow = function()
{
	gl.lineWidth(1.0);

	if(this.touchState != messageType.TouchDown && this.touchState != messageType.TouchMove)
		return;

    ////// render a zoomed in view of the eraser site
    var zoomLevel = 3.0;
    var zoomWindowSize = 500.0;
    zoomWindowSize/= (rendererClass.iImageW + rendererClass.iImageH);
    var vSizeZoomWindow = new Array(zoomWindowSize, zoomWindowSize);
	var vPosZoomWindow = new Array();// = new Array(-this.vfEraserPoint[0]*rendererClass.fAspectRatio, -this.vfEraserPoint[1]);
    var vEraseTexPoint = new Array();
    var fEraserSize = new Array(20.0 / rendererClass.iScreenWidth, 20.0 / rendererClass.iScreenHeight);

    vPosZoomWindow[0] = -rendererClass.fAspectRatio*(2.0*(rendererClass.touchPoint.elements[0] / rendererClass.iImageW) - 1.0);
//    vPosZoomWindow[1] = -(2.0*(rendererClass.iScreenHeight - rendererClass.touchPoint.elements[1]) / rendererClass.iImageH - 1.0);
    vEraseTexPoint[0] = (rendererClass.touchPoint.elements[0] / rendererClass.iImageW);
    vEraseTexPoint[1] = (rendererClass.iScreenHeight - rendererClass.touchPoint.elements[1]) / rendererClass.iImageH;
    
    if(vPosZoomWindow[0] > 0.0)
		vPosZoomWindow[0] = rendererClass.fCanvasW - vSizeZoomWindow[0];
	else
		vPosZoomWindow[0] = -rendererClass.fCanvasH + vSizeZoomWindow[0];

	vPosZoomWindow[1] = 0.0;

    var fVerts1 = new Array(
        vPosZoomWindow[0]-vSizeZoomWindow[0], vPosZoomWindow[1]-vSizeZoomWindow[1],
        vPosZoomWindow[0]+vSizeZoomWindow[0], vPosZoomWindow[1]-vSizeZoomWindow[1],
        vPosZoomWindow[0]-vSizeZoomWindow[0], vPosZoomWindow[1]+vSizeZoomWindow[1],
        vPosZoomWindow[0]+vSizeZoomWindow[0], vPosZoomWindow[1]+vSizeZoomWindow[1]   );

    var fTexCoord3 = new Array(
		vEraseTexPoint[0]-fEraserSize[0]*zoomLevel, vEraseTexPoint[1]-fEraserSize[1]*zoomLevel,
		vEraseTexPoint[0]+fEraserSize[0]*zoomLevel, vEraseTexPoint[1]-fEraserSize[1]*zoomLevel,
		vEraseTexPoint[0]-fEraserSize[0]*zoomLevel, vEraseTexPoint[1]+fEraserSize[1]*zoomLevel,
		vEraseTexPoint[0]+fEraserSize[0]*zoomLevel, vEraseTexPoint[1]+fEraserSize[1]*zoomLevel   );

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, rendererClass.texWallUndoRedo[this.idPrev]);

    gl.useProgram(shaderLib.shaderTex.uiId);
    gl.uniformMatrix4fv(shaderLib.shaderTex.uiMVPMatrixLoc, false, rendererClass.matOrtho);

    gl.enableVertexAttribArray(0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.maskZoomVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fVerts1), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    
    gl.enableVertexAttribArray(1);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.maskZoomTexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fTexCoord3), gl.STATIC_DRAW);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    // render the eraser boundary
    gl.useProgram(shaderLib.shaderProgramColor.uiId);

    var fColor = [0.0, 0.0, 0.0];
    gl.uniform3fv(shaderLib.shaderProgramColor.uiColor, fColor);

    var vScale = [1.0, 1.0];
    gl.uniform2fv(shaderLib.shaderProgramColor.uiScale, vScale);

    var fVerts2 = new Array(
        vPosZoomWindow[0]-vSizeZoomWindow[0], vPosZoomWindow[1]-vSizeZoomWindow[1],
        vPosZoomWindow[0]+vSizeZoomWindow[0], vPosZoomWindow[1]-vSizeZoomWindow[1],
        vPosZoomWindow[0]+vSizeZoomWindow[0], vPosZoomWindow[1]+vSizeZoomWindow[1],
        vPosZoomWindow[0]-vSizeZoomWindow[0], vPosZoomWindow[1]+vSizeZoomWindow[1]    );

    gl.enableVertexAttribArray(0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.maskZoomVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fVerts2), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    
    gl.lineWidth(2.0);
    if(rendererClass.b_isBrowserIE)
		rendererClass.drawLineLoop(fVerts2);
	else
		gl.drawArrays(gl.LINE_LOOP, 0, 4);

    // draw a circle in the centre to show eraser bounds
    var vRadius = new Array(vSizeZoomWindow[0]/zoomLevel, vSizeZoomWindow[1]/zoomLevel);
    var iVerts = 20;
	var f2Verts = new Array();
	var fTheta = this.M_PI * 2.0 / iVerts;
	for(var i=0; i<iVerts; i++)
	{
		f2Verts[2*i] = vPosZoomWindow[0] + vRadius[0]*Math.cos(fTheta*i);
		f2Verts[2*i+1] = vPosZoomWindow[1] + vRadius[1]*Math.sin(fTheta*i);
	}

	gl.enableVertexAttribArray(0);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.maskZoomVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(f2Verts), gl.STATIC_DRAW);
	gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
	
	if(rendererClass.b_isBrowserIE)
		rendererClass.drawLineLoop(f2Verts);
	else
		gl.drawArrays(gl.LINE_LOOP, 0, iVerts);
}

CStateMasking.prototype.renderPreviousPolys = function()
{
	gl.lineWidth(1.0);
	var vScale = new Array(rendererClass.fCanvasW, rendererClass.fCanvasH);
	gl.useProgram(shaderLib.shaderProgramColor.uiId);
	// apply the draw color
	var vColor = [1.0, 0.0, 0.0];
	gl.uniform3fv(shaderLib.shaderProgramColor.uiColor, vColor);

	gl.uniform2fv(shaderLib.shaderProgramColor.uiScale, vScale);
//	    glUniformMatrix4fv(gShaderLib->m_ShaderProgramColor.uiMVPMatrixLoc,
//	    		1, GL_FALSE, gCCRenderer->m_matOrthoProjection.f);

	gl.enableVertexAttribArray(0);

	for(var i = 0 ;i < this.iNumPoly;i++)
	{
	   if(this.pPolygon[i])
	   {
		    var test = new Array();//Float32Array(this.pPolygon[this.iNumPoly]);
			for(var j = 0; j<(this.iNumVerts[this.iNumPoly-1] * 2); j+=2)
			{
				test[j] = this.pPolygon[i][j/2][0];
				test[j+1] = this.pPolygon[i][j/2][1];
			}
			gl.enableVertexAttribArray(0);
		    gl.bindBuffer(gl.ARRAY_BUFFER, this.maskVerticesBuffer);
		    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(test), gl.STATIC_DRAW);
		    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
		    
//		    if(this.idPrev != rendererClass.iCurrentLevel)
		    if(rendererClass.b_isBrowserIE)
				rendererClass.drawLineLoop(test);
			else
				gl.drawArrays(gl.LINE_LOOP, 0, this.iNumVerts[i]);
	   }

//	   i--;

//	   if( i < 0 )
//	   {
//		   i = MAX_UNDO_LEVELS - 1;
//	   }
	}
}

CStateMasking.prototype.createMaskPolyline = function(touch)
{
	switch(this.touchState)
	{
		case messageType.TouchDown:
		{

			////Check is user is trying to drag a point
			if( this.iDragIndex < 0 )
			{
				var pos = this.touchPos;
				var delta = 8.0 / 1000;  //specify this in terms of actual distance between 2 verts
				for( var i=0; i < this.iNumVerts[this.iNumPoly]; i++ )
				{
					var tempLen = new Array(this.pPolygon[this.iNumPoly][i][0] - pos[0],
											this.pPolygon[this.iNumPoly][i][1] - pos[1]);
					if( lenSquare(tempLen) < delta )
					{
						this.iDragIndex = i;
						break;
					}
				}

				//////If no point is found at touch pos then create a new point
				if(!this.bClosed && this.iDragIndex < 0 && this.iNumVerts[this.iNumPoly] < MAX_VERTS) 	// 100: Max Verts
				{
					//if there are more than 1 vertices check if user is trying to place vertex in between two others
/*					if( this.iNumVerts > 1 )
					{
						var DeltaLineIntersect = 20.0/1000;
						delta = DeltaLineIntersect;//(2.0f * DeltaLineIntersect) / ( gCCRenderer->m_iScreenW + gCCRenderer->m_iScreenH ) ;

						for( var i=0; i < (this.iNumVerts - 1); i++ )
						{
							var line1 = this.pPolygon[this.iNumPoly][i];
							var line2 = this.pPolygon[this.iNumPoly][i+1];

							var numer = 0.0;
							numer = (line2[1] - line1[1]);
							var denom = 0.0;
							denom = (line2[0] - line1[0]);
							var dist = 9999999.0;

							if( Math.abs(denom) < 0.00001 )
							{
								dist = Math.abs(line2[0] - pos[0]);
							}
							else
							{
								if( Math.abs(numer) < 0.00001 )
								{
									dist = Math.abs(line2[1] - pos[1]);
								}
								else
								{
									var m = 0.0;
									m = (line2[1] - line1[1]) / (line2[0] - line1[0]) ;
									var b = 0.0;
									b = -1.0 * m * line1[0] + line1[1];

									denom = Math.sqrt(m*m + 1);
									numer = Math.abs(pos[1] - m*pos[0] - b);

									dist = numer / denom;

								}
							}

							if( dist < delta )
							{
								this.iDragIndex = i+1;
							}
						}
					}
*/						
					////if user is trying to place a vertex in between 2 others
					if( this.iDragIndex > 0)
					{
						this.addVertexAtIndex(this.iDragIndex,pos);
					}
					else
					{
						//if new vertex is being added
						this.addVertexAtIndex(this.iNumVerts[this.iNumPoly],pos);
					}
				}
			}
			else
			{
//				CHLOG_ERROR(" DragIndex Not NULL in Touch Start ????? ");
			}
		}
		break;
	case messageType.TouchMove:
		{
			///if we are draging a vertex update its pos
			if(this.iDragIndex >= 0)
			{
				var pos = this.touchPos;
				var test = new Array(0.0, 0.0);
				test[0] += pos[0];
				test[1] += pos[1];
				this.pPolygon[this.iNumPoly].splice(this.iDragIndex,1,test);
//				this.pPolygon[this.iNumPoly][this.iDragIndex] = pos;
			}
			else
			{
//				CHLOG_INFO("DragIndex NULL ignoring TouchDrag");
			}
		}
		break;
	case messageType.TouchUp:
		{
			if(this.iDragIndex >= 0)
			{
				var pos = this.touchPos;
				var test = new Array(0.0, 0.0);
				test[0] += pos[0];
				test[1] += pos[1];
				this.pPolygon[this.iNumPoly].splice(this.iDragIndex,1,test);
//				this.pPolygon[this.iNumPoly][this.iDragIndex] = pos;
				this.iDragIndex = -1;
			}
			else
			{
//				CHLOG_INFO("DragIndex NULL ignoring TouchEnd");
			}
		}
		break;
	default:
		{
		}
		break;
	}
}

CStateMasking.prototype.createMaskFreeHand = function(touch)
{
	switch(this.touchState)
	{
	case messageType.TouchDown:
	case messageType.TouchMove:
		{
			if( this.iNumVerts[this.iNumPoly] == MAX_VERTS )
				break;

			var pos = this.touchPos;
			this.iDragIndex = -1;
			////drag not needed in freehand
			var delta = 20.0 / 1000;
			for( var i=0; i < this.iNumVerts[this.iNumPoly]; i++ )
			{
				var tempLen = new Array(this.pPolygon[this.iNumPoly][i][0] - pos[0],
										this.pPolygon[this.iNumPoly][i][1] - pos[1]);
				if( lenSquare(tempLen) < delta )
				{
					this.iDragIndex = i;
					break;
				}
			}

			if(!this.bClosed && this.iDragIndex < 0)
			{
				var test = new Array(0.0, 0.0);
				test[0] += pos[0];
				test[1] += pos[1];
				this.pPolygon[this.iNumPoly].push(test);
				
				this.iNumVerts[this.iNumPoly]++;
				this.iRedoMaxIndex = this.iNumVerts[this.iNumPoly];
			}
			this.iDragIndex = 0;
		}
		break;
	default:
		{
		}
		break;
	}
}

CStateMasking.prototype.processMessage = function(message)
{
	var res = false;
	this.touchState = messageType.None;
	
	switch(message.type)
	{
		case messageType.TouchDown:
		case messageType.TouchUp:
		case messageType.TouchMove:
		{
			this.touchPos[0] = (2.0*(rendererClass.touchPoint.elements[0] / rendererClass.iImageW) - 1.0);
			this.touchPos[1] = (2.0*(rendererClass.iScreenHeight - rendererClass.touchPoint.elements[1]) / rendererClass.iImageH - 1.0);
			this.touchState = message.type;

			if(this.touchPos[0] > 1.0)
				this.touchPos[0] = 1.0;
			else if(this.touchPos[0] < -1.0)
				this.touchPos[0] = -1.0;

			if(this.touchPos[1] > 1.0)
				this.touchPos[1] = 1.0;
			else if(this.touchPos[1] < -1.0)
				this.touchPos[1] = -1.0;

			if(this.enMaskState === EN_MASKSTATE.MSTATE_POLYLINE)
				this.createMaskPolyline(this.touch);
			else
				this.createMaskFreeHand(this.touch);

			break;
		}

		case messageType.Undo:
		{
			res = this.undo();
			break;
		}
		case messageType.Redo:
		{
//			res = this->Redo();
			break;
		}

		case messageType.MaskFreeHand:
		{
			if(this.enMaskState == EN_MASKSTATE.MSTATE_FREEHAND)
				return;
			this.enMaskState = EN_MASKSTATE.MSTATE_FREEHAND;
			this.iDragIndex = -1;
			this.iNumVerts[this.iNumPoly] = 0;
			this.iRedoMaxIndex = 0;
			this.bClosed = false;
			this.touchState = messageType.None;
			break;
		}
		
		case messageType.MaskPolyLine:
		{
			if(this.enMaskState == EN_MASKSTATE.MSTATE_POLYLINE)
				return;
			this.enMaskState = EN_MASKSTATE.MSTATE_POLYLINE
			this.iDragIndex = -1;
			this.iNumVerts[this.iNumPoly] = 0;
			this.iRedoMaxIndex = 0;
			this.bClosed = false;
			this.touchState = messageType.None;
			break;
		}
		
		case messageType.SwitchAutoComplete:
		{
			this.iDragIndex = -1;
			this.bClosed = true;
			this.touchState = messageType.None;
			stateCommon.bMaskingActionDone = true;
			break;
		}
		
		case messageType.ResetImage:
		{
			var tempMode = this.enMaskState;
			this.pPolygon = new Array(new Array());
			this.iNumPoly = 0;
			
			this.iNumVerts = new Array();
			this.iPolyLevel = new Array();
			
			this.initMask();
			this.enMaskState = tempMode;
			break;
		}

	default:
		break;
	}
	return res;
}

CStateMasking.prototype.addVertexAtIndex = function(index, pos)
{
	////make the room for new vertex and move all vertices from that location by 1 position downwards
	if(index < this.iNumVerts[this.iNumPoly])
	{
		var test = new Array(0.0, 0.0);
		test[0] += pos[0];
		test[1] += pos[1];
		this.pPolygon[this.iNumPoly].splice(index,0,test);
	}
	else if(index == this.iNumVerts[this.iNumPoly])
	{
		var test = new Array(0.0, 0.0);
		test[0] += pos[0];
		test[1] += pos[1];
		this.pPolygon[this.iNumPoly].push(test);
	}
	this.iNumVerts[this.iNumPoly]++;
	this.iDragIndex = index;
	this.iRedoMaxIndex = this.iNumVerts[this.iNumPoly];
}

CStateMasking.prototype.autoClosePolyline = function()
{
	this.iDragIndex = -1;
	this.bClosed = true;
	this.touchState = messageType.None; 
}

CStateMasking.prototype.undo = function()
{
	if(this.iNumVerts > 0)
	{
		--this.iNumVerts[this.iNumPoly];// -= 1;
	}
	this.bClosed = false;
	return true;
}

CStateMasking.prototype.enterState = function(enPrevState)
{
	
	///record undo redo button state
//	gCCRenderer->InitStateUndoRedoButtons();
	stateCommon.bMaskingActionDone = false;

	//initialize masking
	this.initMask();

	switch(enPrevState)
	{
	default:
		break;
	}
}

CStateMasking.prototype.leaveState = function()
{
	////During masking we draw things directly to the backbuffer and dnt modify the current level texture
	//when user is done masking and leave the masking we have to commit all those changes to current level texture
	//which involves rendering masking polygons on the alpha channel on the current level texture

//	gCCRenderer->RestoreUndoRedoButtons();

	if(this.iNumVerts[this.iNumPoly] <= 0 || !this.bClosed)
		return;

	stateCommon.bShowMask = true;

	rendererClass.incrementLevel();
	this.idCurrent = rendererClass.iCurrentLevel;

	rendererClass.bindOffScreenFBO(rendererClass.texWallUndoRedo[rendererClass.iCurrentLevel]);
	
	gl.useProgram(shaderLib.shaderTex.uiId);

    // resets the daylight to full
//	glUniform1f(gShaderLib->m_ShaderTex.uiDayLight, 1.0f);

    // reset the ortho matrix for drawing on FBO
	gl.uniformMatrix4fv(shaderLib.shaderTex.uiMVPMatrixLoc, false, rendererClass.matIdentity);

	rendererClass.drawFullScreenImage(rendererClass.texWallUndoRedo[this.idPrev]);

	// reset the matrix for drawing on screen
	gl.uniformMatrix4fv(shaderLib.shaderTex.uiMVPMatrixLoc, false, rendererClass.matOrtho);

	gl.colorMask(false,false,false,true);

	if(this.enMaskState == EN_MASKSTATE.MSTATE_POLYLINE)
		this.renderPolyline(true);
	else
		this.renderFreeHand(true);

	gl.colorMask(true,true,true,true);
	
	this.iNumPoly++;
	var test = {level:0, cycle:0}
	test.level += rendererClass.iCurrentLevel;
	test.cycle += rendererClass.levelCycle;
	this.iPolyLevel.push(test);

	// bind the original FBO
    rendererClass.bindOriginalFBO();

//	SAFE_DELETE_ARRAY(gCCRenderer->m_arrPolygons[gCCRenderer->m_iCurrentLevel].polygon);
//
//	gCCRenderer->m_arrPolygons[gCCRenderer->m_iCurrentLevel].freehand = (this->m_maskState == MSTATE_FREEHAND) ? true : false;
//	gCCRenderer->m_arrPolygons[gCCRenderer->m_iCurrentLevel].size = this->m_nNumVerts;
//
//	gCCRenderer->m_arrPolygons[gCCRenderer->m_iCurrentLevel].polygon = new Vector2D[this->m_nNumVerts];
//	memcpy( gCCRenderer->m_arrPolygons[gCCRenderer->m_iCurrentLevel].polygon,
//	                         this->m_ppPolygon[this->m_nCurrLayer], this->m_nNumVerts*sizeof(Vector2D) );
}

CStateMasking.prototype.resetLastMask = function()
{
	--this.iNumPoly;
	this.iPolyLevel.pop();
	this.pPolygon[this.iNumPoly] = null;
}

CStateMasking.prototype.undoPolygon = function()
{
	if(this.iPolyLevel.length == 0)
		return;
	
	if(this.iPolyLevel[this.iNumPoly-1].level == rendererClass.iCurrentLevel)
	{
		if((this.iPolyLevel[this.iNumPoly-1].cycle == rendererClass.levelCycle) || 
				(this.iPolyLevel[this.iNumPoly-1].cycle == rendererClass.levelCycle-1))
		{
			this.resetLastMask();
		}
	}
	
	stateCommon.bGlobalUndoDone = false;
}

function lenSquare(x)
{
	return (x[0]*x[0] + x[1]*x[1]);
}