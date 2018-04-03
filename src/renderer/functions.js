export function updateDeep(toUpdate, object) {
  Object.keys(object).forEach(k => {
    if (typeof object[k] == "object") {
      if (!toUpdate[k]) toUpdate[k] = {}
      updateDeep(toUpdate[k], object[k])
    } else
      toUpdate[k] = object[k]
  })
}

export function getNewId() {
  return [0,0].reduce((str) => {
    let a = str + (str != "" ? "-" : "");
    let b = [0,0,0].reduce((str) => {
      let c = Math.round(Math.random()*62)
      return str + (c < 52 ? String.fromCharCode(c < 26 ? 65 + c : 71 + c) : (c - 52))
    }, "")
    return a+b;
  }, "")
}

let notifyFunc = null;

export function setNotify(notify) {
  notifyFunc = notify;
}
export function notify(...args) {
  if (notifyFunc) notifyFunc(...args)
}

export function rotate(p, dim, inv, m) {
  if (!dim.rot) return p;
  m = m || {
    x: dim.x+dim.w/2,
    y: dim.y+dim.h/2
  }
  let rad = (inv?1:-1)*dim.rot*Math.PI*2/360;
  let cos = Math.cos(rad);
  let sin = Math.sin(rad);

  let d = {x: p.x-m.x, y: p.y-m.y}
  return {
    x: m.x + d.x * cos - d.y * sin,
    y: m.y + d.y * cos + d.x * sin
  }
}

export function dist(x1, y1, x2, y2) {
  return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
}

export function map(v, s1, e1, s2, e2) {
  return s2 + (e2 - s2) * ((v - s1) / (e1 - s1));
}

export function round(data, r) {
  r = r ? r : 100000;
  return Math.round(data*r) / r;
}

export function approx(f, x1, x2, n) {
  if (!n) n = 0;
  if (n>40) return (x1+x2)/2;

  let y1 = f(x1);
  let y2 = f(x2);

  let o1 = {x: x1, y: y1};
  let o2 = {x: x2, y: y2};

  if (Math.abs(y2) < Math.abs(y1)) {
    let t = o1;
    o1 = o2;
    o2 = t;
  }

  let om = {x: (x1+x2)/2, y: f((x1+x2)/2)}

  if (round(om.y, 1000) == 0) {
    return om.x;
  } else {

    if (Math.abs(om.y) < Math.abs(o1.y)) {
      o2 = o1;
      o1 = om;
    } else if (Math.abs(om.y) < Math.abs(o2.y)) {
      o2 = om;
    }

    if (o1.y != o2.y) {
      x1 = o1.x;
      x2 = o1.x + (o1.x - o2.x) * 2 * (0 - o1.y) / (o1.y - o2.y)
      return approx(f, x1, x2, n+1)
    } else
      return (o1.x+o2.x)/2;
  }
}

const rendererBoxSize = 200
export function makeCurveFactory(renderer, layer, machine) {

  let {start, end} = makeBorderPoints(renderer)
  let maxlength = getMaxLength(renderer)
  let length = dist(start.x, start.y, end.x, end.y)

  let nums = (corners) => ({
    min: Math.floor(corners.map(el => el.num).reduce((m,e) => Math.min(m,e), Number.MAX_VALUE))-1,
    max: Math.ceil( corners.map(el => el.num).reduce((m,e) => Math.max(m,e), Number.MIN_VALUE))+1
  })

  let steps = (corners) => ({
    min: corners.map(el => el.step).reduce((m,e) => Math.min(m,e), Number.MAX_VALUE),
    max: corners.map(el => el.step).reduce((m,e) => Math.max(m,e), Number.MIN_VALUE)
  })

  let twoPi = Math.PI * 2;
  let halfPi = Math.PI / 2;

  let includePath = (layer && machine)

  let dotPath, maxRad, rad;
  let failPath = () => console.warn("No path method, missing layer and machine parameters in factory call!")

  if (includePath) {
    maxRad = round(machine.bit.inDepth/machine.bit.height*machine.bit.width/2, 100);
    rad = (p) => {
      let r = (1-p.data) * maxRad
      return r < machine.bit.tiprad ? machine.bit.tiprad : r
    }
    if (layer && layer.renderParams.dotted)
      dotPath = (p) => ({x: p.x, y: p.y, r: rad(p)})
  }

  let angle = (dx, dy) => Math.atan2(dy, dx)
  let format = (a) => {
    if (a > Math.PI) a = a - twoPi
    let a2 = a <= 0 ? a+Math.PI : a-Math.PI;
    return [{val: a, sin: Math.sin(a), cos: Math.cos(a)}, {val: a2, sin: Math.sin(a2), cos: Math.cos(a2)}];
  }

  /*****************
        LINIE
   *****************/
  if (renderer.curve=="line") {

    let sg = start.x*renderer.ygap-start.y*renderer.xgap;
    let ges = (renderer.xgap*(end.y-start.y)-renderer.ygap*(end.x-start.x))

    return {
      maxlength,
      curve: (num) => {
        let p = {
          x1: start.x+renderer.xgap*num, y1: start.y+renderer.ygap*num,
          x2: end.x-start.x,          y2: end.y-start.y
        }

        let a = format(angle(p.x2, p.y2)+halfPi)

        return {
          length,
          point: (step) => ({
            x: p.x1+p.x2*step,
            y: p.y1+p.y2*step
          }),
          path: includePath ? dotPath || ((p) => {
            let r = rad(p);
            return {
              "0": {x: p.x+a[0].cos*r, y: p.y+a[0].sin*r},
              "1": {x: p.x+a[1].cos*r, y: p.y+a[1].sin*r},
              r
            };
          }) : failPath
        }
      },
      find: (p) => {
        let step = (p.y*renderer.xgap-p.x*renderer.ygap+sg)/ges;
        let num = (p.x-start.x-(end.x-start.x)*step)/renderer.xgap;
        return {num, step}
      },
      nums, steps
    };

  /*****************
        BOGEN
   *****************/
 } else if (renderer.curve == "arc") {
    let mid = {x: renderer.x+renderer.dcos*renderer.stretch, y: renderer.y+renderer.dsin*renderer.stretch};
    let length = dist(start.x, start.y, mid.x, mid.y)+dist(mid.x, mid.y, end.x, end.y)

    let c1 = {x: end.x-2*mid.x+start.x, y: end.y-2*mid.y+start.y};
    let c2 = {x: 2*mid.x-2*start.x, y: 2*mid.y-2*start.y};

    return {
      maxlength,
      curve: (num) => {
        let c0 = {x: start.x+renderer.xgap*num, y: start.y+renderer.ygap*num}
        return {
          length,
          point: (step) => ({
            x: c0.x+step*(step*c1.x+c2.x),
            y: c0.y+step*(step*c1.y+c2.y)
          }),
          path: includePath ? dotPath || ((p, step) => {
            let a = format(angle(2*c1.x*step + c2.x, 2*c1.y*step + c2.y)+halfPi)
            let r = rad(p);
            return {
              "0": {x: p.x+a[0].cos*r, y: p.y+a[0].sin*r},
              "1": {x: p.x+a[1].cos*r, y: p.y+a[1].sin*r},
              r
            };
          }) : failPath
        };
      },
      find: (p) => {

        let numx = (f) => (p.x - start.x - f * (f * c1.x+c2.x)) / renderer.xgap
        let numy = (f) => (p.y - start.y - f * (f * c1.y+c2.y)) / renderer.ygap

        let step = approx((f) => numx(f)-numy(f), 0, 1)
        let num = numx(step)

        return {step, num}
      },
      nums, steps
    };

  /*****************
        KREIS
   *****************/
 } else if (renderer.curve == "circle") {
    let r_ = rendererBoxSize/4
    return {
      maxlength, r: r_,
      curve: (num) => {
        let r = r_+num*renderer.gap;
        let l = r<=0?0:twoPi*r;

        let RtwoPi = twoPi * r;

        return {
          length: l,
          point: (step) => step <= 1 ? ({
              x: renderer.x+Math.cos(step*twoPi)*r,
              y: renderer.y+Math.sin(step*twoPi)*r
          }) : null,
          path: includePath ? dotPath || ((p, step) => {
            let dx = -RtwoPi * Math.sin(twoPi * step);
            let dy = RtwoPi * Math.cos(twoPi * step);
            let a = format(angle(dx, dy)+halfPi)
            let r = rad(p);
            return {
              "0": {x: p.x+a[0].cos*r, y: p.y+a[0].sin*r},
              "1": {x: p.x+a[1].cos*r, y: p.y+a[1].sin*r},
              r
            };
          }) : failPath
        }
      },
      find: (p) => {
        let num = (dist(p.x, p.y, renderer.x, renderer.y)-r_) / renderer.gap;
        let step = Math.acos((p.x-renderer.x)/(r_+num*renderer.gap))/twoPi;
        return {num, step}
      },
      nums,
      steps: (corners) => ({min: 0, max: 1})
    };

  /*****************
        WELLE
   *****************/
 } else if (renderer.curve == "wave") {
    let cotstr = renderer.dsin != 0 ? round((renderer.dcos / renderer.dsin) / renderer.stretch) : null;
    let tanstr = renderer.dcos != 0 ? round((renderer.dsin / renderer.dcos) / renderer.stretch) : null;
    let cosstr = round(renderer.dcos*renderer.stretch);
    let sinstr = round(renderer.dsin*renderer.stretch);
    let dtan =   renderer.dcos != 0 ? round(renderer.dsin / renderer.dcos) : null;
    let dcot =   renderer.dsin != 0 ? round(renderer.dcos / renderer.dsin) : null;

    let fy = (a) => renderer.dsin != 0 ? (x) => (cotstr * x) - Math.cos( x / renderer.stretch ) + a / sinstr + 1 : () => 0
    let fx = (a) => renderer.dcos != 0 ? (y) => (-tanstr * y) - Math.cos( y / renderer.stretch ) + a / cosstr + 1 : () => 0

    let _2strcot = dcot ? 2*renderer.stretch / dcot : 0;
    let getApproxY = function(a) {
      let f1 = - a / renderer.dcos - _2strcot;
      let f2 = - a / renderer.dcos;
      return approx(fy(a), f1, f2);
    }

    let _2strtan = dtan ? 2*renderer.stretch / dtan : 0;
    let getApproxX = function(a) {
      let f1 = a / renderer.dsin + _2strtan;
      let f2 = a / renderer.dsin;
      return approx(fx(a), f1, f2);
    }

    let getDx = (f) =>  renderer.dsin*f - cosstr + Math.cos(f/renderer.stretch)*cosstr
    let getDy = (f) => -renderer.dcos*f - sinstr + Math.cos(f/renderer.stretch)*sinstr

    let s = rendererBoxSize/2

    let f1, f2;

    if (Math.abs(renderer.direction) < Math.PI/4 || Math.abs(renderer.direction) > Math.PI*(3/4)) {
      f1 = getApproxY(s);
      let fx1 = getDx(f1);
      if (fx1 < -s || fx1 > s) {
        f1 = getApproxX((fx1<-s?-1:1)*s);
      }
      f2 = getApproxY(-s);
      let fx2 = getDx(f2);
      if (fx2 < -s || fx2 > s) {
        f2 = getApproxX((fx2<-s?-1:1)*s);
      }
    } else {
      f1 = getApproxX(s);
      let fy1 = getDy(f1);
      if (fy1 < -s || fy1 > s) {
        f1 = getApproxY((fy1<-s?-1:1)*s);
      }
      f2 = getApproxX(-s);
      let fy2 = getDy(f2);
      if (fy2 < -s || fy2 > s) {
        f2 = getApproxY((fy2<-s?-1:1)*s);
      }
    }

    f2 = f2-f1;

    let f2dsin = -renderer.dsin * f2;
    let f2dcos =  renderer.dcos * f2;

    return {
      maxlength,
      curve: (num) => {
        let mid = {
          x: renderer.x+renderer.xgap*num + cosstr,
          y: renderer.y+renderer.ygap*num + sinstr
        }
        return {
          length,
          point: (step) => {
            let f = f1+f2*step;
            let c = -Math.cos(f/renderer.stretch);
            return {
              x: mid.x - renderer.dsin*f + c*cosstr,
              y: mid.y + renderer.dcos*f + c*sinstr
            }
          }, path: includePath ? dotPath || ((p, step) => {
            let fsin =  Math.sin((f1+f2*step)/renderer.stretch);
            let dx = f2dsin + f2dcos * fsin;
            let dy = f2dcos - f2dsin * fsin;
            let a = format(angle(dx, dy)+halfPi)
            let r = rad(p);
            return {
              "0": {x: p.x+a[0].cos*r, y: p.y+a[0].sin*r},
              "1": {x: p.x+a[1].cos*r, y: p.y+a[1].sin*r},
              r
            };
          }) : failPath
        }
      },
      find(p) {
        let numx = (f) => (p.x - renderer.x - cosstr + renderer.dsin * f + Math.cos(f / renderer.stretch) * cosstr) / renderer.xgap
        let numy = (f) => (p.y - renderer.y - sinstr - renderer.dcos * f + Math.cos(f / renderer.stretch) * sinstr) / renderer.ygap

        let f = approx((f) => numx(f)-numy(f), f1, f2+f1)
        let num = numx(f)

        return {num, step: (f-f1)/f2}
      },
      nums, steps
    };
  }
}

export function getMaxLength(renderer) {

  if (renderer.curve=="line" || renderer.curve == "arc" || renderer.curve == "wave") {
    return rendererBoxSize * Math.sqrt(2);
  } else if (renderer.curve == "circle") {
    return 2 * Math.PI * rendererBoxSize/4;
  } else {
    return 0
  }
}

function makeBorderPoints(renderer) {

  let dc = renderer.dcos*(rendererBoxSize/2/renderer.dsin)
  let ds = renderer.dsin*(rendererBoxSize/2/renderer.dcos)

  let start, end;
  if (Math.abs(renderer.direction) > Math.PI/4 && Math.abs(renderer.direction) < Math.PI*(3/4)) {
    start = { x: renderer.x-rendererBoxSize/2, y: renderer.y+dc }
    end   = { x: renderer.x+rendererBoxSize/2, y: renderer.y-dc }
  } else {
    start = { x: renderer.x+ds, y: renderer.y-rendererBoxSize/2 }
    end   = { x: renderer.x-ds, y: renderer.y+rendererBoxSize/2 }
  }

  return renderer.direction < Math.PI ? {start, end} : {start: end, end: start};
}
