let Vue;
let forEach = (obj, callback) => {
    Object.keys(obj).forEach(objName => {
        callback(objName, obj[objName])
    })
}
class ModuleCollection {
    constructor(options) {
        // 深度遍历所有的子模块都遍历一遍
        this.register([], options)
    }
    register(path, rootModule) {
        let rawModule = {
            _raw: rootModule,
            _children: {},
            state: rootModule.state
        }
        if (!this.root) {
            this.root = rawModule
        } else {
            let parentModule = path.slice(0, -1).reduce((root, current) => {
                return root._children[current]
            }, this.root)
            parentModule._children[path[path.length - 1]] = rawModule
        }

        if (rootModule.modules) { // 表示有子模块
            forEach(rootModule.modules, (moduleName, module) => {
                // console.log(moduleName, 'moduleName')
                // 将a模块进行注册 [a], a模块的定义
                // 将b模块进行注册 [b], b模块的定义
                this.register(path.concat(moduleName), module)
            })
        }
    }
}

function installModule (store, rootState, path, rawModule) { // _raw  _children  state
    

    // 没有安装状态，需要把子模块的状态定义到rootState
    if (path.length > 0) {
        let parentState = path.slice(0, -1).reduce((root, current) => {
            return root[current]
        }, rootState)
        Vue.set(parentState, path[path.length - 1], rawModule.state) // 给当前状态赋值
    }

    let getters = rawModule._raw.getters
    if (getters) {
        forEach(getters, (getterName, value) => {
            if (!getters[getterName]) {
                Object.defineProperty(store.getters, getterName, {
                    get: () => {
                        return value(rawModule.state) // 模块中的状态
                    }
                })
            }
        })
    }
    let mutations = rawModule._raw.mutations;
    if (mutations) {
        forEach(mutations, (mutationName, value) => {
            let arr = store.mutations[mutationName] || (store.mutations[mutationName] = [])
            arr.push((payload) => {
                value(rawModule.state, payload)
            })
        })
    }

    let actions = rawModule._raw.actions;
    if (actions) {
        forEach(actions, (actionName, value) => {
            let arr = store.actions[actionName] || (store.actions[actionName] = [])
            arr.push((payload) => {
                value(store, payload)
            })
        })
    }
    forEach(rawModule._children, (rawName, rawModule) => {
        installModule(store, rootState, path.concat(rawName), rawModule)
    })
}

class Store{ // 用户获取的时Store的实例
    constructor (options) {
        // 获取用户new实例时传入的所有属性
        this.vm = new Vue({
            data: {
                state: options.state
            }
        });

        //let getters = options.getters // 获取用户传入的getters
        this.getters = {}
        this.mutations = {}
        this.actions = {}

        //需要将用户传入的数据，进行格式化操作、格式化后的数据如下
        this.modules = new ModuleCollection(options)

        // 递归安装模块 
        installModule(this, this.state, [], this.modules.root)


        // ****************
    }
    commit = (mutationName, payload) => { // es7的写法，这个里面的this，永远指向当前的store的实例\针对解构的时候
        this.mutations[mutationName].forEach(fn => fn(payload)) // 发布
    }
    dispatch = (actionName, payload) => {
        this.actions[actionName].forEach(fn => fn(payload))
    }
    registerModule (moduleName, module) {
        if (!Array.isArray(moduleName)) {
            moduleName = [moduleName]
        }
        this.modules.register(moduleName, module)
        installModule(this, this.state, moduleName, this.modules.root)
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