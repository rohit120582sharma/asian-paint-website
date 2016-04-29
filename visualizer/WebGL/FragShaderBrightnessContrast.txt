uniform sampler2D  sTexture;
uniform lowp float brightness;
uniform lowp float contrast;

varying mediump vec2   TexCoord;

void main()
{
	lowp vec4 textureColor = texture2D(sTexture, TexCoord);
	
	lowp vec3 tempColor = (textureColor.rgb - vec3(0.5)) * contrast + vec3(0.5);
	
	tempColor += vec3(brightness);
	
    gl_FragColor = vec4(tempColor, textureColor.a);
}
