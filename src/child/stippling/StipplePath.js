
import {dist} from "@/functions"

class PathItem {
  constructor(item, prev, next) {
    this.item = item;
    this.prev = prev;
    this.next = next;
  }
}

let pathMap = new Map()
let head = null;
let tail = null;

export default {
  init(stipples) {
    this.clear();
    for (let s of stipples) {
      this.append(s)
    }
  },
  split(id, a, b) {
    let item = pathMap.get(id)
    if (item) {
      pathMap.delete(id)

      let prev = pathMap.get(item.prev)
      let next = pathMap.get(item.next)

      let d1 = (prev ? dist(prev.item.pos.x, prev.item.pos.y, a.pos.x, a.pos.y) : 0) + (next ? dist(next.item.pos.x, next.item.pos.y, b.pos.x, b.pos.y) : 0)
      let d2 = (prev ? dist(prev.item.pos.x, prev.item.pos.y, b.pos.x, b.pos.y) : 0) + (next ? dist(next.item.pos.x, next.item.pos.y, a.pos.x, a.pos.y) : 0)

      if (d1 > d2) {
        let temp = a;
        a = b;
        b = temp;
      }

      pathMap.set(a.id, new PathItem(a, prev ? prev.item.id : null, b.id))
      pathMap.set(b.id, new PathItem(b, a.id, next ? next.item.id : null))
      if (prev) prev.next = a.id
      else head = a.id

      if (next) next.prev = b.id
      else tail = b.id

    }

  },
  update(id, stipple) {
    let item = pathMap.get(id)
    if (item) {
      item.item = stipple;
    }
  },
  remove(id) {
    let item = pathMap.get(id)
    if (item) {
      pathMap.delete(id)
      if (item.prev) pathMap.get(item.prev).next = item.next
      else head = item.next

      if (item.next) pathMap.get(item.next).prev = item.prev
      else tail = item.prev
    }
  },
  clear() {
    pathMap.clear();
    tail = null;
    head = null;
  },
  append(stipple) {
    if (tail) {
      let item = pathMap.get(tail)
      item.next = stipple.id;
    }
    pathMap.set(stipple.id, new PathItem(stipple, tail, null))
    tail = stipple.id;
    if (head == null) head = stipple.id;
  },
  toArray() {

    let path = []

    let curr = head;
    while (curr) {
      let currItem = pathMap.get(curr)
      path.push(currItem.item)
      curr = currItem.next
    }

    return path
  }
}
