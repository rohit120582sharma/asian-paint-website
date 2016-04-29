// global object for texture library
//var wallFashionLib;

var TOUCH_ERROR	= 0.0009;
var VERTEX_ARRAY = 0;
var OPTIONBAR_OFFSET = 0.075;
var OPTIONBAR_SIZE = 0.35;
var OPTSELECTION_SIZE = 0.075;

var I_DIVISIONS = 50;		// this is the number of quads deaw in y direction

var enWFMode =
	{
		enWFPerspective:		98,			// for perspective setting
		enWFRotate:				99			// for rotation setting
	};

// teture object structure
function CWallFashion(texID, layer)
{
	this.bIsSelected = false;
	this.bIsGrouped = false;
	this.bIsColorSelection = false;
	this.fRotAngle = 0.0;
	this.enSelectionMode = enWFMode.enWFPerspective;
	
	this.matOrtho = mat4.create();
	mat4.ortho(-rendererClass.fAspectRatio, rendererClass.fAspectRatio, -1.0, 1.0, -1.0, 1.0, this.matOrtho);
	
	this.texID = texID;
	this.uiLayerLevel = layer;
	this.vSize = new Array(0.1, 0.1);
	this.vScreenPos = new Array(0.0, 0.0);
	this.vTopColor = new Float32Array([1.0, 1.0, 1.0]);
	this.vPoints = new Array();
	
	this.fFashionButtonRadius = 0.0;
	this.fFashionButtonRadius += (this.vSize[0] + this.vSize[1])/4.0;
	this.vRotateCtrlPos = new Array(this.vScreenPos[0] + this.fFashionButtonRadius, this.vScreenPos[1]);
	this.vOptionPos = new Array(this.vScreenPos[0], this.vScreenPos[1] + this.vSize[1] - OPTIONBAR_OFFSET);
	var yPos = rendererClass.iScreenHeight - ((1.0 + this.vOptionPos[1])*(rendererClass.iImageH/2.0));
	this.vOptionScreenPos = new Array(rendererClass.iScreenWidth/2, yPos);

	this.matModelView = mat4.create();
	mat4.identity(this.matModelView); 			// Set to identity
	mat4.rotate(this.matModelView, this.fRotAngle, [0,0,1]);
	
	this.fPerspectivLeftX = 0.0;
	this.fPerspectivRightX = 0.0;
	this.fPerspectivLeftY = 0.0;
	this.fPerspectivRightY = 0.0;
	
	this.fPerspective = 0.0;
	
	this.verticesBuffer = gl.createBuffer();
	this.texBuffer = gl.createBuffer();
	
	this.matPosTrans = mat4.create();
	this.matNegTrans = mat4.create();
	
	mat4.identity(this.matPosTrans); 			// Set to identity
	mat4.translate(this.matPosTrans, new Array(this.vScreenPos[0]*rendererClass.fCanvasW, this.vScreenPos[1]*rendererClass.fCanvasH, 0)); 	// Calculate: Translate to screenPos
	
	mat4.identity(this.matNegTrans); 			// Set to identity
	mat4.translate(this.matNegTrans, new Array(-this.vScreenPos[0]*rendererClass.fCanvasW, -this.vScreenPos[1]*rendererClass.fCanvasH, 0)); 	// Calculate: Translate to -screenPos

	this.updateButtonRadius();
	this.updateCoords();
	
	this.optionBarTex = textureLib.getTexture("assets/bar_back_all.png");
	this.optionSelTex = textureLib.getTexture("assets/wf_selectionbar.png");
}

CWallFashion.prototype.updateButtonRadius = function()
{
	if(this.fPerspectivLeftX>this.fPerspectivRightX)
	{
		if(this.fPerspectivLeftY>this.fPerspectivRightY)
			this.fFashionButtonRadius = (this.vSize[0] + this.fPerspectivLeftX + this.vSize[1] + this.fPerspectivLeftY)/4.0;
		else
			this.fFashionButtonRadius = (this.vSize[0] + this.fPerspectivLeftX + this.vSize[1] + this.fPerspectivRightY)/4.0;
	}
	else
	{
		if(this.fPerspectivLeftY>this.fPerspectivRightY)
			this.fFashionButtonRadius = (this.vSize[0] + this.fPerspectivRightX + this.vSize[1] + this.fPerspectivLeftY)/4.0;
		else
			this.fFashionButtonRadius = (this.vSize[0] + this.fPerspectivRightX + this.vSize[1] + this.fPerspectivRightY)/4.0;
	}
}

CWallFashion.prototype.updateCoords = function()
{
	this.vPoints[0] = 0.0;
	this.vPoints[1] = 0.0;
	this.vPoints[2] = 0.0;
	this.vPoints[3] = 0.0;
	this.vPoints[4] = 0.0;
	this.vPoints[5] = 0.0;
	this.vPoints[6] = 0.0;
	this.vPoints[7] = 0.0;
	
	this.vPoints[0] += this.vScreenPos[0] - this.vSize[0] - this.fPerspectivLeftX;
	this.vPoints[1] += this.vScreenPos[1] - this.vSize[1] - this.fPerspectivLeftY;
	this.vPoints[2] += this.vScreenPos[0] + this.vSize[0] + this.fPerspectivRightX;
	this.vPoints[3] += this.vScreenPos[1] - this.vSize[1] - this.fPerspectivRightY;
	this.vPoints[4] += this.vScreenPos[0] + this.vSize[0] + this.fPerspectivRightX;
	this.vPoints[5] += this.vScreenPos[1] + this.vSize[1] + this.fPerspectivRightY;
	this.vPoints[6] += this.vScreenPos[0] - this.vSize[0] - this.fPerspectivLeftX;
	this.vPoints[7] += this.vScreenPos[1] + this.vSize[1] + this.fPerspectivLeftY;
}

CWallFashion.prototype.updateRotPoint = function()
{
	mat4.identity(this.matModelView); 			// Set to identity
	mat4.rotate(this.matModelView, this.fRotAngle, [0,0,1]);
	this.vRotateCtrlPos[0] = 0.0;
	this.vRotateCtrlPos[0] += this.fFashionButtonRadius*Math.cos(this.fRotAngle);
	this.vRotateCtrlPos[1] = 0.0;
	this.vRotateCtrlPos[1] += this.fFashionButtonRadius*Math.sin(this.fRotAngle);
}

CWallFashion.prototype.setSize = function(sizeX, sizeY)
{
	this.vSize[0] = sizeX;
	this.vSize[1] = sizeY;
	
	this.updateButtonRadius();
	this.vRotateCtrlPos[0] = this.vScreenPos[0] + this.fFashionButtonRadius;
	this.vRotateCtrlPos[1] = this.vScreenPos[1];

	this.checkOptionPos();

	if(this.vSize[1] <= 0.2)
		this.vOptionPos[1] += 2*OPTIONBAR_OFFSET;
	this.updateCoords();
}

CWallFashion.prototype.clickedOn = function(vTouchPoint)
{
	var temp = new Array(this.vScreenPos[0] - vTouchPoint[0],
							this.vScreenPos[1] - vTouchPoint[1]);
	if(lenSquare(temp) <= this.fFashionButtonRadius)
		this.bIsSelected = true;
	else
		this.bIsSelected = false;
	return this.bIsSelected;
}

CWallFashion.prototype.checkOptionPos = function()
{
	if(this.vSize[1] <= 0.2)
	{
		if((this.vScreenPos[1] + this.vSize[1] + OPTIONBAR_OFFSET) > 1.0)
			this.vOptionPos[1] = 0.0 + this.vScreenPos[1] - this.vSize[1] - OPTIONBAR_OFFSET;
		else
			this.vOptionPos[1] = 0.0 + this.vScreenPos[1] + this.vSize[1] + OPTIONBAR_OFFSET;
	}
	else
	{
		if((this.vScreenPos[1] + this.vSize[1] - OPTIONBAR_OFFSET) > 1.0)
			this.vOptionPos[1] = 0.0 + this.vScreenPos[1] - this.vSize[1] + OPTIONBAR_OFFSET;
		else
			this.vOptionPos[1] = 0.0 + this.vScreenPos[1] + this.vSize[1] - OPTIONBAR_OFFSET;
	}
	var yPos = rendererClass.iScreenHeight - ((1.0 + this.vOptionPos[1])*(rendererClass.iImageH/2.0));
	this.vOptionScreenPos[1] = yPos;
	
}

CWallFashion.prototype.renderWallFashionStencil = function()
{
	var negMat = mat4.create();
	var neutMat = mat4.create();
	var MVPmat = mat4.create();
	mat4.multiply(this.matModelView, this.matNegTrans, negMat);
	mat4.multiply(this.matPosTrans, negMat, neutMat);
	mat4.multiply(this.matOrtho, neutMat, MVPmat);
	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, this.texID); // to use when switch state is enabled

	// draw the processed image into the selection FBO
	gl.useProgram(shaderLib.shaderWallFashion.uiId);

	// send in the texture matrix
	gl.uniformMatrix4fv(shaderLib.shaderWallFashion.uiMVPMatrixLoc, false, MVPmat);

	gl.uniform3fv(shaderLib.shaderWallFashion.uiTopColor, this.vTopColor);

//	gl.uniform1f(shaderLib.shaderWallFashion.uiPerspective, this.fPerspective);
//	glUniform1f(shaderLib.shaderWallFashion.uiDayLight,gCCRenderer->m_fDayLight);
//	gl.uniform1f(shaderLib.shaderWallFashion.uiAspectRatio, this.vSize[0]/this.vSize[1]);

	// we need to create the new texture with not only the layer data but also with the layer colors
	// so redraw on the current level texture with all the new information

	var fVerts = new Array
	(
			this.vPoints[0]*rendererClass.fCanvasW, this.vPoints[1]*rendererClass.fCanvasH,
			this.vPoints[2]*rendererClass.fCanvasW, this.vPoints[3]*rendererClass.fCanvasH,
			this.vPoints[6]*rendererClass.fCanvasW, this.vPoints[7]*rendererClass.fCanvasH,
			this.vPoints[4]*rendererClass.fCanvasW, this.vPoints[5]*rendererClass.fCanvasH
	);											//Vertices for OpenGL Space		
	
	var fLeftX = fVerts[0];
	var fRightX = fVerts[2];
	var fLeftBottomY = fVerts[1];
	var fLeftTopY = fVerts[5];
	var fRightBottomY = fVerts[3];
	var fRightTopY = fVerts[7];
	var fLeftHeight = 0.0 + (fLeftTopY - fLeftBottomY)/I_DIVISIONS;
	var fRightHeight = 0.0 + (fRightTopY - fRightBottomY)/I_DIVISIONS;

	// allocate array to hold vertex data
	var fVertsFinal = new Array();
	var fTexCoordsFinal = new Array();

	for(var i=0; i<=I_DIVISIONS; i++)
	{
		fVertsFinal[4*i] = fLeftX;
		fVertsFinal[4*i+1] = fLeftBottomY + fLeftHeight*i;
		fVertsFinal[4*i+2] = fRightX;
		fVertsFinal[4*i+3] = fRightBottomY + fRightHeight*i;

		fTexCoordsFinal[4*i] = 0.0;
		fTexCoordsFinal[4*i+1] = i/I_DIVISIONS;
		fTexCoordsFinal[4*i+2] = 1.0;
		fTexCoordsFinal[4*i+3] = fTexCoordsFinal[4*i+1];
	}

	//Passing and enabling vertex array in shaders
	gl.enableVertexAttribArray(0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fVertsFinal), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    
    //Passing and enabling Texture coordinates array in shaders
    gl.enableVertexAttribArray(1);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fTexCoordsFinal), gl.STATIC_DRAW);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
	
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.enable(gl.BLEND);
	//Renders the base for image
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, (I_DIVISIONS+1)*2);
	gl.disable(gl.BLEND);

	if(this.bIsSelected && rendererClass.i_screenshot_state != ScreenShotState.SS_TAKE)
	{
		if(!this.bIsGrouped)
			this.renderSelection();
		this.renderOptionBar();
	}
}

CWallFashion.prototype.renderOptionBar = function()
{
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, this.optionBarTex.texID);

	var sizeW = this.optionBarTex.width;
	var sizeH = this.optionBarTex.height;

	var optAspectRatio = 0.0 + sizeH/sizeW;
	// draw the processed image into the selection FBO
	gl.useProgram(shaderLib.shaderTex.uiId);

	// resets the daylight to full
//	gl.uniform1f(shaderLib.shaderTex.uiDayLight, 1.0);

	var fVerts = new Array
	(
		(this.vOptionPos[0]*rendererClass.fCanvasW) - OPTIONBAR_SIZE, (this.vOptionPos[1]*rendererClass.fCanvasH) - (OPTIONBAR_SIZE*optAspectRatio),
		(this.vOptionPos[0]*rendererClass.fCanvasW) + OPTIONBAR_SIZE, (this.vOptionPos[1]*rendererClass.fCanvasH) - (OPTIONBAR_SIZE*optAspectRatio),
		(this.vOptionPos[0]*rendererClass.fCanvasW) - OPTIONBAR_SIZE, (this.vOptionPos[1]*rendererClass.fCanvasH) + (OPTIONBAR_SIZE*optAspectRatio),
		(this.vOptionPos[0]*rendererClass.fCanvasW) + OPTIONBAR_SIZE, (this.vOptionPos[1]*rendererClass.fCanvasH) + (OPTIONBAR_SIZE*optAspectRatio)
	);											//Vertices for OpenGL Space

	//Passing and enabling vertex array in shaders
	gl.enableVertexAttribArray(0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fVerts), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

	var fTexCoord =
	[
		0.0, 0.0,
		1.0, 0.0,
		0.0, 1.0,
		1.0, 1.0,
	];											//Texture coordinates

	//Passing and enabling Texture coordinates array in shaders
    gl.enableVertexAttribArray(1);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fTexCoord), gl.STATIC_DRAW);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

    gl.enable(gl.BLEND);
	//Renders the base for image
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.disable(gl.BLEND);
    
    var selAspectRatio = 0.0 + this.optionSelTex.height/this.optionSelTex.width;
    if(this.bIsGrouped)
	{
    	gl.bindTexture(gl.TEXTURE_2D, this.optionSelTex.texID);
		var fVerts2 = new Array
		(
			(this.vOptionPos[0]*rendererClass.fCanvasW) + 0.081 - OPTSELECTION_SIZE, (this.vOptionPos[1]*rendererClass.fCanvasH) - (OPTIONBAR_SIZE*optAspectRatio/2) - (OPTSELECTION_SIZE*selAspectRatio),
			(this.vOptionPos[0]*rendererClass.fCanvasW) + 0.081 + OPTSELECTION_SIZE, (this.vOptionPos[1]*rendererClass.fCanvasH) - (OPTIONBAR_SIZE*optAspectRatio/2) - (OPTSELECTION_SIZE*selAspectRatio),
			(this.vOptionPos[0]*rendererClass.fCanvasW) + 0.081 - OPTSELECTION_SIZE, (this.vOptionPos[1]*rendererClass.fCanvasH) - (OPTIONBAR_SIZE*optAspectRatio/2) + (OPTSELECTION_SIZE*selAspectRatio),
			(this.vOptionPos[0]*rendererClass.fCanvasW) + 0.081 + OPTSELECTION_SIZE, (this.vOptionPos[1]*rendererClass.fCanvasH) - (OPTIONBAR_SIZE*optAspectRatio/2) + (OPTSELECTION_SIZE*selAspectRatio)
		);											//Vertices for OpenGL Space
		
		//Passing and enabling vertex array in shaders
		gl.enableVertexAttribArray(0);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fVerts2), gl.STATIC_DRAW);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
		
		gl.enable(gl.BLEND);
		//Renders the base for image
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		gl.disable(gl.BLEND);
	}
    if(this.enSelectionMode == enWFMode.enWFRotate)
	{
    	gl.bindTexture(gl.TEXTURE_2D, this.optionSelTex.texID);
		var fVerts2 = new Array
		(
			(this.vOptionPos[0]*rendererClass.fCanvasW) - 0.075 - OPTSELECTION_SIZE, (this.vOptionPos[1]*rendererClass.fCanvasH) - (OPTIONBAR_SIZE*optAspectRatio/2) - (OPTSELECTION_SIZE*selAspectRatio),
			(this.vOptionPos[0]*rendererClass.fCanvasW) - 0.075 + OPTSELECTION_SIZE, (this.vOptionPos[1]*rendererClass.fCanvasH) - (OPTIONBAR_SIZE*optAspectRatio/2) - (OPTSELECTION_SIZE*selAspectRatio),
			(this.vOptionPos[0]*rendererClass.fCanvasW) - 0.075 - OPTSELECTION_SIZE, (this.vOptionPos[1]*rendererClass.fCanvasH) - (OPTIONBAR_SIZE*optAspectRatio/2) + (OPTSELECTION_SIZE*selAspectRatio),
			(this.vOptionPos[0]*rendererClass.fCanvasW) - 0.075 + OPTSELECTION_SIZE, (this.vOptionPos[1]*rendererClass.fCanvasH) - (OPTIONBAR_SIZE*optAspectRatio/2) + (OPTSELECTION_SIZE*selAspectRatio)
		);											//Vertices for OpenGL Space
		
		//Passing and enabling vertex array in shaders
		gl.enableVertexAttribArray(0);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fVerts2), gl.STATIC_DRAW);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
		
		gl.enable(gl.BLEND);
		//Renders the base for image
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		gl.disable(gl.BLEND);
	}
    if(this.bIsColorSelection)
    {
    	gl.bindTexture(gl.TEXTURE_2D, this.optionSelTex.texID);
		var fVerts2 = new Array
		(
			(this.vOptionPos[0]*rendererClass.fCanvasW) - 0.231 - OPTSELECTION_SIZE, (this.vOptionPos[1]*rendererClass.fCanvasH) - (OPTIONBAR_SIZE*optAspectRatio/2) - (OPTSELECTION_SIZE*selAspectRatio),
			(this.vOptionPos[0]*rendererClass.fCanvasW) - 0.231 + OPTSELECTION_SIZE, (this.vOptionPos[1]*rendererClass.fCanvasH) - (OPTIONBAR_SIZE*optAspectRatio/2) - (OPTSELECTION_SIZE*selAspectRatio),
			(this.vOptionPos[0]*rendererClass.fCanvasW) - 0.231 - OPTSELECTION_SIZE, (this.vOptionPos[1]*rendererClass.fCanvasH) - (OPTIONBAR_SIZE*optAspectRatio/2) + (OPTSELECTION_SIZE*selAspectRatio),
			(this.vOptionPos[0]*rendererClass.fCanvasW) - 0.231 + OPTSELECTION_SIZE, (this.vOptionPos[1]*rendererClass.fCanvasH) - (OPTIONBAR_SIZE*optAspectRatio/2) + (OPTSELECTION_SIZE*selAspectRatio)
		);											//Vertices for OpenGL Space
		
		//Passing and enabling vertex array in shaders
		gl.enableVertexAttribArray(0);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fVerts2), gl.STATIC_DRAW);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
		
		gl.enable(gl.BLEND);
		//Renders the base for image
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		gl.disable(gl.BLEND);
    }
}

CWallFashion.prototype.renderSelection = function()
{
	switch(this.enSelectionMode)
	{
		case enWFMode.enWFPerspective:
		{
			var fVerts = new Array
			(
				this.vPoints[0], this.vPoints[1],
				this.vPoints[2], this.vPoints[3],
				this.vPoints[4], this.vPoints[5],
				this.vPoints[6], this.vPoints[7]
			);											//Vertices for OpenGL Space

			gl.useProgram(shaderLib.shaderProgramColor.uiId);
			// apply the draw color
			var vColor = [1.0, 1.0, 1.0];
			gl.uniform3fv(shaderLib.shaderProgramColor.uiColor, vColor);

			var vScale = new Array(rendererClass.fCanvasW, rendererClass.fCanvasH);
			gl.uniform2fv(shaderLib.shaderProgramColor.uiScale, vScale);

			gl.uniformMatrix4fv(shaderLib.shaderProgramColor.uiMVPMatrixLoc, false, rendererClass.matOrtho);

			//Passing and enabling vertex array in shaders
			gl.enableVertexAttribArray(0);
		    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
		    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fVerts), gl.STATIC_DRAW);
		    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

			gl.lineWidth(2.0);
			if(rendererClass.b_isBrowserIE)
				rendererClass.drawLineLoop(fVerts);
			else
				gl.drawArrays(gl.LINE_LOOP, 0, 4 );
/* ---- Disabling Perspective
			// bind the texture for Dot
			gl.bindTexture(gl.TEXTURE_2D, stateCommon.idVertexTex);

			// bind the shader for point sprite rendering
			gl.useProgram(shaderLib.shaderSprite.uiId);
			gl.uniform2fv(shaderLib.shaderSprite.uiScale, vScale);

			// enable blending and draw the points
			gl.enable(gl.BLEND);
		    gl.drawArrays(gl.POINTS, 0, 4);
			gl.disable(gl.BLEND);
*/
			break;
		}

		case enWFMode.enWFRotate:
		{
			var MVPmat = mat4.create();
			mat4.multiply(this.matOrtho, this.matPosTrans, MVPmat);
			
			// draw a circle
			var iVerts = 30;
			var f2Verts = new Array();
			var fTheta = Math.PI * 2.0 / iVerts;
			for(var j=0; j<iVerts; j++)
			{
				f2Verts[2*j] = 0.0 + this.fFashionButtonRadius*Math.cos(fTheta*j);
				f2Verts[2*j+1] = 0.0 + this.fFashionButtonRadius*Math.sin(fTheta*j);
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

			gl.uniformMatrix4fv(shaderLib.shaderProgramColor.uiMVPMatrixLoc, false, MVPmat);
			
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

		    gl.uniformMatrix4fv(shaderLib.shaderProgramColor.uiMVPMatrixLoc, false, rendererClass.matOrtho);

		    if(rendererClass.b_isBrowserIE)
	    	{
		    	gl.useProgram(shaderLib.shaderTex.uiId);
		    	gl.uniformMatrix4fv(shaderLib.shaderTex.uiMVPMatrixLoc, false, MVPmat);
	    		rendererClass.drawPointTex(fVerts, stateCommon.rotateWFTex);
	    		gl.uniformMatrix4fv(shaderLib.shaderTex.uiMVPMatrixLoc, false, rendererClass.matOrtho);
	    	}
	    	else
    		{
				// bind the texture for Dot
			    gl.bindTexture(gl.TEXTURE_2D, stateCommon.rotateWFTex);
	
				// bind the shader for point sprite rendering
			    gl.useProgram(shaderLib.shaderSprite.uiId);
				gl.uniform2fv(shaderLib.shaderSprite.uiScale, vScale);
	
				gl.uniformMatrix4fv(shaderLib.shaderSprite.uiMVPMatrixLoc, false, MVPmat);
	
				// enable blending and draw the points
				gl.enable(gl.BLEND);
			    gl.drawArrays(gl.POINTS, 0, 1);
				gl.disable(gl.BLEND);
	
				gl.uniformMatrix4fv(shaderLib.shaderSprite.uiMVPMatrixLoc, false, rendererClass.matOrtho);
    		}
			break;
		}
	}
}