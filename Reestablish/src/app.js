//react 入口文件
//但是我的交换没有其他的说法也就是好其他的都全部都没有
import React from 'react';    
import ReactDOM from 'react-dom';  

//但是为什么弄不了这个玩意呢,这是个问题啊

//应该所有的东西都是在一个区域里面来负责的吧,这个才是全部的物件的吧

//你要自己正确的认知到这个问题的严重性

//其实我是这么一个异地的人在这里进行面试

class App extends React.Component{
    constructor(props){   //初始化状态
        super(props)
        this.state={}
    }
    render(){
        return(<div>heoll world</div>)
    }
}

ReactDOM.render(<App/>,document.getElementById('app'));  //将主文件与之前的进行连接(这个才会是关键)
