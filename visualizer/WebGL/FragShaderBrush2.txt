uniform sampler2D  sTextureOriginal;
uniform sampler2D  sTextureLayer;
uniform sampler2D  sTextureBrush;
uniform sampler2D  sTemplateTexture;

uniform mediump float Intensity;
uniform mediump float CurrentLayer;
uniform mediump vec3 BaseColor;
uniform mediump vec3 TopColor;
uniform int bApplyTex;
uniform mediump float fPerspective;
uniform highp   mat3  TextureMatrix;
uniform mediump float AspectRatio;
uniform mediump float ShadowFac;

varying highp vec2  TexCoordOriginal;
varying highp vec2  TexCoordBrush;

void main()
{
	// get the texture color in this layer
    highp vec4 texColor = texture2D(sTextureLayer, TexCoordOriginal);
        
    mediump float iLayer = texColor.a * 255.0;    
    
    if(iLayer > 254.9)
    {
	    // get the original texture color
	    highp vec4 originalColor = texture2D(sTextureOriginal, TexCoordOriginal);
	    
	    // calculate the intensity of this pixel
	    highp float iFactor = (originalColor.r + originalColor.g + originalColor.b)/Intensity;
	    
	    // reduces the shadow
	    mediump float sFactor = ShadowFac * (1.0 - iFactor);
	    
	    // get the color in brush texture at this pixel
	    highp float brushAlpha = texture2D(sTextureBrush, TexCoordBrush).r;
	    
	    // this will store the new color
	    highp vec4 vNewColor;
    
        //if(bApplyTex<1)
        {
            // calculate the perspective texture coordinate
		    mediump vec3  TexCoordPerspective;		    
		    TexCoordPerspective = TextureMatrix * vec3(TexCoordOriginal.x*AspectRatio, TexCoordOriginal.y, 1.0);
		    
		    mediump float fTemp1 = 1.0 + fPerspective * ((TexCoordPerspective.x*2.0/AspectRatio-1.0) - sign(fPerspective));
			mediump float fTemp2 = (TexCoordPerspective.y*2.0-1.0)*0.5;
			TexCoordPerspective.y = 0.5 + fTemp2 / fTemp1;
		    
		    // get the color from template texture
		    mediump vec4 newTemplateColor = texture2D(sTemplateTexture, TexCoordOriginal); // Added Till work on texture orientation and perspective is done
		    //mediump vec4 newTemplateColor = texture2D(sTemplateTexture, TexCoordPerspective.xy);
		    
		    vNewColor = vec4((iFactor+sFactor)*(BaseColor*(1.0-newTemplateColor.r) + TopColor*newTemplateColor.r), CurrentLayer);
		}    
            
        
        if( brushAlpha < 0.2 )
            gl_FragColor = vNewColor;
        else
            gl_FragColor = texColor;
    }
    else
    {
        gl_FragColor = texColor;
    }
}
