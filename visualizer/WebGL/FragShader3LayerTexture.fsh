uniform sampler2D  sTextureOriginal;
uniform sampler2D  sTextureLayer;

uniform sampler2D  sTemplateTexture1;
uniform sampler2D  sTemplateTexture2;

uniform mediump float Intensity;
uniform mediump float CurrentLayer;
uniform mediump vec3 BaseColor;
uniform mediump vec3 TopColor;
uniform mediump vec3 TopColor2;
uniform mediump float fPerspective;
uniform highp   mat3  TextureMatrix;
uniform mediump float AspectRatio;
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
        
        // calculate the perspective texture coordinate
        mediump vec3  TexCoordPerspective;
        TexCoordPerspective = TextureMatrix * vec3(TexCoordOriginal.x*AspectRatio, TexCoordOriginal.y, 1.0);
        
        mediump float fTemp1 = 1.0 + fPerspective * ((TexCoordPerspective.x*2.0/AspectRatio-1.0) - sign(fPerspective));
        mediump float fTemp2 = (TexCoordPerspective.y*2.0-1.0)*0.5;
        TexCoordPerspective.y = 0.5 + fTemp2 / fTemp1;
        
        // get the color from first template texture
        mediump vec4 newTemplateColor = texture2D(sTemplateTexture1, TexCoordOriginal); // Added Till work on texture orientation and perspective is done
        //mediump vec4 newTemplateColor = texture2D(sTemplateTexture1, TexCoordPerspective.xy);
       
        // Stores the final color for first textured layer
        mediump vec3 newLayeColor = vec3((iFactor+sFactor)*(BaseColor*(1.0-newTemplateColor.r) + TopColor*newTemplateColor.r));
        
        // get the color from second template texture
        newTemplateColor = texture2D(sTemplateTexture2, TexCoordOriginal); // Added Till work on texture orientation and perspective is done
        //newTemplateColor = texture2D(sTemplateTexture2, TexCoordPerspective.xy);
        
        gl_FragColor = vec4((iFactor+sFactor)*(newLayeColor*(1.0-newTemplateColor.r) + TopColor2*newTemplateColor.r), texColor.a);
    }
    else
    {
        gl_FragColor = texColor;
    }
}
