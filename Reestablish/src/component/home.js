import React, { Component } from 'react';   //引入React
import ReactDOM from 'react-dom';  //引入虚拟dom
import { connect } from 'react-redux';
import store from '../modle/Store';
class Home extends Component{

    constructor(props){ //初始化状态
        super(props)
        this.state={}
    }

    componentWillMount(){ //render运行之前运行一次
       console.log(this.props,'willMount') 
        store.getLogin()
    }

    render(){

        console.log(this.props,'this.props')


        return(
            <div> 这个其实还是告诉我们了一个道理,你大爷还是你大爷</div>
        )

    }

}

const mapStateToProps = state => ({   //过滤数据(数据刷新,组件刷新)
    state
})

module.exports = connect(mapStateToProps)(Home); //将state放到组件的this.pros里面去