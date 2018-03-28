import { Component} from 'react';
import PropTypes from 'prop-types';
import React from 'react';
import {Icon, DatePicker} from 'antd';
import SyCheckbox from './SyCheckbox';
import createWidget from './_createWidget';
import {NoWrap, registryWidget } from './_widgets';
import {registryMarkdownWidget} from '../utils/markdown';
import { isfalse, stopEventPropagate} from '../utils';
import {hasClass} from '../utils/domUtils';
import './SyTodoItem.css';
import SyLineEditor from './SyLineEditor';
import SyList from './SyList';
import SySelect from './SySelect';
import moment from 'moment';
import ValueLabel from './ValueLabel';

class SyTodoItem extends Component {
    /*待办事项

       |---|---|---|---|---|
       |名称|类型|说明|默认值|是否必须|
       |value|object|待办事项记录内容|无|是|
       |readOnly|bool|是否为只读|false|否|
       |mentionSearch|func|查找联系人的方法|无|否|
       |okOk|func|待办事项确认后回调的方法|无|否|
       |activeItem|bool|指明本条待办事项是否被选择|false|否|
       |onSelect|func|本条待办事项是否被选中|无|否|
       |onReLoad|func|重新加载待办事项内容的方法,返回Promise对象,参数为待办事项id,返回相应待办事项内容|无|否|
     */
    //var {id, isfinished, name, handler, attendees, progres} = value;

    constructor(props){
        super(props)
        this.state = {id: props.id,
                      readOnly: props.readOnly,
                      value: props.value,
        }
        if(this.props.onReLoad!=undefined&&!isfalse(this.props.id)&&this.props.id.indexOf('NEW')==-1){
            this.props.onReLoad(parseInt(this.props.id)).then((data)=>{
                var st = {id: data.result[0].id,
                          readOnly: this.state.readOnly,
                          value: data.result[0],
                };
                delete st.value.id;
                this.setState(st);
            });
        }
    }

    componentWillUpdate(newProps){
        var oks, nks, ovls, nvls;
        nks = JSON.stringify(Object.entries(newProps.value).sort())
        oks = JSON.stringify(Object.entries(this.props.value).sort())
        if (nks!=oks){
            var st = {id: newProps.id, value: newProps.value};
            delete st.value.id;
            this.setState(st);
        }
    }

    render (){
        var { readOnly,mentionSearch, onOk, activeItem, onSelect} = this.props;
        var value = this.state.value;
        var dv = {name:'', state: false, handler_id: [], attendee_ids: [], progress: 0, ...value};
        var {id, state, name, handler_id, attendee_ids, progres} = dv;
        id = isfalse(id)? 'rnd_'+parseInt(Math.random()*1000000): id;
        var mens = isfalse(handler_id)? [...attendee_ids]: [handler_id, ...attendee_ids];
        
        var todoChange = (evt)=>{
            mens = evt
        }

        var textOk = (evt)=>{
            this.state.value.name = evt;
            onOk && onOk({name:evt});
        }

        const onMentionOk = (evt)=>{
            var ids=false;
            if (evt.length==1){
                ids = {handler_id: evt[0]}
            } else if (evt.length>1){
                ids = {handler_id: evt[0],
                       attendee_ids: evt.slice(1)
                }
            }
            if (ids){
                this.state.value = {...this.state.value, ...ids};
                onOk && onOk(ids);
            }
        }

        const onFinish = (evt)=>{
            this.state.value.state = evt;
            onOk && onOk({state:evt});
        }

        const onDateTimeChange = (momentDate, dateString)=>{
            var dt2=moment(momentDate).utc();
            var dt3 = dt2.format('YYYY-MM-DD HH:mm:ss');
            if (dv.state){
                this.state.value.end_datetime = dt3;
                dt3 = {end_datetime: dt3}
            } else {
                this.state.value.start_datetime = dt3;
                dt3 = {start_datetime: dt3}
            }
            setTimeout(()=>{
                onOk && onOk(dt3);
            }, 100);
        }

        const itemFocus = (evt)=>{
            onSelect && onSelect(value)
        }
        
        var clsname = state? "siyue-todo-item-wrap siyue-todo-item-finished": "siyue-todo-item-wrap";
        clsname = activeItem? clsname+' siyue-todo-item-select ': clsname;
        const dateFormat = 'YY/MM/DD HH:mm';
        const dfmt = 'YYYY-MM-DD HH:mm:ss';
        var dt = dv.state? value.end_datetime: dv.start_datetime;
        var mdt;

        if (!isfalse(dt)){
            mdt = moment.utc(dt, [dfmt, dateFormat])
            mdt = mdt.local();
            dt = mdt;
        }

        const doubleClick = (evt)=>{
            this.props.onDoubleClick && this.props.onDoubleClick(evt);
            stopEventPropagate(evt);
        }

        const readOnlyRender = ()=>{
            return (
                <span key={id} className={clsname} tabIndex="-1"  onDoubleClick={doubleClick} data-resid={id}>
                <SyCheckbox value={state} readOnly={readOnly} />
                <ValueLabel props={{value:name}}/>
                <div style={{width:'5px'}} />
                <SySelect selected={mens} readOnly={readOnly}/>
                <div style={{width:'5px'}} />
                {dt==''?null:<ValueLabel props={{value:dt?dt.format(dateFormat): ''}}/>}
                </span>
            )
        }

        const editableRender = ()=>{
            return (
                <span key={id} className={clsname} tabIndex="-1" onFocus={itemFocus} contentEditable="false" onDoubleClick={doubleClick} data-resid={id}>
                <SyCheckbox value={state} onOk={onFinish} readOnly={readOnly} />
                <SyLineEditor value={name} mentionSearch={mentionSearch} onOk={textOk} readOnly={readOnly}/>
                <div style={{width:'5px'}} />
                <SySelect items={mentionSearch} dataSearch={mentionSearch} dataSearchProps={{rowsPerPage:10, cachePages:1}} multiSelect={true} onOk={onMentionOk} selected={mens} readOnly={readOnly}/>
                <div style={{width:'5px'}} />        
                <DatePicker defaultValue={dt} format={dateFormat} allowClear={false} showTime style={{width:'98px'}} onChange={onDateTimeChange} ref={
                    node=>{
                        if (node){
                            //当没有指定日期时清理残留在日期节点的内容
                            if(isfalse(dt)){
                                node._reactInternalInstance._renderedComponent._renderedComponent._hostNode.firstChild.firstChild.value = '';
                            }
                        }
                    }
                }/>
                </span>
            );                
        }

        return (
            <NoWrap>{readOnly?readOnlyRender(): editableRender()}</NoWrap>
        )
    }
}

SyTodoItem.propTypes = {
    value: PropTypes.array,
    readOnly:PropTypes.boolean,
    mentionSearch: PropTypes.func,
    onOk: PropTypes.func,
};

registryWidget(SyTodoItem, 'SyTodoItem');
registryMarkdownWidget(SyTodoItem, 'SyTodoItem');
export default SyTodoItem;





