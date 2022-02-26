precision lowp float;

// Texture coordinates
varying vec2 X; // vTexCoord

// uniform vec2 D; // dims
uniform sampler2D A, B; // texture
uniform vec4 F; // fog color

vec4 blend(vec4 s, vec4 t) {
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
vec4 toUint8(vec4 c) {
  return floor(c*255.+vec4(.5))/255.;
}

void main() {

  vec2 uv = vec2( X.x, 1.-X.y );

  vec4 s = toUint8( texture2D( A, uv ) );
  vec4 t = toUint8( texture2D( B, uv ) );
  vec4 f = toUint8( F );

  vec4 c = blend(s, t);

  c = blend(c, f);
  
  c = toUint8(c);
  
  c = clamp(c, 0.0, 1.0);

  gl_FragColor = c;

}