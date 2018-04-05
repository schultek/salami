
import Modal from "@/includes/Modal.js"

export default {
  removeObject({commit, state, getters, dispatch}, id) {
    let o = getters.getObjectById(id)
    Modal.dialog({
      text: `Do you want to delete ${o.title}?`,
      buttons: [
        {title: 'Abort'},
        {
          title: 'Delete',
          default: true,
          class: "vue-dialog-button dialog-button-error",
          handler() {
            if (state.selectedObject == id)
              commit("selectObject", null)
            let toRender = getters.getRenderingIds(id)
            commit("removeObject", id)
            toRender.forEach(r => dispatch("startRendering", r))
            Modal.hide("dialog")
          }
        }
     ]
    })

  }
}
