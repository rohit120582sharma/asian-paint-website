uniform sampler2D  sTextureOriginal;
uniform sampler2D  sTextureLayer;

uniform mediump float Intensity;
uniform mediump float CurrentLayer;
uniform mediump vec3 BaseColor;
uniform mediump float ShadowFac;

varying mediump vec2  TexCoordOriginal;

void main()
{
	// get the texture color in this layer
    mediump vec4 texColor = texture2D(sTextureLayer, TexCoordOriginal);

    mediump float iLayer = texColor.a * 255.0;
    mediump float iMin = CurrentLayer - 0.1;
    mediump float iMax = CurrentLayer + 0.1;
    
    if(iMin<iLayer && iLayer<iMax)
    {
	    // get the original texture color
	    mediump vec4 originalColor = texture2D(sTextureOriginal, TexCoordOriginal);
	    
	    // calculate the intensity of this pixel
	    mediump float iFactor = (originalColor.r + originalColor.g + originalColor.b)/Intensity;
    
    	// reduces the shadow
    	mediump float sFactor = ShadowFac * (1.0 - iFactor);
    	
    	gl_FragColor = vec4((iFactor+sFactor)*BaseColor, texColor.a);
    }
    else
    {
        gl_FragColor = texColor;
    }
}
