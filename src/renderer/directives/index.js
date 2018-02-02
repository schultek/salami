
import Vue from "vue"
import $ from "jquery"

import DragableDirective from "./DragableDirective.js"
import ResizeableDirective from "./ResizeableDirective.js"
import RotateableDirective from "./RotateableDirective.js"
import ZoomableDirective from "./ZoomableDirective.js"

Vue.directive('dragable', DragableDirective)
Vue.directive('resizeable', ResizeableDirective)
Vue.directive('rotateable', RotateableDirective)
Vue.directive("zoomable", ZoomableDirective)

Vue.directive("blur", {
  bind(el) {
    el.addEventListener("keyup", event => {
      if (event.key == "Enter") {
        el.blur()
        event.preventDefault()
      }
    })
  }
})
