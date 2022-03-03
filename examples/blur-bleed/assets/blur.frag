precision mediump float;

// Texture coordinates
varying vec2 X; // vTexCoord

uniform vec2 R, D; // resolution, dims
uniform sampler2D tex0;
uniform vec4 o, w; // offsets, weights
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

  vec4 c = vec4(0.), // rgba color
  l;
  float e, t, b, s = 0.; // sum
  for (int i = 0; i < 4; i++) {
    for (int j = -1; j < 2; j += 2) {

      e = float(i != 0 || j != 1);

      l = texture2D( // coLor
        tex0, 
        vec2(X.x, 1.-X.y)  // `U` Uv normalized cooordinates
          + vec2(o[i]) * D / R * float(j) // Coord + Offset
        );
      t =  // rgb weighT
        w[i] // weight
        * l.a;
      s += t * e;
      c += vec4(l.rgb * t, l.a /7.) * e;
    }
  }
  b = float(s < 1e-5);s = b + s*(1.0-b);
  c /= s;

  gl_FragColor = U( L( c, F ) );
}