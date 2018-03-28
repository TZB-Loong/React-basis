/*
   本文件属于“思悦ERP项目”软件组成内容，相关权利属于深圳市莱克斯瑞智能家居有限公司所有，
   并受中华人民共和国和相关国际版权条约、法律、法规，以及其它知识产权法律和条约的保护。
   具体权利声明请看“版权声明”或http://www.siyue.it/copyright。

   copyright 深圳市莱克斯瑞智能家居有限公司 2017
 */

import {isfalse} from '../utils';
import midware,{store,models,triggers} from '../midware';
import createWidget from './_createWidget';
import React from 'react';
import PropTypes from 'prop-types';
import antd,{Affix}   from 'antd';
import { Tooltip,Dropdown, Button, Icon, Menu,Input,Row,Col } from 'antd';

const createWidgetFactory = function(){
    var widgetFactory = function(){};
    widgetFactory.prototype._widgets={};
    widgetFactory.registry=function(widget,name=''){
        /*
           注册组件
           注册后就可以通过widgets来访问，只要import widgets后，就可以在全局使用已注册的组件。希望通过字符名称来创建的组件都可以进行注册。
           widget:组件对象
           name:访问注册widget对应的名称，没有指定的情况下会自动使用widget的name属性
         */
        name = isfalse(name)?  widget.name : name;
        if (isfalse(name)){
            name = Object(widget).prototype.constructor.displayName;
        }
       
            if (isfalse(widgetFactory.prototype._widgets[name])){
                widgetFactory.prototype._widgets[name]=widget;
            Object.defineProperty(widgetFactory, name, { get: function () { return widgetFactory.prototype._widgets[name]; } });
        }
    }
    return widgetFactory;
}

const Null = ({}) =>{
    return (null);
};

class NoWrap extends React.Component{
    /*仅显示被包裹的组件
       可以按条件在多个组件中选择其中一个进行显示而不用显示上层包裹的多余标签.
       如下例中仅显示Input或Selection组件内容,而NoWrap不会显示多余的内容,保证组件层次不被打乱.
       return( <NoWrap>{ props.readOnly?<Input value={vl}/>: <Select defaultValue={vl} {optionsResult}</Select>}</NoWrap>)
     */
    render() {
        
        var Child = this.props.children;
        if (isfalse(Child)){
            Child = {type:Null, props:{}};
        }
        return <Child.type {...Child.props} />
    }
}

const UnDefined = ({widget,props}) =>{
    return (<div style={{width:props.width,backgroup:'#f00'}}>Widget '{props.widget}' UnDefined</div>);
};

// UnDefined .propTypes = {
//     widget: PropTypes.string,
//     props: PropTypes.object
// }

const toolWidgets = function(){};
toolWidgets.prototype._widgets={};
toolWidgets.prototype._groups={names:{}, sequences:{}};
toolWidgets.registry=function(toolbutton){
    /*
       注册工具栏组件
       注册后就可以通过toolbarWidgets来访问，可以在全局使用已注册的组件。
       toolbutton,工具栏按键定义对象
       component: 按键使用的组件名称，指定组件必须使用widgets注册
       name: 按键名称
       icon: 图标名称
       title: 显示标题，没有指定时使用name内容
       showTitle:是否显示标题
       tooltip:提示内容，没有指定时使用title内容
       group:所在分组,没指定时使用Other
       sequence:按键在所在分组内的排列顺序
       parent:上级按键名称
       state:按键状态，显示normal、隐藏hidden、禁用disabled
       update:更新按键状态方法,方法返回state新的状态值
       trigger:响应按键点击的trigger名称
       props:创建component时使用的其它属性,

     */
    if (isfalse(toolbutton.group)){
        toolbutton.group = 'Other';
    }
    var groups=toolWidgets.prototype._groups;//.name[group.name];
    if (isfalse(groups.names[toolbutton.group])){
        //如果按键指定的分组没有注册，先注册相应分组
        toolWidgets.registryGroup({name:toolbutton.group});
    }

    toolWidgets.prototype._widgets[toolbutton.name] = toolbutton;

    var group = groups.names[toolbutton.group];
    var sequence = groups.sequences[group.sequence];
    var sq = isfalse(sequence[toolbutton.sequence]) ? [] : sequence[toolbutton.sequence] ;
    sq.push(toolbutton.name);
    sequence[toolbutton.sequence] = sq;

    Object.defineProperty(toolWidgets, toolbutton.name, { get: function () { return toolWidgets.prototype._widgets[toolbutton.name]; } });

};
Object.defineProperty(toolWidgets, 'groups', { get: function () { return toolWidgets.prototype._groups } });


toolWidgets.registryGroup=function(group){
    /*
       注册按键分组，主要是用于设置分组排列
       group:分组定义
       name:分组名称
       sequence:分组排列顺序

       groups.names按分组名称存放分组对象
       groups.sqences按分组排列顺序存放分组对象,在sqences中按toolbutton顺序保存所属分组的toolbutton
     */
    var groups=toolWidgets.prototype._groups;//.name[group.name];
    if (isfalse(groups.names[group.name])){
        groups.names[group.name] = group;
        if (isfalse(group.sequence)){
            var sqks = Object.keys(groups.sequences);
            if (sqks.length==0){
	        group.sequence = 0; //sqks[sqks.length-1]+10;
            } else {
	        sqks.sort();
	        group.sequence = sqks[sqks.length-1]+10;
            }
        }
        if (isfalse(groups.sequences[group.sequence])) {
            groups.sequences[group.sequence] = {name:group.name};
        }
    }
};

const widgets = createWidgetFactory();
const TreeWidgets = createWidgetFactory();
const FormWidgets = createWidgetFactory();
const KanbanWidgets = createWidgetFactory();


const registryWidget = widgets.registry;
const registryToolGroup = toolWidgets.registryGroup;
const registryToolButton = toolWidgets.registry;
const getToolButton = function(button_name){return toolWidgets[button_name];}
const getToolGroups = function(){ return toolWidgets.groups};
const Widgets = widgets;
const registryFormWidget = FormWidgets.registry
const registryTreeWidget = TreeWidgets.registry
const registryKanbanWidget = KanbanWidgets.registry

widgets.registry(Null);
widgets.registry(UnDefined);
registryFormWidget(Null)
registryTreeWidget(Null)
registryKanbanWidget(Null)
registryFormWidget(UnDefined)
registryKanbanWidget(UnDefined)

module.exports = {
    createWidgetFactory,
    widgets,
    Widgets,
    Null,
    NoWrap,
    registryWidget,
    registryToolButton,
    getToolButton,
    registryToolGroup,
    getToolGroups,
    TreeWidgets,
    FormWidgets,
    KanbanWidgets,
    registryFormWidget,
    registryTreeWidget,
    registryKanbanWidget
}

