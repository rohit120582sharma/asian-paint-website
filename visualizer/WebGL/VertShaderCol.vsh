attribute highp   vec3  inVertex;
uniform highp   mat4  MVPMatrix;
uniform highp vec2 vertexScale;

void main()
{
	// Transform position
	gl_Position = MVPMatrix * vec4(inVertex.x*vertexScale.x, inVertex.y*vertexScale.y, inVertex.z, 1.0);
    
    gl_PointSize = 10.0;
}