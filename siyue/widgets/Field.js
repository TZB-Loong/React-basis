import { Component} from 'react';
import PropTypes from 'prop-types';
import {store} from '../midware';
import {
    registryWidget,
    widgets,
    TreeWidgets,
    FormWidgets,
    KanbanWidgets,
    registryFormWidget,
    registryTreeWidget,
    registryKanbanWidget
} from './_widgets';
import {isfalse, fieldFalseValue} from '../utils';

class Field extends Component{
    constructor(props){
        super(props);
        this.state = {isLoadSubDatasource:-1};
    }

    commit = (new_value)=>{
        /*将字段对应的更新值提交到相应的datasource dirty中

           ## 参数
           |---|---|---|---|---|
           |名称|类型|说明|默认值|是否必须|
           |new_value|any|字段更新的值|否|是|

         */
        if (this.props.props.readOnly ||new_value==undefined){
            return}
        var updater = {};
        updater[this.props.props.name] = new_value;
        var modi = {
            type: 'modi',
            updater: updater
        };
        if (this.props.props.widget == 'many2many') {
            var ds = store.getAppDatasource(this.props.props.appId, this.props.props.masterDatasourceId);
        } else {
            var ds = store.getAppDatasource(this.props.props.appId, this.props.props.datasourceId)
        }
        ds.commit(modi);
    }
    
    render(){
        /*# Field组件

           将xml字段定义内容绑定数据后转为react组件实例

           ## 参数
           通过props对象传递参数, 参数尽量兼容odoo view xml中field定义,会根据react及组件特性可能会有少许差异,具体参看各组件定义.  

           |---|---|---|---|---|
           |名称|类型|说明|默认值|是否必须|
           |name|string|字段名称,xml文件中定义|无|是|
           |props|object|组件所需的所有参数|无|是|
           |responsefield|string|响应字段名称,将responsefield字段的内容转到responseData属性中方便组件访问,结合onchange事件可轻松实现响应式的操作|无|否|


           props参数属性定义如下:  

           |---|---|---|---|---|
           |名称|类型|说明|默认值|是否必须|
           |appId|int|组件所对应的app id,自动生成|否|是|
           |datasourceId|int|组件所对应的数据源id,自动生成|否|是|
           |resId|int|组件对应字段值来自datasource的记录id,自动生成|否|是|
           |component|function|react组件定义方法|否|是|
           |widget|string|组件名称,与component只使用其中一个,指定widget后将不使用component|否|是|
           |field|object|字段定义内容,对应后将model字段定义内容,为空时将显示空组件|否|是|
           |value|任意|显示的内容,将rawValue格式化后的显示内容|null|否|
           |rawValue|任意|field字段的原始内容,显示的内容与原始内容不一到是一致的|null|否|
           |attr|object|组件使用到的其它属性|无|否|
           |string|string|提示或标题内容,默认情况下会是field中的string指定的内容|无|否|
           |options|object|选项参数|无|否|
           |groups|string|字段所在分组,未实现|无|否|
           |props|object|react组件中使用到的其它参数|无|否|
           |masterDatasourceId|string|关系型字段中主数据源id|无|否|
           |responseData|任意|指定responsefield时,该值会是相应字段的内容|无|否|
           
           
         **rawValue特性还未实现 2017-10-9**
         **当必须参数为空时，将返回空白组件NULL**

         */
        var self = this;
        var {props} ={...self.props};
        var {name, appId, datasourceId, resId, component, widget, value, rawValue, attrs, string, options, groups, props} = this.props;
        var app = store.apps[props.appId];
        var appProps = app.app;
        var ds = store.getAppDatasource(appProps.appId,props.datasourceId);
        var field = ds.fields[name];
        var vl =  '', WrapComponent,cprops={},children, resid;
        var isreadonly=true;
        var slaveDatasourceId = false;
        var sdsid, dsid, ostate;
        var ostate = {...this.state}

        if (isfalse(field)) {
            widget = 'Null';
        } else {
            field.name = name;
            vl = props[field.name] ;
            if (['one2many','many2one','many2many'].indexOf(field.type)>-1){
                //datasourceid生成规则，relation_父datasourceId_字段名称
                if (self.state['datasourceId']){
                    sdsid = self.state['datasourceId'];
                    dsid = self.state['masterDatasourceId'];
                } else  {
                    dsid = ds.props.id;
                    sdsid = `${field.relation}_${ds.props.id}_${field.name}`.split('.').join('_');
                    ostate = {...self.state, datasourceId:sdsid, masterDatasourceId:dsid};
                    self.setState(ostate);
                }
                slaveDatasourceId = sdsid;
                //获取默认加载的字段名称
                //子tree数据加载
                var dfields = [];
                
                var sds = store.registryDatasource(appProps.appId,field.relation,{datasourceId:sdsid, master:props.datasourceId, relationField:field.name,fetchType:'one', relationType:field.type,defaultFields:dfields});
                var cr, pr;
                //针对不同的类型及属性用不同的方式获取数据
                /*识别主表数据有变更，避免重复加载从表内容
                   主表当前记录变更
                   当前内容变更
                   当前组件状态未更新
                 */
                var sdsfields = sds.fields;
                cr = ds.props.currentRow;
                pr = ds.props.rows[ds.props.prevSelectId];
                pr = typeof pr == 'undefined'? {} : pr;
                //console.log('pr',pr,cr, 'field', pr[field.name], cr[field.name])
                /*判断one2many字段是否需要更新从数据源
                   更新数据源有两种方式:
                   1.清除数据源数据
                   props.value为空,datasource不为空

                   2.从后端更新数据
                   props.value不为空,且与datasource值不一致

                 */
                if (isfalse(props.value)){
                    props.value = [];
                }
                
                if (field.type=='one2many'){
                    if (props.value.length==0 && sds.props.rowCount>=1){
                        sds.cleanup();
                        ostate.isLoadSubDatasource = ds.props.currentId;
                        this.setState(ostate);
                    } else if (sdsfields!='loading'){
                        var ovl = props.value.sort();
                        var bval = isfalse(sds.props.rowsKeys)? []: sds.props.rowsKeys.sort();
                        if (ovl.toString()!=bval.toString()&& sds.props.state != 'fetching' && this.state.isLoadSubDatasource!=ds.props.currentId){
                            sds.read(props.value,dfields);
                            ostate.isLoadSubDatasource = ds.props.currentId;
                            this.setState(ostate);
                        }
                    }
                }
                cprops = {
                    datasourceId: sds.props.id,
                    masterDatasourceId: ds.props.id,
                    value: props.value
                }
                if (typeof props.mode == 'string'){
                    cprops.component = props.children.type;
                    if(props.children.props.widget){ //如果子组定义了widget，将优先使用widget
                        cprops.component = widgets[props.children.props.widget];
                    }
                    cprops.children = props.children.props.children;
                }
                else {
                    widget = widget ? widgets[widget] : widgets[field.type];
                    widget = isfalse(widget)? 'Null' : widget;
                }
            }
            
            isreadonly = field.readonly || appProps.editState == 'browse' ; //字段只读，需要考虑权限问题 ;
        }
        cprops = Object.assign({}, props, cprops);
        if (isfalse(cprops.component)){
            WrapComponent = widget ? widgets[widget] : widgets[field.type];
        } else {
            WrapComponent = cprops.component;
        }
        if (props.invisible== "1"){
            WrapComponent = widgets['Null'];
        }

        return (
            <WrapComponent field={field} attrs={{invisiable:'2'=='2'}} props={{...cprops,appId:appProps.appId, field:field, resId:cprops.resId, readOnly:isreadonly, commit: this.commit}} children={cprops.children} />
        );
    };
}

Field.propTypes = {
    name: PropTypes.any,
    widget:PropTypes.string,
    attrs: PropTypes.object,
    string: PropTypes.string,
    groups: PropTypes.string,
    options: PropTypes.object,
    props: PropTypes.object,

};

widgets.registry(Field);
export default Field;
