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

## 一、webpack基础

#### 1.webpack基本结构

```javascript
// webpack.config.js
module.exports = {
    entry: {},
    output: {},
    module: {
        rules: [
            {
                test: /\.js/,
                loader: 'loader1'
            }, {
                test: /\.js/,
                loader: 'loader2',
                enforce: 'pre', // 在处理js文件的两个loader1和loader2中，先执行loader2
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index.html"
        }),
        new MiniCssExtractPlugin({
            filename: "css/[name].css"
        }),
        new OptimizeCssAssetsWebpackPlugin()
    ],
    mode: ''
}
```

#### 2.css提取( mini-css-extract-plugin )

+ 使用插件 mini-css-extract-plugin 打包时将css单独打包为css文件

```javascript
在处理css文件是，在开发环境使用style-loader，但是在打包生产环境时，使用MiniCssExtractPlugin.loader 代替 style-loader，可以将css单独打包
```

#### 3.css兼容处理（postcss）

+ postcss-loader、postcss-preset-env，在package.json中配置browserslist

```javascript
// package.json  develpoment和production是只node中process.env.NODE_ENV的值
{
  "browserslist": {
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ],
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ]
  }
}
```

#### 4.css压缩（optimize-css-assets-webpack-plugin）

- 使用插件optimize-css-assets-webpack-plugin对打包出的css进行压缩处理

#### 5.js兼容处理（babel）

+ babel-loader、@babel/perset-env、@babel/core、core-js

  1.*基本的兼容性处理 -- @babel/preset-env*：只能转换基本的语法，promise无法转换

  ```javascript
  module: {
      rules: [
          {
              test: /\.js$/,
              exclude: /node-modules/, // 不处理node-modules中的文件
              loader: 'babel-loader',
              options: {
                  presets: ['@babel/preset-env']
              }
          }
      ]
  }
  ```

  2. 全部的js兼容性处理 --> @babel/polyfill:*指向解决部分兼容性问题，但是将所有的代码全部引入，体积太大

```javascript
module: {
    rules: [
        {
            test: /\.js$/,
            exclude: /node-modules/, // 不处理node-modules中的文件
            loader: 'babel-loader',
            options: {
                presets: ['@babel/preset-env']
            }
        }
    ]
}
&&在入口文件中引入 import "@babel/polyfill"
```

3. *需要做兼容性处理：按需加载 --> core-js*

```javascript
{
    test: /\.js$/,
    exclude: /node-modules/,
    loader: 'babel-loader',
    options: {
        presets: [
            [
                '@babel/preset-env',
                {
                    // 按需加载
                    useBuiltIns: 'usage',
                    // 指定core-js版本
                    corejs: {
                        version: 3
                    },
                    // 指定兼容性做到哪个版本浏览器
                    targets: {
                        chrome: '60',
                        firefox: '60',
                        ie: '9',
                        safari: '10',
                        edge: '17'
                    }
                }
            ]
        ]
    }
}
```

#### 6.html、js压缩（html-webpack-plugin）

```javascript
// html压缩
new HtmlWebpackPlugin({
    template: './src/index.html',
    // html压缩
    minify: {
        // 移除空格
        collapseWhitespace: true,
        removeComments: true
    }
})
// js压缩 生产环境下自动压缩
mode: 'production'
```

## 二、webpack优化（开发环境）

### 优化打包速度

#### 7.HMR

```javascript
//webpack.config.js
module.exports = {
    devServer: {
        hot: true, // 开启HMR
    }
}
```

- 样式文件：可以使用HMR功能，因为style-loader实现了

- js文件：默认不能使用HMR功能，需要修改js代码，添加支持HMR功能

  ```javascript
  // print.js
  function print() {
      console.log('print111333')
  }
  export default print
  // index.js
  import print from "./print"
  print()
  // 一旦module.hot为true，表示开启了HMR功能
  if (module.hot) {
      // 监听print.js文件，一旦发生改变，就执行回调函数
      module.hot.accept("./print.js", function () {
          print()
      })
  }
  ```

- html文件：默认不能使用HMR功能，一般HTML文件不做热更新，因为html只有一个，要变都变。如果需要，在entry中以数组的方式添加上html文件

### 优化代码调试

#### 8.（source-map）

- *[inline-|hidden-|eval-]\[nosource-\][cheap-[module-]]source-map*

```javascript
//webpack.config.js
module.exports = {
    devtool: 'source-map'
}
```

## 三、webpack优化（生产环境优化）

### 优化打包速度

#### 9.oneOf

- oneOf打包时一个文件只匹配一次，遇到匹配的文件时，不会再寻找其他loader，加快编译速度，如果存在其他loader处理相同文件，写在oneOf外面

```javascript
// webpack.config.js
module.exports = {
    rules: [
        {
            test: /\.js$/,
            loader: ''
        }, {
            oneOf: [
                {
                    test: /\.js$/,
                    loader: ''
                }, {
                    test: /\.css$/,
                    loader: ''
                }
            ]
        }
    ]
}
```

#### 10.babel缓存（第二次打包的速度更快）

```javascript
// webpack.config.js
module.exports = {
    module: {
        rules: [
            {
                test: /\.js/,
                exclude: /node-modules/,
                loader: 'babel-loader',
                options: {
                    // 开启babel缓存，编译时只针对修改的文件进行编译（生产环境）（开发环境有HMR）
                    cacheDirectory: true
                }
            }
        ]
    }
}
```

#### 11.多进程打包（thread-loader）针对babel

```javascript
module.exports = {
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node-modules/,
                use: [
                  /**
                   * 开启多进程打包：thread-loader。
                   * 进行启动大概需要消耗600毫秒，进程通讯也有开销
                   * 只有工作耗时时间比较长，才需要多进程打包
                   */
                    {
                        loader: 'thread-loader',
                        options: {
                            workers: 2 // 两个进程
                        }
                    }, {
                        loader: 'babel-loader',
                        options: {
                            preset: [
                                [
                                    '@babel/preset-env'
                                ]
                            ]
                        }
                    }
                ]
            }
        ]
    }
}
```

#### 12.externals(不打包)

- 通过配置externals，配置的模块不进行打包,然后需要在html中引入cdn的链接

```javascript
// webpack.config.js
module.exports = {
    externals: {
        jquery: 'jQuery'
    }
}
```

#### 13.dll(将公共模块再拆分开来打包)（也可以增加运行的速度，多个文件一起请求）

- 使用dll，对某个第三方库进行单独打包（jquery、react、vue）
- 当运行webpack时，默认查找webpack.config.js配置文件
- 所以需要修改命令 webpack --config webpack.dll.js

```javascript
// webpack.dll.js
const { resolve } = require('path')
const webpack = require('webpack')
module.exports = {
    entry: {
        // 最终打包生成的[name] --> jquery
        // ['jquery] --> 要打包的库是jquery
        jquery: ['jQuery']
    },
    output: {
        filename: '[name].js',
        path: resolve(__dirname, "dll"),
        library: '[name]_[hash]', // 打包的库里面向外暴漏出去的内容的名字
    },
    plugins: [
        // 打包生成一个manifest.json --> 提供和juqery映射
        new webpack.DllPlugin({
            name: '[name]_[hash]', // 映射库的暴漏的内容名称
            path: resolve(__dirname, "dll/manifest.json"), // 输出文件路径
        })
    ],
    mode: 'production'
}
```

```javascript
// webpack.config.js
const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const AddAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin')
process.env.NODE_ENV = 'production' // 决定browerslist使用哪个环境

module.exports = {
  entry: './src/js/index.js',
  output: {
    filename: 'js/built.js',
    path: resolve(__dirname, "build")
  },
  module: {
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    // 告诉webpack哪写库不参与打包，同时使用时的名称也得改变
    new webpack.DllReferencePlugin({
      manifest: resolve(__dirname, "dll/manifest.json")
    }),
    // 将某个文件打包输出出去，并在html中自动引入该资源
    new AddAssetHtmlWebpackPlugin({
      filepath: resolve(__dirname, "dll/jquery.js")
    })
  ],
  /**
   * 可以将node_modules中的代码单独打包一份chunk最终输出
   * 自动分析多入口的chunk中，有没有公共的文件。如果有会打包成单独的chunk。
   * 但入口也会把node_modules中的代码单独打包一份
   */
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  // production自动压缩js
  mode: 'development',
  externals: {
    // 拒绝jQuery包被打包进来
    jquery: 'jQuery'
  }
}
```

### 优化打包运行的性能

#### 14.文件资源缓存（hash-chunkhash-contenthash）

- hash: 每次webpack打包构建时会生产的一个hash值
  - 因为js和css使用同一个hash，只改动一个文件，所有的文件缓存失效

- chunkhash: 根据chunk生成hash值。如果打包来源与同一个chunk，那么hash值就会一样
  - js和css的hash还是一样，因为css是在js引入的，始于同一个chunk

- contenthash: 根据文件内容生成的hash，所以每个文件生成的hash值不一样，文件内容不变，文件名就不会改变

#### 15.tree shaking（es6 + production自动启用插件）

- 前提：
  - 1.必须使用ES模块化
  - 2.开发production环境（webpack：mode）会将js种的export出的方法，但是没有被使用的，不被打包，减少打包体积

- 副作用：会把 import "@babel/polyfill"类似这种忽略打包。解决方案:

  ```javascript
  // package.json
  "sideEffects":false // 所有的代码都没有副作用，都可以进行tree shaking
  // 可能会把 css / @babel/polyfill 文件干掉
  "sideEffects": ["*.css", ".less"] // 把css标记为不被tree shaking
  ```

#### 16.code split

```javascript
1. 配置多入口
2. 配置多入口
// package.json
/**
   * 可以将node_modules中的代码单独打包一份chunk最终输出
   * 自动分析多入口的chunk中，有没有公共的文件。如果有会打包成单独的chunk。
   * 但入口也会把node_modules中的代码单独打包一份
   */
optimization: {
    splitChunks: {
        chunks: 'all'
    }
},
3.通过代码（import动态导入），将某个文件单独打包成chunk
```

#### 17.懒加载/预加载（兼容性差）

```javascript
document.getElementById('btn').onclick = function () {
    // import导入，这样就懒加载了
    // 预加载：webpackPrefetch: true，会在使用前，提前加载js文件（兼容性差，慎用）
    /*
    	-- 正常加载可以认为是并行加载（同一时间加载多个文件）
    	-- 预加载：等待其他资源加载完毕，浏览器空闲了再偷偷加载资源
    */
    import(/* webpackChunkName: 'test', webpackPrefetch: true */ "./test").then({mul} => {
        console.log(mul())
    })
}
```

#### 18.PWA（兼容性差）

- PWA：渐进式网络开发应用程序（离线可访问）
  - workbox --> workbox-webpack-plugin

```javascript
new WorkboxWebpackOlugin.GenerateSW({
    /*
    	1.帮助seriveWorker快速启动
    	2.删除旧的serviceworker
    */
    clientsClaim: true,
    skipWaiting: true
})
```

## 四、webpack结构详解

#### 1.entry

```javascript
module.exports = {
    entry:
}
/*
	1.string --> "./src/index.js"
		打包形成一个chunk，输出一个bundle文件
		此时chunk的名称默认时main
	2.array --> ['./src/index.js', './src/add.js']
		多入口
		所有入口文件最终形成一个chunk，输出出去的只有一个bundle文件
		-- 一般用于在HMR功能中使html文件热更新
	3.object --> {key: value, key: value}
		多入口
		有几个入口文件就形成几个chunk，输出一个bundle文件
		此时chunk的名称是key值
	4.特殊用法：
		{
			index: ['./src/index.js', './src/add.js'],
			add: './src/add.js'
		}
**/
```

#### 2.output

```javascript
// webpack.config.js
module.exports = {
    // 文件名称(指定名称+目录)
    filename: '[name].js',
    // 输出文件目录（将来左右资源输出的公共目录）
    path: path.resolve(__dirname, "build"),
    // 所有资源引入的公共路径 --> path的前面（一般用于生产环境）
    pubicPath: '/',
    // 非入口chunk的名称
    chunkFilename: 'js/[name]_chunk.js',
    // 全局整个库向外暴漏的变量名
    library: '[name]',
    // 变量名添加到哪个上 浏览器
    libraryTarget: 'window' | 'global' | 'commonjs'
}
```

#### 3.module

```javascript
//webpack.config.js
module.exports = {
    module: {
        rules: [
            {
                test: /\.js$/,
                // 排除node_modules
                exclude: /node_modules/,
                // 只检查src下的js文件
                include: resolve(__dirname, 'src'),
                // 优先执行
                enfore: 'pre',
                // 延后执行
                enfore: 'post',
                // 单个loader
                loader: '',
                options: {}
            }
        ]
    }
}
```

#### 4.resolve

```javascript
//webpack.config.js
module.exports = {
    // 配置解析模块的路径别名；优点：简写路径、缺点：路径没有提示
    alias: {
        $css: resolve(__dirname, 'src')
    },
    // 配置省略文件路径的后缀名
    extensions: ['.js', '.json', '.css'],
    // 告诉webpack 解析模块是去哪里目录找
    modules: [resolve(__dirname, '../../node_modules'), 'node_modules']
}
```

#### 5.devServer

```javascript
// webpack.config.js
module.exports = {
    devServer: {
        // 构建项目后的路径
        contentBase: resolve(__dirname, 'build'),
        // 监视contentBase 目录下的所有文件，一旦文件发生变化就会reload
        watchContentBase: true,
        watchOptions: {
            // 忽略文件
            ignore: /node_modules/
        },
        // 启动gzip压缩
        compress: true,
        // 端口
        port: 3000,
        // 自动打开浏览器
        open: true,
        // 域名
        host: 'localhost',
        // 开启HMR
        hot: true,
        // 不要显示启动服务器日志信息
        clientLogLevel: 'none',
        // 除了一些基本信息以外，其他内容不要显示
        quiet: true,
        // 如果出错，不要全屏提示
        overlay: false,
        // 服务器代理
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                // 发送请求时，请求路径会重写，将/api/xxx --> /xxx(去掉/api)
                pathRewrite: {
                    '^/api': ''
                }
            }
        }
    }
}
```

#### 6.optimization(针对生产环境)

```javascript
// webpack.config.js
module.exports = {
    optimization: {
        splitChunks: {
            chunks: 'all',
            // 一下均为默认配置，可以不写
            minSize: 30 * 1024, // 分隔的chunk最小为30KB
            maxSize: 0, // 最大不限制
            minChunks: 1, // 要提取的chunk最少被引用一次
            maxAsyncRequests: 5, // 按需加载时并行加载的文件最大数量
            maxInitialRequests: 3, // 入口js文件最大并行请求数量
            automaticNameDelimiter: '~', // 名称连接符
            name: true, // 可以使用命名规则
            cacheGroups: { // 分割chunk的组
                // node_modules 文件会被打包到vendors 组的chunk中 -- vendors.XX.js
                // 满足上面的公共规则，如大小要超过30kb，至少引用一次
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    // 打包优先级
                    priority: -10
                },
                default: {
                    // 要提取的chunk最少被引用两次
                    minChunks: 2,
                    // 优先级
                    priority: -20,
                    // 如果当前要打包的模块，和之前已经被提取的模块时同一个，就会复用而不是重新打包
                    reuseExistingChunk: true
                }
            }
        },
        // 将当前模块的记录其他模块的hash单独打包为一个文件runtime
        // 解决：修改a文件导致b文件的contenthash变化
        runtimeChunk: {
            name: entrypoint => `runtime-${entrypoint.name}`
        },
        minimizer: [
            // 配置生产环境的压缩方案：js和css  webpack 4.26以上版本使用terser做的压缩
            new TerserWebpackPlugin({
                // 开启缓存
                cache: true,
                // 开启多进程打包
                parallel: true,
                // 启用sourece-map
                soureceMap: true
            })
        ]
    }
}
```

