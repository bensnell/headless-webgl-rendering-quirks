precision lowp float;

// Texture coordinates
varying vec2 X; // vTexCoord

uniform vec2 D; // dims
uniform sampler2D S, T; // texture
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

float round(float a) {
  return floor(a + 0.5);
}

// Using this removes some alpha artifacts
vec4 toUint8(vec4 c) {
  return vec4(
    float(round(c.r*255.0))/255.0,
    float(round(c.g*255.0))/255.0,
    float(round(c.b*255.0))/255.0,
    float(round(c.a*255.0))/255.0
  );
}

void main() {

  vec2 uv = vec2( X.x, 1.-X.y );

  vec4 s = toUint8( texture2D( S, uv ) );
  vec4 t = toUint8( texture2D( T, uv ) );
  vec4 f = toUint8( F );

  vec4 c = blend(s, t);

  c = blend(c, f);
  
  c = toUint8(c);
  
  c = clamp(c, 0.0, 1.0);

  gl_FragColor = c;

}