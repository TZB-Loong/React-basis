import {widgets,registryWidget} from './_widgets';
import {store,triggers,apps} from '../midware';
import {Modal, Spin} from 'antd';
import {isfalse,_globals} from '../utils';
import './AppRoot.css'
import PropTypes from 'prop-types';
// const PropTypes = React.PropTypes;
const Component = React.Component;

const Dialog = ({title, visible, content, onCancel, onOk, inapp}) => {
    /*
       |---|---|---|---|---|
       |名称|类型|说明|默认值|是否必须|
       |type|string|对话框类型,未实现|无|否|
       |title|string|对话框标题|无|否|
       |visible|bool|是否显示|false|是|
       |content|string,react|字符串或react组件|无|否|
       |onCancel|func|点取消后执行的方法|无|否|
       |onOk|func|点击确认后执行的方法|无|否|
       |inapp|bool|是否属于应用内的对话框,只是对mark位置进行修改|false|是|
     */
    let _ref;
    var dlgcls = isfalse(inapp)? "dialog-wrap": "dialog-wrap appmark"
    return (
        <div className="dialog">
        <div className={dlgcls} ref={e => (_ref = e)}></div>
        <Modal  title={title} visible={visible} onCancel={onCancel} onOk={onOk} getContainer={()=>_ref}>{content}</Modal>
        </div>
    )
}

Dialog.propTypes = {
    title: PropTypes.string,
    visible: PropTypes.bool,
    content: PropTypes.any,
    onCancel: PropTypes.func,
    onOk: PropTypes.func,
    props: PropTypes.object,
    
}

export default Dialog;
