// global object for texture library
var messageObj;

// teture object structure
function CMessage()
{
	this.messages = [];
}

CMessage.prototype.destroy = function()
{
	this.messages = null;
};

CMessage.prototype.addMessage = function(message)
{
	this.messages.push(message);
};

var messageType = 
{
		None:					0,
		TouchDown: 				1,					// Message for - Touch Down in rendering window
		TouchUp:				2,					// Message for - Touch Up in rendering window
		TouchMove:				3,					// Message for - Touch Move in rendering window
		LongTouch:				4,					// Message for - Long Touch in rendering window (for 7 miliseconds)
		Undo:					5,
		Redo:					6,		
	    ChromaThreshHold:		7,					// Message to set Chroma-Threshold value by 'Slider'
	    ChomaShadowFactor:		8,					// Message for 'Shadow' button click - to Reset-Image in Croma
	    ResetImage:				9,					// Message for 'Reset' button click - to Reset-Image in Croma
	    LoadedTexture:			10,
	    RemoveTone:				11,					// Message for 'Remove' button click - Remove Tne in Effect.
		Loaded3ToneTexture:		12,
		SetColor:				13,
		SetColor2:				14,
		SetWallFashion:			15,
//		SetOldWallFashion:		16,
		SetWallFashionColor:	17,
		SetLayerToChroma:		18,
		HideTexture:			19,
		TranslateTexture:		20,
		ZoomTexture:			21,
		RotateTexture:			22,
		SwitchAutoComplete:		23,					// Auto completes mask
		ImageCorrected:			24,
		SkipToChroma:			25,					// Message for 'Skip' button click
		ProceedToChroma:		26,					// Message for 'Proceed' button click
		SwitchToBrush:			27,					// Message for 'Brush' button click - Switch to Brush State
		BrushSize1:				28,					// Message for 'Circular Brush -1 (Small)' button click
		BrushSize2:				29,					// Message for 'Circular Brush -2 (Medium)' button click
		BrushSize3:				30,					// Message for 'Circular Brush -3 (Bigger)' button click
		BrushSquareSize1:		31,					// Message for 'Rectangular Brush -1 (Small)' button click
		BrushSquareSize2:		32,					// Message for 'Rectangular Brush -2 (Medium)' button click
		BrushSquareSize3:		33,					// Message for 'Rectangular Brush -3 (Bigger)' button click
		SwitchToEraser:			34,					// Message for 'Eraser' button click - Switch to Eraser State
		EraserSize1:			35,					// Message for 'Circular Eraser -1 (Small)' button click
		EraserSize2:			36,					// Message for 'Circular Eraser -2 (Medium)' button click
		EraserSize3:			37,					// Message for 'Circular Eraser -3 (Bigger)' button click
		EraserSquareSize1:		38,					// Message for 'Rectangular Eraser -1 (Small)' button click
		EraserSquareSize2:		39,					// Message for 'Rectangular Eraser -2 (Medium)' button click
		EraserSquareSize3:		40,					// Message for 'Rectangular Eraser -3 (Bigger)' button click
		SwitchToMasking:		41,
		MaskFreeHand:			42,
		MaskPolyLine:			43,
		SwitchToChroma:			44,					// Message for 'Chroma' button click - Switch to Chroma State
		ToggleMask:				45,					// Message for 'Show/Hide Mask' button click
		TakeScreenshot:			46,					// Message for 'Save' button click
		SwitchToPerspective:	47					// Message for 'Perspective' button click - Switch to Perspective State
};