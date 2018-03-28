import { Component } from 'react';
import PropTypes from 'prop-types';
import { Input, Button, Modal, Select, Icon } from 'antd';
import createWidget from '../_createWidget';
import { registryFormWidget, registryWidget } from '../_widgets';
import { isfalse, stopEventPropagate} from '../../utils';
import {hasClass, isNode, indexOfNodes, getCaretPosition, setCaretPosition, clearCaretSelection, moveCaretLeft, moveCaretRight, createReactDom, moveCaretToNextSibling, moveCaretToPrevSibling } from '../../utils/domUtils';
import {apps, store } from '../../midware';
import SyEditor from '../SyEditor';

class DbRichEditor extends Component {

    constructor(props){
        super(props);
        this._TodoDs = store.registryDatasource(props.props.appId, 'todo.todo', {datasourceId: 'todo_todo_backend'});
        this._MentionDs = store.registryDatasource(props.props.appId, 'res.partner', {datasourceId: 'res_partner_mention_ids_backend'});
        this._UsersDs = store.registryDatasource(props.props.appId, 'res.users', {datasourceId: 'res_users_mention_ids_backend'});
    }

    loadTodo = (todo_id)=>{
        /*根据id加载待办事项内容
           返回Promise对象
         */
        var prm = new Promise((resolve, reject)=>{
            var afterload = (data)=>{
                resolve(data);
            };
            this._TodoDs.read([todo_id], 'id,name,state,start_datetime,end_datetime,handler_id,attendee_ids,progress'.split(','), {}, {}, {}, 'ignore', afterload, {});
        })
        return prm;
    }

    
    render(){
        var {field, props} = this.props;

        const mentionSearch = (domain, offset, limit) => {
            var prm = new Promise((resolve, reject)=>{
                var afterload = (data)=>{
                    data.searchResult = data.result.records.map(item=>{return [item.id, item.name]});; 
                    resolve(data);
                };
                domain = isfalse(domain)? []: domain
                this._MentionDs.search2(['id', 'name'], domain, {}, {offset: offset, limit: limit}, 'ignore', afterload);
            })
            return prm;            
        }

        const userSearch = (domain, offset, limit) => {
            var prm = new Promise((resolve, reject)=>{
                var afterload = (data)=>{
                    data.searchResult = data.result.records.map(item=>{return [item.id, item.name]});; 
                    resolve(data);
                };
                domain = isfalse(domain)? []: domain
                this._UsersDs.search2(['id', 'name'], domain, {}, {offset: offset, limit: limit}, 'ignore', afterload);
            })
            return prm;            
        }

        const onTextOk = (text)=>{
            var ds = store.getAppDatasource(props.appId, props.datasourceId);
            var up={};
            up[field.name] = text;
            ds.commit({type:'modi', updater:up});
        }

        return <SyEditor props={props} mentionQuery={mentionSearch} userQuery={userSearch} defaultValue={props.value} onOk={onTextOk} todoReLoad={this.loadTodo} queryProps={{rowsPerPage:10, cachePages:1}}/>
    }
}
DbRichEditor.prototype.propTypes = {
    field: PropTypes.object,
    props: PropTypes.object,
};


registryFormWidget(DbRichEditor,'DbRichEditor');
registryFormWidget(DbRichEditor, 'html');
export default DbRichEditor;
