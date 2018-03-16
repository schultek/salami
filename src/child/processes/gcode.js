
import {round} from "@/functions.js"

import RenderScheduler from "../RenderScheduler"

process.on("message", (event) => {
  RenderScheduler.run(() => generate(event), (result) => {
    if (result)
      process.send(result)
  })
})

function* generate(event) {

    let lines = event.lines.filter(l => l && l.length > 0);
    let machine = event.machine;

    let starttime = Date.now()

    var output = [];
    var pos = {x: 0, y: 0, z: 0};
    var time = 0;

    var dx = 0, dy = 0;

    var add = (g, x, y, z, s) => {
      var str = "G"+g+(x!=null?" X"+x.toFixed(3):"")+(y!=null?" Y"+y.toFixed(3):"")+(z!=null?" Z"+z.toFixed(3):"")+" F"+s;
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
      var d = data*machine.bit.inDepth;
      return d<minD?-minD:-d;
    };

    var isIn = false;
    var sOut = machine.speed.seekrate;
    var sIn = machine.speed.feedrate;
    var sInD = machine.speed.feedrateDot;

    //output.push(gcode.pre.replace(/\$W/g, layer.w).replace(/\$H/g, layer.h));

    let ordered = order(lines)

    for (let line of ordered) {
      yield;
      if (line.length > 0) {
        add(0, line[0].x, line[0].y, null, sOut)
      }
      for (let p of line) {
        if (p.data >= 0) {
          add(1, p.x, machine.h-p.y, zd(p.data), sIn);
        }
      }
      add(0, null, null, machine.outHeight, sOut);
    }

    console.log("Generated GCode ("+(Date.now()-starttime)+"ms)");

    //output.push(gcode.post.replace(/\$W/g, layer.w).replace(/\$H/g, layer.h));

    return {time, gcode: output.join("\n")}
}

function sq(a) {
  return a * a
}

function order(lines, cb) {

  if (!lines[0] || ! ("order" in lines[0]))
    return lines

  return lines.sort((a, b) => a.order - b.order)

}
