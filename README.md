# ounce-minivue
使用JavaScript编写的个人minivue，通过模仿vue3源码逻辑实现reactivity、runtime和compiler三大模块中的核心逻辑，略过边缘case，旨在通过这种方式提升自己对于vue3框架核心的理解
## reactivity
- reactive
- isReactive
- reactive嵌套转换
- 返回 runner
- scheduler
- stop&onStop
- isReadonly
- readonly嵌套转换
- ref
- isRef
- unRef
- proxyRefs
- shallowReadonly
- isProxy
- computed
## runtime
- 组件和elment的初始化
- 组件代理对象
- shapeFlags
- 注册事件
- 组件props
- 组件emit
- 组件slots
- Fragment和Text类型节点
- getCurrentInstance
- provide&inject
- custom renderer
- 初始化elment更新
- 更新props
- 更新children
- 双端对比算法
- 更新组件
- nextRick
## compiler
- 解析插值
- 解析elment
- 解析text
- 解析三种联合类型
- transform
- codegen生成text
- codegen生成插值
- codegen生成element
- template编译为render
