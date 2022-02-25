precision mediump float;

// Texture coordinates
varying vec2 X; // vTexCoord

uniform vec2 R, D; // resolution, dims
uniform sampler2D tex0;

void main() {

  vec4 c = vec4(0.), // rgba color
  l;
  float e, t, b, s = 0.; // sum

  vec2 xy = vec2(X.x, 1.-X.y);
  vec2 dr = D/R;

  l = texture2D(tex0, xy - vec2(5.176470588) * dr);
  t = .0103813624 * l.a;
  s += t;
  c += vec4(l.rgb * t, l.a /7.);

  l = texture2D(tex0, xy - vec2(3.294117647) * dr);
  t = .09447039785 * l.a;
  s += t;
  c += vec4(l.rgb * t, l.a /7.);

  l = texture2D(tex0, xy - vec2(1.411764705) * dr);
  t = .2969069646 * l.a;
  s += t;
  c += vec4(l.rgb * t, l.a /7.);

  l = texture2D(tex0, xy);
  t = .09824127505 * l.a;
  s += t;
  c += vec4(l.rgb * t, l.a /7.);

  l = texture2D(tex0, xy + vec2(1.411764705) * dr);
  t = .2969069646 * l.a;
  s += t;
  c += vec4(l.rgb * t, l.a /7.);

  l = texture2D(tex0, xy + vec2(3.294117647) * dr);
  t = .09447039785 * l.a;
  s += t;
  c += vec4(l.rgb * t, l.a /7.);

  l = texture2D(tex0, xy + vec2(5.176470588) * dr);
  t = .0103813624 * l.a;
  s += t;
  c += vec4(l.rgb * t, l.a /7.);

  b = float(s < 1e-5);
  s = b + s*(1.0-b);
  c /= s;

  gl_FragColor = c;
}