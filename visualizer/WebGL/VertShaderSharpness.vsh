attribute highp   vec3  inVertex;
attribute mediump vec2  inTexCoord;

uniform float imageWidthFactor; 
uniform float imageHeightFactor; 
uniform float sharpness;
uniform highp   mat4  MVPMatrix;
 
varying vec2 textureCoordinate;
varying vec2 leftTextureCoordinate;
varying vec2 rightTextureCoordinate; 
varying vec2 topTextureCoordinate;
varying vec2 bottomTextureCoordinate;
 
varying float centerMultiplier;
varying float edgeMultiplier;

void main()
{
	// Transform position
	gl_Position = MVPMatrix * vec4(inVertex, 1.0);

	mediump vec2 widthStep = vec2(imageWidthFactor, 0.0);
 	mediump vec2 heightStep = vec2(0.0, imageHeightFactor);
 
 	textureCoordinate = inTexCoord;
 	leftTextureCoordinate = inTexCoord - widthStep;
 	rightTextureCoordinate = inTexCoord + widthStep;
 	topTextureCoordinate = inTexCoord + heightStep;     
 	bottomTextureCoordinate = inTexCoord - heightStep;
 
 	centerMultiplier = 1.0 + 4.0 * sharpness;
 	edgeMultiplier = sharpness;
}