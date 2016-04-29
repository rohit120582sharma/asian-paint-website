//Glabal var for statecommon class
var stateCommon;

//Enum for states
var EN_STATE = {
	enCorrection: 0,			// for brightness, sharpness, contrast
	enChroma: 1,				// for chroma fill tool
	enMasking: 2,				// for masking tool
	enEraser: 3,				// for eraser tool
	enPerspective: 4,			// for creating a perspective on a layer
	enBrush: 5,					// for brush tool
	enStamp: 6,					// for stamp tool
};

//this structure will hold the data for texture matrix
function ST_BOUNDS()
{
	this.vTranslate = new Float32Array([0.0, 0.0]);
	this.vZoom 		= new Float32Array([1.0, 1.0]);
	this.fRotation	= 0.0;

	this.matTexture = new Float32Array(Matrix.I(3).flatten());
}

//Respective Layer data
function LayerStateValue()
{
	this.iIntensity 				= 500;
	this.fShadow 					= 0.0;
	this.fPerspective 				= 0.0;
	this.vBaseColor 				= new Float32Array([0.8, 0.0, 0.0]);
	this.vTopColor 					= new Float32Array([0.8, 0.0, 0.0]);		// Changed to red from green as texture preview with default colors is no longer supported
	this.vTopColor2 				= new Float32Array([1.0, 1.0, 1.0]);
	this.iTemplateTexture;
	this.iTemplateTexture2;
	this.iApplyTexture 				= 0;
	this.bLayerPainted				= false;
	
	this.oUIData;
//	CCRenderer::ST_BOUNDS stTextureMatrix;
	this.stTextureMatrix = new ST_BOUNDS();
}

//Common data amongst states, undo/redo level-wise
function RenderLevelStateValue()
{
	this.iVBOs 						= 0;
	this.iTagVertices 				= 0;
	this.bChromaSelectionDone 		= false;
	this.bWallFashionImplement 		= false;
	
	this.oImgData = new LayerStateValue();

	// texture matrix info
	// CCRenderer::ST_BOUNDS stTextureMatrix;
	// this.stTextureMatrix = new ST_BOUNDS();
}

//Data class to store common state data
function CCStateCommon()
{
	this.vLevelValue = new Array();						// Container for storing Undo/Redo level respective data
	for (var i = 0; i < MAX_UNDO_LEVELS; i++)
		this.vLevelValue.push(new RenderLevelStateValue());
	
	this.vLayerValue = new Array();						// Container for storing layer respective data
//	this.vLayerValue.push(new LayerStateValue());
	 
	this.bGlobalUndoDone = false;		// Needed by other states to undo mask
	
	this.iCurrentLayer = 0;				// Current layer which is being used
	this.iMaxLayer = 0;					
	this.idBrush;						// Texture for Brush and eraser -- (Square/Circle)
	this.isPreCut = false;
	
	// Masking Inter-State variables
	this.bMaskingActionDone = false;	// True when a closed mask is made
	this.bShowMask = true;				// Condition for showing mask in chroma state
	
	this.iOriginalTex;					// Original image texture produced after Image Correction Operation
	this.idPointTex;					// Vertices Texture required by masking state
	this.idVertexTex;					// Vertices Texture required by all other state
	this.rotateWFTex;					// Rotate Texture required by Wall Fashions
	
	// Function pointers
	this.pMaskRender = function(){}				// Renders mask polygons in chroma state
	this.pDelLastMask = function(){}			// Deletes Last mask polygon in case no selection was made using chroma
	this.pApplyChroma = function(){}			// Reflects the changes such as changing colour, texture, etc.
	this.pUndoPolygon = function(){}			// Deletes the relative polygons on performing undo on global level
}

CCStateCommon.prototype.resetCurrentLevelValueDefault = function(level)
{
	this.vLevelValue[level] = new RenderLevelStateValue();
	
	if(rendererClass.b_isPreCutMode)
		this.vLevelValue[rendererClass.iCurrentLevel].oImgData.bLayerPainted = true;
}