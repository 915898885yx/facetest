#### 1.Vue中为什么不能使用index作为key值（diff算法）

```javascript
<ul>
  <li>1</li>
  <li>2</li>
</ul>
虚拟DOM大概为：
{
  tag: 'ul',
  children: [
    { tag: 'li', children: [ { vnode: { text: '1' }}]  },
    { tag: 'li', children: [ { vnode: { text: '2' }}]  },
  ]
}
```

​	首先响应式数据更新后，触发了渲染Watcher的回调函数vm._update(vm._render())驱动视图更新，vm._render()就是生成vnode，而vm._update会带着新的vnode触发\__patch__过程。

​	patch过程：对比新旧节点是否是同类型的节点：

```javascript
function sameVnode (a, b) {
  return (
    a.key === b.key && (
      (
        a.tag === b.tag &&
        a.isComment === b.isComment &&
        isDef(a.data) === isDef(b.data) &&
        sameInputType(a, b)
      )
    )
  )
}
vue判断两个vnode是否相同，key是关键
```

	###### 1.如果不是相同节点：

isSameNode为false，直接销毁旧的vnode，渲染新的vnode。所以diff是同层对比

2.是相同节点，要尽可能的做节点的复用

调用src/core/vdom/patch.js下的patchVNode方法

- 如果新的vnode是文字vnode，直接调用dom api替换文字
- 如果新vnode不是文字vnode，开始对比子节点children开始进行对比
- 如果有新的children而没有旧的children，说明是新增children，直接addVnodes添加子节点
- 如果有旧的children，而没有新的children，说明是删除children，直接removeVnodes删除旧子节点
- 如果新旧的children都存在（都存在里子节点列表，进入li）那么就是diff算法最核心的点，新旧节点的diff过程
  + 旧首节点和新首节点用sameNode对比
  + 旧尾节点和新尾节点用sameNode对比
  + 旧首节点和新尾节点用sameNode对比
  + 旧尾节点和新首节点用sameNode对比
  + 如果以上都匹配不到，再把所有的旧子节点的key做一个映射到旧节点下标key -> index表，用新的vnode的key找去旧节点中可以复用的位置，
  + 不停的把匹配到的指针向内部收缩，直到新旧节点有一端的指针相遇

- 在指针相遇后，有两种特殊情况
  + 有新节点需要加入。如果更新完以后，oldStartIdx > oldEndIdx,说明旧节点被patch完。但是有可能 还有新的节点没有被处理，接着会判断是否需要新增节点
  + 有旧节点需要删除。如果新增节点patch完，此时newStartIdx > newEndInd逻辑，会删除多余的旧子节点

#### 2.in和Object.hasOwnProperty区别

+ hasOwnProperty()方法返回布尔值，指示对象自身属性中是否具有指定的属性，因此这个方法会忽略从原型上继承到的属性
+ 如果指定的属性在指定对象或其原型链中，则in运算符返回true

#### 3.函数表达式和函数声明之间有什么区别

```javascript
+ 函数声明会进行函数提升
+ 函数表达式不会提升
//函数声明
function funcName () {}
// 函数表达式
var _funcName = function () {}
```

#### 4.new关键字有什么用

new 关键字做了4件事

+ 创建一个新的对象

+ 将构造函数的作用域赋给新的对象;

+ 执行构造函数中的代码;

+ 返回新的对象;

  实现一个new

  ```javascript
  function new (constructor, ...rest) {
      if (typeof constructor !== 'function') {
          return constructor
      }
      // 创建新对象，关联构造函数的原型队形
      const _constructor = Object.create(Object.prototype)
      //执行构造函数
      const obj = constructor.apply(_constructor, rest)
      if (typeof obj === 'object') {
          return obj
      } else {
          reutrn _constructor
      }
  }
  ```

  

#### 5.什么时候不使用箭头函数

+ 当想要函数被提升时（箭头函数是匿名的）
+ 要在函数中使用this/arguments时，由于箭头函数本身不具有this/arguments,因此取决于外部上下文
+ 使用命名函数（箭头函数是匿名的）
+ 使用函数作为构造函数时（箭头函数没有构造函数）

#### 6.浏览器渲染过程、dom树和渲染树

##### 浏览器的渲染过程

+ 解析HTML构建DOM树，并行请求css/image/js
+ css下载完成，开始构建CSSOM（css树）
+ CSSOM构建结束，和DOM一起生成render tree（渲染树）
+ 布局（layout）：计算出每个节点在屏幕的位置
+ 显示（painting）：通过显卡把页面画到屏幕上

##### DOM树和渲染树的区别

+ DOM树和HTML标签一一对应，包括head和隐藏元素
+ 渲染树不包括head和隐藏元素，大段文本的每一行都是独立节点，每一个节点都有对应的css属性

#### 7.css会阻塞dom解析吗？

对于一个html文档来说，不管是内联还是外链的css，都会阻碍后续的dom渲染，但是不会阻碍dom解析

#### 8.重绘（repaint）和回流（重排）（reflow）

+ 重绘：当渲染树中的元素外观（如颜色）发生改变，不影响布局时，产生重绘
+ 回流：当渲染树中的元素的布局（如：尺寸、位置、隐藏/状态）发生改变时，产生回流
+ 注意：js获取layout属性（如：offsetLeft、scrollTop、getComputedStyle）也会引起回流，因为浏览器通过回流计算最新值
+ 回流必将引起重绘，重绘不一定会引起回流

dom结构中，各元素有自己的合租，根据各种样式计算并将元素放到该出现的位置，叫回流（reflow）

 触发reflow：

+ 添加或删除可见的dom元素
+ 元素位置改变
+ 元素尺寸改变
+ 内容改变
+ 渲染器初始化
+ 浏览器窗口改变

#### 9.如何最最小化重绘和回流

+ 以下操作会导致性能问题：
  - 改变window大小
  - 改变字体
  - 添加或删除样式
  - 改变文字
  - 定位或者浮动
  - 盒模型

+ 解决办法：
  + 需要对dom元素进行复杂操作时，可以先隐藏（display：none），操作完再显示
  + 需要创建多个dom节点时，通过DocumentFragment创建结束一次性加入document，或使用字符串拼接好一次性修改
  + 缓存Layout属性，如var left = elem.offsetLeft,多次使用left只产生一次回流
  + 避免用table布局（table元素一旦回流，导致table所有元素回流）
  + 批量修改样式：elem.className和elem.style.cssText代替elem.style.XXX

#### 10.首屏优化的解决方案

+ vue-router路由懒加载（利用webpack的代码分割）
+ 使用cdn加速，将通用库从vendor分离
+ nginx开启gzip压缩
+ vue异步组件
+ 服务端渲染ssr
+ ui库按需加载
+ 做文件缓存

#### 11.requestIdleCallback是干什么用的

**`window.requestIdleCallback()`**方法将在浏览器的空闲时段内调用的函数排队。

```javascript
var handle = window.requestIdleCallback(callback[, options])
//一个ID，可以把它传入 Window.cancelIdleCallback() 方法来结束回调。
//callback、options {timeout}
```

#### 12.cookie的samesite属性的作用

**chrome51**cookie新增了Samesite属性防止SCRF攻击和用户追踪

+ CSRF攻击是什么：

  Cookie 往往用来存储用户的身份信息，恶意网站可以设法伪造带有正确 Cookie 的 HTTP 请求，这就是 CSRF 攻击

  **for example：**

  1.先访问a.com服务器返回cookie

  然后访问了b.com，但是b.com有一个表单请求的action为a.com,这样a网站就收到了带有正确cookie请求

  2.facebook在第三方网站插入一张看不到的图片

  ```html
  <img src="facebook.com">
  ```

  浏览器加载时会向facebook发送带有cookie的请求，从而facebook就知道你是谁，访问了什么网站

+ SameSite属性

  可以设置三个值：

  ```javascript
  Strict
  + Set-Cookie: CookieName=CookieValue; SameSite=Strict;
  Lax
  + Set-Cookie: CookieName=CookieValue; SameSite=Lax;
  None
  ```

  1.Strict完全禁止第三方cookie，跨站访问时任何情况都不会发送cookie，只有当网页的url和请求目标一致才会带上cookie：可能导致用户体验不好。

  比如当前网页有一个github连接，用户点击连接不会带有github的cookie，跳转总是未登录

  2.Lax多数情况也是不发送第三方cookie，但是导航到目标网站的get请求除外

  3.None和之前一毛一样

#### 13.CSRF防御手段

+ 尽量使用post，限制get
+ 浏览器cookie策略
+ 加验证码
+ 加token（访问时生成token，提交时校验token）

#### 14.事件绑定有几种方式

+ 在DOM元素直接绑定

+ 在javascript代码中绑定 xxx.click = function () {}

+ 事件监听器绑定 xxx.addEvemtListener('event', () =>{})

  addEventListener第三个参数为true，代表再捕获阶段绑定，第三个参数为false，代表在冒泡阶段绑定

#### 15.DOM事件流以及冒泡和捕获

+ dom事件流:事件捕获->处于目标阶段->事件冒泡

  阻止事件冒泡或者捕获的方法：

  + **stopImmediatePropagation()**和**stopPropagation()**

    后者只会阻止事件冒泡或者捕获，前者除此外还会阻止元素的其他事件发生

#### 16.浏览器的垃圾回收机制

**大多数浏览器采用标记清除的方式**

+ 标记清除：当变量进入环境时，将变量标记**"进入环境"**，变量离开环境时，标记为**"离开环境"**某个时刻垃圾回收器会过滤掉环境中的变量，以及被环境变量引用的变量，剩下的被视为为首垃圾。
+ 引用计数：当声明一个变量并将一个引用类型赋值给该变量时，则引用次数就是1.相反如果包含这个值得引用得变量又取得了另外一个值，则这个值引用次数减1，当引用次数为0时，没办法再访问该变量，则收回其占用得空间。

#### 17.js对象循环引用会导致什么问题

```javascript
//循环引用代码
function circularReference() {
    let obj1 = {}
    let obj2 = {
        b: obj1
    }
    obj1.a = obj2
}
```

+ js中引用计数垃圾回收策略得问题

+ 循环对象使用JSON.stringify()会报错

  解决办法：JSON扩展包JSON.decycle可以去除循环引用

  ```javascript
  let c = JSON.decycle(obj1)
  JSON.stringify(c)
  ```

#### 18.如何实现one绑定事件

```javascript
function once (ele, eventType, fn) {
    var handle = function () {
        fn()
        ele.removeEventListener(eventType, handle)
    }
    ele.addEventListener(eventType, handle)
}
```

#### 19.简单请求和复杂请求的区别

+ 简单请求：

  **1.请求方法是以下三种方法之一：**

  + HEAD
  + GET
  + POST

​        **2.请求头不超过以下几种字段：**

​			Accept

​			Accept_language

​			Content-language

​			Last-Event-ID

​			Content-type:只限于三个值application/x-www-form-urlencoded、multipart/form-data、text/plain

+ 复杂请求：

  非简单请求就是复杂请求

  **复杂请求在正式请求前都会有预检请求，在浏览器中都能看到有OPTIONS请求，用于向服务器请求权限信息的。**

  **axios都是复杂请求，ajax可以是简单请求**

#### 20.event.target和event.currentTarget区别

+ event.target指向引起触发事件的元素，而event.currentTarget则是事件绑定的元素，点击哪个元素就是哪个元素







