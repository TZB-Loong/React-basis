//登录的Action,用来获取到登录的信息

import * as  types from '../modle/actionTypes';
import request from '../modle/request';
import {createAction} from 'redux-actions';



// console.log('request.get',request.get)
function getLogin(){  
    //在使用代理之后,就可以解决跨域请求的问题,这个大家都是需要理解的
   //年终的问题也就是现在的问题了,其实不用这个明确的来了解这个事情,也就是现在就是你的忌日而不是你的生日
   //以前看上去觉得很提气的事,现在觉得没有一点劲,以前觉得很厉害的事,现在觉得也不过如此了,嘿嘿
   //以前很厉害的事,现在觉得其实也不会很厉害的啊,我还是以为我们要好好的了解这个事情,其实不会烦的,也就是那样了
    return request.get('/php_oprea/userApi.php',null,(data)=>{
            console.log(data,'----data---')
            if(data.ok){
                console.log(data.data,'data-data')
                return{
                    data:data.data
                }
            }
            // data.ok?dispatch(getSpreadSuccess(data.data)):null
    },(error)=>{
        
        //怎么老是一样的呢,这个问题,和这个不是很简单就了解的事情了吗

        console.log('ay');
        console.log(error);
    })

    // return request.get(' http://api.zhuishushenqi.com/recommendPage/node/books/all/57832d0fbe9f970e3dc4270c?ajax=ajax&st=1&size=10',true)
  }

//可以在执行后调用一个callback

const  getLogin_data = createAction(types.LOGIN,getLogin);

// export modules = 
module.exports = getLogin_data;