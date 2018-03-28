/*
   本文件属于“思悦ERP项目”软件组成内容，相关权利属于深圳市莱克斯瑞智能家居有限公司所有，
   并受中华人民共和国和相关国际版权条约、法律、法规，以及其它知识产权法律和条约的保护。
   具体权利声明请看“版权声明”或http://www.siyue.it/copyright。

   copyright 深圳市莱克斯瑞智能家居有限公司 2017
 */

import {isfalse} from '../utils';
import midware,{store,models,triggers} from '../midware';
import createWidget from './_createWidget';
import React, { PropTypes } from 'react';
import antd,{Affix}   from 'antd';
import { Tooltip,Dropdown, Button, Icon, Menu,Input,Row,Col } from 'antd';


const widgets = function(){};
widgets.prototype._widgets={};
widgets.registry=function(widget,name=''){
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
  if (isfalse(widgets.prototype._widgets[name])){
    widgets.prototype._widgets[name]=widget;
    Object.defineProperty(widgets, name, { get: function () { return widgets.prototype._widgets[name]; } });
  }
};


const Null = ({}) =>{
      return (null);
};
widgets.registry(Null);


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
//Object.defineProperty(toolWidgets, 'groups', { get: function () { return toolWidgets.prototype._groups } });


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


const ToolButton = ({button,session,app,datasource,error}) => {
  //state = update ? update() :state;

  return (
      <Button {...button.props} icon={button.icon}  disabled={button.state=='disabled'} onClick={button.onClick}>{button.showTitle?button.title:null}</Button>
  )
};

ToolButton.prototype.propTypes = {
  button:PropTypes.object,
  session: PropTypes.object,
  app: PropTypes.object,
  datasource: PropTypes.object,

  component: PropTypes.string,
  name: PropTypes.string,
  icon: PropTypes.string,
  title: PropTypes.string,
  showTitle: PropTypes.boolean,
  tooltip: PropTypes.string,
  group: PropTypes.string,
  sequence: PropTypes.int,
  parent: PropTypes.string,
  state: PropTypes.string,
  update: PropTypes.func,
  action: PropTypes.any,
  props: PropTypes.object,
  onClick: PropTypes.func,
  error: PropTypes.object
};



widgets.registry(ToolButton);


const ToolAction = ({button}) => {
    //component,name,icon,title,showTitle,tooltip,group,sequence,parent,state,update,action,props,onClick
    console.log('ToolAction');
    var session = store.session;
    var actApp = store.activeApp;
    console.log('ToolAction 2');
    var datasource = store.activeAppDatasource;
    console.log('ToolAction 3');
    var state=isfalse(button.update) ? button.state : button.update(session,actApp,datasource) ;
    var ToolComponent = widgets[button.component];
    button.onClick = isfalse(button.onClick)? function(){
        if (triggers[button.trigger]) {
            triggers[button.trigger].pull({target:button,appId:actApp.app.appId,datasourceId:actApp.app.datasourceId});
        }
    } : button.onClick;
    button.state=state;
    //<Null>{state=='hidden'?null: </Null>
    //
    //         
    //
    return (
        <Tooltip placement='bottom' title={button.tooltip}>
        <ToolComponent button={button} session={session} app={actApp} datasource={datasource} /> 
        </Tooltip>
    );
};

ToolAction.prototype.propTypes = {
  button:PropTypes.object,
  session: PropTypes.object,
  app: PropTypes.object,
  datasource: PropTypes.object,

  component: PropTypes.string,
  name: PropTypes.string,
  icon: PropTypes.string,
  title: PropTypes.string,
  showTitle: PropTypes.boolean,
  tooltip: PropTypes.string,
  group: PropTypes.string,
  sequence: PropTypes.int,
  parent: PropTypes.string,
  state: PropTypes.string,
  update: PropTypes.func,
  action: PropTypes.any,
  props: PropTypes.object,
  onClick: PropTypes.func,
  error: PropTypes.object
};


const ToolGroup = ({name,buttons}) => {
    var bts = buttons.reduce(function(cur,pre){
        cur.push({key:pre,name:pre});
        return cur
    },[]);
    return (
        <span style={{'margin-left':'3px'}}>
        {bts.map(button => <ToolAction key={button.key} button={toolWidgets[button.name]}  />)}
      </span>
  )
}

ToolGroup.prototype.propTypes = {
  name: PropTypes.string,
  buttons: PropTypes.array,
  session: PropTypes.object
};



const WrappedDbInput = createWidget(Input);

const DbInput = ({field,model,value,defaultValue,props}) =>{
    var vl = isfalse(defaultValue) ? '' : defaultValue;

    return (
        <WrappedDbInput addonBefore={field.string} defaultValue={vl} value={value}  props={props} />
    );
};

DbInput.prototype.propTypes = {
  field: PropTypes.object,
  model: PropTypes.func,
  defaultValue:PropTypes.any,
  value:PropTypes.any,
  props: PropTypes.object,
  error: PropTypes.object
};

widgets.registry(DbInput);
widgets.registry(DbInput,'char');

const Many2One = ({field,model,value,defaultValue,props}) =>{
  return (
      <Input  />
  );
};

Many2One.prototype.propTypes = {
  field: PropTypes.object,
  model: PropTypes.func,
  defaultValue:PropTypes.any,
  value:PropTypes.any,
  props: PropTypes.object,
  error: PropTypes.object
};

const Field = ({name,widget, value,defaultValue,  props}) => {
    var app = props.__app__;
    var ds = store.getAppDatasource(app.appId,app.datasourceId);
    var appmodels = models[app.appId];//.getModel(app.model);
    var field = ds.fields[name];
    var vl = defaultValue ? defaultValue : props[name];
    var model = appmodels[ds.id],isreadonly=true;
        
    if (isfalse(field)){
        widget = 'Null';
    }
    else {
        field.name = name;
        if (['one2many','many2one','many2many'].indexOf(field.type)>-1){
            //可以尝试在加载视图后注册字段关联的model
            var fn = `${field.name}_${field.relation}`;
            models.registry(field.relation,fn);
        }
        isreadonly = field.readonly || ds.state=='browse'; //字段只读，需要考虑权限问题 ;
    }

    let Component = widget ? widgets[widget] : widgets[field.type];
    return (
        <Component field={field}  value={value} defaultValue={vl} props={{field:field, readOnly:isreadonly, __models__:models,__model__:model}} />
    );
};

Field.propTypes = {
  name: PropTypes.any,
  widget:PropTypes.string,
  dispatch: PropTypes.func,
  app:  PropTypes.object,
  props: PropTypes.object,
  kwargs: PropTypes.object,
  value:  PropTypes.any,
  defaultValue:  PropTypes.any,
  error: PropTypes.object
};

widgets.registry(Field);
widgets.registry(ToolButton);

module.exports=  {
  DbInput,
  Null,
  Field,
  ToolButton,
  ToolGroup,
  createWidget,
  widgets,
  toolWidgets
}
