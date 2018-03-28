import React, {PropTypes, Component} from 'react';
import { render } from 'react-dom';
import antd, {Button, Icon, Input, Select} from 'antd';
import  './Tree.css';
import {globalMouseDrop, isfalse} from '../utils';
import {store} from '../midware';
import {TreeWidgets,registryWidget, Widgets} from './_widgets';
import _Widgets,{UnDefined} from './TreeWidgets';
const Option = Select.Option;


class Tree extends Component {
    /*Tree接口组件
       Tree组件只是一个入口,会根据xml tree定义的widget来加载显示列表形式的组件,没有指定widget情况下会用Table进行显示
     */
    constructor(props){
        super(props)
    }
    render(){
        const onDoubleClick = (evt)=>{
            store.dispatch('switchView', { target: { view: 'form' }, appId: this.props.props.appId, datasourceId: this.props.props.datasourceId });
        }
        var widget_name = isfalse(this.props.widget)? 'Table': this.props.widget;
        var WrappedTree = Widgets[widget_name];
        return <WrappedTree {...this.props} onDoubleClick={onDoubleClick} />
    }
}

registryWidget(Tree);
export default Tree;
