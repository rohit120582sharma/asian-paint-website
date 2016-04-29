// global object for texture library
var textureLib;

// teture object structure
function CTexture(width, height, name, texId)
{
	this.width = width;
	this.height = height;
	this.name = name;
	this.texID = texId;
	this.image = null;
	this.bLoaded = false;
}

// texture library class
function CTextureLib()
{
	this.textures = [];
	this.multiTextures = [];
	this.countToLoad = 0;
}

// to destroy all the loaded textures
CTextureLib.prototype.destroy = function()
{
	for(var i=0; i<this.textures.length; i++)
		gl.deleteTexture(this.textures[i].texID);
}

// load a texture given it's name
CTextureLib.prototype.loadTexture = function(name, src, isMultiTex, isWallFashion)
{
	if(isMultiTex)
		if(this.multiTextures.length == 2)
			this.multiTextures.splice(0,2);
	var textureObject = new CTexture();
	textureObject.image = new Image();
	textureObject.image.crossOrigin = '';
	textureObject.image.name = name;
	textureObject.name = name;
	var texLoaded = this.getTextureIndex(name);
	textureObject.image.onload = function()
	{
		if(!texLoaded)
			loadTextureGPU(isMultiTex, isWallFashion);
		else if(isWallFashion)
			messageObj.addMessage({type:messageType.SetWallFashion, texture:textureLib.textures[texLoaded] });
		else if(!isMultiTex)
			rendererClass.textureLoaded(textureLib.textures[texLoaded].name, texLoaded);
	}
	if(src)
	{
		textureObject.image.src = src;
	}
	else
	{
		textureObject.image.src = name;
	}
	if(texLoaded)
	{
		if(isMultiTex)
			this.multiTextures.unshift(texLoaded);
		else if(isWallFashion)
			messageObj.addMessage({type:messageType.SetWallFashion, texture:textureLib.textures[texLoaded] });
	}
	else 
		this.textures.push(textureObject);
}

//load a texture given it's image object
CTextureLib.prototype.loadImageTexture = function(img, isMultiTex, isWallFashion)
{
	if(isMultiTex)
		if(this.multiTextures.length == 2)
			this.multiTextures.splice(0,2);
	var textureObject = new CTexture();
	textureObject.image = img;
//	textureObject.image.crossOrigin = '';
	textureObject.name = img.name;
	var texLoaded = this.getTextureIndex(img.name);
	
	if(texLoaded)
	{
		if(isMultiTex)
			this.multiTextures.unshift(texLoaded);
		else if(isWallFashion)
			messageObj.addMessage({type:messageType.SetWallFashion, texture:textureLib.textures[texLoaded] });
		else
			rendererClass.textureLoaded(textureLib.textures[texLoaded].name, texLoaded);
	}
	else 
	{
		this.textures.push(textureObject);
		loadTextureGPU(isMultiTex, isWallFashion);
	}
}

function loadTextureGPU(isMultiTex, isWallFashion)
{
	textureLib.countToLoad++;
	if(textureLib.countToLoad == textureLib.textures.length)
	{
		// now we can actually load all the textures
		for(var i=0; i<textureLib.countToLoad; i++)
		{
			if( !textureLib.textures[i].bLoaded )
			{
				// find out all the textures that have not yet been loaded and load them
				textureLib.textures[i].texID = gl.createTexture();
				
			    //Binds Generated texture ID to texture type
			    gl.bindTexture(gl.TEXTURE_2D, textureLib.textures[i].texID);
			    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			    
			    textureLib.textures[i].width = textureLib.textures[i].image.width;
			    textureLib.textures[i].height = textureLib.textures[i].image.height;
			    
			    // if it is a power of two texture then it can be loaded in repeat mode, otherwise clamp to edge
				if( (textureLib.textures[i].width & (textureLib.textures[i].width - 1)) | (textureLib.textures[i].height & (textureLib.textures[i].height - 1)) )
				{
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				}
				else
				{
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
				    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
				}

				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			    
//			    gl.pixelStorei(gl.UNPACK_PREMULIPLY_ALPHA, true);
//			    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION, gl.BROWSER_DEFAULT_WEBGL);
			    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureLib.textures[i].image);
			    
			    if(textureLib.textures[i].image.name == "assets/bar_back_all.png")
				{
					gl.generateMipmap(gl.TEXTURE_2D);  //Generate mipmaps now!!!
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
				}
			    
			    textureLib.textures[i].bLoaded = true;
			    textureLib.textures[i].image = null;
			    
			    if(!isMultiTex && !isWallFashion)
			    	rendererClass.textureLoaded(textureLib.textures[i].name, i);
			    else if(isMultiTex)
			    	textureLib.multiTextures.unshift(i);
			    else if(isWallFashion)
			    	messageObj.addMessage({type:messageType.SetWallFashion, texture:textureLib.textures[i] });
			}
		}
	}
}

// create and empty screen size texture
CTextureLib.prototype.allocateEmptyScreenSizeTexture = function()
{
	var texID = gl.createTexture();
	
    //Binds Generated texture ID to texture type
    gl.bindTexture(gl.TEXTURE_2D, texID);

    //Setting Texture Properties
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    
    //Passing Image Data(Null) to texture
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, rendererClass.iImageW, rendererClass.iImageH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    
    // add the texture in the library array
    var textureObject = new CTexture(rendererClass.iImageW, rendererClass.iImageH, "", texID);
    textureObject.bLoaded = true;
    this.textures.push(textureObject);
    this.countToLoad++;
    return texID;
}

// Function to return texture required by name
CTextureLib.prototype.getTexture = function(tex_name)
{
	if (tex_name)
	{
		var tex_list_size = this.textures.length - 1;
		while(1 <= tex_list_size)
		{
			if(tex_name === this.textures[tex_list_size].name)
			{
				return this.textures[tex_list_size];
			}
						
			tex_list_size--;
		}
	}
	else
	{
		//alert("Texture Name: "+tex_name);
	}
	return false;
}

//Function to return texture required by index
CTextureLib.prototype.getTextureAt = function(index)
{
	if (index)
	{
		return this.textures[index];
	}
	else
	{
		if(index === 0)
			return this.textures[index];
		//alert("Texture Name: "+tex_name);
	}
	return false;
}

//Function to return texture required by index
CTextureLib.prototype.getTextureIndex = function(tex_name)
{
	if (tex_name)
	{
		var tex_list_size = this.textures.length - 1;
		while(1 <= tex_list_size)
		{
			if(tex_name === this.textures[tex_list_size].name)
			{
				return tex_list_size;
			}
						
			tex_list_size--;
		}
	}
	else
	{
		//alert("Texture Name: "+tex_name);
	}
	return false;
}

//Function to return texture required by index
CTextureLib.prototype.getTextureNameByID = function(texID)
{
	if (texID)
	{
		var tex_list_size = this.textures.length - 1;
		while(1 <= tex_list_size)
		{
			if(texID === this.textures[tex_list_size].texID)
			{
				return this.textures[tex_list_size].name;
			}
						
			tex_list_size--;
		}
	}
	else
	{
		//alert("Texture Name: "+tex_name);
	}
	return false;
}