attribute highp   vec3  inVertex;
attribute highp vec2  inTexCoordOriginal;
attribute highp vec2  inTexCoordBrush;

uniform highp   mat4  MVPMatrix;
varying highp vec2  TexCoordOriginal;
varying highp vec2  TexCoordBrush;

void main()
{
	// Transform position
	gl_Position = MVPMatrix * vec4(inVertex, 1.0);

	// Pass through texcoords
	TexCoordOriginal = inTexCoordOriginal;
    TexCoordBrush = inTexCoordBrush;
}