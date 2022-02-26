const W = window.innerWidth;
const H = window.innerHeight;
const D = Math.min(W,H);

let s=p5.Shader.prototype;
s.u=function(k,v){return this.setUniform(k,v)};

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

// CompositoR
class CR {
  // Preload
  P() {
    this.s = loadShader('assets/compositor.vert', 'assets/compositor.frag'); // Shader
  }
  // Setup
  // S(a) { 
  // }
  // Apply
  //  a   bottom WEBGL instance of p5.Graphics or `this` p5 window
  //  b   top texture to composite on top of `a`; Can be WEBGL or P2D p5.Graphics; Should be same size as `a`
  //  f   fog color as an array; default: none
  A(a, b, f=[0,0,0,0]) {
    let s = this.s;
    let w = a.width;
    let h = a.height;
    a.shader(s);
    s.u('A', a._renderer);
    s.u('B', b);
    // s.u('D', [w, h]);
    s.u('F', f);
    a.rect(0, 0, w, h);
    a.resetShader();
  }
}

var iter = 0;
var canvas2D;
var compositor = new Compositor();
var useCompositor = true;


function preload() {
  if (useCompositor) {
    compositor.P();
  }
}

function setup() {

  createCanvas(D, D, useCompositor ? WEBGL : P2D);
  colorMode(RGB, 1);
  noStroke();
  frameRate(10);

  if (useCompositor) {

    // Generate a gradient background
    canvas2D = getGraphics(0, D, D);
    canvas2D.background(color(1));
    gradient(
      canvas2D,
      lerpColor(color("#F5DCB6"), color("#662200"), .2),
      color(1),
      [0.5,0,0.5,1,0],
      [0.5,0,0.5,0,0],
      200
    );

    // Composite the gradient onto the primary webgl canvas (this)
    compositor.A(this, canvas2D);

  } else {

    background(color(1));
    gradient(
      this,
      lerpColor(color("#F5DCB6"), color("#662200"), .2),
      color(1),
      [0.5,0,0.5,1,0],
      [0.5,0,0.5,0,0],
      200
    );
  }
}

function draw() {

  iter++;

  transform(useCompositor ? canvas2D : this, (_)=>{
    let i = iter/35;
    if (useCompositor) _.clear(0,0,0,0);
    _.fill(1-i, i, 0, 0.1);
    _.circle(.5 + cos(i*TWO_PI)/4, .5 + sin(i*TWO_PI)/4, .25);
  });

  if (useCompositor) {

    compositor.A(
      this, 
      canvas2D,
      [0.9607843137254902, 0.8627450980392157, 0.7137254901960784, .03]
    );

  } else {
    let c = color([0.9607843137254902, 0.8627450980392157, 0.7137254901960784, .03]);
    background(c);
  }

  // console.log(iter);


  // transform(canvas2D, (_)=>{
  //   let c = color("#F5DCB6")._array;
  //   c[3] = .03;
  //   _.background(c);
  //   _.fill(1);
  //   _.rect(0,0,.5,1-iter/40);
  // });
  
  // transform(this, (_)=>{
  //   _.image(canvas2D, 0, 0, 1, 1);
  // });

  if (iter == 35) noLoop();
}