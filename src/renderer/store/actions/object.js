
export default {
  removeObject({commit, state, getters, dispatch}, id) {
    if (state.selectedObject == id)
      commit("selectObject", null)
    let toRender = getters.getRenderingIds(id)
    commit("removeObject", id)
    toRender.forEach(r => dispatch("startRendering", r))
  }
}
