uniform sampler2D  sTexture;

precision highp float;
 
varying highp vec2 textureCoordinate;
varying highp vec2 leftTextureCoordinate;
varying highp vec2 rightTextureCoordinate; 
varying highp vec2 topTextureCoordinate;
varying highp vec2 bottomTextureCoordinate;
 
varying highp float centerMultiplier;
varying highp float edgeMultiplier;

void main()
 {
     mediump vec4 textureColor = texture2D(sTexture, textureCoordinate);
     mediump vec3 leftTextureColor = texture2D(sTexture, leftTextureCoordinate).rgb;
     mediump vec3 rightTextureColor = texture2D(sTexture, rightTextureCoordinate).rgb;
     mediump vec3 topTextureColor = texture2D(sTexture, topTextureCoordinate).rgb;
     mediump vec3 bottomTextureColor = texture2D(sTexture, bottomTextureCoordinate).rgb;

     gl_FragColor = vec4((textureColor.rgb * centerMultiplier - edgeMultiplier*(leftTextureColor + rightTextureColor + topTextureColor + bottomTextureColor)), textureColor.a);
 }