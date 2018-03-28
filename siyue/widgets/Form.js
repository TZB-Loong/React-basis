import React, {  Component } from 'react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';
// import antd, { Table } from 'antd'; # 当前文件没有用到
import { isfalse } from '../utils';
import { store } from '../midware';
import { FormWidgets, registryWidget, Null } from './_widgets';
import _Widgets from './FormWidgets';

import './Form.css';


let wCell = window.screen.width / 24;
let hCell = window.screen.height / 24;

class Form extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };

    }

    render() {
        var { props, children } = this.props;
        var self = this;
        props = { ...props }
        var field, widget, component, ci = 0, datasource, dsid, dsChildren, col, row, rpd, rawvalue;
        datasource = store.getAppDatasource(props.appId, props.datasourceId);

        if (isfalse(children)) {
            var propsData = datasource.props.currentRow
            dsChildren = props.children
        } else {
            var propsData = props.props;
            dsChildren = children;
        }
        const appProps = store.props.apps[datasource.props.appId].app;

        if(isfalse(dsChildren)){
            dsChildren = [];
        }else if (isfalse(dsChildren.__proto__.concat)) {
            dsChildren = [dsChildren];
        }
        
        return (
            <div className='db_form_an' >
                <div className={isfalse(children) ? "" : 'db_form_fa'}>
                    <div className='db_form_so'>
                        {dsChildren.map(Child => {
                            field = datasource.fields[Child.props.name];
                            widget = typeof field == 'undefined' ? 'Null' : isfalse(Child.props.widget) ? field.type : Child.props.widget;
                            if (widget == 'char' && field.name == 'address_id') {
                                //把adderss 单独拎出来
                                widget = 'address';
                            }
                            component = FormWidgets[widget];
                            component = isfalse(component) ? FormWidgets.UnDefined : component;
                            col = isfalse(Child.props.col) ? '' : Child.props.col * wCell + 'px';
                            row = isfalse(Child.props.row) ? '' : Child.props.row * hCell + 'px';
                            delete Child.props.props;
                            rpd = isfalse(Child.props.responsefield)? false:propsData[Child.props.responsefield];
                            return (
                                <Child.type key={Child.props.name + (++ci)} name={Child.props.name} props={{ ...Child.props, appId: appProps.appId, datasourceId: datasource.props.id, resId: propsData.id, component: component, widget: widget, value: propsData[Child.props.name], rawValue: propsData[Child.props.name], responseData: isfalse(rpd)? false: py.eval(rpd), width: col, height: row }} />
                            )
                        })}

                    </div>
                </div>
            </div>

        )
    }
}
Form.propTypes = {
    props: PropTypes.object,
    children: PropTypes.array
};
registryWidget(Form);
export default Form;


