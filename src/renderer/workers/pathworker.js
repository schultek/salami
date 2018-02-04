
let r = (d) => round(d, 100)
let deg = (r) => (r/Math.PI/2)*360
let lx = (x) => r(x-layer.x)
let ly = (y) => r(y-layer.y)
let str = {
  l: (p) => "L"+lx(p.x)+","+ly(p.y)+" ",
  m: (p) => "M"+lx(p.x)+","+ly(p.y)+" ",
  a: (rad,s,p) => "A"+r(rad)+","+r(rad)+" 0 0 "+s+" "+lx(p.x)+","+ly(p.y)+" ",
  c: (p) => "M "+lx(p.x-r(p.r))+" "+ly(p.y)+" A"+r(p.r)+" "+r(p.r)+" 0 0 0"+lx(p.x+r(p.r))+" "+ly(p.y)
              +" A"+r(p.r)+" "+r(p.r)+" 0 0 0"+lx(p.x-r(p.r))+" "+ly(p.y)+" "
}
let f = {}

let svgFactory;

function generatePaths() {

  let time = Date.now();
  var sendTime = Date.now();

  let key = (p) => {
    return p[0].x.toFixed(1)+p[0].y.toFixed(1)
  }

  svgFactory = makeSvgFactory(layer, curve, machine)

  let getPath = layer.render.dotted ? getDottedPathFromLine : getPathFromLine

  var paths = [];
  for (var l in lines) {
    for (var p in lines[l]) {
      if (lines[l][p].length>0) {
        let path = getPath(lines[l][p])
        paths.push({path, k: key(lines[l][p])})
      }
    }
    if (sendTime+100<Date.now()) {
      self.postMessage({progress: Math.min(99,40+Math.round(60*l/lines.length))});
      sendTime = Date.now();
    }
  }

  console.log("Generated SVG ("+(Date.now()-time)+"ms)");
  console.log(svgFactory.time)

  return paths;

}


function getPathFromLine(line) {

  let svg = svgFactory.curve(line)

  let p = svg.point(0)

  let path1 = str.m(p[0]);
  let path2 = str.l(p[1])+str.a(p.r, 0, p[0])+"Z";

  for (let i=1; i<line.length-2; i++) {
    p = svg.point(i);
    let t = Date.now();
    path1 += str.l(p[0]);
    path2 = str.l(p[1])+path2;
    svgFactory.time.str += Date.now()-t
  }

  p = svg.point(line.length-2);
  path1 += str.l(p[0]);

  return path1 + str.a(p.r, 0, p[1]) + path2;

}

function getDottedPathFromLine(line) {
  let path = "";
  let svg = svgFactory.curve(line)
  for (var i in line) {
    path += str.c(svg.point(i));
  }
  return p;
}
