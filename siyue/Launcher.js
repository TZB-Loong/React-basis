// import { PropTypes } from 'react';
import PropTypes from 'prop-types';
// import {connect } from 'dva';

/*
   var {store,triggers} = SiYue.midware; //.store
   var utils = SiYue.utils
   var UserLogin = SiYue.Widgets.UserLogin;
   var AppRoot = SiYue.Widgets.AppRoot;
 */

import {store,triggers} from './midware'; //.store
import utils from './utils';
import {UserLogin, AppRoot} from './widgets';
import antd,{notification} from 'antd';

/*
   本文件属于“思悦ERP项目”软件组成内容，相关权利属于深圳市莱克斯瑞智能家居有限公司所有，
   并受中华人民共和国和相关国际版权条约、法律、法规，以及其它知识产权法律和条约的保护。
   具体权利声明请看“版权声明”或http://www.siyue.it/copyright。

   copyright 深圳市莱克斯瑞智能家居有限公司 2017
 */

const connect = dvalib.connect;
var kargs=utils.url2params(window.location.search.substr(1));
console.log(kargs,'kargs')
if (kargs.dev==1){
    //这个是浏览器url后面的参数,兄弟
    //这个并不能代表着什么的,其实


}
const Launcher = ({children, location, dispatch,SyState}) => {
  
    var base = SyState;
    store.bind(dispatch,base);
  if (base.session.state==-8){
    //网页刚打开状态，尝试会话恢复
    //检查localStorage是否保存会话信息
      //dispatch({type:'base/sessionLoad'});
      triggers.SessionLoad.pull()
  } else if (base.session.state == -7){
    //从服务器恢复会话
    var data ={rpc:1, csrf_token: base.session.csrf_token, redirect: '', db:base.session.db};
   
      //dispatch({type:'base/init', payload:data});
      triggers.SysInit.pull(data);
  }
    //console.log('error check', base.error);
    // console.log('antd',antd)
    if (base.error.message && utils.isfalse(base.error.type) && utils.isfalse(base.error.target)) {
        notification.error({
            message: '错误',
            description: base.error.message,
            onClose:function(){
                triggers.ErrorTips.pull({});
            }
        });
        triggers.ErrorTips.pull({});
    }    
    const islogin = base.session.state===9;
    var kargs = utils.url2params(window.location.search.substr(1));
    return (
        <div style={{height:'100%'}}>
        {islogin ? <AppRoot dispatch={dispatch} state={base} kargs={kargs}/> :<UserLogin dispatch={dispatch}  userlogin={base.userlogin} session={base.session} error={base.error}/>}
        </div>
    )

    //  return (
    //     <div style={{height:'100%'}}>
    //         div
    //     </div>
    // )
}

Launcher.propTypes = {
    children: PropTypes.object, //element.isRequired,
    location: PropTypes.object,
    dispatch: PropTypes.func,
    SyState:PropTypes.object
}

export default connect(({ SyState }) => ({ SyState }))(Launcher)

//function mapStateToProps(state) {
  //console.log('map state ',state);
  //  return { ...state };
//}


//export default connect()(MyApp);
//export default connect(mapStateToProps )(MyApp);
//export default connect(({ systate }) => ({ systate }))(Launcher)
//export default connect(mapStateToProps )(Launcher);
