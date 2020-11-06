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

###### 2.是相同节点，要尽可能的做节点的复用

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