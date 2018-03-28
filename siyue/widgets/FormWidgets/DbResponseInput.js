
import PropTypes from 'prop-types';
import { Component} from 'react';
import {Input, Menu, Dropdown} from 'antd';
import createWidget from '../_createWidget';
import {registryFormWidget,registryWidget, NoWrap} from '../_widgets';
import SyInput from '../SyInput';
import {isfalse, stopEventPropagate} from '../../utils';
import "./DbResponseInput.css"
import {store} from '../../midware'


class SiYueSelect extends Component{
    constructor(props){
        /* # 创建选择列表

           ## 参数
           items为选择项定义列表,每个菜单项定义如下表.  

           |---|---|---|---|---|
           |名称|类型|说明|默认值|是否必须|
           |value|int|选择项组件键|无|是|
           |name|string|菜单项显示的文本内容|无|是|
           
         */
        super(props)
        this.state = {visibility: !isfalse(this.props.visibility)};

    }

    itemClick = (evt) => {
        this.setState({visibility: false})
        isfalse(this.props.onClick)? false: this.props.onClick(evt);
    }
    
    render(){
        var props = this.props;
        var visibility = !isfalse(this.props.visibility) || this.state.visibility;
        var i = 0;
    return  (
        <ul style={{"position":"absolute"}} className="ant-dropdown-menu ant-dropdown-menu-vertical ant-dropdown-menu-light ant-dropdown-menu-root">
        {visibility? props.items.map(l => {i++; return <li value={i-1} onClick={this.itemClick} className="ant-dropdown-menu-item">{l.name}</li>}): null}
        </ul>
        )
    }
}


const ResponsePath = ({props}) => {
    /*# 显示路径

       ## 参数
       
       |---|---|---|---|---|
       |名称|类型|说明|默认值|是否必须|
       |props|array|[路径值,路径显示内容]数组|[]|否|
       
     */
    props = isfalse(props)? []: props
    return (
        <span className="dbresponseinput-path" style={{"display": "table-cell"}}>
        {props.map((item) => {
            return <span className="dbresponseinput-path-name" data-value={item}>{item[item.length-1]}<span className="dbresponseinput-path-separator"></span></span>
        })}
        </span>

    )
}

class ResponseInput  extends Component{
    constructor(props){
        super(props)
        this.state = {value:undefined}
        this._timer = null;
    }

    itemSelected = (evt) => {
        var selected = this.props.props.responseData[evt.nativeEvent.target.value];
        /*选择匹配的内容
           如果stat.value是数组而最后一个为字符串或stat.value是字符串,将用选择内容替换掉字符串值
         */
        var vl = this.state.vale;
        console.log('vl1:', vl);
        if (isfalse(vl) || isfalse(vl.splice)){
            vl = [selected];
        } else {
            vl.splice(vl.length-1, 1, selected);
        }
        console.log('vl2:', vl);
        //this.state.value.push(selected);
        this.setState({showSelection:false});
        this.ok(vl)
        //isfalse(this.props.onOk)? '': this.props.onOk(vl);
        console.log('itemSelected', selected,this._refNode.childNodes[0].tagName);
        if(this._refNode.childNodes[0].tagName=='INPUT'){
            this._refNode.childNodes[0].focus();
        }else {
            this._refNode.childNodes[1].focus();
        }
    }

    blur = (evt) => {
        console.log('blur', this.state.value);
        //如果this.state.value==undefined解发onOk事件
        this.ok();
        !isfalse(this.props.onBlur)? this.props.onBlur(evt):null;
        setTimeout(()=>{
            this.setState({showSelection:false, value: undefined});
        },250);
    }


     keydown = (evt) => {
         if(!isfalse(this._timer)){
            clearTimeout(this._timer)
            this._timer = null;
        }
        !isfalse(this.props.onKeyDown)? this.props.onKeyDown(evt):null;
        //console.log('keydown', evt.nativeEvent.target.value, val);
        this._timer = setTimeout(this.ok, 3000);
    }

    //重新focus后timeout commit的内容会被清除
    change = (evt) => {
        //console.log('change', evt.nativeEvent.target.value, val,pitems);
        this.pitems.push(evt.nativeEvent.target.value);
        this.setState({value:this.pitems});
        
        //return true;
    }

    focus = (evt) => {
        
        !isfalse(this.props.onFocus)? this.props.onFocus(evt):null;
        /*获取焦点时判断是否有已返回的查询清单
           . 如何判断返回列表为空和未进行查询
           . 
         */
        if (!isfalse(this.props.props.responsefield) && this.props.props.responseData===false){
            var ds = store.getAppDatasource(this.props.props.appId, this.props.props.datasourceId);
            ds.change([ds.props.currentId], this.props.props.field.name, {...ds.props.currentRow}, '',{id:ds.props.currentId});
        }
        this.setState({showSelection:true});
    }
    
    ok = (evt) => {
        console.log('ok', evt, this.state.value != undefined);
        if (isfalse(evt)) {
            if (this.state.value != undefined){
                isfalse(this.props.onOk)? '': this.props.onOk(this.state.value);
            }
        } else {
            isfalse(this.props.onOk)? '': this.props.onOk(evt);
        }
        this.setState({value:undefined});
        
    }
    
    
    render(){
        var props = {...this.props};
        var ds = store.getAppDatasource(props.props.appId, props.props.datasourceId);
        var inputWidth = "100%", val="";
        val = isfalse(this.state.value)? props.value: this.state.value ;
        //val = isfalse(val)? '': val;
        var clsName = isfalse(props.className)? "siyue-input": "siyue-input " + props.className;

        var showSelection = !isfalse(this.state.showSelection);
        var items = isfalse(props.props.responseData)? []: props.props.responseData;
        //var items = [['todo.config.relatedmodel','1','线索活动记录'],['todo.config.relatedmodel','2','客户订单']];
        var mitems = [];
        //将responseData转为选择列表格式
        items.map(item => {
            mitems.push({value:item, name:item[item.length-1]});
        });
        
        /*将value转为ResponsePath列表
           value最后一个值的类型为字符串时,认为没有匹配到相应的记录,该值将会显示到输入框中
           
         */
        console.log('raw value', val);
        this.pitems = [];
        var txtval = val;
        if (!isfalse(val) && !isfalse(val.map)){
            val.map(v => {
                if (isfalse(v.map)){
                    txtval = v;
                } else {
                    this.pitems.push(v);
                    txtval = '';
                }
            });
        }
        val = txtval;
        

        
        console.log('props', typeof val, val, val.map, txtval, this.pitems);
        
        return (
            <span className="ant-input-wrapper ant-input-group" style={{"display": "table"}} ref={e => (this._refNode = e)}>
            {isfalse(this.pitems)? null: <ResponsePath props={this.pitems} />}
            <input {...props} className={clsName} value={val} style={{"white-space":"nowrap", "width":inputWidth,'outline':'none' }} onFocus={this.focus} onBlur={this.blur} onKeyDown={this.keydown} onChange={this.change} />
            <SiYueSelect visibility={showSelection} onClick={this.itemSelected} items={mitems} />
            </span>
        )
    }
}

ResponseInput.formatter = (value, formate) => {
    return <ResponsePath props={value} />
}

const WrappedDbInput = createWidget(ResponseInput);

const DbResponseInput = ({field, props}) =>{

    props.rawValue = (typeof props.rawValue == 'string' && ['(', '[', '{'].indexOf(props.rawValue.substr(0,1))!=-1)? py.eval(props.rawValue): props.rawValue
    props.value=props.rawValue;
    return (
        <WrappedDbInput addonBefore={field.string} defaultValue={ isfalse(props['value'])?"":props['value']}  props={props} />

    );
};

DbResponseInput.prototype.propTypes = {
    field: PropTypes.object,
    props: PropTypes.object,
};

registryFormWidget(DbResponseInput);
export default DbResponseInput;

