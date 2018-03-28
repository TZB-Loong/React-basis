import React from 'react';   //引入React
import ReactDOM from 'react-dom';  //引入虚拟dom
import store from './modle/Store'
import {Provider} from 'react-redux';
import Home from './component/home';

//Provider  用来连接组件与store  其原理就是react 中的context属性 (包裹在App下面,这样的话,整个组件就能拿到所有的state
//react-redux  就是自动生成容器组件的代码(包括异步什么的)



class App extends React.Component {  // App组件作为整个程序的 唯一入口
  
    render() {
        return (
            <Provider store={store} >
            <Home/>
          </Provider>
        );
    }
}


ReactDOM.render(<App/>, document.getElementById('root'));