
import $ from "jquery"

export default {
  bind(el, binding, vnode) {
    let store = vnode.context.$store;

    el.addEventListener("mousewheel", event => {

      if (event.ctrlKey) {
        event.preventDefault();
        event.stopImmediatePropagation();
        var p = store.getters.getLocalPosition(event);

        let zoom = store.state.project.zoom - event.deltaY/20;

        if (zoom < 0.1) zoom = 0.1;
        if (zoom > 20) zoom = 20;

        let x = event.x-(p.x*zoom)-$(el).position().left;
        let y = event.y-(p.y*zoom)-$(el).position().top;

        store.commit("translateProject", {x, y})
        store.commit("zoomProject", zoom)
      } else {
        store.commit("translateProject", {
          x: store.state.project.x - event.deltaX/2,
          y: store.state.project.y - event.deltaY/2
        })
      }
    })
  }
}
