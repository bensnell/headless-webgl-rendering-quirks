// attribute vec3 aPosition;attribute vec2 aTexCoord;varying vec2 X;void main(){X = aTexCoord;vec4 p=vec4(aPosition,1.);p.xy=p.xy*2.-1.;gl_Position=p;}

attribute vec3 aPosition;
attribute vec2 aTexCoord;

// Texture coordinates
varying vec2 X;

void main() {

  // copy the texcoords
  X = aTexCoord;

  // Copy the position data into a vec4, adding 1.0 as the w parameter
  vec4 p = vec4(aPosition, 1.); // positionVec4

  // Scale to make the output fit the canvas
  p.xy = p.xy * 2. - 1.; 

  // Send the vertex information on to the fragment shader
  gl_Position = p;
}