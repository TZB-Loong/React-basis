/*
   本文件属于“思悦ERP项目”软件组成内容，相关权利属于深圳市莱克斯瑞智能家居有限公司所有，
   并受中华人民共和国和相关国际版权条约、法律、法规，以及其它知识产权法律和条约的保护。
   具体权利声明请看“版权声明”或http://www.siyue.it/copyright。

   copyright 深圳市莱克斯瑞智能家居有限公司 2017
 */
import React from 'react';
import { isfalse, fieldFalseValue } from '../utils';
import store from '../midware/store';
import ValueLabel from './ValueLabel';
import './Form.css';



/*
   1创建状态
   defaultValue由store传入
   state.value为空

   2.修改组件内容
   触发change事件将值更新到state.value中

   3.更新显示值
   用state.value的值作为最新显示值

   4.修改完成
   修改完成后调用commit将组件中最新值提交到stroe.  
   清除state.value值  
   然后再从第一步开始.  

 */

function createWidget(WrappedComponent) {
    //创建新组件，并让WrappedComponent继承新组件内容

    return class WidgetProxy extends React.Component {

        constructor(props) {
            var p = { ...props };
            delete p.props;
            var pp = { ...props, ...p }
            super(props);
            this._lastcommit = false;
            this.state = { isFocused: false };
            this._props = pp;
            WrappedComponent.prototype.getDatasource = this.getDatasource;
            WrappedComponent.prototype.getMasterDatasource = this.getMasterDatasource;
        }

        change = (e, ...other) => {
            if (e.target) {
                if (e.target.value) {
                    this.setState({
                        value: e.target.value
                    });
                }
                else {
                    this.setState({
                        value: false
                    });
                }
            } else {
                this.setState({
                    value: e
                });
            }
        }

        updateState = (value) => {
            /*更新onchage返回的数据

               ----
               调用ds的方法时如果涉及与后端交互的方法的中调用并且在方法中指定回调函数时,需要由指定的回调函数处理数据和应用状态.
               分别为app.state(应用状态),datasource.state(数据状态)
             */
            console.log('updateState', value)
        }

        commit = (change) => {
            /*# commit 提交组件变化到systate.state
               commit后组件变化会暂存到相应datasource dirty空间,当datasource执行保存操作时才能将变化保存到后端.

               ## 参数
               |---|---|---|---|---|
               |名称|类型|说明|默认值|是否必须|
               |change|对象|change.value为组件变更的值|无|否|
               
               ----
               提交后要删除组件state.value为了避免state.value影响切换记录行后显示内容.  
               当chage.value和props.value不相等时,就提交变更
               在commit方法中,显示内容可能会来自props.value,change.value,state.value,优先顺序change.value->state.value->props.value.

             */

            if (this.props.props.readOnly || (this.state.value == undefined && change == undefined)) {
                return
            }

            var ovl = this.props.value ? this.props.value : this.props.defaultValue;

            let vals;
            if (change) {
                vals = change.value;
            } else {
                vals = this.state.value ? this.state.value : fieldFalseValue(this.props.props.field.type);
            }
            this._lastcommit = vals;
            if (vals != ovl) {
                var updater = {};
                updater[this.props.props.field.name] = vals;
                var modi = {
                    type: 'modi',
                    updater: updater
                };
                if (this.props.props.widget == 'many2many') {
                    //var ds = store.getAppDatasource(this.props.props.appId, this.props.props.masterDatasourceId);
                    var ds = this.getMasterDatasource();
                } else {
                    //var ds = store.getAppDatasource(this.props.props.appId, this.props.props.datasourceId)
                    var ds = this.getDatasource();
                }
                ds.commit(modi);
                if (this.props.props.field.onchange) {
                    var row = { ...ds.props.currentRow };
                    var ids = [ds.props.currentId];
                    if (typeof ds.props.currentId == 'string') {
                        row['id'] = false;
                        ids = [];
                    }
                    var afterchange = isfalse(this.props.afterchange) ? null : this.props.afterchange;
                    ds.change(ids, this.props.props.field.name, row, afterchange, { id: ds.props.currentId });
                }

            }
            var ostate = { ...this.state }
            ostate.value = undefined; //false;
            this.setState(ostate)
            delete this.state.value;
            if (!isfalse(WrappedComponent.prototype.reset)) {

                WrappedComponent.prototype.reset.apply(this);
            }

        }

        keyPress = (evt) => {
            /*
               响应按键事件
             */
            if (evt.key == 'Enter') {
                this.commit();
            }
        }

        focus = (evt) => {
            this.setState({ isFocused: true });
        }

        blur = (evt) => {
            /*
               响应失去焦点
             */
            if (evt._targetInst != undefined) {
                this.commit();
            }
            this.setState({ isFocused: false });
        }

        onOk = (value) => {
            this.setState({
                value: value
            });
            this.commit({ value: value });
        }

        getDatasource = () => {
            return store.getAppDatasource(this.props.props.appId, this.props.props.datasourceId)
        }

        getMasterDatasource = () => {
            return store.getAppDatasource(this.props.props.appId, this.props.props.masterDatasourceId);
        }

        render() {
            var { props } = this.props
            var _props = { ...this.props }

            var _state = { ...this.state }
            var self = this;
            var vl = this.state.value == undefined ? this.props.defaultValue : this.state.value;
            var domSize = {};
            if (!isfalse(this._refNode)) {
                var size = this._refNode.getBoundingClientRect();
                domSize = { width: size.width, height: size.height };
            }

            vl = isfalse(vl) ? fieldFalseValue(_props.props.field.type) : vl;
            const onChange = _props.onChange == undefined ? this.change : _props.onChange;
            const newProps = {
                ..._props,
                value: vl,
                readOnly: _props.props.readOnly, //this.props.props.readOnly,
                onChange: _props.props.readOnly ? ((e) => { }) : onChange,
                onKeyPress: this.keyPress,
                onBlur: this.blur,
                onFocus: this.focus,
                width: _props.props.width,
                height: _props.props.height,
                onOk: _props.props.onOk == undefined ? this.onOk : _props.props.onOk,
                domSize: domSize,
            };
            delete newProps.props;
            delete newProps.addonBefore;
            newProps.props = _props.props;
            newProps.field = _props.props.field;
            var ref = null;
            var fieldClass = newProps.field.required ? "siyue-field-wrapper ant-input-wrapper ant-input-group siyue-field-required" : "siyue-field-wrapper ant-input-wrapper ant-input-group";
            fieldClass = _props.addonBefore ? fieldClass + ' siyue-field-wrapped-label' : fieldClass;
            fieldClass = isfalse(this.state.isFocused) ? fieldClass : fieldClass + ' siyue-field-focused';
            var treeClass = isfalse(_props.className) ? "siyue-widget-wrap" : _props.className;
            //编辑状态下,编辑的样式还是按照from的样式来进行渲染的

            return <div className={treeClass} ref={e => (this._refNode = e)} >
                <div className='siyue-widget' style={{ width: isfalse(newProps.width) ? '' : newProps.width }}>
                    <span className={fieldClass} >
                        {_props.addonBefore ? <span className={"ant-input-group-addon siyue-field-label"}>{_props.addonBefore}</span> : null}
                        {newProps.readOnly && WrappedComponent.formatter
                            ? <ValueLabel props={{ ...newProps, className: "siyue-field-value", formatter: WrappedComponent.formatter }} ref={ref} />
                            : <WrappedComponent {...newProps} className={"siyue-field-value"} ref={ref} />
                        }
                    </span>
                </div>
            </div>
        }
    }
}

export default createWidget;
