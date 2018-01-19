let {getGlobalConstants, getCurveConstants, getCurvePoint} = require("./renderfunctions.js")

const count = 2;

export default function generateCurvePaths(c, machine) {

  let curve = {...c}

  curve.direction = curve.direction / 360 * Math.PI*2
  curve.dcos = Math.cos(curve.direction);
  curve.dsin = Math.sin(curve.direction);
  curve.xgap = curve.dcos*curve.gap;
  curve.ygap = curve.dsin*curve.gap;

  let globals = getGlobalConstants(curve, machine)

  let paths = []

  if (!globals) return paths

  for (var i = -count; i <= count; i++) {
    paths.push({
      data: makePath(i, curve, machine, globals),
      opacity: 1 - Math.abs(i) / (count+1)
    })
  }

  return paths
}

function makePath(num, curve, machine, globals) {
  var cdata = getCurveConstants(num, curve, machine, globals);
  if (!cdata) return "";
  var di = curve.steps/Math.round(curve.steps*cdata.length/globals.maxlength);
  var path = "";
  for (var i = 0; i<=curve.steps+1; i += di) {
    var point = getCurvePoint(i/curve.steps, cdata, curve, machine, globals);
    path += (path==""?"M ":"L ")+point.x+" "+point.y+" ";
  }
  return path;
}
