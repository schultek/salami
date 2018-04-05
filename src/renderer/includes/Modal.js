
let modal = null, store = null

export default {
  init(st, md) {
    modal = md
    store = st
  },
  show(...args) {
    if (modal)
      modal.show(...args)
  },
  dialog(params) {
    if (modal) {
      modal.show("dialog", params)
    }
  },
  hide(...args) {
    if (modal)
      modal.hide(...args)
  }
}
