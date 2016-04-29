uniform sampler2D  sTextureOriginal;
uniform sampler2D  sTextureRead;
uniform sampler2D  sTextureEraser;

uniform mediump float CurrentLayer;

varying highp vec2  TexCoordOriginal;
varying highp vec2  TexCoordEraser;

void main()
{
    mediump vec4 texColorOriginal = texture2D(sTextureOriginal, TexCoordOriginal);
    mediump vec4 texColorRead = texture2D(sTextureRead, TexCoordOriginal);
    mediump float eraserAlpha = texture2D(sTextureEraser, TexCoordEraser).r;
    
    if(eraserAlpha<0.1)
    {
        gl_FragColor = texColorOriginal;
    }
    else
    {
        gl_FragColor = texColorRead;
    }

}
