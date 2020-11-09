#### 1.koa2中间件

+ 洋葱圈模型

  ```javascript
  // 第一个中间件 m1
  funciton m1 (ctx) {
      console.log('m1 start')
  }
  module.exports = function () {
      return async function (ctx, next) {
          m1(ctx)
          await next()
          console.log('m1 end')
      }
  }
  // 第二个中间件 m2
  funciton m2 (ctx) {
      console.log('m2 start')
  }
  module.exports = function () {
      return async function (ctx, next) {
          m2(ctx)
          await next()
          console.log('m2 end')
      }
  }
  // 第三个中间件 m3
  funciton m3 (ctx) {
      console.log('m3 start')
  }
  module.exports = function () {
      return async function (ctx, next) {
          m3(ctx)
          await next()
          console.log('m3 end')
      }
  }
  // use
  app.use(m1())
  app.use(m2())
  app.use(m3())
  // 执行顺序为（洋葱模型）
  m1 start、 m2 start、m3 start、m3 end、m2 end、m1 end
  ```

#### 3.koa路由

```javascript
// 会在当前路由模块中，每个路由前加一个 /users
router.prefix('/users')
// 
router.get('/page', async (ctx, next) => { // 渲染页面
    await ctx.render('index', {
        title: ''
    })
})
router.get('/json', async (ctx, next) => { // 返回接口 json
    ctx.body = {
        title: ''
    }
})
```

#### 4.cookie、session

+ cookie

  ```javascript
  // 设置cookie
  ctx.cookies.set(key, value)
  // 读取cookie
  ctx.cookies.get(key)
  ```

  