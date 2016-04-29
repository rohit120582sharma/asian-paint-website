//Global var for shaderLib
var shaderLib;

// shader for texture and sprite
function ShaderTex()
{
	this.uiId = 0;
	this.uiMVPMatrixLoc = 0;
	this.uiScale = 0;
}

//function for image correction brightness/contrast
function  ShaderBrightContrast()
{
	this.uiId = 0;
	this.uiMVPMatrixLoc = 0;
	this.uiBrightness = 0;
	this.uiContrast = 0;
}

//Function for image correction sharpness
function ShaderSharpness()
{
	this.uiId = 0;
	this.uiMVPMatrixLoc = 0;
	this.uiImageWidth = 0;
	this.uiImageHeight = 0;
	this.uiSharpness = 0;
}

//Function for chroma and Brush tool
function ShaderFill()
{
	this.uiId = 0;
	this.uiMVPMatrixLoc = 0;
	this.uiIntensity = 0;
	this.uiCurrentLayer = 0;
	this.uiBaseColor = 0;
	this.uiTopColor = 0;
	this.uiApplyTex = 0;
	this.uiPerspective = 0;
	this.uiTextureMatrix = 0;
	this.uiAspectRatio = 0;
	this.uiShadowFac = 0;
}

//Function for WallFashions
function ShaderWallFashion()
{
	this.uiId = 0;
	this.uiMVPMatrixLoc = 0;
	this.uiTopColor = 0;
	this.uiPerspective = 0;
	this.uiAspectRatio = 0;
}

//Function for 2 Layer Texture-chroma tool
function ShaderChroma2()
{
	this.uiId = 0;
	this.uiMVPMatrixLoc = 0;
	this.uiIntensity = 0;
	this.uiCurrentLayer = 0;
	this.uiBaseColor = 0;
	this.uiTopColor = 0;
	this.uiPerspective = 0;
	this.uiTextureMatrix = 0;
	this.uiAspectRatio = 0;
	this.uiShadowFac = 0;
}

//Function for 3 Layer Texture-chroma and brush tool
function ShaderFill3()
{
	this.uiId = 0;
	this.uiMVPMatrixLoc = 0;
	this.uiIntensity = 0;
	this.uiCurrentLayer = 0;
	this.uiBaseColor = 0;
	this.uiTopColor = 0;
	this.uiTopColor2 = 0;
	this.uiPerspective = 0;
	this.uiTextureMatrix = 0;
	this.uiAspectRatio = 0;
	this.uiShadowFac = 0;
}

// Function for Masking, Eraser Tool and Pre-Cut Images
function ShaderColor()
{
	this.uiId = 0;
	this.uiMVPMatrixLoc = 0;
	this.uiColor = 0;
	this.uiScale = 0;
}

// function to get the shader source
function getSourceSynch(url)
{	
	var path = url;
	var split_text = path.split(".");
	split_text[1] = ".txt";
	url = split_text[0] + ".txt";
	
    var req = new XMLHttpRequest();
    req.open("GET", url, false);
    req.send(null);
    
    if(req.status == 200 || req.responseText)
    {
    	return req.responseText;
    }
    else
    {
    	return null;
    }
};

// function to compile the shader
function getShader(type, path)
{
	var shader = gl.createShader(type);
	gl.shaderSource(shader, getSourceSynch(path));
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

function compileShader(vShader, fShader, arrAttribs, nAttribs)
{
	var shaderProgram = gl.createProgram();
	
	// sttach the shaders to the shader program
  	gl.attachShader(shaderProgram, vShader);
  	gl.attachShader(shaderProgram, fShader);
  	
  	for (var i = 0; i < nAttribs; ++i)
	{
		gl.bindAttribLocation(shaderProgram, i, arrAttribs[i]);
	}
  	
  	gl.linkProgram(shaderProgram);
  	
  	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    	alert("Unable to initialize the shader program.");
    	return null;
  	}
  	
  	gl.useProgram(shaderProgram);
  	
  	return shaderProgram;
}

// shader class, compiles all the shaders
function CShaderLib()
{
	var vTempBaseColor1 = new Float32Array([1.0, 1.0, 0.0]);
	var vTempTopColor1 = new Float32Array([1.0, 0.0, 0.0]);
	
	this.shaderTex = new ShaderTex();
	this.shaderTexNoAlpha = new ShaderTex();
	this.shaderSprite = new ShaderTex();
	
	//Obj member for Eraser Tool shader
	this.shaderEraser = new ShaderColor();
	
	//Obj member for Brush Tool shader
	this.shaderBrush = new ShaderFill();
	this.shaderBrush2 = new ShaderFill();
	this.shaderBrush3 = new ShaderFill3();
	
	//Obj member for Brightness/Contrast shader
	this.shaderBrightnessContrast = new ShaderBrightContrast();
	
	//Obj member for Sharpness shader
	this.shaderSharpness = new ShaderSharpness();
	
	//Obj member for Chroma shader
	this.shaderChroma = new ShaderFill();
	this.shader2LayerTex = new ShaderChroma2();
	this.shader3LayerTex = new ShaderFill3();
	
	//Obj member for WallFashion shader
	this.shaderWallFashion = new ShaderWallFashion();
	
	//Obj member for Coloring shader
	this.shaderProgramColor = new ShaderColor();
	
	//Obj member for Masking shader
	this.shaderMaskingAlpha = new ShaderColor();
	
	//Obj member for Pre-Cut shader
	this.shaderRenderLayer = new ShaderColor();				//Renders Alpha channel to texture
	this.shaderRenderLayerRGB = new ShaderColor();			//Renders Color to Layers files
	this.shaderRenderUserLayer = new ShaderColor();			//Renders User generated Layer Data to texture
	
	// load the shader for Simple texture
	var vertShader, fragShader;
	vertShader = getShader(gl.VERTEX_SHADER, "WebGL/VertShader.vsh");								
	fragShader = getShader(gl.FRAGMENT_SHADER, "WebGL/FragShader.fsh");								
	this.shaderTex.uiId = compileShader(vertShader, fragShader, ["inVertex", "inTexCoord"], 2);
	
	/*
    Set up and link the shader program
    */
	// Set the sampler2D variable to the first texture unit
	gl.uniform1i(gl.getUniformLocation(this.shaderTex.uiId, "sTexture"), 0);
	
    // Store the location of uniforms for later use
	this.shaderTex.uiMVPMatrixLoc	= gl.getUniformLocation(this.shaderTex.uiId, "MVPMatrix");

	// set default projection matrix
	gl.uniformMatrix4fv(this.shaderTex.uiMVPMatrixLoc, false, rendererClass.matOrtho);
	
	gl.deleteShader(vertShader);
	gl.deleteShader(fragShader);
	
	
	
	
	// load the shader for Simple texture will alpha channel = 1
	var vertShader, fragShader;
	vertShader = getShader(gl.VERTEX_SHADER, "WebGL/VertShader.vsh");								
	fragShader = getShader(gl.FRAGMENT_SHADER, "WebGL/FragShaderNoAlpha.txt");								
	this.shaderTexNoAlpha.uiId = compileShader(vertShader, fragShader, ["inVertex", "inTexCoord"], 2);
	
	/*
    Set up and link the shader program
    */
	// Set the sampler2D variable to the first texture unit
	gl.uniform1i(gl.getUniformLocation(this.shaderTexNoAlpha.uiId, "sTexture"), 0);
	
    // Store the location of uniforms for later use
	this.shaderTexNoAlpha.uiMVPMatrixLoc	= gl.getUniformLocation(this.shaderTexNoAlpha.uiId, "MVPMatrix");

	// set default projection matrix
	gl.uniformMatrix4fv(this.shaderTexNoAlpha.uiMVPMatrixLoc, false, rendererClass.matIdentity);
	
	gl.deleteShader(vertShader);
	gl.deleteShader(fragShader);
	
	
	
	
	// load the shader for ERASER
	vertShader = getShader(gl.VERTEX_SHADER, "WebGL/VertShaderEraser.vsh");
	fragShader = getShader(gl.FRAGMENT_SHADER, "WebGL/FragShaderEraser.fsh");
	this.shaderEraser.uiId = compileShader(vertShader, fragShader, ["inVertex", "inTexCoordOriginal", "inTexCoordEraser"], 3);
	
	/*
    Set up the shader program
    */
	// Set the sampler2D variable to the first texture unit
	gl.uniform1i(gl.getUniformLocation(this.shaderEraser.uiId, "sTextureOriginal"), 0);
	gl.uniform1i(gl.getUniformLocation(this.shaderEraser.uiId, "sTextureRead"), 1);
	gl.uniform1i(gl.getUniformLocation(this.shaderEraser.uiId, "sTextureEraser"), 2);
	this.shaderEraser.uiColor = gl.getUniformLocation(this.shaderEraser.uiId, "CurrentLayer");

   // Store the location of uniforms for later use
	this.shaderEraser.uiMVPMatrixLoc	= gl.getUniformLocation(this.shaderEraser.uiId, "MVPMatrix");

	// set default projection matrix
	gl.uniformMatrix4fv(this.shaderEraser.uiMVPMatrixLoc, false, rendererClass.matIdentity);
	
	gl.deleteShader(vertShader);
	gl.deleteShader(fragShader);
	
	
	
	
	// load the shader for BRUSH
	vertShader = getShader(gl.VERTEX_SHADER, "WebGL/VertShaderBrush.vsh");
	fragShader = getShader(gl.FRAGMENT_SHADER, "WebGL/FragShaderBrush.fsh");
	this.shaderBrush.uiId = compileShader(vertShader, fragShader, ["inVertex", "inTexCoordOriginal", "inTexCoordBrush"], 3);

	/*
     Set up and link the shader program
     */
    // Set the sampler2D variable to the first texture unit
	gl.uniform1i(gl.getUniformLocation(this.shaderBrush.uiId, "sTextureOriginal"), 0);
	gl.uniform1i(gl.getUniformLocation(this.shaderBrush.uiId, "sTextureLayer"), 1);
	gl.uniform1i(gl.getUniformLocation(this.shaderBrush.uiId, "sTextureBrush"), 2);
	gl.uniform1i(gl.getUniformLocation(this.shaderBrush.uiId, "sTemplateTexture"), 3);

	// Store the location of uniforms for later use
	this.shaderBrush.uiMVPMatrixLoc		= gl.getUniformLocation(this.shaderBrush.uiId, "MVPMatrix");
	this.shaderBrush.uiIntensity		= gl.getUniformLocation(this.shaderBrush.uiId, "Intensity");
	this.shaderBrush.uiCurrentLayer		= gl.getUniformLocation(this.shaderBrush.uiId, "CurrentLayer");
	this.shaderBrush.uiBaseColor		= gl.getUniformLocation(this.shaderBrush.uiId, "BaseColor");
	this.shaderBrush.uiTopColor			= gl.getUniformLocation(this.shaderBrush.uiId, "TopColor");
	this.shaderBrush.uiApplyTex			= gl.getUniformLocation(this.shaderBrush.uiId, "bApplyTex");
	this.shaderBrush.uiPerspective		= gl.getUniformLocation(this.shaderBrush.uiId, "fPerspective");
	this.shaderBrush.uiTextureMatrix	= gl.getUniformLocation(this.shaderBrush.uiId, "TextureMatrix");
	this.shaderBrush.uiAspectRatio		= gl.getUniformLocation(this.shaderBrush.uiId, "AspectRatio");
	this.shaderBrush.uiShadowFac		= gl.getUniformLocation(this.shaderBrush.uiId, "ShadowFac");

	// set default values wherever possible
	gl.uniform1i(this.shaderBrush.uiApplyTex, 1);
	gl.uniform1f(this.shaderBrush.uiAspectRatio, rendererClass.fCanvasW/rendererClass.fCanvasH);
	gl.uniform1f(this.shaderBrush.uiCurrentLayer, 0.0);
	gl.uniform1f(this.shaderBrush.uiIntensity, 765.0);
	gl.uniform1f(this.shaderBrush.uiShadowFac, 1.0);
	gl.uniform1f(this.shaderBrush.uiPerspective, 0.0);
	gl.uniform3fv(this.shaderBrush.uiBaseColor, vTempBaseColor1);
	gl.uniform3fv(this.shaderBrush.uiTopColor, vTempTopColor1);
	gl.uniformMatrix4fv(this.shaderBrush.uiMVPMatrixLoc, false, rendererClass.matIdentity);

	gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
    
    
    
    
    
 // load the shader for BRUSH(2 tone)
    vertShader = getShader(gl.VERTEX_SHADER, "WebGL/VertShaderBrush.vsh");
	fragShader = getShader(gl.FRAGMENT_SHADER, "WebGL/FragShaderBrush2.fsh");
	this.shaderBrush2.uiId = compileShader(vertShader, fragShader, ["inVertex", "inTexCoordOriginal", "inTexCoordBrush"], 3);
	
	/*
     Set up and link the shader program
     */
	// Set the sampler2D variable to the first texture unit
	gl.uniform1i(gl.getUniformLocation(this.shaderBrush2.uiId, "sTextureOriginal"), 0);
	gl.uniform1i(gl.getUniformLocation(this.shaderBrush2.uiId, "sTextureLayer"), 1);
	gl.uniform1i(gl.getUniformLocation(this.shaderBrush2.uiId, "sTextureBrush"), 2);
	gl.uniform1i(gl.getUniformLocation(this.shaderBrush2.uiId, "sTemplateTexture"), 3);

	// Store the location of uniforms for later use
	this.shaderBrush2.uiMVPMatrixLoc	= gl.getUniformLocation(this.shaderBrush2.uiId, "MVPMatrix");
	this.shaderBrush2.uiIntensity		= gl.getUniformLocation(this.shaderBrush2.uiId, "Intensity");
	this.shaderBrush2.uiCurrentLayer	= gl.getUniformLocation(this.shaderBrush2.uiId, "CurrentLayer");
	this.shaderBrush2.uiBaseColor		= gl.getUniformLocation(this.shaderBrush2.uiId, "BaseColor");
	this.shaderBrush2.uiTopColor		= gl.getUniformLocation(this.shaderBrush2.uiId, "TopColor");
	this.shaderBrush2.uiApplyTex		= gl.getUniformLocation(this.shaderBrush2.uiId, "bApplyTex");
	this.shaderBrush2.uiPerspective		= gl.getUniformLocation(this.shaderBrush2.uiId, "fPerspective");
	this.shaderBrush2.uiTextureMatrix	= gl.getUniformLocation(this.shaderBrush2.uiId, "TextureMatrix");
	this.shaderBrush2.uiAspectRatio		= gl.getUniformLocation(this.shaderBrush2.uiId, "AspectRatio");
	this.shaderBrush2.uiShadowFac		= gl.getUniformLocation(this.shaderBrush2.uiId, "ShadowFac");

	// set default values wherever possible
	gl.uniform1i(this.shaderBrush2.uiApplyTex, 1);
	gl.uniform1f(this.shaderBrush2.uiAspectRatio, rendererClass.fCanvasW/rendererClass.fCanvasH);
	gl.uniform1f(this.shaderBrush2.uiCurrentLayer, 0.0);
	gl.uniform1f(this.shaderBrush2.uiIntensity, 765.0);
	gl.uniform1f(this.shaderBrush2.uiShadowFac, 1.0);
	gl.uniform1f(this.shaderBrush2.uiPerspective, 0.0);
	gl.uniform3fv(this.shaderBrush2.uiBaseColor, vTempBaseColor1);
	gl.uniform3fv(this.shaderBrush2.uiTopColor, vTempTopColor1);
	gl.uniformMatrix4fv(this.shaderBrush2.uiMVPMatrixLoc, false, rendererClass.matIdentity);

	gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
    
    
    
    
    
 // load the shader for rendering point sprites
    vertShader = getShader(gl.VERTEX_SHADER, "WebGL/VertShaderSprite.vsh");
	fragShader = getShader(gl.FRAGMENT_SHADER, "WebGL/FragShaderSprite.fsh");
	this.shaderSprite.uiId = compileShader(vertShader, fragShader, ["inVertex"], 1);
	
	/*
     Set up and link the shader program
     */
   // Set the sampler2D variable to the first texture unit
	gl.uniform1i(gl.getUniformLocation(this.shaderSprite.uiId, "sTexture"), 0);

    // Store the location of uniforms for later use
	this.shaderSprite.uiMVPMatrixLoc	= gl.getUniformLocation(this.shaderSprite.uiId, "MVPMatrix");

	// set default projection matrix
	gl.uniformMatrix4fv(this.shaderSprite.uiMVPMatrixLoc, false, rendererClass.matOrtho);

	// get and set the vertex scale
	this.shaderSprite.uiScale = gl.getUniformLocation(this.shaderSprite.uiId, "vertexScale");
	var vScale = new Float32Array([1.0, 1.0]);
	gl.uniform2fv(this.shaderSprite.uiScale, vScale);

	gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);

    
 // load the shader for objects with a texture for shader color program being used in masking tool
    vertShader = getShader(gl.VERTEX_SHADER, "WebGL/VertShaderCol.vsh");
	fragShader = getShader(gl.FRAGMENT_SHADER, "WebGL/FragShaderCol.fsh");
	this.shaderProgramColor.uiId = compileShader(vertShader, fragShader, ["inVertex"], 1);

	/*
     Set up and link the shader program
     */
	// Set the sampler2D variable to the first texture unit
	this.shaderProgramColor.uiColor = gl.getUniformLocation(this.shaderProgramColor.uiId, "vColor");

    // Store the location of uniforms for later use
	this.shaderProgramColor.uiMVPMatrixLoc	= gl.getUniformLocation(this.shaderProgramColor.uiId, "MVPMatrix");

	// set default projection matrix
	gl.uniformMatrix4fv(this.shaderProgramColor.uiMVPMatrixLoc, false, rendererClass.matOrtho);

	// get and set the vertex scale
	this.shaderProgramColor.uiScale = gl.getUniformLocation(this.shaderProgramColor.uiId, "vertexScale");
	gl.uniform2fv(this.shaderProgramColor.uiScale,  vScale);

	gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
    
    
    
    
    
    // load the shader for objects with a color for shader color program being used in masking tool with alpha
    vertShader = getShader(gl.VERTEX_SHADER, "WebGL/VertShaderCol.vsh");
	fragShader = getShader(gl.FRAGMENT_SHADER, "WebGL/FragShaderColAlphaOnly.fsh");
	this.shaderMaskingAlpha.uiId = compileShader(vertShader, fragShader, ["inVertex"], 1);
	/*
     Set up and link the shader program
     */
	// Set the sampler2D variable to the first texture unit
	this.shaderMaskingAlpha.uiColor = gl.getUniformLocation(this.shaderMaskingAlpha.uiId, "vColor");

    // Store the location of uniforms for later use
	this.shaderMaskingAlpha.uiMVPMatrixLoc	= gl.getUniformLocation(this.shaderMaskingAlpha.uiId, "MVPMatrix");

	// set default projection matrix
	gl.uniformMatrix4fv(this.shaderMaskingAlpha.uiMVPMatrixLoc, false, rendererClass.matIdentity);

	// get and set the vertex scale
	this.shaderMaskingAlpha.uiScale = gl.getUniformLocation(this.shaderMaskingAlpha.uiId, "vertexScale");
	gl.uniform2fv(this.shaderMaskingAlpha.uiScale, vScale);

	gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
    
    
    
    
 // load the shader for rendering layers(Alpha) to main image
    vertShader = getShader(gl.VERTEX_SHADER, "WebGL/VertShader.vsh");
	fragShader = getShader(gl.FRAGMENT_SHADER, "WebGL/FragShaderWriteAlphaCompare.fsh");
	this.shaderRenderLayer.uiId = compileShader(vertShader, fragShader, ["inVertex"], 1);

	/*
     Set up and link the shader program
     */
	// Set the sampler2D variable to the first texture unit
	this.shaderRenderLayer.uiColor = gl.getUniformLocation(this.shaderRenderLayer.uiId, "alpha");

    // Store the location of uniforms for later use
	this.shaderRenderLayer.uiMVPMatrixLoc	= gl.getUniformLocation(this.shaderRenderLayer.uiId, "MVPMatrix");

	// set default projection matrix
	gl.uniformMatrix4fv(this.shaderRenderLayer.uiMVPMatrixLoc, false, rendererClass.matIdentity);

	gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
    
    
    
    
 // load the shader for rendering User-Made zip layers
    vertShader = getShader(gl.VERTEX_SHADER, "WebGL/VertShader.vsh");
	fragShader = getShader(gl.FRAGMENT_SHADER, "WebGL/FragShaderWriteTexCompare.fsh");
	this.shaderRenderUserLayer.uiId = compileShader(vertShader, fragShader, ["inVertex", "inTexCoord"], 2);

	/*
     Set up and link the shader program
     */
	
	// Set the sampler2D variable to the first texture unit
//	gl.uniform1i(gl.getUniformLocation(this.shaderRenderUserLayer.uiId, "sTextureOriginal"), 0);
//	gl.uniform1i(gl.getUniformLocation(this.shaderRenderUserLayer.uiId, "sTexture"), 1);
	
	// Set the sampler2D variable to the first texture unit
	this.shaderRenderUserLayer.uiColor = gl.getUniformLocation(this.shaderRenderUserLayer.uiId, "alpha");

    // Store the location of uniforms for later use
	this.shaderRenderUserLayer.uiMVPMatrixLoc	= gl.getUniformLocation(this.shaderRenderUserLayer.uiId, "MVPMatrix");

	// set default projection matrix
	gl.uniformMatrix4fv(this.shaderRenderUserLayer.uiMVPMatrixLoc, false, rendererClass.matIdentity);

	gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
    
    
    
    
    
  // load the shader for rendering layers(Coloured) to save image
    vertShader = getShader(gl.VERTEX_SHADER, "WebGL/VertShader.vsh");
	fragShader = getShader(gl.FRAGMENT_SHADER, "WebGL/FragShaderWriteRGBCompareAlpha.fsh");
	this.shaderRenderLayerRGB.uiId = compileShader(vertShader, fragShader, ["inVertex"], 1);

	/*
     Set up and link the shader program
     */
	// Set the sampler2D variable to the first texture unit
	this.shaderRenderLayerRGB.uiColor = gl.getUniformLocation(this.shaderRenderLayerRGB.uiId, "alpha");

    // Store the location of uniforms for later use
	this.shaderRenderLayerRGB.uiMVPMatrixLoc	= gl.getUniformLocation(this.shaderRenderLayerRGB.uiId, "MVPMatrix");

	// set default projection matrix
	gl.uniformMatrix4fv(this.shaderRenderLayerRGB.uiMVPMatrixLoc, false, rendererClass.matIdentity);

	gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
    
    
    
    
 // load the shader for image correction (brightness/contrast)
    vertShader = getShader(gl.VERTEX_SHADER, "WebGL/VertShaderBrightnessContrast.vsh");
	fragShader = getShader(gl.FRAGMENT_SHADER, "WebGL/FragShaderBrightnessContrast.fsh");
	this.shaderBrightnessContrast.uiId = compileShader(vertShader, fragShader, ["inVertex", "inTexCoord"], 2);

	/*
     Set up and link the shader program
     */
	// Set the sampler2D variable to the first texture unit
	gl.uniform1i(gl.getUniformLocation(this.shaderBrightnessContrast.uiId, "sTexture"), 0);

	// Store the location of uniforms for later use
	this.shaderBrightnessContrast.uiMVPMatrixLoc	= gl.getUniformLocation(this.shaderBrightnessContrast.uiId, "MVPMatrix");
	this.shaderBrightnessContrast.uiBrightness		= gl.getUniformLocation(this.shaderBrightnessContrast.uiId, "brightness");
	this.shaderBrightnessContrast.uiContrast		= gl.getUniformLocation(this.shaderBrightnessContrast.uiId, "contrast");

	// set default values for brightness & contrast
	gl.uniform1f(this.shaderBrightnessContrast.uiBrightness, 0.0);
	gl.uniform1f(this.shaderBrightnessContrast.uiContrast, 0.0);

	// set default projection matrix
	gl.uniformMatrix4fv(this.shaderBrightnessContrast.uiMVPMatrixLoc, false, rendererClass.matIdentity);

	gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
    
    
    
    
 // load the shader for image correction (sharpness)
    vertShader = getShader(gl.VERTEX_SHADER, "WebGL/VertShaderSharpness.vsh");
	fragShader = getShader(gl.FRAGMENT_SHADER, "WebGL/FragShaderSharpness.fsh");
	this.shaderSharpness.uiId = compileShader(vertShader, fragShader, ["inVertex", "inTexCoord"], 2);

	/*
     Set up and link the shader program
     */
	// Set the sampler2D variable to the first texture unit
	gl.uniform1i(gl.getUniformLocation(this.shaderSharpness.uiId, "sTexture"), 0);

	// Store the location of uniforms for later use
	this.shaderSharpness.uiMVPMatrixLoc		= gl.getUniformLocation(this.shaderSharpness.uiId, "MVPMatrix");
	this.shaderSharpness.uiImageWidth		= gl.getUniformLocation(this.shaderSharpness.uiId, "imageWidthFactor");
	this.shaderSharpness.uiImageHeight		= gl.getUniformLocation(this.shaderSharpness.uiId, "imageHeightFactor");
	this.shaderSharpness.uiSharpness		= gl.getUniformLocation(this.shaderSharpness.uiId, "sharpness");

	// set default values for sharpness
	gl.uniform1f(this.shaderSharpness.uiSharpness, 0.0);

	// set default projection matrix
	gl.uniformMatrix4fv(this.shaderSharpness.uiMVPMatrixLoc, false, rendererClass.matIdentity);

	gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
    
    
    
    
 // load the shader for chroma tool(Single tone)
    vertShader = getShader(gl.VERTEX_SHADER, "WebGL/VertShaderChroma.vsh");
	fragShader = getShader(gl.FRAGMENT_SHADER, "WebGL/FragShaderChroma.fsh");
	this.shaderChroma.uiId = compileShader(vertShader, fragShader, ["inVertex", "inTexCoord"], 2);

	/*
     Set up and link the shader program
     */
	// Set the sampler2D variable to the first texture unit
	gl.uniform1i(gl.getUniformLocation(this.shaderChroma.uiId, "sTextureOriginal"), 0);
	gl.uniform1i(gl.getUniformLocation(this.shaderChroma.uiId, "sTextureLayer"), 1);
	gl.uniform1i(gl.getUniformLocation(this.shaderChroma.uiId, "sTemplateTexture"), 2);
	
	// Store the location of uniforms for later use
	this.shaderChroma.uiMVPMatrixLoc		= gl.getUniformLocation(this.shaderChroma.uiId, "MVPMatrix");
	this.shaderChroma.uiIntensity			= gl.getUniformLocation(this.shaderChroma.uiId, "Intensity");
	this.shaderChroma.uiCurrentLayer		= gl.getUniformLocation(this.shaderChroma.uiId, "CurrentLayer");
	this.shaderChroma.uiBaseColor			= gl.getUniformLocation(this.shaderChroma.uiId, "BaseColor");
	this.shaderChroma.uiTopColor			= gl.getUniformLocation(this.shaderChroma.uiId, "TopColor");
	this.shaderChroma.uiApplyTex			= gl.getUniformLocation(this.shaderChroma.uiId, "bApplyTex");
	this.shaderChroma.uiPerspective			= gl.getUniformLocation(this.shaderChroma.uiId, "fPerspective");
	this.shaderChroma.uiTextureMatrix		= gl.getUniformLocation(this.shaderChroma.uiId, "TextureMatrix");
	this.shaderChroma.uiAspectRatio			= gl.getUniformLocation(this.shaderChroma.uiId, "AspectRatio");
	this.shaderChroma.uiShadowFac			= gl.getUniformLocation(this.shaderChroma.uiId, "ShadowFac")

	// set default values for shader
	gl.uniform1i(this.shaderChroma.uiApplyTex, 1);
	gl.uniform1f(this.shaderChroma.uiAspectRatio, rendererClass.fCanvasW/rendererClass.fCanvasH);
	gl.uniform1f(this.shaderChroma.uiCurrentLayer, 0.0);
	gl.uniform1f(this.shaderChroma.uiIntensity, 765.0);
	gl.uniform1f(this.shaderChroma.uiShadowFac, 1.0);
	gl.uniform1f(this.shaderChroma.uiPerspective, 0.0);
	gl.uniform3fv(this.shaderChroma.uiBaseColor, vTempBaseColor1);
	gl.uniform3fv(this.shaderChroma.uiTopColor, vTempTopColor1);

	// set default projection matrix
	gl.uniformMatrix4fv(this.shaderChroma.uiMVPMatrixLoc, false, rendererClass.matIdentity);

	gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
    
    
    
    
 // load the shader for 2 layer Texture CHroma Tool (2 Tone)
    vertShader = getShader(gl.VERTEX_SHADER, "WebGL/VertShaderChroma.vsh");
	fragShader = getShader(gl.FRAGMENT_SHADER, "WebGL/FragShader2LayerTexture.fsh");
	this.shader2LayerTex.uiId = compileShader(vertShader, fragShader, ["inVertex", "inTexCoord"], 2);

	/*
     Set up and link the shader program
     */
	// Set the sampler2D variable to the first texture unit
	gl.uniform1i(gl.getUniformLocation(this.shader2LayerTex.uiId, "sTextureOriginal"), 0);
	gl.uniform1i(gl.getUniformLocation(this.shader2LayerTex.uiId, "sTextureLayer"), 1);
	gl.uniform1i(gl.getUniformLocation(this.shader2LayerTex.uiId, "sTemplateTexture1"), 2);
	
	// Store the location of uniforms for later use
	this.shader2LayerTex.uiMVPMatrixLoc		= gl.getUniformLocation(this.shader2LayerTex.uiId, "MVPMatrix");
	this.shader2LayerTex.uiIntensity		= gl.getUniformLocation(this.shader2LayerTex.uiId, "Intensity");
	this.shader2LayerTex.uiCurrentLayer		= gl.getUniformLocation(this.shader2LayerTex.uiId, "CurrentLayer");
	this.shader2LayerTex.uiBaseColor		= gl.getUniformLocation(this.shader2LayerTex.uiId, "BaseColor");
	this.shader2LayerTex.uiTopColor			= gl.getUniformLocation(this.shader2LayerTex.uiId, "TopColor");
	this.shader2LayerTex.uiPerspective		= gl.getUniformLocation(this.shader2LayerTex.uiId, "fPerspective");
	this.shader2LayerTex.uiTextureMatrix	= gl.getUniformLocation(this.shader2LayerTex.uiId, "TextureMatrix");
	this.shader2LayerTex.uiAspectRatio		= gl.getUniformLocation(this.shader2LayerTex.uiId, "AspectRatio");
	this.shader2LayerTex.uiShadowFac		= gl.getUniformLocation(this.shader2LayerTex.uiId, "ShadowFac")

	// set default values for shader
	gl.uniform1f(this.shader2LayerTex.uiAspectRatio, rendererClass.fAspectRatio);
	gl.uniform1f(this.shader2LayerTex.uiCurrentLayer, 0.0);
	gl.uniform1f(this.shader2LayerTex.uiIntensity, 765.0);
	gl.uniform1f(this.shader2LayerTex.uiShadowFac, 0.0);
	gl.uniform1f(this.shader2LayerTex.uiPerspective, 0.0);
	gl.uniform3fv(this.shader2LayerTex.uiBaseColor, vTempBaseColor1);
	gl.uniform3fv(this.shader2LayerTex.uiTopColor, vTempTopColor1);

	// set default projection matrix
	gl.uniformMatrix4fv(this.shader2LayerTex.uiMVPMatrixLoc, false, rendererClass.matIdentity);
	gl.uniformMatrix3fv(this.shader2LayerTex.uiTextureMatrix, false, rendererClass.matTexIdentity);

	gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
    
    
    
    
 // load the shader for 2 layer Texture Chroma Tool (2 Tone)
    vertShader = getShader(gl.VERTEX_SHADER, "WebGL/VertShaderChroma.vsh");
	fragShader = getShader(gl.FRAGMENT_SHADER, "WebGL/FragShader3LayerTexture.fsh");
	this.shader3LayerTex.uiId = compileShader(vertShader, fragShader, ["inVertex", "inTexCoord"], 2);

	/*
     Set up and link the shader program
     */
	// Set the sampler2D variable to the first texture unit
	gl.uniform1i(gl.getUniformLocation(this.shader3LayerTex.uiId, "sTextureOriginal"), 0);
	gl.uniform1i(gl.getUniformLocation(this.shader3LayerTex.uiId, "sTextureLayer"), 1);
	gl.uniform1i(gl.getUniformLocation(this.shader3LayerTex.uiId, "sTemplateTexture1"), 2);
	gl.uniform1i(gl.getUniformLocation(this.shader3LayerTex.uiId, "sTemplateTexture2"), 3);
	
	// Store the location of uniforms for later use
	this.shader3LayerTex.uiMVPMatrixLoc		= gl.getUniformLocation(this.shader3LayerTex.uiId, "MVPMatrix");
	this.shader3LayerTex.uiIntensity		= gl.getUniformLocation(this.shader3LayerTex.uiId, "Intensity");
	this.shader3LayerTex.uiCurrentLayer		= gl.getUniformLocation(this.shader3LayerTex.uiId, "CurrentLayer");
	this.shader3LayerTex.uiBaseColor		= gl.getUniformLocation(this.shader3LayerTex.uiId, "BaseColor");
	this.shader3LayerTex.uiTopColor			= gl.getUniformLocation(this.shader3LayerTex.uiId, "TopColor");
	this.shader3LayerTex.uiTopColor2		= gl.getUniformLocation(this.shader3LayerTex.uiId, "TopColor2");
	this.shader3LayerTex.uiPerspective		= gl.getUniformLocation(this.shader3LayerTex.uiId, "fPerspective");
	this.shader3LayerTex.uiTextureMatrix	= gl.getUniformLocation(this.shader3LayerTex.uiId, "TextureMatrix");
	this.shader3LayerTex.uiAspectRatio		= gl.getUniformLocation(this.shader3LayerTex.uiId, "AspectRatio");
	this.shader3LayerTex.uiShadowFac		= gl.getUniformLocation(this.shader3LayerTex.uiId, "ShadowFac")

	// set default values for shader
	gl.uniform1f(this.shader3LayerTex.uiAspectRatio, rendererClass.fCanvasW/rendererClass.fCanvasH);
	gl.uniform1f(this.shader3LayerTex.uiCurrentLayer, 0.0);
	gl.uniform1f(this.shader3LayerTex.uiIntensity, 765.0);
	gl.uniform1f(this.shader3LayerTex.uiShadowFac, 1.0);
	gl.uniform1f(this.shader3LayerTex.uiPerspective, 0.0);
	gl.uniform3fv(this.shader3LayerTex.uiBaseColor, vTempBaseColor1);
	gl.uniform3fv(this.shader3LayerTex.uiTopColor, vTempTopColor1);
	gl.uniform3fv(this.shader3LayerTex.uiTopColor2, vTempTopColor1);

	// set default projection matrix
	gl.uniformMatrix4fv(this.shader3LayerTex.uiMVPMatrixLoc, false, rendererClass.matIdentity);

	gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
    
    
    
    
 // load the shader for BRUSH(3 tone)
    vertShader = getShader(gl.VERTEX_SHADER, "WebGL/VertShaderBrush.vsh");
	fragShader = getShader(gl.FRAGMENT_SHADER, "WebGL/FragShaderBrush3.fsh");
	this.shaderBrush3.uiId = compileShader(vertShader, fragShader, ["inVertex", "inTexCoordOriginal", "inTexCoordBrush"], 3);

	/*
     Set up and link the shader program
     */
	// Set the sampler2D variable to the first texture unit
	gl.uniform1i(gl.getUniformLocation(this.shaderBrush3.uiId, "sTextureOriginal"), 0);
	gl.uniform1i(gl.getUniformLocation(this.shaderBrush3.uiId, "sTextureLayer"), 1);
	gl.uniform1i(gl.getUniformLocation(this.shaderBrush3.uiId, "sTextureBrush"), 2);
	gl.uniform1i(gl.getUniformLocation(this.shaderBrush3.uiId, "sTemplateTexture1"), 3);
	gl.uniform1i(gl.getUniformLocation(this.shaderBrush3.uiId, "sTemplateTexture2"), 4);
	
	// Store the location of uniforms for later use
	this.shaderBrush3.uiMVPMatrixLoc		= gl.getUniformLocation(this.shaderBrush3.uiId, "MVPMatrix");
	this.shaderBrush3.uiIntensity		= gl.getUniformLocation(this.shaderBrush3.uiId, "Intensity");
	this.shaderBrush3.uiCurrentLayer		= gl.getUniformLocation(this.shaderBrush3.uiId, "CurrentLayer");
	this.shaderBrush3.uiBaseColor		= gl.getUniformLocation(this.shaderBrush3.uiId, "BaseColor");
	this.shaderBrush3.uiTopColor			= gl.getUniformLocation(this.shaderBrush3.uiId, "TopColor");
	this.shaderBrush3.uiTopColor2		= gl.getUniformLocation(this.shaderBrush3.uiId, "TopColor2");
	this.shaderBrush3.uiPerspective		= gl.getUniformLocation(this.shaderBrush3.uiId, "fPerspective");
	this.shaderBrush3.uiTextureMatrix	= gl.getUniformLocation(this.shaderBrush3.uiId, "TextureMatrix");
	this.shaderBrush3.uiAspectRatio		= gl.getUniformLocation(this.shaderBrush3.uiId, "AspectRatio");
	this.shaderBrush3.uiShadowFac		= gl.getUniformLocation(this.shaderBrush3.uiId, "ShadowFac")

	// set default values for shader
	gl.uniform1f(this.shaderBrush3.uiAspectRatio, rendererClass.fCanvasW/rendererClass.fCanvasH);
	gl.uniform1f(this.shaderBrush3.uiCurrentLayer, 0.0);
	gl.uniform1f(this.shaderBrush3.uiIntensity, 765.0);
	gl.uniform1f(this.shaderBrush3.uiShadowFac, 1.0);
	gl.uniform1f(this.shaderBrush3.uiPerspective, 0.0);
	gl.uniform3fv(this.shaderBrush3.uiBaseColor, vTempBaseColor1);
	gl.uniform3fv(this.shaderBrush3.uiTopColor, vTempTopColor1);
	gl.uniform3fv(this.shaderBrush3.uiTopColor2, vTempTopColor1);

	// set default projection matrix
	gl.uniformMatrix4fv(this.shaderBrush3.uiMVPMatrixLoc, false, rendererClass.matIdentity);

	gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
    
    
    
    
 // load the shader for wall fashion tool
    vertShader = getShader(gl.VERTEX_SHADER, "WebGL/VertShaderChroma.vsh");
	fragShader = getShader(gl.FRAGMENT_SHADER, "WebGL/FragShaderWallFashion.fsh");
	this.shaderWallFashion.uiId = compileShader(vertShader, fragShader, ["inVertex", "inTexCoord"], 2);

	/*
     Set up and link the shader program
     */
	// Set the sampler2D variable to the first texture unit
	gl.uniform1i(gl.getUniformLocation(this.shaderWallFashion.uiId, "sTexture"), 0);

    // Store the location of uniforms for later use
	this.shaderWallFashion.uiMVPMatrixLoc	= gl.getUniformLocation(this.shaderWallFashion.uiId, "MVPMatrix");
	this.shaderWallFashion.uiTopColor		= gl.getUniformLocation(this.shaderWallFashion.uiId, "TopColor");
//	this.shaderWallFashion.uiPerspective	= gl.getUniformLocation(this.shaderWallFashion.uiId, "fPerspective");
//	this.shaderWallFashion.uiAspectRatio	= gl.getUniformLocation(this.shaderWallFashion.uiId, "AspectRatio");
	
	// set default values for shader
	gl.uniform3fv(this.shaderWallFashion.uiTopColor, vTempTopColor1);
//	gl.uniform1f(this.shaderWallFashion.uiPerspective, 0.0);
//	gl.uniform1f(this.shaderWallFashion.uiAspectRatio, rendererClass.fCanvasW/rendererClass.fCanvasH);

	// set default projection matrix
	gl.uniformMatrix4fv(this.shaderWallFashion.uiMVPMatrixLoc, false, rendererClass.matOrtho);

	gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
}

CShaderLib.prototype.destroy = function()
{
	//Deletes Programs from GPU
    gl.deleteProgram(this.shaderTex.uiId);
    gl.deleteProgram(this.shaderTexNoAlpha.uiId);
    gl.deleteProgram(this.shaderBrightnessContrast.uiId);
    gl.deleteProgram(this.shaderSharpness.uiId);
    gl.deleteProgram(this.shaderChroma.uiId);
    gl.deleteProgram(this.shaderSprite.uiId);
    gl.deleteProgram(this.shaderProgramColor.uiId);
    gl.deleteProgram(this.shaderMaskingAlpha.uiId);
    gl.deleteProgram(this.shaderEraser.uiId);
    gl.deleteProgram(this.shaderBrush.uiId);
    gl.deleteProgram(this.shaderBrush2.uiId);
    gl.deleteProgram(this.shaderBrush3.uiId);
    gl.deleteProgram(this.shader2LayerTex.uiId);
    gl.deleteProgram(this.shader3LayerTex.uiId);
    gl.deleteProgram(this.shaderRenderLayer.uiId);
    gl.deleteProgram(this.shaderRenderLayerRGB.uiId);
    gl.deleteProgram(this.shaderWallFashion.uiId);
    gl.deleteProgram(this.shaderRenderUserLayer.uiId);
}