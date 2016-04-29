attribute highp   vec3  inVertex;
attribute mediump vec2  inTexCoord;

uniform highp   mat4  MVPMatrix;
varying mediump vec2  TexCoordOriginal;

void main()
{
	// Transform position
	gl_Position = MVPMatrix * vec4(inVertex, 1.0);
	
	// Pass through texcoords
	TexCoordOriginal = inTexCoord;
}