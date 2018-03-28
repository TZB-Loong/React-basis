
//将所有的redux 全部引入当前的位置
//可以把一个Action直接的写到一个组件里面去.这样子也是可以获取到
//当时分开来实现action 的话,这样子的代码结构就比较容易


import Login from './Login';

console.log(typeof(Login),'typeof')


export{
    Login
}



// const rootReducer = combineReducers({  //把所有的redux集成一个(在有多个redux的时候)
//     Login
// })

// export default rootReducer





