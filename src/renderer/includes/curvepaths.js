let {makeCurveFactory, round} = require("../includes/renderfunctions.js")

const count = 2;

export default function generateCurvePaths(c) {

  let curve = {...c}

  curve.direction = round(curve.direction / 360 * Math.PI*2)
  curve.dcos = round(Math.cos(curve.direction));
  curve.dsin = round(Math.sin(curve.direction));
  curve.xgap = round(curve.dcos*curve.gap);
  curve.ygap = round(curve.dsin*curve.gap);

  let factory = makeCurveFactory(curve)

  let paths = []

  for (var i = -count; i <= count; i++) {
    paths.push({
      data: makePath(i, curve, factory),
      opacity: 1 - Math.abs(i) / (count+1)
    })
  }

  return paths
}

function makePath(num, curve, factory) {
  var cdata = factory.curve(num);
  var di = 1/Math.round(curve.steps*cdata.length/factory.maxlength);
  var path = "";
  for (var i = 0-di; i<=1+di; i += di) {
    var point = cdata.point(i);
    if (point)
      path += (path==""?"M ":"L ")+point.x+" "+point.y+" ";
  }
  return path;
}
