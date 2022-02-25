const W = window.innerWidth;
const H = window.innerHeight;
const D = Math.min(W,H);

//
// TIMESAMPLE.js
//
// This class can be used to take timing measurements of javascript code.
// 
// It can be used one of two ways:
//  (1) Pass a function with `ACC()`; calculates the time to execute this function.
//  (2) Mark the start and stop with `ACC_START()` and `ACC_STOP()`.
// The name of the measurement is passed as `name` to each of these methods.
// 
// When you are completely done measuring, reconcile and report the measurements
// using `RECONCILE()` and `REPORT()`, respectively. Reconciling should only
// ever be done once.
//
const HX=(c)=>'#'+hex(JSON.parse(JSON.stringify(c.levels)).splice(0,3),2).join(''); // Convert color to hex representation
const LG=(v,b=10)=>log(v)/log(b); // Log with optional base
const SM=(v)=>v.reduce((p,c)=>p+c, 0); // Sum of an array
const UZ = (a) => a&& (a[0] instanceof Array) ? a[0].map((_,i) => a.map(j => j[i])) : a;
class TIMESAMPLE {
  // All time samples for the script
  samples = {
    "profile" : {
      'total_time' : 0,
      'self_time' : NaN,
      'avg_total_time' : NaN,
      'avg_self_time' : NaN,
      'num_calls' : 0
    },
    "children" : {}
  };

  // Are we actively recording?
  recording=true;

  // Active recordings
  active = {};

  // Accumulate time for a function
  //  name  list of names identifying the hierarchy of a function's execution
  //  fnct  the function we'd like to record timing of
  ACC(name, fnct) {
    let start = millis();
    let result = fnct();
    let end = millis();
    let elapsed = end - start;
    if (this.recording) this._add([name].flat().flat().flat(), elapsed);
    return result;
  }

  // Use these two methods together when a function cannot be wrapped
  ACC_START(name) {
    this.active[name.join('___')] = millis();
  }
  ACC_STOP(name) {
    let end = millis();
    let start = this.active[name.join('___')];
    let elapsed = end - start;
    if (this.recording) this._add([name].flat().flat().flat(), elapsed);
  }

  // Get a sample object
  _get(name, samples=null) {
    var _=this;
    if (!samples) samples = _.samples;
    if (!(name[0] in samples['children'])) {
      samples['children'][name[0]] = { 
        'profile' : { 
          'total_time' : 0, // time spent on this function and all children
          'self_time' : NaN, // time spent on this function only
          'avg_total_time' : NaN, // average total time
          'avg_self_time' : NaN, // average self time
          'num_calls' : 0  // number of times this function has been called
        },
        'children' : { } 
      };
    }
    if (name.length==1) {
      return samples['children'][name[0]];
    } else {
      return _._get(
        name.splice(1), 
        samples['children'][name[0]]
      )
    }
  }

  // Add a measurement
  _add(name, time) {
    var _=this;
    var sample = _._get(name)['profile'];
    sample['total_time'] += time;
    sample['num_calls'] += 1;
  }

  // Call this once at the completion of this script
  // to calculate the self time for each function
  RECONCILE() {
    var _=this;
    if (!_.recording) return;

    _._reconcile(_.samples);

    // stop recording now
    _.recording = false;
  }

  // Recursively reconcile samples
  _reconcile(sample) {
    var _=this;
    var profile = sample['profile'];

    // Find the sum of all children's total time
    var sum = SM(Object.entries(sample['children']).map(([k,v]) => _._reconcile(v)));

    // Calculate the // If this sample has calls, then calculate its self time
    if (profile['num_calls'] > 0) {
      profile['self_time'] = profile['total_time'] - sum;
    }
    
    // Set the total time of this sample if it has never been called
    if (profile['num_calls'] == 0) {
      profile['total_time'] = sum;
    }

    // Calculate average times
    if (profile['num_calls'] > 0) {
      profile['avg_total_time'] = profile['total_time'] / profile['num_calls'];
      profile['avg_self_time'] = profile['self_time'] / profile['num_calls'];
    }

    // The return value is only a rough approximate. 
    // Since time can be doubly counted depending on how these methods are used,
    // technically only total_time should be returned if there is more than one call.
    // return profile['num_calls'] == 0 ? 0 : profile['total_time']; 
    return profile['total_time']; 
  }

  // Print a report to the console
  REPORT() {
    var _=this;

    var textPads = 30;
    var numPads = 8;

    var text = '%c'
      + 'Function'.padEnd(textPads)
      + '#Calls'.padEnd(numPads)
      + 'Total'.padEnd(numPads)
      + 'AvgT'.padEnd(numPads)
      + 'Self'.padEnd(numPads)
      + 'AvgS'.padEnd(numPads)
    var colors = ['background: gray; color: white']

    var [_text, _colors] = _._report('Global', _.samples, 1, textPads, numPads);

    // Convert numerical values in colors to actual colors, mapping min to max
    var value_colors = UZ(_colors);
    value_colors.forEach((values, value_index)=>{
      if (typeof(values[0])=='string') return;
      var finite_values = values.filter(i=>isFinite(i));
      finite_values = finite_values.map(i=>LG(i,10))
      var lo = Math.min(...finite_values);
      var hi = Math.max(...finite_values);
      if (!isFinite(lo)) lo = 0;
      if (!isFinite(hi)) hi = 0;
      values.forEach((value, instance_index) => {
        if (!isFinite(value)) value = 0;
        var param = map(LG(value,10), lo, hi, 0, 1, 1);
        value_colors[value_index][instance_index] = "color: "+HX(color(pow(param,.5),pow(1-param,.5),0));
      })
    })
    _colors = UZ(value_colors).flat().flat().flat()
    
    text += _text;
    colors = colors.concat(_colors);
    console.log(text, ...colors);
  }

  // recursive report
  _report(name, sample, curLevel, textPads, numPads) {

    var decimalPlaces = 2;
    var profile = sample['profile'];

    var formatNumber = (n)=>{
      return (isNaN(n) ? '' : round(n, decimalPlaces).toString()).padEnd(numPads,' ');
    }

    var text = '';
    var colors = [[
      'color: black',
      profile['total_time'],
      profile['avg_total_time'],
      profile['self_time'],
      profile['avg_self_time']
    ]];
    text += ''
      + '%c' + (new Array(curLevel).join(' ') + name).padEnd(textPads,' ') 
      +        (profile['num_calls']==0?'':profile['num_calls'].toString()).padEnd(numPads,' ')
      + '%c' + formatNumber(profile['total_time'])
      + '%c' + formatNumber(profile['avg_total_time'])
      + '%c' + formatNumber(profile['self_time'])
      + '%c' + formatNumber(profile['avg_self_time'])
      + '\n';

    Object.entries(sample.children).forEach(([k,v])=>{
      var [_text, _colors] = this._report(k, v, curLevel+1, textPads, numPads);
      text += _text;
      colors = colors.concat(_colors);
    })
    
    return [text, colors];
  }
}
TS = new TIMESAMPLE();

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

  apply(s, d, _r, n) {
    let _ = this;
    let a = _.a;
    let b = _.b;
    let h = _.h;
    let v = _.v;
    let r = _r*D;
    let f = _.f;
    let g = _.g;
    TS.ACC_START(['blur', 'apply', 'ab clear']);
    a.clear();
    b.clear();
    TS.ACC_STOP(['blur', 'apply', 'ab clear']);
    TS.ACC_START(['blur', 'apply', 'shader']);
    range(n).map(i => {
      [[a,h,i==0?s:b,[r,0],b],[b,v,a,[0,r],a]].map(j => {
        let [t,u,v,w,x] = j;
        t.shader(u);
        u.setUniform('R', [f,g]);
        u.setUniform('tex0', v);
        u.setUniform('D', w);
        // u.setUniform('o', [0., 1.411764705, 3.294117647, 5.176470588]);
        // u.setUniform('w', [.09824127505, .2969069646, .09447039785, .0103813624]);
        t.rect(0, 0, f, g);
        x.resetShader();
        x.clear();
        t.resetShader()
      })
    });
    TS.ACC_STOP(['blur', 'apply', 'shader']);
    TS.ACC_START(['blur', 'apply', 'clear d']);
    // d.clear();
    TS.ACC_STOP(['blur', 'apply', 'clear d']);
    TS.ACC_START(['blur', 'apply', 'draw d']);
    // d.copy(b, 0, 0, b.width, b.height, 0, 0, d.width, d.height);
    // transform(d, function(_){ 
    //   _.image(b,0,0,1,1) 
    // });
    TS.ACC_STOP(['blur', 'apply', 'draw d']);
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
  _V.background(color(1));
}

function draw() {

  if (B.p.includes(_I)) {
    B.apply(_V, _V, map(_I,0,500,1e-3,1e-5), 1);
  } 
  _I++; 

  transform(_V, (_)=>{
    _.fill(1-_I/500, _I/500, 0);
    _.circle(.5 + cos(_I/500*TWO_PI)/4, .5 + sin(_I/500*TWO_PI)/4, .25);
  });
  
  transform(this, (_)=>{
    _.image(_V, 0, 0, 1, 1);
  });

  if (_I == 500) {
    noLoop();
    TS.RECONCILE();
    TS.REPORT();
  }
}