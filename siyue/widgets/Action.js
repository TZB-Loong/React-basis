/*
   本文件属于“思悦ERP”软件组成内容，相关权利属于深圳市莱克斯瑞智能家居有限公司所有，
   并受中华人民共和国和相关国际版权条约、法律、法规，以及其它知识产权法律和条约的保护。
   具体权利声明请看“版权声明”或http://www.siyue.it/copyright。

   copyright 深圳市莱克斯瑞智能家居有限公司 2017
 */
import React, { Component} from 'react';
import PropTypes from 'prop-types';
import {registryWidget,Null} from './_widgets';
import {store,triggers,apps} from '../midware';
import {srequest,isfalse} from '../utils';
import {notification } from 'antd'

const Action = ({type, rootAppId, pane, props, binds }) => {
    /*# Action Action组件
       Action组件主要用于定义响应鼠标点击,打开ir.action定义的action内容或打开指定视图，它可以放在界面的任意位置，点击后就可以打开定义动作。action不定义界面元素，由pane属性定义。

       # 参数
       
       |---|---|---|---|---|
       |名称|类型|说明|默认值|是否必须|
       |type|字符串|action类型,具体看"type参数定义"|无|是|
       |rootAppId|数字|actiion所在页签app的id|无|是|
       |pane|字符串/方法|显示内容的string/组件/html无|是|
       |props|对象|执行相应action所需的参数，type不同要求的props参数不一样|无|否|
       |binds|对象|应用事件绑定回调函数|否|否|
       
       # type参数定义

       |----|----|
       |定义|说明|
       |action|应用,根据actionId从act_window表中相应的action加载应用|
       |view|单视图，使用视图名称打开相应视图；|
       |views|多视图，从ui_views表中加载指定model的视图列表，然后打开相应应用视图和app处理差不多，只是加载方式和入口不一样；|
       |object|指令，执行相应的指令，可能没有窗口出现，如非编辑状态更新相关数据。|

       type参数定义

     **type='action'**

       |----|----|
       |props属性|说明|
       |actionId|act_window表中相应的id或xml定义action的xml_id|

     **type='views'**

       |----|----|
       |props属性|说明|
       |model|views对应的model
       |views|指定需要加载的视图类型|
       |target|应用打开方式，对应ir_act_window表target,inline,main,new,current|

     **type='view'**

       |----|----|
       |props属性|说明|
       |model|view对应的model|
       |view|需要加载的视图类型|
       |target|应用打开方式，对应ir_act_window表target,inline,main,new,current|

     **type='object'**
       未完成
       根据不同需求传入object对象


       ## props说明
       定义的props会在调用loadApp及openApp后会变为app.props.action属性内容
       
       |---|---|---|---|---|
       |名称|类型|说明|默认值|是否必须|
       |model字符串|应用需要使用的模型|无|是|
       |parentField|对象|父级字段|无|否|
       |target|字符串|打开应用的位置及方式,有inline/main/new/current，详细说明看`target说明`|无|否|
       |type|字符串|打开应用后的编辑类型,'new'新建,'modi'编辑当前记录,'search'搜索,'browse'搜索|无|否|
       |view|字符串|打开的视图类型,xml文件定义的视图类型form/tree/...|无|否|
       |rootAppId|int|主应用id|无|是|


     */
    var onclick = function(evt){
        //弹出框可重复弹出,(相应的去确定点击事件绑定还未完成)
        var sapp = store.apps[store.apps[rootAppId].app.subApps.length-1];
        if (isfalse(sapp) || (sapp && sapp.app.state != 'creating')){
            apps.createApp(type, rootAppId, props, binds);    
        }
    };
    // console.log(pane,'pane')
    var Pane = typeof pane == 'string'? (()=>{return <span className='siyue_action'  onClick={onclick}>{pane}</span>}) :  pane;
    return (<Pane {...props} onClick={onclick}/>);
}

Action.propTypes = {
    type:PropTypes.string,
    rootAppId:PropTypes.any,    
    props:PropTypes.object,
    pane:PropTypes.any,
    target:PropTypes.string,
}
    
registryWidget(Action)
export default Action;








