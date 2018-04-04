
let store, callback;

export default {
  init(st) {
    store = st;
  },
  setDrawCallback(cb) {
    callback = cb
  },
  getSimple(id, p, snap = 5) {
    if (!store) return p

    let objects = getAllObjects(id)

    if (objects.length == 0) return p

    let hlines = getHorizontalLines(objects)
    let vlines = getVerticalLines(objects)

    let pos = {
      x: hlines
        .filter(x => Math.abs(x - p.x) <= snap)
        .reduce((x, l) => x === null || Math.abs(l - p.x) < Math.abs(x - p.x) ? l : x, null),
      y: vlines
        .filter(y => Math.abs(y - p.y) <= snap)
        .reduce((y, l) => y === null || Math.abs(l - p.y) < Math.abs(y - p.y) ? l : y, null)
    }

    if (!pos.x && pos.x !== 0) pos.x = p.x
    if (!pos.y && pos.y !== 0) pos.y = p.y

    return pos;

  },
  getPoint(id, p, snap = 5) {
    if (!store) return p;

    let pos = this.getSimple(id, p, snap)

    if (callback) {
      callback(pos.x != p.x ? pos.x : null, pos.y != p.y ? pos.y : null)
    }

    return pos
  },
  get(id, start, end, snap = 5) {
    if (!store) return {start, end};

    let s = this.getSimple(id, start, snap)
    let e = this.getSimple(id, end, snap)

    if (callback) {
      callback(s.x != start.x ? s.x : null, s.y != start.y ? s.y : null, e.x != end.x ? e.x : null, e.y != end.y ? e.y : null)
    }

    return {start: s, end: e}

  },
  close() {
    if (callback)
      callback()
  }
}

function getAllObjects(id) {

  let obj = store.getters.getObjectById(id)

  if (obj && "rot" in obj && obj.rot != 0) return []

  return store.state.layers
    .concat(store.state.images)
    .filter(o => !o.rot || o.rot == 0)
    .filter(o => o.id != id)

}

function getHorizontalLines(objects) {
  return objects.reduce((lines, o) => lines.concat(o.getSnapping ? o.getSnapping(true) : [o.x, o.x+o.w]), [])
}

function getVerticalLines(objects) {
  return objects.reduce((lines, o) => lines.concat(o.getSnapping ? o.getSnapping(false) : [o.y, o.y+o.h]), [])
}
