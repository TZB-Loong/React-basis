/**
 * Created by hongmei on 2017/6/29.
 */

import { Menu,Button} from 'antd';
import SyMenu from './SyMenu';
import React, { Component} from 'react';
import PropTypes, { func } from 'prop-types';
import {isfalse} from '../utils';
import { render } from 'react-dom';
import {registryFormWidget,registryWidget} from './_widgets';
import {triggers, store,apps} from '../midware';
import './UserInfo.css' ;
import lcs from '../utils/localStore';

const SubMenu = Menu.SubMenu;


class UserInfo extends Component{
    constructor(props){
        super(props);
        this.state = {
            isShow:false,
            Loading:false,
            
        }
    }

    
    //绑定鼠标单击左键事件(把事件绑定在body下面)
    //不仅是要服从,是要无条件服从,这个才是正确的相处机会,你们要明白这个道理的,兄弟
    componentWillMount() {
         //render之前执行一次,最后一次修改state的机会

        //我们要大气一点,要把眼光看得远一点,这才是一个人本来该有的事情
        //其实你们要明白这一点哟,兄弟
        //我这里有个注册表示已经注册的,那么也就是说,其实我是要下载sdk的既然前面我是使用这个的
        //我也就是可以再次使用这个的,你们说的对吗?


        var e = document.getElementsByTagName('body')[0];
        
        e.addEventListener('click',this._leftMouse) //把一个点击事件帮定到body
        //页面的自动跳转发生在导入之后而不是在导入之前,这个才是比较现实的
        console.log(isfalse(this.props.kargs.dev))
        if(isfalse(this.props.kargs.dev)){ //当前在非开发状态下打开 
                console.log('this.props.kargs',this.props.kargs)
            if (!isfalse(this.props.kargs.actionId)) {
                // console.log('this.props.kargs.currentView', this.props.kargs.view)
                apps.createApp('action', 1, {
                    actionId: this.props.kargs.actionId, view: this.props.kargs.view
                    , res_id: this.props.kargs.res_id
                });
            }
            // }else{
            //     var record = lcs.getObject('record')
            //     if(!isfalse(record)){
            //         apps.createApp('action',1,{
            //             actionId:record.actionId,
            //             view:record.view,
            //             res_id:record.res_id
            //         })
            //     }
            // }

        }
    }
    
    _leftMouse = (event)=>{ 
        
        var e = event|| window.event || arguments.callee.caller.arguments[0];

        var classNameAy = document.getElementsByClassName('siyue-menu-bar')[0]
     
        //判断所点击的位置是否为目标区域或者目标区域的后代元素

        if(this.isDescendant(classNameAy,e.target)==false){
            this.setState({
                isShow:false
            })
        }
    }
    
    isDescendant = ( targetNode,judgeNode)=>{ //判断点击的元素是否为目标区域或者目标区域的后代元素
        
    /*
    |tagetNode|judgeNode
    |判断的区域Node|点击获取到的Node
    */
        var node = judgeNode.parentNode;

        if(targetNode == judgeNode){
            return true
        }else{
            while (node != null) {
                if (node == targetNode) {
                    return true;
                }
                node = node.parentNode;    // If node = window, then node.parentNode will return null.
            }
            return false;
        }
    }



    render(){
        var {session,state,kargs} = this.props;
        var self = this;
        if (isfalse(state.userlogin.useInfo) &&self.state.Loading == false){
            self.setState({
                Loading:!self.state.Loading
            })
            store.call_kw('res.users','read','userInfoLoad',{args:[[session.uid],["name", "login", "lang", "login_date"]]});
        } else if (!isfalse(state.userlogin.useInfo)){
            console.log('获取数据错误')
        }
        //BUG:1.用户注销再登录，在未返回userInfo时出错，
        //BUG:2.在返回userInfo后，组件没法更新userInfo数据，原因是使用了全局的loading状态

    

        var field = state.userlogin.userInfo;
        var getSpan = function () {
            return  field ? field.map((item,i)=>{
                return  <span key={i}> {item.name}</span>
            }) : <span/>;
        };

        var handleClick = function () {
            self.setState({isShow:!self.state.isShow}); 
            //在开始进行数据读取的时候,首先获取一次比较
            console.log(document.location.href);
            
            // window.history.pushState(document.location.href,'title','?userInfo');
            // console.log(window.location.hostname,window.location.ancestorOrigins,window.location);
            
        };
        var backCLick = function () {
            triggers.SysLogout.pull();
        };
      
        return(
            <div className='siyue-userInfo'  >    
            <Button onClick={handleClick} className='siyue-menu'>菜单</Button>
            <span>{getSpan()}</span>
            <Button style={{border:0}} onClick={backCLick} className='siyue-back'>退出</Button>
            <div style={{display:this.state.isShow?'block':'none',width:'100%', height: '100%'}} className='siyue-main-menu-wrap'>
            <SyMenu menus={state.menus} state={state} handleClick={handleClick} kargs={kargs} />
            </div>
            </div>
        );
    }
};


UserInfo.propTypes = {
    session: PropTypes.object,
    state:PropTypes.object,
    error: PropTypes.object,
};

registryFormWidget(UserInfo);
export default UserInfo;
