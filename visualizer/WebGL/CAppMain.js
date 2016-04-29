/**
 * 
 */

var ccMain;
var img_flag;
function CAppMain()
{
	this.img_flag = 1;
}

CAppMain.prototype.enableUndo = function()
{
	MainModule.vm.undo(true);
}

CAppMain.prototype.enableRedo = function()
{
	MainModule.vm.redo(true);
}

CAppMain.prototype.disableUndo = function()
{
	MainModule.vm.undo(false);
}

CAppMain.prototype.disableRedo = function()
{
	MainModule.vm.redo(false);
}

CAppMain.prototype.saveScreenshot = function(img_comp_flag)
{
	if (rendererClass.i_screenshot_state = ScreenShotState.SS_READPIXEL)
	{
		//var chck = gl.getError();
		//var img_dim = (rendererClass.iScreenWidth - rendererClass.iImageW)/2;
		gl.readPixels(0, 0, rendererClass.iImageW, rendererClass.iImageH, gl.RGBA, gl.UNSIGNED_BYTE, rendererClass.arr_ssImg);
		//MainModuleTool.savePrecutImages(rendererClass.arr_ssImg, rendererClass.iImageH, rendererClass.iImageW, img_comp_flag);

		if (!rendererClass.b_switch_screenShot)
		{
			MainModuleTool.saveImage(rendererClass.arr_ssImg, rendererClass.iImageH, rendererClass.iImageW, img_comp_flag);
			rendererClass.i_screenshot_state = ScreenShotState.SS_WAITING;
					
		}			
		else
		{
			MainModuleTool.savePrecutImages(rendererClass.arr_ssImg, rendererClass.iImageH, rendererClass.iImageW, img_comp_flag);

			if (!img_comp_flag)
				rendererClass.i_screenshot_state = ScreenShotState.SS_TAKE;
			else
				rendererClass.i_screenshot_state = ScreenShotState.SS_WAITING;

		}
			

		// rendererClass.i_screenshot_state = ScreenShotState.SS_WAITING;
		
		//alert("Saved - 1");
		
		// ---------------------A lot of things are happening ------------------------
		// ---------------------------------------------------------------------------		
	}
/*	
	if (!img_comp_flag)
		rendererClass.i_screenshot_state = ScreenShotState.SS_TAKE;
	else
		rendererClass.i_screenshot_state = ScreenShotState.SS_WAITING;
*/
	
	//rendererClass.i_screenshot_state = ScreenShotState.SS_WAITING;
}

