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
  g.noSmooth();
  g.clear();
  return g;
};

const unzip = (a) => a&& (a[0] instanceof Array) ? a[0].map((_,i) => a.map(j => j[i])) : a;

var _I = 0;
var _V;

function setup() {

  createCanvas(D, D);
  colorMode(RGB, 1);
  noStroke();
  noSmooth();

  _V = getGraphics(0, D, D);
  _V.pixelDensity(1);
  _V.noStroke();

  _V.clear(1);
  transform(_V, (_)=>{
    _.fill(0);
    _.circle(0.5,0.5+3/70,.5);
  });
  transform(this, (_)=>{
    _.image(_V, 0, 0, 1, 1);
  });
}

function draw() {

  noLoop();
}