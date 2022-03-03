const W = window.innerWidth;
const H = window.innerHeight;
const D = Math.min(W,H);

const range = (a) => Array(a).fill(0).map((_,i)=>i);

const transform = (_, f) => {
  let w = _.width;
  let h = _.height;
  let s = min(w,h);
  _.push();
  if (_._renderer.drawingContext instanceof CanvasRenderingContext2D) {
    _.translate((w-s)/2, (h-s)/2);
  }
  _.scale(s);
  f(_);
  _.pop();
}

const getGraphics = (bWebGL, w=D, h=D)=>{
  var g = createGraphics(w, h, bWebGL ? WEBGL : P2D);
  g.colorMode(RGB, 1);
  g.noStroke();
  g.clear();
  return g;
};

class Blur {

  preload() {
    let n = 'assets/blur.';
    ['h','v'].map(i => {
      this[i] = loadShader(n + 'vert', n + 'frag')
    });
  }

  setup(w=D, h=D) {
    let _=this;
    _.f = w;
    _.g = h;
    _.a = getGraphics(1, w, h);
    _.b = getGraphics(1, w, h);
  }

  apply(s, d, _r, n, o=[0,0,0,0]) {
    let _ = this;
    let a = _.a;
    let b = _.b;
    let h = _.h;
    let v = _.v;
    let r = _r*D;
    let f = _.f;
    let g = _.g;
    a.clear();
    b.clear();
    range(n).map(i => {
      [[a,h,i==0?s:b,[r,0],b,[0,0,0,0]],[b,v,a,[0,r],a,o]].map(j => {
        let [t,u,v,w,x,y] = j;
        t.shader(u);
        u.setUniform('R', [f,g]);
        u.setUniform('tex0', v);
        u.setUniform('D', w);
        u.setUniform('o', [0., 1.411764705, 3.294117647, 5.176470588]);
        u.setUniform('w', [.09824127505, .2969069646, .09447039785, .0103813624]);
        u.setUniform('F', y);
        t.rect(0, 0, f, g);
        x.resetShader();
        x.clear();
        t.resetShader()
      })
    });
    d.clear();
    transform(d, function(_){ 
      _.image(b,0,0,1,1) 
    })
  };

  // f = number of batches, q = number of blurs, b = bias power, m = max iteration fraction [0, 1]
  plan(f, q, b=1, m=1) {
    this.p = range(q).map( i => floor(m * pow(exp(1), pow(i/q,b)*log(f))) );
    return this.p;
  }
}

var B = new Blur();
var _I = 0;
var _V;

function preload() {
  B.preload();
}

function setup() {

  createCanvas(D, D);
  colorMode(RGB, 1);
  noStroke();

  B.setup(D, D);
  B.plan(500, 40);

  _V = getGraphics(0, D, D);
  _V.background(color(0.8, 0.8, 0));
  transform(_V, (_)=>{
    _.fill(0.9, 1, 0);
    _.rect(0.1,0.1,0.5,0.8);
  });
  
}

function draw() {

  if (B.p.includes(_I)) {
    B.apply(_V, _V, map(_I,0,500,1e-3,1e-5)/4, 1, [1,1,0,.01]);
  } 
  _I++; 

  transform(_V, (_)=>{
    _.fill(1-_I/500, _I/500, 0);
    _.circle(.5 + cos(_I/500*TWO_PI)/4, .5 + sin(_I/500*TWO_PI)/4, .25);
  });
  
  transform(this, (_)=>{
    _.image(_V, 0, 0, 1, 1);
  });

  if (_I == 500) noLoop();
}