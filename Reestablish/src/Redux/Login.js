//是通过别人的代码进行研究得来的
//这里就是想对应的redux   

/*一个redux 的标准就是
action.type 就是用来判断action的类型//这个也可以传进来的,这个
object.assgin() 是将多个对象进行合并 //用来造成多个数组进行嵌套的局面 


{} //是state里面初始化的内容可以是很多的数组  那么这个就看action 里面怎么定义的了

 export default function Login(state={},action){
'
    switch(action.type){
        case types.Dis..:
        return object.assgin({},state,{
            isLoading:action.isLoading
        })
        case types.ss:
        return objecct.assign({},state,{
            isLoading:action.isLoading
            male:action.male
        })   
    }

}


*/

import * as types from '../modle/actionTypes';  //把所有的action的名称全部引入后来开始进行对比

const initialState = {  //初始化 state里面的内容 //这个是可以根据需求来进行改变的,这个都是多变的,兄弟
    isLoading: false,
    Login: []
}

//里面的isloading 还需要我们进行修改

//action 是一个对象

// function Login(state=initialState,action={}) {
//     switch (action.type) {
//         case types.LOGIN:
//             return object.assgin({}, state, {})
//             break;
//         default:
//             return state;
//     }
// }

// module.exports = Login

export default function Login(state=initialState,action={}){  
    //当然在页面应用这一块,其实我们本身就可以不用再发新的action,其实在导航里面都已发过了
    //这个是当前数据的逻辑处理问题都在里面呢
     switch (action.type) {
       case types.LOGIN:
         var ostate = { ...state }; //复制好当前要获取的数据;
         console.log(ostate,'ostate-ostate')
         return Object.assign(
           {}, state, {
             list: action.payload
           }
         )
       default:
         return state;
     }
   }








