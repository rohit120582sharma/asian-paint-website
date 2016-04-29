uniform sampler2D  sTexture;
varying mediump vec2   TexCoord;

uniform highp float alpha;

void main()
{
	highp vec3 color = texture2D(sTexture, TexCoord).rgb;
	if( color.r > 0.0001 || color.g > 0.0001 || color.b > 0.0001 )
    	gl_FragColor = vec4(color, alpha);
	else
		discard;
}