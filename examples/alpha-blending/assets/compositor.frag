precision mediump float;

// Texture coordinates
varying vec2 X; // vTexCoord

// uniform vec2 D; // dims
uniform sampler2D A, B; // texture
uniform vec4 F; // fog color

// bLend
vec4 L(vec4 s, vec4 t) {
  // Blend method 1
  // return s * (1.0-t.a) + t * t.a;

  // Blend method 2
  float a = t.a + s.a * (1.0 - t.a);
  return vec4(
    (t.rgb * t.a + s.rgb * s.a * (1.0 - t.a)) / a,
    a
  );

  // Blend method 3
  // return vec4( mix(s.rgb, t.rgb, t.a), t.a + s.a * (1.0 - t.a));
}

// Using this removes some alpha artifacts
// toUint8
vec4 U(vec4 c) {
  return floor(c*255.+vec4(.5))/255.;
}

void main() {

  vec2 p = vec2( X.x, 1.-X.y ); // uv

  gl_FragColor = 
    clamp( 
      U( 
        L(
          L(
            U( texture2D( A, p ) ), 
            U( texture2D( B, p ) )
          ), 
          U( F )
        ) 
      ), 
      0., 
      1.
    );

}