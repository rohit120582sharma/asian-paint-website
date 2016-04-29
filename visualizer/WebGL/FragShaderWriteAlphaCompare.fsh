uniform sampler2D  sTexture;
varying mediump vec2   TexCoord;

uniform highp float alpha;

void main()
{
	highp float colA = texture2D(sTexture, TexCoord).a;
	if( colA > 0.0001 )
    	gl_FragColor = vec4(1.0,0.0,0.0,alpha);
	else
		discard;
}
