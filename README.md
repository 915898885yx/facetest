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

#### 21.vue父子组件生命周期执行顺序

+ 加载渲染过程：

  1.父beforeCreate

  2.父created

  3.父beforeMount

  4.子beforeCreate

  5.子created

  6.子beforeMount

  7.子mounted

  8.父mounted

+ 子组件更新过程：

  1.父beforeUpdate

  2.子beforeUpdate

  3.子updated

  4.父updated

+ 父组件更新过程：

  1.父beforeUpdate

  2.父updated

+ 销毁过程：

  1.父beforeDestory

  2.子beforeDestory

  3.子destoryed

  4.父destoryed

#### 22.为什么v-for和v-if不能连用

+ v-for比v-if优先执行，每次都需要遍历数组，会影响速度，尤其需要渲染很小一部分时。
+ 如果连用会把v-if给每个元素都添加一下，会造成性能问题。
+ 一般v-if放在外层判断，不符合就不去执行，或者使用computed代替v-if

#### 23.watch中的deep：true是如何实现的

// TODO

#### 24.组件中的data为什么是一个函数而不是一个对象

+ 因为对象是引用类型，如果data是对象的情况下会造成所有的组件公用一个data。而data是一个函数的画，每次执行函数都会返回一个新对象，这样的话每个组件都会维护一份独立的对象data

#### 25.action和mutation区别

+ 流程顺序：修改State拆成两部分，视图触发action,action再触发mutation

+ 角色定位：

  1.mutation：专注于需改State，理论上是修改State的唯一途径

  2.action：业务代码，异步请求

+ 限制：角色不同

  mutation：必须同步执行

  action：可以异步，但不能直接操作state

#### 25.1 vuex如何知道state是否通过mutation修改的

```javascript
_withCommit (fn) {
    const committing = this._committing
    this._committing = true
    fn()
    this._committing = committing
}
```



#### 26.v-html会导致哪些问题？

+ v-html更新的元素是innerHTML，内容按照普通的HTML插入，不会作为Vue模板进行编译，但是有时候我们需要渲染html片段中插值表达式，或者按照vue模板语法给dom元素绑定事件
+ 在单文件组件里，scoped样式不会应用在v-html内部，因为那部分的html没有被Vue的模板编译器处理，如果希望针对v-html的内容设置带作用域的css，你可以用一个全局的style标签手动设置类似BEM的作用域策略
+ 后台返回的html片段以及css样式和js，但是返回js步执行，浏览器在渲染时候并没有渲染js，需要通过$nextTick中动态创建script标签

#### 27.vue为何采用异步渲染

+ 浏览器执行机制：

  主进程-微异步-dom渲染-宏异步

  异步渲染dom。通过nexttick改变属性值，不论修改多少次，最后都是进行一次dom渲染，提高性能。

#### 28.ajax放在哪个声明周期中

+ 看情况，不需要操作dom，在created中，需要操作dom在mounted中
+ 但是服务端渲染没有mounted，所以在created中

#### 29.vue的computed的特点-TODO

// https://blog.csdn.net/qq_42072086/article/details/106993983

+ 概念：computed是一个计算属性，类似过滤器，对绑定到view的数据进行处理，计算属性的结果会被缓存，除非依赖的响应式结果发生变化才会重新计算，计算属性不是异步更新，渲染的时候才能取到最新的值。

#### 30.何时需要使用beforeDestoryed

+ 在当前组件使用了$on方法，需要在组件销毁前解绑
+ 清除自己定义的定时器
+ 解除事件的绑定

#### 31.vue-router中的导航守卫有哪些

#### 32.实现函数

```javascript
实现sum函数，使得
sum(1,2,3).sumOf() //6
sum(2,3)(2).sumOf() //7
sum(1)(2)(3)(4).sumOf() //10
```

```javascript
function sum (...args) {
	var ret = args.reduce((x, y) => x + y)
	var add = function (...args) {
		return sum(ret, ...args)
	}
	add.sumOf = function () {
		return ret
	}
	return add
}
console.log(sum(1, 2)(5)(8).sumOf())
```

#### 33.js实现一个带并发限制的异步调度器schedule，保证同时运行的任务最多有两个

```javascript
class Scheduler {
	constructor () {
		this.tasks = []
		this.usingTask = []
	}
	add (promiseCreator) {
		return new Promise(resolve => {
			promiseCreator.resolve = resolve
			if (this.usingTask.length < 2) {
				this.usingRun(promiseCreator)
			} else {
				this.tasks.push(promiseCreator)
			}
		})
	}
	usingRun (promiseCreator) {
		this.usingTask.push(promiseCreator)
		promiseCreator().then(() => {
			promiseCreator.resolve()
			this.usingMove(promiseCreator)
			if (this.tasks.length > 0) {
				this.usingRun(this.tasks.shift())
			}
		})
	}
	usingMove(promiseCreator) {
		let index = this.usingTask.findIndex(promiseCreator)
		this.usingTask.splice(index, 1)
	}
}
const timeout = (time) => new Promise(resolve => {
	setTimeout(resolve, time)
})
const scheduler = new Scheduler()
const addTask = (time, order) => {
	scheduler.add(() => timeout(time).then(() => console.log(order)))
}
addTask(400, 4) 
addTask(200, 2) 
addTask(300, 3) 
addTask(100, 1) 
```

#### 34.数组有哪写属性

+ 内置属性：length,索引
+ 自定义属性 arr.self = '123'

#### 35.js实现大数相乘

```javascript
var multiply = function(num1, num2) {
  //if(isNaN(num1) || isNaN(num2)) return '' //判断输入是不是数字
  var len1 = num1.length,
    len2 = num2.length
  var ans = []
  for (var i = len1 - 1; i >= 0; i--) {    //这里倒过来遍历很妙,不需要处理进位了
    for (var j = len2 - 1; j >= 0; j--) {
      var index1 = i + j
      var index2 = i + j + 1
      var mul = num1[i] * num2[j] + (ans[index2] || 0)
      ans[index1] = Math.floor(mul / 10) + (ans[index1] || 0)
      ans[index2] = mul % 10
    }
  }
  var result = ans.join('')
    //这里结果有可能会是多个零的情况，需要转成数字判断
    //原来写的是return +result === 0 ? '0' : result，result字符串会出现有前置0的情况，感谢评论区小伙伴@nicknice的提醒让我找到了这个错误
  return +result === 0 ? '0' : result.replace(/^0+/,'')
 
}
console.log(multiply([1, 3, 5], [2,4,5]))
```

#### 36.script标签async和defer区别

+ async、defer这两个属性使得script都不会阻塞DOM渲染。

+ defer:
  + 如果设置了该属性，则浏览器会异步下载文件，并不会影响后面得DOM渲染
  + 如果多个设置得defer得script得标签存在，则会按照顺序执行所有得script
  + defer脚本会在文件渲染完毕后，DOMContentLoaded事件调用前执行

+ async：
  + async的设置，会使得script脚本异步的加载并在与允许的情况下执行
  + asunc的执行，并不会按照script在页面中的顺序来执行，而是谁先加载谁先执行

#### 37.this的几种情况

+ 通过addEventListener绑定方法，this指向dom元素，DOM2级绑定事件div.attachEvent中this指向window
+ 普通函数执行，this指向window。严格模式下是undefined
+ 构造函数this指向构造函数的实例
+ call/apply/bind改变函数中this的指向
+ 箭头函数没有this，this是上级上下文对象

#### 38.bind实现原理

```javascript
Function.prototype.bind = function () {
  var that = this, obj = arguments[0], _args = Array.prototype.slice.call(arguments, 1)
  if (typeof that !== 'function') {
    return Error('typeError')
  }
  return function () {
    var args = Array.prototype.slice.call(arguments)
    return that.apply(obj, _args.concat(args))
  }
}
```

#### 39.数组扁平化

```javascript
function flatten (list) {
  var result = []
  list.forEach(item => {
    if (Array.isArray(item)) {
      result = [...result, ...flatten(item)]
    } else {
      result.push(item)
    }
  })
  return result
}
```

#### 40.深拷贝

```javascript
function copy(obj,appeard=new Map()) {
 if (!(obj instanceof Object)) return obj//如果是原始数据类型
    if (appeard.has(obj)) return appeard.get(obj)//如果已经出现过

    let result=Array.isArray(obj)?[]:{}
    appeard.set(obj,result)//将新对象放入map

    //遍历所有属性进行递归拷贝
    ;[...Object.keys(obj),...Object.getOwnPropertySymbols(obj)]
     .forEach(key=>result[key]=copy(obj[key],appeard))

    return result
}
```

##### `JSON.stringify`

- 只能处理纯JSON数据
- 有几种情况会发生错误
- 包含不能转成 JSON 格式的数据
- 循环引用
- undefined,NaN, -Infinity, Infinity 都会被转化成null
- **RegExp/函数**不会拷贝
- new Date()会被转成字符串

#### 41.promise原理

```javascript
function Promise (exector) {
	var self = this
	self.status = 'pending'
	self.data = undefined
	self.resolveCallbackList = []
	self.rejectCallbackList = []
	function resolve (value) {
		setTimeout(() => {
			self.status = 'resolved'
			self.data = value
			self.resolveCallbackList.forEach(fn => fn(self.data))
		}, 0)
	}
	function reject (value) {
		setTimeout(() => {
			self.status = 'rejected'
			self.data = value
			self.rejectCallbackList.forEach(fn => fn(self.data))
		}, 0)
	}
	try{
		exector(resolve, reject)
	} catch(e) {
		reject(e)
	}
}

function resolvePromise(promise2, x, resolve, reject) {
	var self = this
	var thenCalledThrow = false
	if (promise2 === x) {
		return new TypeError('')
	}
	if (x instanceof Promise) {
		if (self.status === 'pending') {
			x.then(function (v) {
				resolvePromise(promise2, v, resolve, reject)
			}, reject)
		} else {
			x.then(resolve, reject)
		}
		return
	}
	if (x != null && typeof x === 'object' || typeof x === 'function') {
		try{
			var then = x.then
			if (typeof then === 'function') {
				then.call(x, function (rs) {
					return resolvePromise(promise2, rs, resolve, reject)
				}, function (er) {
					return reject(er)
				})
			} else {
				resolve(x)
			}
		} catch(e) {
			reject(e)
		}
	} else {
		resolve(x)
	}
}

Promise.prototype.then = function (onResolve, onReject) {
	var self = this
	if (self.status === 'resolved') {
		return new Promise(function (resolve, reject) {
			try {
				var x = onResolve(self.data)
				if (x instanceof Promise) {
					x.then(resolve, reject)
				} else {
					reject(x)
				}
			} catch(e) {
				reject(e)
			}
		})
	}
	if (self.status === 'rejected') {
		return new Promise(function (resolve, reject) {
			try{
				var x = onReject(self.data)
				if (x instanceof Promise) {
					x.then(resolve, reject)
				} else {
					reject(x)
				}
			} catch(e) {
				reject(e)
			}
		})
	}
	if (self.status === 'pending') {
		return new Promise(function (resolve, reject) {
			self.resolveCallbackList.push(function (value) {
				try{
					var x = onResolve(value)
					if (x instanceof Promise) {
						x.then(resolve, reject)
					} else {
						resolve(x)
					}
				} catch(e) {
					reject(e)
				}
			})
			self.rejectCallbackList.push(function (value) {
				try{
					var x = onReject(value)
					if (x instanceof Promise) {
						x.then(resolve, reject)
					} else {
						reject(x)
					}
				} catch(e) {
					reject(e)
				}
			})
		})
	}
}
Promise.prototype.valueOf = function () {
	return this.data
}
Promise.prototype.catch = function (onReject) {
	return this.then(null, onReject)
}
Promise.prototype.finally = function (fn) {
	return this.then(function (v) {
		setTimeout(fn)
		return v
	}, function (r) {
		setTimeout(fn)
		throw r
	})
}
Promise.prototype.all = function (list) {
  return new Promise((resolve, reject) => {
    if (list.length == 0) return resolve([])
    let count, result = []
    list.forEach((promise, index) => {
      Promise.resolve(promise).then(value => {
        result[index] = value
        if (++count === list.length) resolve(result)
      }, resaon => reject(resaon))
    })
  })
}
function resolvePromise(promise2, x, resolve, reject) {
	var then
	var thenCalledThrow = false
	if (promise2 === x) {
		return reject(new TypeError('chaining cycle detected for promise'))
	}
	if (x instanceof Promise) {
		if (x.status === 'pending') {
			x.then(function (v) {
				resolvePromise(promise2, v, resolve, reject)
			}, reject)
		} else {
			x.then(resolve, reject)
		}
	}
}
```

#### 42.trim()实现

```javascript
function myTrim(str) {
  return str.replace(/(^\s+)|(\s+$)/g,'')//将前空格和后空格替换为空
}
```

#### 43.http1.1、http2和http3差异，有做什么优化

- http1.1

- 增加了keep-alive长连接
- 管线化发送请求，不用等一个请求回来再发另外一个请求
- 提供了可以指定发送长度的数据块,请求头引入了 range 头域

+ http2

- 多路复用：HTTP/2 使用多路复用技术，使用一个 TCP 连接并发处理多个请求，不但节约了开销而且可处理请求的数量也比 HTTP 1.1 大了很多.在 HTTP 1.x 中，如果客户端要想发起多个并行请求以提升性能，则必须使 用多个 TCP 连接。这种模型也会导致队首阻塞，从而造成底层 TCP 连接的效率低下。
- 数据传输：HTTP/2 采用二进制格式传输数据，而非 HTTP 1.x 的文本格式，二进制协议解析起来更高效
- 头部压缩：HTTP 1.1 不支持 Header 数据压缩，HTTP/2 使用 HPACK 算法对 Header 的数据进行压缩，使得数据传输更快
- 服务器推送（Server Push）：当对支持 HTTP/2 的服务器请求数据的时候，服务器会顺便把一些客户端需要的资源一起推送到服务器，这种方式适用于加载静态资源，节约带宽

+ http3

- 运行在 QUIC 之上的 HTTP 协议被称为 HTTP/3(HTTP-over-QUIC)
- QUIC 协议(Quick UDP Internet Connection)基于 UDP，正是看中了 UDP 的速度与效率。同时 QUIC 也整合了 TCP、TLS 和 HTTP/2 的优 点，并加以优化。
- 特点:

1. 1. 减少了握手的延迟(1-RTT 或 0-RTT)
   2. 多路复用，并且没有 TCP 的阻塞问题

+ 对首阻塞问题

- HTTP/1.1 和 HTTP/2 都存在队头阻塞问题(Head of line blocking)
- HTTP/1.1 的队头阻塞。一个 TCP 连接同时传输 10 个请求，其中第 1、2、3 个请求已被客户端接收，但第 4 个请求丢失，那么后面第 5 - 10 个请求都被阻塞，需要等第 4 个请求处理完毕才能被处理，这样 就浪费了带宽资源。
- HTTP/2 的多路复用虽然可以解决“请求”这个粒度的阻塞，但 HTTP/2 的基础 TCP 协议本身却也存在着队头阻塞的问题。
- 由于 HTTP/2 必须使用 HTTPS，而 HTTPS 使用的 TLS 协议也存在队 头阻塞问题。
- 队头阻塞会导致 HTTP/2 在更容易丢包的弱网络环境下比 HTTP/1.1 更慢。
- 那 QUIC 解决队头阻塞问题的的方法:



1. QUIC 的传输单元是 Packet，加密单元也是 Packet，整个加密、 传输、解密都基于 Packet，这样就能避免 TLS 的队头阻塞问题;
2. QUIC 基于 UDP，UDP 的数据包在接收端没有处理顺序，即使中间 丢失一个包，也不会阻塞整条连接，其他的资源会被正常处理。

#### 44.vuex相关问题

```
https://blog.csdn.net/chenqiuge1984/article/details/80129368
```

##### 1.vuex是否可以不通过mutation修改状态？

+ 在非严格模式下，可以通过vuex实例直接修改state状态，并且视图会更新，在严格模式下会报错

##### 2.vuex是否可以在mutation中通过异步方式修改state状态

+ 在非严格模式下，可以通过mutation异步修改state状态，不过会影响devtool的时间旅行，在严格模式下会报错

#### 45.mvvm

```javascript
function Vue (option) {
  this.$option = option
  var data = this._data = option.data
  observe(data)
  for (let key in data) {
    Object.defineProperty(this, key, {
      enumerable: true,
      get () {
        return this._data[key]
      },
      set (newVal) {
        this._data[key] = newVal
      }
    })
  }
  initComputed(this, option.computed)
  new Compile(this, option.el)
  
}

function Observe (data) {
  let dep = new Dep()
  for (let key in data) {
    let val = data[key]
    if(typeof val === 'object') {
      observe(val)
      continue
    }
    Object.defineProperty(data, key, {
      enumerable: true,
      get () {
        Dep.target && dep.addSub(Dep.target)
        return val
      },
      set (newVal) {
        if (newVal === val) return
        val = newVal
        console.log(`修改了${key} == ${newVal}`)
        if (typeof newVal === 'object') {
          observe(newVal)
        }
        dep.notify()
      }
    })
  }
}

function observe (data) {
  return new Observe(data)
}

function Compile (vm, el) {
  vm.$el = document.querySelector(el)
  let fragment = document.createDocumentFragment()
  while(child = vm.$el.firstChild) {
    fragment.appendChild(child)
  }
  replace(vm, fragment)
  function replace(vm, fragment) {
    Array.from(fragment.childNodes).forEach(node => {
      let text = node.textContent
      let reg = /\{\{(.*)\}\}/
      if (node.nodeType === 3 && reg.test(text)) {
        let name = reg.exec(text)[1].split('.')
        let val = vm
        name.forEach(key => {
          val = val[key]
        })
        new Watcher(vm, name, function (newVal) {
          node.textContent = text.replace(reg, newVal)
        })
        node.textContent = text.replace(reg, val)
      }
      if (node.nodeType === 1) {
        let attrs = node.attributes
        Array.from(attrs).forEach(attr => {
          if (attr.name === 'v-model') {
            new Watcher(vm, attr.value.split('.'), function (newVal) {
              node.value = newVal
            })
            let val = vm
            let exp = attr.value.split('.')
            exp.forEach(key => {
              val = val[key]
            })
            node.value = val
            node.addEventListener('input', function (e) {
              let newVal1 = e.target.value
              let z = vm
              let exp = attr.value.split('.')
              exp.forEach(k => {
                if (typeof z[k] == 'object') {
                  z = z[k]
                } else {
                  z[k] = newVal1
                }
              })
            })
          }
        })
      }
      if (node.childNodes) {
        replace(vm, node)
      }
    })
  }
  vm.$el.appendChild(fragment)
}

function Dep () {
  this.subs = []
}
Dep.prototype.addSub = function (sub) {
  this.subs.push(sub)
}
Dep.prototype.notify = function () {
  this.subs.forEach(sub => sub.update())
}

function Watcher (vm, exp, fn) {
  this.fn = fn
  this.vm = vm
  this.exp = exp
  Dep.target = this
  let val = vm
  let arr = this.exp
  arr.forEach(key => {
    val = val[key]
  })
  Dep.target = null
}
Watcher.prototype.update = function () {
  let val = this.vm
  let arr = this.exp
  arr.forEach(key => {
    val = val[key]
  })
  this.fn(val)
}

function initComputed (vm, computed) {
  Object.keys(computed).forEach(key => {
    Object.defineProperty(vm, key, {
      enumerable: true,
      get:  typeof computed[key] === 'function' ? computed[key] : computed[key].get,
      set () {}
    })
  })
}

```

#### 46.js继承的几种方式

##### 父类：

```javascript
function Anmial (name) {
    this.name = name || 'Anmial'
    this.sleep = function () {
        console.log(this.name + 'sleep')
    }
}
Anmial.prototype.eat = function (food) {
    console.log(this.name + 'eat')
}
```

##### 1.原型链继承：将父类的实例作为子类的原型

```javascript
function Cat () {}
Cat.prototype = new Anmial()
Cat.prototype.name = 'cat'

var cat = new Cat()
console.log(cat.name)
console.log(cat.eat('fish'))
console.log(cat instanceof Anmial)// true
console.log(cat instanceof Cat) // true
```

1.子类的实例也是父类的实例

2.父类新增原型方法/原型属性，子类都能访问

3.简单，易于实现

##### 2.构造继承：使用父类的构造函数增加子类实例，复制父类的实例属性给子类

```javascript
function Cat (name) {
    Animal.call(this)
    this.name = name || 'Tom'
}
var cat = new Cat()
console.log(cat.name)
console.log(cat.sleep())
console.log(cat instanceof Animal) // false
console.log(cat instanceof Cat) // true
```

1.解决了子类实例和父类实例引用属性

2.创建子类实例时，可以向父类传递参数

3.可以实现多个继承

##### 3.组合继承：通过调用父类构造，继承父类的属性并保留传参优点，然后通过父类实例作为子类愿你吸纳光，实现函数复用

```javascript
function Cat (name) {
    Animal.call(this)
    this.name = name || 'Tom'
}
Cat.prototype = new Animal()
var cat = new Cat()
console.log(cat.name)
console.log(cat.sleep())
console.log(cat instanceof Animal) // true
console.log(cat instanceif Cat) // true

```

1.可以继承实例属性/方法，也可以继承原型属性/方法

2.既是子类实例，也是父类实例

3.不存在引用属性共享

4.可传参

5/函数可以复用

#### 47.bind实现

```javascript
Function.prototype.bind = function() {
  var thatFunc = this, thatArg = arguments[0];
  var args = slice.call(arguments, 1);
  return function(){
    var funcArgs = args.concat(slice.call(arguments))
    return thatFunc.apply(thatArg, funcArgs);
  };
};
```

#### 47.1-call实现

```javascript
Function.prototype.myCall = function (context) {
  context = context ? Object(context) : window 
  context.fn = this;

  let args = [...arguments].slice(1);
  const result = context.fn(...args);
  delete context.fn;
  return result;
}
```

#### 47.2-apply

```javascript
Function.prototype.myApply = function (context) {
  context = context ? Object(context) : window;
  context.fn = this;

  let args = [...arguments][1];
  let result;
  if (args.length === 0) {
      result = context.fn();
  } else {
      result = context.fn(args);
  }
  delete context.fn;
  return result;
}
```

#### 48.虚拟列表实现

```javascript
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>简单实现虚拟列表</title>
  </head>
  <style>
    .list-view {
      height: 400px;
      overflow: auto;
      position: relative;
      border: 1px solid #aaa;
    }

    .list-view-phantom {
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      z-index: -1;
    }

    .list-view-content {
      left: 0;
      right: 0;
      top: 0;
      position: absolute;
    }

    .list-view-item {
      padding: 5px;
      color: #666;
      line-height: 30px;
      box-sizing: border-box;
    }

    [v-cloak] {
      display: none;
    }
  </style>

  <body>
    <div id="app" v-cloak>
      <div class="list-view" ref="scrollBox" @scroll="handleScroll">
        <div
          class="list-view-phantom"
          :style="{
                       height: contentHeight
                    }"
        ></div>
        <div ref="content" class="list-view-content">
          <div
            class="list-view-item"
            :style="{
                        height: itemHeight + 'px'
                      }"
            v-for="item in visibleData"
          >
            {{ item }}
          </div>
        </div>
      </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
    <script>
      new Vue({
        el: "#app",
        computed: {
          contentHeight() {
            return this.data.length * this.itemHeight + "px";
          },
        },
        mounted() {
          this.updateVisibleData();
        },
        data() {
          return {
            data: new Array(100).fill(1),
            itemHeight: 30,
            visibleData: [],
          };
        },
        methods: {
          updateVisibleData(scrollTop = 0) {
            const visibleCount = Math.ceil(
              this.$refs.scrollBox.clientHeight / this.itemHeight
            );
            const start = Math.floor(scrollTop / this.itemHeight);
            const end = start + visibleCount;
            this.visibleData = this.data.slice(start, end);
            this.$refs.content.style.webkitTransform = `translate3d(0, ${
              start * this.itemHeight
            }px, 0)`;
          },
          handleScroll() {
            const scrollTop = this.$refs.scrollBox.scrollTop;
            this.updateVisibleData(scrollTop);
          },
        },
      });
    </script>
  </body>
</html>
```

#### 49.vue-router全局路由钩子和组件路由钩子

- 全局钩子
  - beforeEach(to, from, next)
  - adterEach(route => {})

- 路由独享钩子
  - beforeEnter(to, from, next)
- 组件内的钩子
  - beforeRouteEnter(to, from, next)【不能访问this】
  - beforeRouteUpdate(to, from, next)
  - beforeRouteLeave(to, from, next)





