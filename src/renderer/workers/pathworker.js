
let r = (d) => round(d, 100)
let deg = (r) => (r/Math.PI/2)*360
let lx = (x) => r(x-layer.x)
let ly = (y) => r(y-layer.y)
let str = {
  l: (p) => "L"+lx(p.x)+","+ly(p.y)+" ",
  m: (p) => "M"+lx(p.x)+","+ly(p.y)+" ",
  a: (rad,s,p) => "A"+r(rad)+","+r(rad)+" 0 0 "+s+" "+lx(p.x)+","+ly(p.y)+" ",
  c: (p,rad) => "M "+lx(p.x-r(rad))+" "+ly(p.y)+" A"+r(rad)+" "+r(rad)+" 0 0 0"+lx(p.x+r(rad))+" "+ly(p.y)
              +" A"+r(rad)+" "+r(rad)+" 0 0 0"+lx(p.x-r(rad))+" "+ly(p.y)+" "
}
let f = {}

function generatePaths() {

  let time = Date.now();
  var sendTime = Date.now();

  let key = (p) => {
    return p[0].x.toFixed(1)+p[0].y.toFixed(1)
  }

  var paths = [];
  for (var l in lines) {
    for (var p in lines[l]) {
      if (lines[l][p].length>0) {
        let path = layer.render.dotted?getDottedPathFromLine(lines[l][p]):getPathFromLine(lines[l][p]);
        paths.push({path, k: key(lines[l][p])})
      }
    }
    if (sendTime+100<Date.now()) {
      self.postMessage({progress: Math.min(99,40+Math.round(60*l/lines.length))});
      sendTime = Date.now();
    }
  }

  console.log("Generated SVG ("+(Date.now()-time)+"ms)");

  return paths

}


function getPathFromLine(line) {

  f.rad = funcRad(line);
  f.angle = funcAngle(line);

  var nextPoint = funcNextPoint(line);

  var a0 = f.angle(0), r0 = f.rad(0);
  var p = {
    "0": {x: line[0].x+a0[0].cos*r0, y: line[0].y+a0[0].sin*r0},
    "1": {x: line[0].x+a0[1].cos*r0, y: line[0].y+a0[1].sin*r0},
    a: a0, r: r0
  }
  var path1 = str.m(p[0]);
  var path2 = str.l(p[1])+str.a(p.r, 0, p[0])+"Z";

  for (var i=0; i<line.length-2; i++) {
    //console.log(p);
    p = nextPoint(p, i);
    path1 += str.l(p[0]);
    path2 = str.l(p[1])+path2;
  }
  //console.log(p);
  p = nextPoint(p, line.length-2);
  path1 += str.l(p[0]);
  //console.log(p);

  //console.log(p[0], p[1], p.a[0].val*180/Math.PI, p.a[1].val*180/Math.PI);

  return path1 + str.a(p.r, 0, p[1]) + path2;

}

function getDottedPathFromLine(line) {
  var p = "";
  f.rad = funcRad(line);
  for (var l in line) {
    p += str.c(line[l], f.rad(l));
  }
  return p;
}

function funcNextPoint(line) {
  return function(p, i) {
    var a = f.angle(i+1);
    var rq = f.rad(i+1);
    var q1 = {x: line[i+1].x+a[0].cos*rq, y: line[i+1].y+a[0].sin*rq};
    var q2 = {x: line[i+1].x+a[1].cos*rq, y: line[i+1].y+a[1].sin*rq};
    return {"0": q1, "1": q2, a: a, r: rq};
  }
}


function funcAngle(line) {
  var a = function(i1, i2) {
    return Math.atan2(line[i2].y-line[i1].y,line[i2].x-line[i1].x);
  }
  if (line.length<2) {
    return (i) => [{val:0,sin:0,cos:0}, {val:0,sin:0,cos:0}];
  } else {
    let ret = (a_1) => {
      if (a_1 > Math.PI) a_1 = a_1 - Math.PI*2
      let a_2 = a_1 <= 0 ? a_1+Math.PI : a_1-Math.PI;
      return [{val: a_1, sin: Math.sin(a_1), cos: Math.cos(a_1)}, {val: a_2, sin: Math.sin(a_2), cos: Math.cos(a_2)}];
    };
    if (curve.type == "Linie") {
      let an = ret(a(0,1)+Math.PI/2);
      return (i) => an;
    } else {
      let a0 = ret(a(0,1)+Math.PI/2);
      let al = ret(a(line.length-2, line.length-1)+Math.PI/2);
      return (i) => {
        if (i==0) {
          return a0;
        } else if (i == line.length-1) {
          return al;
        } else {
          let a1 = a(i, i-1);
          let a2 = a(i, i+1);
          if (a1 >= a2)
            return ret((a2+a1)/2);
          else {
            return ret((a2+a1)/2+Math.PI);
          }
        }
      }
    }
  }
}

function funcRad(line) {
  var maxRad = round(machine.bit.inDepth/machine.bit.height*machine.bit.width/2, 100);
  return function(i) {
    var r = (!layer.inverted?(1-line[i].data):line[i].data)*maxRad;
    return r<machine.bit.tiprad?machine.bit.tiprad:r;
  };
}
