import Vue from 'vue'
import VueRouter from "../vue-router"
Vue.use(VueRouter)

export default new VueRouter({
    routes: [
        {
            path: '/',
            component: () => import("../components/HelloWorld.vue"),
            beforeEnter (from, to, next) {
                console.log(`from: ${from} to: ${to}`)
                setTimeout(() => {
                    next()
                }, 1000)
            }
        }, {
            path: '/about',
            component: () => import("../components/about.vue")
        }
    ]
})