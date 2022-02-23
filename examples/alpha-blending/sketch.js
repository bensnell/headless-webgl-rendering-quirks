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

const unzip = (a) => a&& (a[0] instanceof Array) ? a[0].map((_,i) => a.map(j => j[i])) : a;

/*
GRadient
  _   canvas
  a   color from (outside)
  b   color to (inside)
  c   from [x,y,w,h,r] of gradient area (where r = corner radius)
  d   to [x,y,w,h,r] of gradient area (where r = corner radius)
  n   number of steps (>1)
*/
const gradient = (_,a,b,c=[0,0,1,1,0],d=null,n=100) => {
  let step = 1/n;
  transform(_,()=>{
    // If d is not defined, calculate the centroid
    if (!d) d = [(c[0]+c[2])/2, (c[1]+c[3])/2, 0, 0, 1];
    // Zip c and d
    let e = unzip([c,d]);
    // Iterate over all steps...
    range(n).map(i=>{
      // Set the fill color
      _.fill(lerpColor(a, b, i/n));
      // Draw a rectangle at this position
      _.rect(...e.map(([f,g])=>lerp(f, g, i/n)))
    })
  })
}

var _I = 0;
var _V;

function setup() {

  createCanvas(D, D);
  colorMode(RGB, 1);
  noStroke();

  _V = getGraphics(0, D, D);
  _V.background(color(1));

  // Fill the background with a gradient
  gradient(
    _V,
    lerpColor(color("#F5DCB6"), color("#662200"), .2),
    color(1),
    [0.5,0,.5,1,0],
    [0.5,0,.5,0,0],
    200
  )
}

function draw() {

  _I++; 

  transform(_V, (_)=>{
    let c = color("#F5DCB6")._array;
    c[3] = .03;
    _.background(c);
    _.fill(1);
    _.rect(0,0,.5,1-_I/40);
  });
  
  transform(this, (_)=>{
    _.image(_V, 0, 0, 1, 1);
  });

  if (_I == 40) noLoop();
}