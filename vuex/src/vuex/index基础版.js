// let root = {
//     _raw: rootModule,
//     state: rootModule.state,
//     _children: {
//         a: {
//             _raw: aModule,
//             _children: {},
//             state: aModule.state
//         },
//         b: {
//             _raw: bModule,
//             _children: {
//                 c: {}
//             },
//             state: bModule.state
//         }
//     }
// }

let Vue;
let forEach = (obj, callback) => {
    Object.keys(obj).forEach(objName => {
        callback(objName, obj[objName])
    })
}
class Store{ // 用户获取的时Store的实例
    constructor (options) {
        // 获取用户new实例时传入的所有属性
        console.log(options, 'option')
        this.vm = new Vue({
            data: {
                state: options.state
            }
        });

        let getters = options.getters // 获取用户传入的getters
        this.getters = {}
        forEach(getters, (getterName, value) => {
            Object.defineProperty(this.getters, getterName, {
                get: () => {
                    return value(this.state)
                }
            })
        })
        // 需要讲用户定义的mutation，放到state上，订阅 讲函数订阅到一个数组中  发布  让数组中的函数一次执行
        let mutations = options.mutations
        this.mutations = {}
        forEach(mutations, (mutationName, value) => {
            this.mutations[mutationName] = (payload) => { // 订阅
                value(this.state, payload)
            }
        })

        let actions = options.actions
        this.actions = {}
        forEach(actions, (actionName, value) => {
            this.actions[actionName] = (payload) => {
                value(this, payload)
            }
        })
    }
    commit = (mutationName, payload) => { // es7的写法，这个里面的this，永远指向当前的store的实例\针对解构的时候
        this.mutations[mutationName](payload) // 发布
    }
    dispatch = (actionName, payload) => {
        this.actions[actionName](payload)
    }
    // 类的属性访问器
    get state () { // 获取实例上的state属性，就会执行此方法
        return this.vm.state
    }
}

const install = (_Vue) => { // Vue的构造函数
    Vue = _Vue
    // 放到vue的(原型上，不对，因为默认会给所有的实例增加
    // 只从当前的根实例开始，所有根实例的子组件才会有$store方法
    Vue.mixin({
        beforeCreate() { // 混入的声明周期会先执行
            // 把父组件的store属性，放到每个组件的实例上
            if (this.$options.store) { // 根实例
                this.$store = this.$options.store
            } else {
                this.$store = this.$parent && this.$parent.$store
            }
        }
    })
}

export default {
    Store,
    install
}