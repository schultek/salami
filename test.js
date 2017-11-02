
function r(dx, dy, rot) {
  let rad = rot*Math.PI*2/360;
  let cos = Math.cos(rad);
  let sin = Math.sin(rad);
  return {
    x: dx * cos - dy * sin,
    y: dy * cos + dx * sin
  }
}

let l = (dx, dy, ro) => console.log(r(dx, dy, ro));

l(10, 10, 5);
l(0, 0, 5);
l(-10, 10, 5);
