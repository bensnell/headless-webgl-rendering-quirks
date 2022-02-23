precision mediump float;

// Texture coordinates
varying vec2 X; // vTexCoord

uniform vec2 R, D; // resolution, dims
uniform sampler2D tex0;

void main() {

  vec4 o = vec4(0., 1.411764705, 3.294117647, 5.176470588), // offsets
  w = vec4(.09824127505, .2969069646, .09447039785, .0103813624), // weights

  c = vec4(0.), // rgba color
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

  gl_FragColor = c;
}