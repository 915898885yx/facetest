import Vue from 'vue'
import Vuex from '../vuex'

Vue.use(Vuex)

let store = new Vuex.Store({
  modules: {
    a: {
      state: {
        age: 'a100'
      },
      mutations: {
        syncChange() {
          console.log('a-change')
        }
      }
    },
    b: {
      state: {
        age: 'b100'
      },
      mutations: {
        syncChange() {
          console.log('b-change')
        }
      },
      modules: {
        c: {
          state: {
            age: 'c100'
          },
          mutations: {
            syncChange() {
              console.log('c-change')
            }
          }
        }
      }
    }
  },
  state: {
    age: 10
  },
  getters: {
    age (state) {
      return state.age + 20
    }
  },
  mutations: {
    // payload载荷
    syncChange(state, payload) {
      state.age += payload
    }
  },
  actions: {
    asyncChange ({commit}, payload) {
      commit('syncChange', payload)
    }
  }
})
store.registerModule('e', {
  state: {
    age: 'e100'
  }
})
store.registerModule(['a', 'g'], {
  state: {
    age: 'ag100'
  }
})
export default store
