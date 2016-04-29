attribute highp   vec3  inVertex;
attribute mediump vec2  inTexCoordOriginal;
attribute mediump vec2  inTexCoordEraser;

uniform highp   mat4  MVPMatrix;
varying highp vec2  TexCoordOriginal;
varying highp vec2  TexCoordEraser;

void main()
{
	// Transform position
	gl_Position = MVPMatrix * vec4(inVertex, 1.0);

	// Pass through texcoords
	TexCoordOriginal = inTexCoordOriginal;
    TexCoordEraser = inTexCoordEraser;
}