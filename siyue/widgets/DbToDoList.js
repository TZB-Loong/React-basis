// import { PropTypes } from 'react';
import PropTypes from 'prop-types';
import { Input, Checkbox, Select, Button } from 'antd';
import createWidget from './_createWidget';
import { registryFormWidget, registryWidget } from './_widgets';
import {hasClass} from '../utils/domUtils'; 
import { isfalse } from '../utils';
import { store, triggers } from '../midware'
import "./DbToDoList.css"; 
import SyCheckbox from './SyCheckbox';
import SyTodoItem from './SyTodoItem';

class DbToDoList extends React.Component {
    constructor(props) {
        super(props);
        store.registryDatasource(props.props.appId, 'res.users', {datasourceId: 'res_users_mention_ids_backend'});
    }

    render() {
        var props = { ...this.props };
        var self = this;
        var t;
        var datasource = store.getAppDatasource(props.props.appId, props.props.datasourceId);
        var editState = store.apps[self.props.props.appId].app.editState
        var readOnly = editState=='browse';
        
        const onItemOk = (data)=>{
            datasource.commit({type:'modi', updater:data})
        }
        
        const onDbClick = (evt) => { //响应双击事件
            this.props.onDoubleClick&&this.props.onDoubleClick(evt);
        }

        const partnerSearch=(name, callback)=>{
            var ptds = store.getAppDatasource(props.props.appId, 'res_users_mention_ids_backend');
            ptds.name_search([], {name:name}, {}, {}, 'ignore', callback, {});
        }

        const onItemSelect = (evt)=>{
            var node = evt.nativeEvent.target;
            if (hasClass(node, 'siyue-DbToDoList-flexm')){
                return
            }
            while (!hasClass(node, 'siyue-todo-item-wrap')){
                node = node.parentNode;
            }
            if(!isfalse(node.dataset.resid)){
                datasource.goto({id:parseInt(node.dataset.resid)});
            }
        }
        
        const getTodoItems = ()=>{
            return datasource.props.rowsKeys.map((rowid, i) => {
                var row = datasource.props.rows[rowid];
                return <SyTodoItem value={row} mentionSearch={partnerSearch} onSelect={onItemSelect} activeItem={rowid==datasource.props.currentId} onOk={onItemOk} readOnly={readOnly}/>

            });
        }

        return (
            <div className='siyue-DbToDoList-flex'>
            <div className='siyue-DbToDoList-flexm' onClick={onItemSelect} onDoubleClick={onDbClick}>
            {getTodoItems()}
            </div>
            </div>
        );
    }
}


DbToDoList.prototype.propTypes = {
    field: PropTypes.object,
    props: PropTypes.object,
};

registryWidget(DbToDoList, 'DbToDoList');
export default DbToDoList;


