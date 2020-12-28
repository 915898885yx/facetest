<template>
  <div id="app">
    <button @click="push">push</button>
    <router-link to="/">HelloWorld</router-link>|
    <router-link to="/about">About</router-link>
    <router-view></router-view>
    <div>我才{{$store.state.age}}</div>
    <div>20年后{{$store.getters.age}}</div>
    <div>a.age: {{$store.state.a.age}}</div>
    <div>b.age: {{$store.state.b.age}}</div>
    <div>b.c.age: {{$store.state.b.c.age}}</div>
    <div>e.age: {{$store.state.e.age}}</div>
     <div>a.g.age: {{$store.state.a.g.age}}</div>
    <button @click="changeState">mutation</button>
    <button @click="asyncChangeState">action</button>
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    // HelloWorld
  },
  methods: {
    changeState () {
      console.log(this.$store, 'store')
      this.$store.commit('syncChange', 30)
    },
    asyncChangeState () {
      this.$store.dispatch('asyncChange', 10)
    },
    push () {
      this.$router.push('/about')
    }
  },
  mounted () {
    // console.log(this.$store)
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
