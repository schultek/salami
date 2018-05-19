import Store from "electron-store";

let userStore = null;

export default {
  init(store) {
    userStore = new Store({
      defaults: {
        madeTour: false
      }
    })
  },
  get(id) {
    if (userStore)
      return userStore.get(id);
  },
  set(id, payload) {
    if (userStore)
      userStore.set(id, payload);
  },
  addToRecentProjects(project) {
    if (!userStore) return;
    let recents = userStore.get("recentProjects")
    let p = recents.find(r => r.url == project.url)
    if (p) recents.splice(recents.indexOf(p), 1)
    recents.unshift(project)
    userStore.set("recentProjects", recents)
  }
}
