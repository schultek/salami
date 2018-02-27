
self.addEventListener("message", (event) => {

  let lines = event.data.lines;
  let machine = event.data.machine;
  let layer = event.data.layer;

  let starttime = Date.now()

  var output = [];
  var pos = {x: 0, y: 0, z: 0};
  var time = 0;

  var dx = 0, dy = 0;

  if (layer.w > machine.w) {
    dx = (layer.w - machine.w) / 2
    layer.w = machine.w;
  }
  if (layer.h > machine.h) {
    dy = (layer.h - machine.h) / 2
    layer.h = machine.h
  }
  //TODO test correct behaviour

  var sq = (a) => a*a;
  var add = function(g, x, y, z, s) {
    x = x-dx;
    y = y-dy;
    var str = "G"+g+(x!=null?" X"+round(x, 1000):"")+(y!=null?" Y"+round(y,1000):"")+(z!=null?" Z"+round(z,1000):"")+" F"+s;
    output.push(str);
    x = x!=null ? x : pos.x;
    y = y!=null ? y : pos.y;
    z = z!=null ? z : pos.z;
    var td = Math.sqrt(sq(Math.sqrt(sq(pos.x-x)+sq(pos.y-y)))+sq(pos.z-z))/s;
    time += td;
    pos.x = x;
    pos.y = y;
    pos.z = z;
  }

  var minD = round(machine.bit.tiprad/machine.bit.width*2*machine.bit.height, 100);
  var zd = function(data) {
    var d = (!layer.inverted?(1-data):data)*machine.bit.inDepth;
    return d<minD?-minD:-d;
  };

  var isIn = false;
  var sOut = machine.speed.seekrate;
  var sIn = machine.speed.feedrate;
  var sInD = machine.speed.feedrateDot;
  //output.push(gcode.pre.replace(/\$W/g, layer.w).replace(/\$H/g, layer.h));

  for (let i in lines) {
    let dir_alt = i%2==1;
    for (let j in lines[i]) {
      let line = dir_alt ? lines[i][lines[i].length-1-j] : lines[i][j];
      for (let k in line) {
        var p = dir_alt ? line[line.length-1-k] : line[k];
        p.y = machine.h-p.y;
        if (layer.render.dotted) {
          if (p.data > 0) {
            add(0, p.x, p.y, null, sOut);
            add(1, null, null, 0, sOut);
            add(1, null, null, zd(p.data), sInD);
            add(1, null, null, machine.outHeight, sOut);
          }
        } else {
          if (isIn) {
            if (p.data > 0) {
              add(1, p.x, p.y, zd(p.data), sIn);
            } else {
              add(1, null, null, machine.outHeight, sIn);
              isIn = false;
            }
          } else {
            if (p.data > 0) {
              add(0, p.x, p.y, null, sOut);
              add(1, null, null, zd(p.data), sIn);
              isIn = true;
            }
          }
        }
      }
      if (isIn) {
        add(1, null, null, machine.outHeight, layer.render.dotted?sInD:sIn);
        isIn = false;
      }
    }
  }

  console.log("Generated GCode ("+(Date.now()-starttime)+"ms)");

  //output.push(gcode.post.replace(/\$W/g, layer.w).replace(/\$H/g, layer.h));

  self.postMessage({time, gcode: output.join("\n")})

})


function round(data, r) {
  return Math.round(data*r)/r;
}
