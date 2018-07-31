//登录的Action,用来获取到登录的信息

import * as  types from '../modle/actionTypes';
import request from '../modle/request';
import {createAction} from 'redux-actions';



// console.log('request.get',request.get)
function getLogin(){  
    //在使用代理之后,就可以解决跨域请求的问题,这个大家都是需要理解的
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
    

        console.log('ay');
        console.log(error);
    })

    // return request.get(' http://api.zhuishushenqi.com/recommendPage/node/books/all/57832d0fbe9f970e3dc4270c?ajax=ajax&st=1&size=10',true)
  }

//可以在执行后调用一个callback

const  getLogin_data = createAction(types.LOGIN,getLogin);

// export modules = 
module.exports = getLogin_data;