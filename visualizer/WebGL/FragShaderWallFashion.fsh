uniform sampler2D  sTexture;

uniform mediump vec3 TopColor;

varying mediump vec2   TexCoordOriginal;

void main()
{
    mediump vec4 texColor = texture2D(sTexture, TexCoordOriginal);
    
    if( texColor.a > 0.1 )
        gl_FragColor = vec4(TopColor, texColor.a);
    else
        gl_FragColor = texColor;
}