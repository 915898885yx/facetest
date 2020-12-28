let Vue
class VueRouter {
    static install (_Vue) {
        Vue = _Vue
        Vue.mixin({
            beforeCreate () {
                if (this.$options.router) {
                    // 启动路由
                    this.$options.router.init()
                    Vue.prototype.$router = this.$options.router
                }
            }
        })
    }
    constructor (options) {
        this.$options = options
        this.routeMap = {}
        // 借用vue的响应式机制，却换路由做响应
        this.app = new Vue({
            data: {
                // 默认根目录
                current: '/'
            }
        })
    }
    init () {
        // 启动整个路由
        //由插件use负责启动也行
        /**
         * 1.监听hashChange事件
         */
        this.bindEvents()
        /**
         * 2.处理路由表
         */
        this.createRouteMap()
        console.log(this.routeMap, 'routerMap')
        /**
         * 初始化router-view  router-link
         */
        this.initComponent()
    }
    initComponent () {
        Vue.component('router-view', {
            render: (h) => {
                const component = this.routeMap[this.app.current].component
                return h(component)
            }
        })

        Vue.component('router-link', {
            props: {
                to: String
            },
            render (h) {
                /**
                 * h三个参数：元素名，参数，子元素[]
                 */
                return h('a', {
                    attrs: {
                        href: '#' + this.to
                    }
                }, [
                    this.$slots.default
                ])
            }
        })
    }
    createRouteMap () {
        this.$options.routes.forEach(item => {
            this.routeMap[item.path] = item
        })
    }
    bindEvents () {
        window.addEventListener('hashchange', this.onHashChange.bind(this), false)
        window.addEventListener('load', this.onHashChange.bind(this), false)
    }
    getHash () {
        return window.location.hash.slice(1) || '/'
    }
    getFrom(e) {
        let from, to
        if (e.newURL) {
            from = e.oldURL.split('#')[1]
            to = e.newURL.split('#')[1]
        } else {
            from = ''
            to = this.getHash()
        }
        return {from, to}
    }
    onHashChange (e) {
        let hash = this.getHash()
        // 修改this.app.current 借用了vue的响应式机制
        let router = this.routeMap[hash]
        let {from, to} = this.getFrom(e)
        if (router.beforeEnter) {
            // 有声明周期
            router.beforeEnter(from, to, () => {
                this.app.current = hash
            })
        } else {
            this.app.current = hash
        }
        
        console.log('hash改变', e)
    }
    push(url) {
        // hash模式直接赋值
        //history 使用pushState
        window.location.hash = url
    }
}

export default VueRouter