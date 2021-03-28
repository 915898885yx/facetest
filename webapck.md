#### webpack基本模块原理

```javascript
(function (modules) {
    var installModule = {}
    function require(moduleId) {
        if (installModule[moduleId]) {
            return installModule[moduleId]
        }
        var module = installModule[moduleId] = {
            i: moduleId,
            export: {}
        }
        modules[moduleId].call(module.export, module, require)
        return module.export
    }
    return require(0)
})
([
    function (module, require) {
        var name = require(1)
        function consoleName () {
            console.log(name)
        }
        consoleName()
    },
    function (module, require) {
        var name = '123'
        module.export = name
    }
])
```

#### 1.webpack5个核心概念

- Entry
- Output
- Loader
- Plugins
- Mode