import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';
import antd,{Tabs,Spin} from 'antd';
import {isfalse} from '../utils';
import {store} from '../midware';
import {FormWidgets,registryWidget,Null} from './_widgets';
const TabPane = Tabs.TabPane

class Notebook extends React.Component{
        /* 
        props.children:Tab组件内包含的Field的数组集合
        datasource:数据源空间
        propsData:子组件包含的数据(datasource.props.currentRow)
        appProps :应用内的属性props
        component:每个字段所对应的组件
        */


    constructor(props){
        super(props);
        this.state = {
            active:0
         };
   
    }
    
    //想要的效果是在其他的页签还没有渲染的时候,让这个页签是不存在的,而不是存在,他只是把高度给缩成了0

    render(){
        var {props,children} = this.props;
        var self = this;
        var field, widget, component, ci=0, datasource, propsData;
        props = {...props}

        const handleChange = (data)=>{ //页面切换时的回调返回当前选择的ActiveKey
           
            self.setState({
                active :data
            })
            
        }
        
        datasource = store.getAppDatasource(props.appId,props.datasourceId);
        propsData = datasource.props.currentRow;
       
        const appProps = store.props.apps[datasource.props.appId].app;
        var props_children = isfalse(props.children.concat)? [props.children]: props.children;
        return (
            <div style={{width:'100%',marginTop:'20px'}}>
            <Tabs defaultActiveKey="0" type='card'  onChange={handleChange}>
            {props_children.map((Child,i) => {
            field = datasource.fields[Child.props.name];
            widget = typeof field== 'undefined'? 'Null' : isfalse(Child.props.widget)? field.type: 
            Child.props.widget;        
            component = FormWidgets[widget];
            component = isfalse(component)? FormWidgets.UnDefined : component;
            delete Child.props.props; 
            
            return (
                <TabPane tab={isfalse(field)?'': field.string} key={i} forceRender='false' >
                    { i== this.state.active? <Child.type key={Child.props.name+(++ci)} name={Child.props.name} props={{...Child.props, appId:appProps.appId, datasourceId:datasource.props.id, component:component, resId:propsData.id, widget:widget,value:propsData[Child.props.name]}}/>  :null }
                </TabPane > 
            )
        })}
        </Tabs>
         </div>
    )
}
}
Notebook.propTypes = {
    props: PropTypes.object,
    children:PropTypes.array
};

registryWidget(Notebook);
export default Notebook;


