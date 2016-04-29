uniform sampler2D  sTexture;
varying mediump vec2   TexCoord;

uniform highp float alpha;

void main()
{
    //gl_FragColor = vec4(1.0,0.0,0.0,1.0);
   	highp float val = abs(texture2D(sTexture, TexCoord).a - alpha);
    if( val < 0.000001 )
    //if( texture2D(sTexture, TexCoord).a == alpha )
    	gl_FragColor = vec4(texture2D(sTexture, TexCoord).rgb,1.0);
    else
    	discard;
}
