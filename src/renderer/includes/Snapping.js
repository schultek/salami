
let store;

export function initSnapping(st) {
  store = st;
}

export function snapToObjects(id, p, snap = 5) {
  if (!store) return p;

  let objects = getAllObjects(id)

  if (objects.length == 0) return p

  let x = getHorizontalLines(objects).reduce((x, l) => x == null || Math.abs(l - p.x) < Math.abs(x - p.x) ? l : x, null)
  let y = getVerticalLines(objects).reduce((y, l) => y == null || Math.abs(l - p.y) < Math.abs(y - p.y) ? l : y, null)

  x = Math.abs(x - p.x) <= snap ? x : p.x;
  y = Math.abs(y - p.y) <= snap ? y : p.y;

  return {x, y}

}

function getAllObjects(id) {

  let mapObj = o => ({id: o.id, x: o.x, y: o.y, w: o.w, h: o.h, rot: o.rot || 0})

  let obj = store.getters.getObjectById(id)

  if ("rot" in obj && obj.rot != 0) return []

  return store.state.layers.map(mapObj)
    .concat(store.state.images.map(mapObj))
    .concat(store.state.texts.map(mapObj))
    .filter(o => o.rot == 0)
    .filter(o => o.id != id)

}

function getHorizontalLines(objects) {
  return objects.reduce((lines, o) => lines.concat([o.x, o.x+o.w]), [])
}

function getVerticalLines(objects) {
  return objects.reduce((lines, o) => lines.concat([o.y, o.y+o.h]), [])
}
