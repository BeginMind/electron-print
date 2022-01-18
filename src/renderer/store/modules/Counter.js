/*
 * @Description:
 * @Date: 2021-09-13 14:17:28
 * @LastEditTime: 2021-09-13 14:42:20
 */
const state = {
  main: 0
}

const mutations = {
  DECREMENT_MAIN_COUNTER (state) {
    state.main -= 1
  },
  INCREMENT_MAIN_COUNTER (state) {
    state.main += 1
  }
}

const actions = {
  someAsyncTask ({ commit }) {
    // do something async
    commit('INCREMENT_MAIN_COUNTER')
  }
}

export default {
  state,
  mutations,
  actions
}
