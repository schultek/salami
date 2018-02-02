

self.addEventListener("message", (msg) => {

  let machine = msg.machine;
  let text = msg.text;
  let path = msg.path;

  let out = [];
  let depth = (-Math.max(text.stroke, machine.bit.tip)/machine.bit.width*machine.bit.height).toFixed(2);
  let pathBegin = null;
  let last = null;
  let rad = text.rot*Math.PI*2/360;
  let cos = Math.cos(rad);
  let sin = Math.sin(rad);
  let rotate = !text.rot ?
    (p) => ({
      x: text.x + p.x,
      y: machine.h - (text.y + p.y)
    }) :
    (p) => ({
      x: text.x + p.x * cos - p.y * sin,
      y: machine.h - (text.y + p.y * cos + p.x * sin)
    })
  path.commands.forEach(c => {
    let p = rotate(c);
    if (c.x1) p.x1 = text.x+c.x1;
    if (c.y1) p.y1 = machine.h - (text.y+c.y1);
    if (c.type == "M") {
      out.push("G1 Z1");
      out.push("G1 X"+p.x.toFixed(2)+" Y"+p.y.toFixed(2));
      out.push("G1 Z"+depth);
      pathBegin = p;
    } else if (c.type == "L") {
      out.push("G1 X"+p.x.toFixed(2)+" Y"+p.y.toFixed(2)+" Z"+depth);
    } else if (c.type == "Z") {
      if (pathBegin) out.push("G1 X"+pathBegin.x.toFixed(2)+" Y"+pathBegin.y.toFixed(2)+" Z"+depth);
    } else if (c.type == "Q") {
      if (last) out.concat(makeQBezier(last, p).map(pt => "G1 X"+pt.x.toFixed(2)+" Y"+pt.y.toFixed(2)+" Z"+depth));
    } else {
      throw Error("Path Command not implemented: "+c.type);
    }
    last = p;
  });

  self.postMessage({gcode: out.join("\n")})

})

function makeQBezier(l, p) {
  let sq = a => a*a;
  let len = Math.sqrt(sq(p.x1-l.x)+sq(p.y1-l.y))+Math.sqrt(sq(p.x-p.x1)+sq(p.y-p.y1));
  let steps = Math.max(Math.round(len / 2), 1);
  let points = [];
  for (let i=1; i<=steps; i++) {
    let f = i/steps;
    let dx1 = l.x + (p.x1 - l.x) * f;
    let dx2 = p.x1 + (p.x - p.x1) * f;
    let x = dx1 + (dx2 - dx1) * f;
    let dy1 = l.y + (p.y1 - l.y) * f;
    let dy2 = p.y1 + (p.y - p.y1) * f;
    let y = dy1 + (dy2 - dy1) * f;
    points.push({x, y});
  }
  return points;
}
