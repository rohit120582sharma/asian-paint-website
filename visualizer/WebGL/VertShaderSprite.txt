attribute highp   vec3  inVertex;

uniform highp   mat4  MVPMatrix;
uniform highp vec2 vertexScale;

void main()
{
	// Transform position
    gl_Position = MVPMatrix * vec4(inVertex.x*vertexScale.x, inVertex.y*vertexScale.y, inVertex.z, 1.0);
    
    // Pass through texcoords
	gl_PointSize = 20.0;
}