/**
 * 
 */

// State Masking class
function CStatePerspective()
{
	// Call the parent constructor
	CCState.call(this, EN_STATE.enPerspective);
	
	this.bPerspectiveSelected = false;
	this.bPointSelected = false;
	this.vLastTouchPos = new Array();
	this.vPoints = new Array();
	this.verticesBuffer = gl.createBuffer();
	this.vPerspectives = new Array();
}

//inherit State
CStatePerspective.prototype = new CCState();

//correct the constructor pointer because it points to CCState
CStatePerspective.prototype.constructor = CStatePerspective;

CStatePerspective.prototype.addPerspective = function()
{
	// add a default perspective
	var vPoints = new Array();
	vPoints[0] = -0.2;
	vPoints[1] = 0.2;
	vPoints[2] = -0.2;
	vPoints[3] = -0.2;
	vPoints[4] = 0.2;
	vPoints[5] = -0.2;
	vPoints[6] = 0.2;
	vPoints[7] = 0.2;

	this.vPerspectives.push(vPoints);
}

CStatePerspective.prototype.processState = function()
{
	var vScale = new Array(rendererClass.fCanvasW, rendererClass.fCanvasH);

	// Render the final result/image on screen
	gl.useProgram(shaderLib.shaderTex.uiId);

	gl.uniformMatrix4fv(shaderLib.shaderTex.uiMVPMatrixLoc, false, rendererClass.matOrtho);

	// resets the daylight to slider value
//	glUniform1f(gShaderLib->m_ShaderTex.uiDayLight, gCCRenderer->m_fDayLight);

	// set current texture unit and then render the full-screen quad with current level
	gl.activeTexture(gl.TEXTURE0);
	rendererClass.drawFullScreenImage(rendererClass.texWallUndoRedo[rendererClass.iCurrentLevel]);

	// bind the shader for color drawing
	gl.useProgram(shaderLib.shaderProgramColor.uiId);
	// apply the draw color
	var vColor = [1.0, 1.0, 1.0];
	gl.uniform3fv(shaderLib.shaderProgramColor.uiColor, vColor);

	gl.uniform2fv(shaderLib.shaderProgramColor.uiScale, vScale);

	// now draw the perspective quad on screen
	gl.enableVertexAttribArray(0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vPoints), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

	// connect the points with lines
	gl.lineWidth(2.0);
	if(rendererClass.b_isBrowserIE)
		rendererClass.drawLineLoop(this.vPoints);
	else
		gl.drawArrays(gl.LINE_LOOP, 0, 4);
	
	if(rendererClass.b_isBrowserIE)
		rendererClass.drawPointTex(this.vPoints, stateCommon.idVertexTex);
	else
	{
		// bind the texture for Dot
		gl.bindTexture(gl.TEXTURE_2D, stateCommon.idVertexTex);
	
		// bind the shader for point sprite rendering
		gl.useProgram(shaderLib.shaderSprite.uiId);
		gl.uniform2fv(shaderLib.shaderSprite.uiScale, vScale);
	
		// enable blending and draw the points
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.enable(gl.BLEND);
	    gl.drawArrays(gl.POINTS, 0, 4);
		gl.disable(gl.BLEND);
	}
}

CStatePerspective.prototype.enterState = function(enPrevState)
{
	var iPerspectivesToAdd = 0;
	iPerspectivesToAdd += stateCommon.iCurrentLayer + 1 - this.vPerspectives.length;
	if(iPerspectivesToAdd > 0)
	{
		for(var i=0; i<iPerspectivesToAdd; i++)
			this.addPerspective();
	}

	this.vPoints = this.vPerspectives[stateCommon.iCurrentLayer];
}

CStatePerspective.prototype.leaveState = function()
{	};

CStatePerspective.prototype.processMessage = function(message)
{
	var res = false;
	var TOUCH_ERROR = 0.01;
	switch(message.type)
	{
		case messageType.TouchDown:
		{
			// check for user user trying to select one of the points
			var vPoint = new Array();

			// get the screen touch pos and normalize it
			vPoint[0] = (2.0*(rendererClass.touchPoint.elements[0] / rendererClass.iImageW) - 1.0);
			vPoint[1] = (2.0*(rendererClass.iScreenHeight - rendererClass.touchPoint.elements[1]) / rendererClass.iImageH - 1.0);
			this.vLastTouchPos = vPoint;

			// now check for this position's proximity with one of the perspective points
			this.bPointSelected = false;
			for(var i=0; i<4; i++)
			{
				var tempArr = new Array(this.vPoints[2*i] - vPoint[0],
										this.vPoints[2*i+1] - vPoint[1]);
				if( lenSquare(tempArr) < TOUCH_ERROR )
				{
					// select this point
					this.bPointSelected = true;
					this.iPointID = i
					res = true;
					break;
				}
			}

			// in case no point was selected then check if the perspective itself was selected
			this.bPerspectiveSelected = false;
			if(!this.bPointSelected)
			{
				if(this.vPoints[0] < vPoint[0] && vPoint[0] < this.vPoints[6])
				{
					var fTopY = 0;
					fTopY += (this.vPoints[1] + this.vPoints[7]) / 2.0;
					var fBottomY = 0;
					fBottomY += (this.vPoints[3] + this.vPoints[5]) / 2.0;

					if(fBottomY < vPoint[1] && vPoint[1] < fTopY)
					{
						this.bPerspectiveSelected = true;
						res = true;
					}
				}
			}
		}
			break;
		case messageType.TouchMove:
		{
			// move the selected point
			if(this.bPointSelected)
			{
				// get the screen touch pos and normalize it
				var vPoint = new Array();
				vPoint[0] = (2.0*(rendererClass.touchPoint.elements[0] / rendererClass.iImageW) - 1.0);
				vPoint[1] = (2.0*(rendererClass.iScreenHeight - rendererClass.touchPoint.elements[1]) / rendererClass.iImageH - 1.0);

				// get the position change compared to last touch move event
				var diff = new Array(vPoint[0] - this.vLastTouchPos[0], vPoint[1] - this.vLastTouchPos[1]);
				this.vLastTouchPos[0] = 0;
				this.vLastTouchPos[0] += vPoint[0];
				this.vLastTouchPos[1] = 0;
				this.vLastTouchPos[1] += vPoint[1];

				// update the new point position
				vPoint[0] = this.vPoints[2*this.iPointID] + diff[0];
				vPoint[1] = this.vPoints[2*this.iPointID+1] + diff[1];

				// store the change in Y for later use
				var fyChange = diff[1];

				// keep track if change is allowed
				var bAllowX = false;
				var bAllowY = false;

				// depending on the selected point we have to move one more point in some way or another
				// we can not allow the left point to cross the right point and vice versa
				// we also can not allow top point to cross the bottom point and vice versa
				// 0 is the ID of point at left top
				// 1 is the ID of point at left bottom
				// 2 is the ID of point at right bottom
				// 3 is the ID of point at right top
				switch(this.iPointID)
				{
				case 0:
					if( vPoint[1] > this.vPoints[3] - fyChange )
					{
						//m_stPoints->vPoints[3] -= fyChange;
						bAllowY = true;
					}

					if( vPoint[0] < this.vPoints[6] )
					{
						this.vPoints[2] = 0;
						this.vPoints[2] += vPoint[0];
						bAllowX = true;
					}
					break;
				case 1:
					if( vPoint[1] < this.vPoints[1] - fyChange )
					{
						//m_stPoints->vPoints[1] -= fyChange;
						bAllowY = true;
					}

					if( vPoint[0] < this.vPoints[4] )
					{
						this.vPoints[0] = 0;
						this.vPoints[0] += vPoint[0];
						bAllowX = true;
					}
					break;
				case 2:
					if( vPoint[1] < this.vPoints[7] - fyChange )
					{
						//m_stPoints->vPoints[7] -= fyChange;
						bAllowY = true;
					}

					if( vPoint[0] > this.vPoints[2] )
					{
						this.vPoints[6] = 0;
						this.vPoints[6] += vPoint[0];
						bAllowX = true;
					}

					break;
				case 3:
					if( vPoint[1] > this.vPoints[5] - fyChange )
					{
						//m_stPoints->vPoints[5] -= fyChange;
						bAllowY = true;
					}

					if( vPoint[0] > this.vPoints[0] )
					{
						this.vPoints[4] = 0;
						this.vPoints[4] += vPoint[0];
						bAllowX = true;
					}
					break;
				}
				// assign this new point
				if(bAllowX)
				{
					this.vPoints[2*this.iPointID] = 0;
					this.vPoints[2*this.iPointID] += vPoint[0];
				}

				if(bAllowY)
				{
					this.vPoints[2*this.iPointID+1] = 0;
					this.vPoints[2*this.iPointID+1] += vPoint[1];
				}

				// add the right side length
				stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.fPerspective = Math.abs(this.vPoints[7]-this.vPoints[5]);

				// subtract the left side length
				stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.fPerspective -= Math.abs(this.vPoints[3]-this.vPoints[1]);

				// divide by two to get the correct value
				stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.fPerspective /= 2.0;

				// get the correct ratio by diving by horizontal length
				stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.fPerspective /= this.vPoints[6] - this.vPoints[0];

				// make sure that the perspective value is adjusted according to screen width
				stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.fPerspective *= rendererClass.iImageH/rendererClass.iImageW;

				if(stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.fPerspective > 0.4)
					stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.fPerspective = 0.4;
				else if(stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.fPerspective < -0.4)
					stateCommon.vLevelValue[rendererClass.iCurrentLevel].oImgData.fPerspective = -0.4;
				
				res = true;
			}
			else if(this.bPerspectiveSelected)
			{
				// in case the perspective was selected move the entire perspective
				// get the screen touch pos and normalize it
				var vPoint = new Array();
				vPoint[0] = (2.0*(rendererClass.touchPoint.elements[0] / rendererClass.iImageW) - 1.0);
				vPoint[1] = (2.0*(rendererClass.iScreenHeight - rendererClass.touchPoint.elements[1]) / rendererClass.iImageH - 1.0);

				// get the position change compared to last touch move event
				var diff = new Array(vPoint[0] - this.vLastTouchPos[0], vPoint[1] - this.vLastTouchPos[1]);
				this.vLastTouchPos[0] = 0;
				this.vLastTouchPos[0] += vPoint[0];
				this.vLastTouchPos[1] = 0;
				this.vLastTouchPos[1] += vPoint[1];

				// update the new positions
				for(var i=0; i<4; i++)
				{
					this.vPoints[2*i] += diff[0];
					this.vPoints[2*i+1] += diff[1];
				}
				
				res = true;
			}
		}
			break;
		
		case messageType.ResetImage:
		{
			this.vPerspectives = new Array();
			this.addPerspective();
			this.vPoints = this.vPerspectives[stateCommon.iCurrentLayer];
			break;
		}
		default:
			break;
	}
	return res;
}