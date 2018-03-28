import { Component } from 'react';
//import { Dropdown, Button, Icon, Menu,Popover } from 'antd';
import {store, triggers, apps} from '../midware';
import {isfalse,_globals} from '../utils';
import {registryWidget} from './_widgets';
import {Menu} from 'antd';
import PropTypes from 'prop-types';
// import { Component } from './C:/Users/Administrator/AppData/Local/Microsoft/TypeScript/2.6/node_modules/@types/react';
//全局状态中保存菜单加载状态menus.state,0未加载,1正在加载,2已加载,9加载失败
let menusState = _globals.getDefault('menus.state', 0);
// const Menu = antd.Menu;

const getMenus = function (menuArray) {
    var icon,smn;
    return menuArray.map(menu =>{
        var mid = menu.action ? menu.action+','+menu.id : ',0,'+menu.id;        
        if (menu.children.length) {
            return (
                <Menu.SubMenu key={mid} title={menu.name}  >
                {getMenus(menu.children)}
                </Menu.SubMenu>
            )
        }
        return <Menu.Item key={mid}>{menu.name}</Menu.Item>
    });
}

//把这个组件变成状态组件


class SyMenu extends Component{
    constructor(props){
        super(props)
        this.state={}
    }


    componentWillMount(){  //不用去修改原本的形态
        //这个跳转的部分也能放在 AppRoot componentWillMount 里面去执行
        //render 渲染之前,执行一次
        console.log(this.props,'this.SyMun');
            
        //修改history  的部分就放在loadApp 里面去运行了,这个才是重点
        
        //不用太修改 syMenu 的部分,我在这天寒地冻的日子里,默默的向着前面开始前进,你真的不怕失去我的吗?

        // if(!isfalse(this.props.kargs.actionId)){
           
            
        //     apps.createApp('action', 1, {actionId:this.props.kargs.actionId,view:'tree'});

        // }

    }

    render(){

        var {menus,handleClick,kargs} = this.props

        if (_globals.get('menus.state') == 0) {
            _globals.set('menus.state', 1)
            store.call_kw('ir.ui.menu','load_siyue_menus','loadMenu',{args:[[0,true]]});
        } else if (!isfalse(menus.menus)){
    
        }
        const menuItems = getMenus(menus.menus);
            // console.log('this.kargs',kargs)
    
    
        const onMenuClick = function(evt){
             //loadApp 才是重点(打开的重点  所有的参数都能传到loadApp里面然后交给systate进行处理)
             //要点击的时候进行过滤,当为开发的状态下呢,浏览器的变化是不会变得
            // 点击之后的呢,是怎么处理的呢

            //默认输出的全部都是这个,或者说不是这个

            var [atype, aid, mid] = evt.key.split(',');
            console.log('evt,key',evt.key,atype,aid,mid);
            console.log('actionId',aid);
            if (aid!='0'){
                apps.createApp('action', apps.activeAppId, {actionId:aid})
                //    window.history.pushState(document.location.href,'title','?actionId='+aid+'&view=tree'+'&id=1');
                {handleClick()}
            }
        }
        return (
            <Menu 
            onClick={onMenuClick}
            style={{ width: 240 }}
            mode="inline">
            {menuItems}
            </Menu>
        );
    }
}



/*
const SyMenu = ({menus,handleClick,kargs}) => {
    if (_globals.get('menus.state') == 0) {
        _globals.set('menus.state', 1)
        store.call_kw('ir.ui.menu','load_siyue_menus','loadMenu',{args:[[0,true]]});
    } else if (!isfalse(menus.menus)){

    }
    const menuItems = getMenus(menus.menus);
        console.log('this.kargs',kargs)


    const onMenuClick = function(evt){ 
        var [atype, aid, mid] = evt.key.split(',');
        console.log('actionId',aid)
        if (aid!='0'){
            apps.createApp('action', apps.activeAppId, {actionId:aid})
            {handleClick()}
        }
    }
    return (
        <Menu 
        onClick={onMenuClick}
        style={{ width: 240 }}
        mode="inline">
        {menuItems}
        </Menu>
    );
};
*/

SyMenu.propTypes = {
    menus: PropTypes.object,
    error: PropTypes.object,
    kargs:PropTypes.object
};

registryWidget(SyMenu);
export default SyMenu;
