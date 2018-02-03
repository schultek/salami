
let curveBoxSize = 200

function makeCurveFactory(c_) {
  let curve = c_ ? c_ : curve;

  let {start, end} = makeBorderPoints(curve)
  let maxlength = getMaxLength(curve)
  let length = dist(start.x, start.y, end.x, end.y)

  let nums = (corners) => ({
    min: Math.floor(corners.map(el => el.num).reduce((m,e) => Math.min(m,e), Number.MAX_VALUE))-1,
    max: Math.ceil( corners.map(el => el.num).reduce((m,e) => Math.max(m,e), Number.MIN_VALUE))+1
  })

  let steps = (corners) => ({
    min: corners.map(el => el.step).reduce((m,e) => Math.min(m,e), Number.MAX_VALUE),
    max: corners.map(el => el.step).reduce((m,e) => Math.max(m,e), Number.MIN_VALUE)
  })

  /*****************
        LINIE
   *****************/
  if (curve.type=="Linie") {

    let sg = start.x*curve.ygap-start.y*curve.xgap;
    let ges = (curve.xgap*(end.y-start.y)-curve.ygap*(end.x-start.x))

    return {
      maxlength,
      curve: (num) => {
        let p = {
          x1: start.x+curve.xgap*num, y1: start.y+curve.ygap*num,
          x2: end.x  +curve.xgap*num, y2: end.y  +curve.ygap*num
        }
        p.x2 = p.x2 - p.x1;
        p.y2 = p.y2 - p.y1;
        return {
          length,
          point: (step) => ({
            x: p.x1+p.x2*step,
            y: p.y1+p.y2*step
          })
        };
      },
      find: (p) => {
        let step = (p.y*curve.xgap-p.x*curve.ygap+sg)/ges;
        let num = (p.x-start.x-(end.x-start.x)*step)/curve.xgap;
        return {num, step}
      },
      nums, steps
    };

  /*****************
        BOGEN
   *****************/
  } else if (curve.type == "Bogen") {
    let mid = {x: curve.x+curve.dcos*curve.stretch, y: curve.y+curve.dsin*curve.stretch};
    let length = dist(start.x, start.y, mid.x, mid.y)+dist(mid.x, mid.y, end.x, end.y)

    let c1 = {x: end.x-2*mid.x+start.x, y: end.y-2*mid.y+start.y};
    let c2 = {x: 2*mid.x-2*start.x, y: 2*mid.y-2*start.y};

    return {
      maxlength,
      curve: (num) => {
        let c0 = {x: start.x+curve.xgap*num, y: start.y+curve.ygap*num}
        return {
          length,
          point: (step) => ({
            x: c0.x+step*(step*c1.x+c2.x),
            y: c0.y+step*(step*c1.y+c2.y)
          })
        };
      },
      find: (p) => {

        let numx = (f) => (p.x - start.x - f * (f * c1.x+c2.x)) / curve.xgap
        let numy = (f) => (p.y - start.y - f * (f * c1.y+c2.y)) / curve.ygap

        let step = approx((f) => numx(f)-numy(f), 0, 1)
        let num = numx(step)

        return {step, num}
      },
      nums, steps
    };

  /*****************
        KREIS
   *****************/
  } else if (curve.type == "Kreis") {
    let r_ = curveBoxSize/4
    let twoPi = Math.PI*2
    return {
      maxlength, r: r_,
      curve: (num) => {
        let r = r_+num*curve.gap;
        let l = r<=0?0:twoPi*r;
        return {
          length: l,
          point: (step) => step <= 1 ? ({
              x: curve.x+Math.cos(step*twoPi)*r,
              y: curve.y+Math.sin(step*twoPi)*r
          }) : null
        }
      },
      find: (p) => {
        let num = (dist(p.x, p.y, curve.x, curve.y)-r_) / curve.gap;
        let step = Math.acos((p.x-curve.x)/(r_+num*curve.gap))/twoPi;
        return {num, step}
      },
      nums,
      steps: (corners) => ({min: 0, max: 1})
    };

  /*****************
        WELLE
   *****************/
  } else if (curve.type == "Welle") {
    let cotstr = curve.dsin != 0 ? round((curve.dcos / curve.dsin) / curve.stretch) : null;
    let tanstr = curve.dcos != 0 ? round((curve.dsin / curve.dcos) / curve.stretch) : null;
    let cosstr = round(curve.dcos*curve.stretch);
    let sinstr = round(curve.dsin*curve.stretch);
    let dtan =   curve.dcos != 0 ? round(curve.dsin / curve.dcos) : null;
    let dcot =   curve.dsin != 0 ? round(curve.dcos / curve.dsin) : null;

    let fy = (a) => curve.dsin != 0 ? (x) => (cotstr * x) - Math.cos( x / curve.stretch ) + a / sinstr + 1 : () => 0
    let fx = (a) => curve.dcos != 0 ? (y) => (-tanstr * y) - Math.cos( y / curve.stretch ) + a / cosstr + 1 : () => 0

    let _2strcot = dcot ? 2*curve.stretch / dcot : 0;
    let getApproxY = function(a) {
      let f1 = - a / curve.dcos - _2strcot;
      let f2 = - a / curve.dcos;
      return approx(fy(a), f1, f2);
    }

    let _2strtan = dtan ? 2*curve.stretch / dtan : 0;
    let getApproxX = function(a) {
      let f1 = a / curve.dsin + _2strtan;
      let f2 = a / curve.dsin;
      return approx(fx(a), f1, f2);
    }

    let getDx = (f) =>  curve.dsin*f - cosstr + Math.cos(f/curve.stretch)*cosstr
    let getDy = (f) => -curve.dcos*f - sinstr + Math.cos(f/curve.stretch)*sinstr

    let s = curveBoxSize/2

    let f1, f2;

    if (Math.abs(curve.direction) < Math.PI/4 || Math.abs(curve.direction) > Math.PI*(3/4)) {
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

    return {
      maxlength,
      curve: (num) => {
        let mid = {
          x: curve.x+curve.xgap*num + cosstr,
          y: curve.y+curve.ygap*num + sinstr
        }
        return {
          length,
          point: (step) => {
            let f = f1+f2*step;
            let c = -Math.cos(f/curve.stretch);
            return {
              x: mid.x - curve.dsin*f + c*cosstr,
              y: mid.y + curve.dcos*f + c*sinstr
            }
          }
        }
      },
      find(p) {
        let numx = (f) => (p.x - curve.x - cosstr + curve.dsin * f + Math.cos(f / curve.stretch) * cosstr) / curve.xgap
        let numy = (f) => (p.y - curve.y - sinstr - curve.dcos * f + Math.cos(f / curve.stretch) * sinstr) / curve.ygap

        let f = approx((f) => numx(f)-numy(f), f1, f2+f1)
        let num = numx(f)

        return {num, step: (f-f1)/f2}
      },
      nums, steps
    };
  }
}

function getMaxLength(c_) {
  let curve = c_ ? c_ : curve;

  if (curve.type=="Linie" || curve.type == "Bogen" || curve.type == "Welle") {
    return curveBoxSize * Math.sqrt(2);
  } else if (curve.type == "Kreis") {
    return 2 * Math.PI * curveBoxSize/4;
  } else {
    return 0
  }
}

function makeBorderPoints(c_) {
  let curve = c_ ? c_ : curve;

  let dc = curve.dcos*(curveBoxSize/2/curve.dsin)
  let ds = curve.dsin*(curveBoxSize/2/curve.dcos)

  let start, end;
  if (Math.abs(curve.direction) > Math.PI/4 && Math.abs(curve.direction) < Math.PI*(3/4)) {
    start = { x: curve.x-curveBoxSize/2, y: curve.y+dc }
    end   = { x: curve.x+curveBoxSize/2, y: curve.y-dc }
  } else {
    start = { x: curve.x+ds, y: curve.y-curveBoxSize/2 }
    end   = { x: curve.x-ds, y: curve.y+curveBoxSize/2 }
  }

  return curve.direction < Math.PI ? {start, end} : {start: end, end: start};
}

function rotate(p, dim, inv, m) {
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

function def(obj, ...props) {
  for (let prop of props) {
    obj[prop] = obj[prop] || 0;
  }
}

function dist(x1, y1, x2, y2) {
  return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
}

function map(v, s1, e1, s2, e2) {
  return s2 + (e2 - s2) * ((v - s1) / (e1 - s1));
}

function round(data, r) {
  r = r | 100000;
  return Math.round(data*r) / r;
}

function updateDeep(toUpdate, object) {
  Object.keys(object).forEach(k => {
    if (typeof object[k] == "object") {
      if (!toUpdate[k]) toUpdate[k] = {}
      toUpdate[k] = updateDeep(toUpdate[k], object[k])
    } else
      toUpdate[k] = object[k]
  })
}

function approx(f, x1, x2, n) {
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

if (this.__esModule) {
  let set = (global, functions) => {
    Object.keys(functions).forEach(f => global[f] = functions[f])
  }
  set(this, {updateDeep, makeCurveFactory, getMaxLength, rotate, map, dist, round, def})
}
