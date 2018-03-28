
//现在的思路是这样,先新建一个来进行测试,然后后再把前面已经打包好的东西添加到这里面来

//我们先试下这个会不会有问题,然后后面的在说咯

//配置webpack的文件,添加各种的webpack的一些作用

//控制webpack的各种行为,有三种途径
/*{
    cli-即命令形式,一般都会动过package.json中写入script字段的形式
    在配置文件webpack.config.js里面写入字段,在webpack启动时会读取它
    node api
} */
var path = require('path');
var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin');
//var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {

    entry:path.join(__dirname,'/src/index.js'), //打包文件的唯一入口 //__dirname是运行当前的js所在目录
    output:{
        path:path.join(__dirname,'/build'), //文件打包后的出口(存放的位置)
        filename:'build.js',  //文件打包后输出文件的文件名
        publicPath:'/', //启动本地服务后的根目录 (也即是执行当前目录下的index.html,兄弟)

    },
     module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
          loader: 'babel-loader',
          options: {
              presets: ['env','es2015', 'stage-0', 'react'],
              plugins: ['transform-runtime']
                      //,['import', {libraryName: 'antd',style: 'css'}]
          }
          },
            {
          test: /\.css$/,
          use: [ 'style-loader', 'css-loader' ]
            },
            {
          test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
          loader: 'url-loader',
          options: {
            limit: 10000
          }
            }	    
        ]
      },
      externals: { 
         //把一些东西单独打包 (这些内容是要在外部引入的内容 规定这些是不会集成打包在一起的
        // antd: 'antd',
        // react: 'React',
        // 'react-dom': 'ReactDOM',
        // dva:'dva'
      },
      resolve:{
          extensions: ['.js', '.jsx', '.less', '.png', '.png'],
      },
      plugins: [
          //new webpack.optimize.CommonsChunkPlugin({
          //name: 'vendor',
          //filename: 'vendor.min.js',
          //}),
          new ExtractTextPlugin({
            filename: 'build.min.css',
        allChunks: true,
          }),	
      new CopyWebpackPlugin(),
          new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      new webpack.HotModuleReplacementPlugin()
      ]    ,
      devServer: {
        port:8088,   //设置监听端口
        contentBase:'./build', //本地服务器 所加载的页面所在目录
        // colors:true,  //终端输出结果为彩色的
        historyApiFallback:true,// 不跳转,用于单页面开发应用
        inline:true, //实时刷新
        hot:true, //启用webpack 的模块热替换特性
      //hotOnly: true,
        proxy:{   //代理也是有问题
          '/php_oprea/userApi.php':{
            'target':'http://127.0.0.1',
            'changeOrigin':true
          }
        }
        //   proxy: {
        //     "/web/login": {
        //     "target": "http://localhost:8069",
        //     "changeOrigin": true
        //    },
        //     "/web/database/selector": {
        //     "target": "http://localhost:8069",
        //     "changeOrigin": true
        //    }   ,
        //     "/web/session/logout": {
        //     "target": "http://localhost:8069/web/session/logout",
        //     "changeOrigin": true,
        //     "pathRewrite": { "^/web/session/logout" : "" }
        //    }    ,
        //     "/web/dataset/**": {
        //     "target": "http://localhost:8069",
        //     "changeOrigin": true
        //    },
        //     "/web/action/**": {
        //     "target": "http://localhost:8069",
        //     "changeOrigin": true 
        //    },
        //     "/siyue/static/**": {
        //     "target": "http://localhost:8069",
        //     "changeOrigin": true
        //    }
        //  }
      },	

}