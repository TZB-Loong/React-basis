// import { PropTypes } from 'react';
import PropTypes from 'prop-types';
import { Input, Button, Modal, Select, Icon } from 'antd';
import createWidget from '../_createWidget';
import { registryFormWidget, registryWidget } from '../_widgets';
import { isfalse, stopEventPropagate} from '../../utils';
import {hasClass, isNode, indexOfNodes, getCaretPosition, setCaretPosition, clearCaretSelection, moveCaretLeft, moveCaretRight, createReactDom, moveCaretToNextSibling, moveCaretToPrevSibling } from '../../utils/domUtils';
import {apps, store } from '../../midware';
import SyMention from '../SyMention';

import '../SiYueEditor.css'

const InputGroup = Input.Group;
const Option = Select.Option;


/*
   增加点击联系人或联系人获取焦点时弹出联系人
 */

class Mention extends React.Component {
    constructor(props){
        /*
           props.props

           |---|---|---|---|---|
           |名称|类型|说明|默认值|是否必须|
           |appId|int|组件所对应的app id,自动生成|否|是|
           |datasourceId|int|组件所对应的数据源id,自动生成|否|是|

         */
        super(props)
        this.state = {
            showList: true,
            mentionList: false,
            selectedIndex: -1,
            value: [],
            inputValue: '',
            searchValue: undefined,
            searching:false
        }
        this._searchValue = '';
        this._searching = false;
        this._timer=null;
    }

    keyDown = (evt) => {
        if (evt.keyCode == 13){
            //回车键，选择第一个选项
            var node = evt.target.parentNode;
            while (!hasClass(node, 'siyue-mention-wrap')){
                node = node.parentNode;
            }
            //moveCaretRight(node);
            moveCaretToNextSibling(node);
            node.parentNode.focus();
            this.setState({selectedIndex: 0, showList: false, value: this.state.mentionList[0]});
            if (this.props.onOk){
                this.props.onOk(this.state.mentionList[0]);
            }
            stopEventPropagate(evt);
        }
        var pos=getCaretPosition();
        if (pos.node.nodeName=='#text' && pos.node.textContent.substr(0,1)=='@' && pos.location==0){
            setCaretPosition(pos.node, 1);
        }
    }
    
    keyUp = (evt) => {
        //var pos=getCaretPosition();
        if (isfalse(evt.target.textContent)){
            evt.target.textContent = '@';
            setCaretPosition(evt.target, 1);
        } else {
            if(!isfalse(this._timer)){
                clearTimeout(this._timer);
            }
            //为减少连续输入时查询次数，输入结束延时0.5秒后再执行查询
            this._timer = setTimeout(()=>{
                this.setState({inputValue:evt.target.textContent});
            }, 300);
        }
    }

    itemClick = (evt)=>{
        var item = [parseInt(evt.target.value), evt.target.dataset.text];
        
        var node = evt.target.parentNode;
        while (!hasClass(node, 'siyue-mention-wrap')){
            node = node.parentNode;
        }
        moveCaretToNextSibling(node);
        this.setState({selectedIndex: 0, showList: false, value: item});
        if (this.props.onOk){
            this.props.onOk(item);
        }
    }

    render() {
        var props = this.props;
        var ds = store.getAppDatasource(props.appId, props.datasourceId);
        const fb = (data) => {
            this._searching = false;
            this.setState({mentionList: data.result, searching: false});
        };
        //是否需要查询联系人
        if (this.state.showList==true&&!this._searching&&this._searchValue!=this.state.inputValue){
            try{
                ds.name_search([], {name: this.state.inputValue.substring(1)}, {}, {}, 'ignore', fb,{});
                this.setState({searchValue:this.state.inputValue, searching:true});
                this._searchValue = this.state.inputValue;
                this._searching = true;
            } catch(e){
                this.setState({searching: false});
                this._searching = false;
            }
        }

        const renderList = ()=>{
            return (
                <ul className="ul_box siyue-mention-list ant-dropdown-menu"  style={{"margin-top": props.lineHeight}}>
                {this.state.mentionList.map(item => {
                    return (<li className="siyue-mention-item ant-dropdown-menu-item" value={item[0]} data-text={item[1]} onClick={this.itemClick}>{item[1]}</li>)
                })}
                </ul>
            )
        }
        
        return (
            <span>
            {isfalse(this.state.showList)? <span className="siyue-mention" value={isfalse(this.state.value)?0:this.state.value[0]} data-text={isfalse(this.state.value)?'':this.state.value[1]} ref={e => {
                if(!isfalse(e)){
                    while(!hasClass(e, 'siyue-mention-wrap')){
                        e = e.parentNode;
                    }
                    e.style.position = "relative";
                    if (e.nextSibling==null){
                        setCaretPosition(e.parentNode, e.parentNode.childNodes.length);
                    } else {
                        setCaretPosition(e.nextSibling, 0);
                    }
                    
                }
            }
            }>@{isfalse(this.state.value)?'': this.state.value[1]} </span>: <p className="siyue-mention-input" contentEditable="true" onKeyDown={this.keyDown}  ref={e => {
                if(!isfalse(e)){
                    if (e.textContent=='@'){
                        setCaretPosition(e, 1);
                    }
                    e.focus();
                    e.onkeydown=this.keyDown;
                    e.onkeyup=this.keyUp;
                }
            }
            } >@</p>}
            {!isfalse(this.state.showList) && !isfalse(this.state.mentionList) ? renderList(): null}
            </span>
        )
    }
}


class textEditor extends React.Component {
    constructor(props) { //默认时开始的
        super(props)
        this.state = {
            show: false,
            visible: false,
            imgSrc: '',
            videoSrc: '',
            videoType: '',
            titleValue: '',
            inputValue: '',
            locationValue: '',
            left: '',
            top: '',
            onkeyDownValue:'',
            mentions:{newid:1}
        }
    }

    componentDidMount() {
        //在首次render函数执行后会执行这个函数,第二次render之后不执行
        //去掉外层的p标签
        this.refs.editor.innerHTML = this.props.defaultValue.replace(/(^\<p[\d\D]*?\>)|(\<\/p\>$)/g,'');
        setTimeout(()=>{this.refs.editor.focus();},10);
    }

    insertContentNode = (tag, node, pos)=>{
        /*插入新节点
           tag, 接入节点标签
           node, 接入的新节点所在的父节点，为空时以光标所在位置为准
           pos,插入位置，为空时以光标所在位置为准，指定node时没指定pos则pos默认为0
         */

        if (isfalse(window.getSelection) && document.selection && document.selection.type != "Control") {
            return
        }
        var sel, range, new_node;
        new_node = document.createElement(tag);
        if (node==null || isfalse(node)){
            sel = window.getSelection();
            if (isfalse(sel.getRangeAt) || isfalse(sel.rangeCount)){
                return
            }
            range = sel.getRangeAt(0);
            range.insertNode(new_node);
        } else {
            range = document.createRange();
            pos = isfalse(pos)? 0: pos;
            if(node.nodeName=='#text'){
                range.selectNode(node);
                setCaretPosition(node, pos);
                range.insertNode(new_node);
            } else {
                if(node.childNodes.length==0){
                    node.appendChild(new_node);
                } else {
                    node.insertBefore(new_node, node.childNodes[pos]);
                }
            }
        }
        return new_node;
    }

    mentionOk = (data)=>{
        this.refs.editor.focus();
        var p = getCaretPosition();
        var i=0;
        if (p.node.nodeName=='BR'){
            //如果选择的br节点，为了避免在br节点内创建新节点，跳出br节点
            moveCaretRight(p.node);
        }
        this.refs.editor.focus();
        this.setState({
            locationValue: p
        })
    }

    render() {
        /*
           在xml定义字段时mentionDatasourceId属性指定关联联系人的数据源id,没有指定mentionDatasourceId的编辑器禁用联系人关联功能
           
         */
        var props = { ...this.props }
        var self = this;
        var app = apps.getApp(props.props.appId);
        var appid = isfalse(app.props.action.rootAppId)? props.props.appId: app.props.action.rootAppId;
        var mtds = props.props.mentionDatasourceId;
        var ds = store.getAppDatasource(appid, mtds);
        
        const onMouseDown = (e)=>{
            //鼠标按下去的事件
            if(isfalse(e.target.value)&&self.state.show){
                setCaretPosition(self.refs.fd,self.state.keyLoactionValue)
                self.setState({
                    show: false
                })
                //删除调弹出的列表
                self.state.onkeyDownValue.node.parentNode.removeChild(self.state.onkeyDownValue.node.nextSibling)
                
            }
        }

        const deleteLeftObject = (node, position)=>{
            /*向左删除对象（联系人）节点
               node,当前节点
               position,光标所在位置
               return,需要删除的对象（联系人）节点
               ----
               将当前节点与联系人之间的空白节点一并删除
             */
            var enodes=[], pnode;
            if (node.nodeName == '#text'){
                if(position==0){
                    pnode=node.previousSibling;
                }
            } else {
                pnode = node.childNodes[position-1];
            }
            while(isNode(pnode) && pnode.nodeName=='#text' && pnode.length==0){
                enodes.push(pnode);
                pnode = pnode.previousSibling;
            }
            if(hasClass(pnode, 'siyue-mention-wrap')){
                enodes.map(n=>{
                    n.parentNode.removeChild(n);
                });
            } else {
                pnode = undefined;
            }
            enodes.splice(0,enodes.length);
            return pnode;
        }

        const deleteRightObject = (node, position)=>{
            /*向右删除对象（联系人）节点
               node,当前节点
               position,光标所在位置
               return,需要删除的对象（联系人）节点
               ----
               将当前节点与联系人之间的空白节点一并删除
             */
            var enodes=[], pnode;
            if (node.nodeName == '#text'){
                if(position>=node.length){
                    pnode=node.nextSibling;
                }
            } else {
                pnode = node.childNodes[position];
            }
            while(isNode(pnode) && pnode.nodeName=='#text' && pnode.length==0){
                enodes.push(pnode);
                pnode = pnode.nextSibling;
            }
            if(hasClass(pnode, 'siyue-mention-wrap')){
                enodes.map(n=>{
                    n.parentNode.removeChild(n);
                });
            } else {
                pnode = undefined;
            }
            enodes.splice(0,enodes.length);
            return pnode;
        }
        
        const mouseUp = (evt)=>{
            this.setState({
                locationValue: getCaretPosition()
            })
        }
        
        const keyUp = (evt) => {
            var pos = getCaretPosition();
            if (!(hasClass(pos.node.parentNode, 'siyue-mention-input') || hasClass(pos.node, 'siyue-mention-input'))){
                this.setState({
                    locationValue: pos
                })
            }
        }

        const mentionQuery = (name, callback)=>{
            console.log('sy editor mention query', name, callback);
            //var dsid = 'res_partner_mention_ids_backend';
            var mtds = store.getAppDatasource(props.props.appId, 'res_partner_mention_ids_backend');
            mtds.name_search([], {name: name}, {}, {}, 'ignore', callback,{});            
            
        }
        
        const removeNode = (node)=>{
            /*删除指定的节点
               如果节点前后节点都是空的文本节点，则删除其中一个
             */
            
            if (isNode(node.nextSibling) && isNode(node.previousSibling) && node.nextSibling.nodeName=='#text' && node.nextSibling.length==0 &&node.previousSibling.nodeName=='#text' && node.previousSibling.length==0){
                if(this.state.locationValue.node!==node.nextSibling){
                    node.parentNode.removeChild(node.nextSibling)
                } else {
                    node.parentNode.removeChild(node.previousSibling)
                }
            }
            node.parentNode.removeChild(node);
        }
        
        const onKeyDown = (e) => {   //键盘监听事件
            var e = e || window.event || arguments.callee.caller.arguments[0], node, i, lc;
            var pos = getCaretPosition();
            if (hasClass(pos.node.parentNode, 'siyue-mention-input')){
                pos.node.parentNode.focus();
                return
            } else if(hasClass(pos.node, 'siyue-mention-input')){
                pos.node.focus();
                return
            }
            if (e.keyCode == 27){
                //阻止按esc键关闭窗口
                stopEventPropagate(e);
            } else if (e.keyCode == 8 &&!(e.shiftKey||e.ctrlKey||e.altKey||e.metaKey)){
                //backspace后删键
                node = deleteLeftObject(this.state.locationValue.node, this.state.locationValue.location);
                if (isNode(node)){
                    removeNode(node);
                    this.setState({
                        locationValue: getCaretPosition()
                    })
                    stopEventPropagate(e);
                }
            } else if (e.keyCode == 37 && !(e.shiftKey||e.ctrlKey||e.altKey||e.metaKey)){
                //向左方向键
                lc = this.state.locationValue.location;
                node = this.state.locationValue.node;
                moveCaretLeft(node, lc);
                this.setState({
                    locationValue: getCaretPosition()
                })
                stopEventPropagate(e);
                this.refs.editor.focus();
            }else if (e.keyCode == 39 && !(e.shiftKey||e.ctrlKey||e.altKey||e.metaKey)){
                //向右方向键
                moveCaretRight(this.state.locationValue.node, this.state.locationValue.location);
                this.setState({
                    locationValue: getCaretPosition()
                })
                this.refs.editor.focus();
                stopEventPropagate(e);
            } else if (e.keyCode == 46 &&!(e.shiftKey||e.ctrlKey||e.altKey||e.metaKey)){
                //删除键
                node = deleteRightObject(this.state.locationValue.node, this.state.locationValue.location);
                if (isNode(node)){
                    removeNode(node);
                    this.setState({
                        locationValue: getCaretPosition()
                    })
                    stopEventPropagate(e);    
                }
            } else if (e.keyCode == 50 && e.shiftKey) {  //shift+2 @键 英文状态下
                
                if(self.state.show){
                    self.setState({
                        show:false
                    })
                }
                else{
                    var node = this.state.locationValue.node, pos = this.state.locationValue.location;
                    var span = self.insertContentNode('span');
                    span.setAttribute('contentEditable', 'false');
                    span.className = 'siyue-mention-wrap-outer no-caret';
                    var mid = this.state.mentions.newid;
                    var mentions = {...this.state.mentions};
                    var mention = {show:true, id: mid};
                    mentions[mid] = mention;
                    this.setState({mentions: mentions});
                    var dsid = 'res_partner_mention_ids_backend';
                    var mtsds = store.registryDatasource(props.props.appId, 'res.partner', {datasourceId: dsid});
                    //createReactDom(Mention, {appId: props.props.appId, datasourceId: dsid,  mention: mention, onOk:this.mentionOk}, span);
                    createReactDom(SyMention, {query: mentionQuery, onOk:this.mentionOk, showList:true}, span);
                    //屏蔽掉@原本的效果
                    if (e.preventDefault) e.preventDefault();  //标准技术  
                    if (e.returnValue) e.returnValue = false;  //IE
                }
            }
            else { //点击其他键盘时，选择列表会消失
                if(self.state.show){
                    self.setState({
                        show: false
                    })
                    //删除调弹出的列表
                    //self.state.onkeyDownValue.node.parentNode.removeChild(self.state.onkeyDownValue.node.nextSibling)
                }
            }
        }
        
        const fileChange = () => {
            if (self.state.titleValue == '插入图片') { //当点击的为插入图片时响应
                //判断是否有值 
                if (!isfalse(self.refs.files.value)) { //没有选择的情况下
                    //判断浏览器是否支持文件内容读取接口,不是放在这里进行判断  ,放在控制弹出框的函数中进行判断
                    var filesObject = self.refs.files.files[0] //开始读取文件内容
                    if (!/image\/\w+/.test(filesObject.type) || filesObject.size > 1024 * 4000) { //判断文件类型及大小
                        alert('请选择图片,或者图片超过4M')  //当不是图片文件时,或者文件过大
                        self.refs.files.value = '';
                    } else {  //当满足这些条件时,可以进行添加
                        var reader = new FileReader();   //创建一个新的FileReader接口
                        reader.readAsDataURL(filesObject);   //读取文件的url
                        reader.onload = function (evt) {
                            //文件存放在evt.target.result
                            self.setState({
                                imgSrc: evt.target.result
                            })
                        }
                    }
                }
            } else if (self.state.titleValue == '待办事件') {
                // 判断是否有值
                if (!isfalse(self.refs.files.value)) {//在没有输入的情况下
                    // alert('不能为空')    
                    self.setState({
                        inputValue: self.refs.files.value
                    })
                }
            } else {
                if (!isfalse(self.refs.files.value)) { //没有选择的情况下 
                    var filesObject = self.refs.files.files[0]
                    if (!/video\/\w+/.test(filesObject.type) || filesObject.size > 1024 *10000) {
                        alert('请选择视频,或者视频超过10M')
                        self.refs.files.value = '';
                    } else {
                        var reader = new FileReader();   //创建一个新的FileReader接口
                        reader.readAsDataURL(filesObject);   //读取文件的url
                        reader.onload = function (evt) {
                            //文件存放在evt.target.result
                            self.setState({
                                videoSrc: evt.target.result
                            })
                        }
                    }
                }
            }
        }

        const showModal = (e) => {
            if(isfalse(this.state.locationValue)){
                this.setState({
                    locationValue: {node:this.refs.editor, location:0}
                })
            }
            e.stopPropagation(); //阻止冒泡事
            e.preventDefault();    // 阻止默认事件 
            //var location = getCaretPosition(); //获取到光标位置 //在点击的是时候获取开始的光标的位置
            setTimeout(() => { //保证每次点击是出现的都是空值
                if (!isfalse(self.refs.files.value)) {
                    self.refs.files.value = ''
                }

            }, 1)
            if (typeof FileReader == 'undefined') {
                alert('你的浏览器不支持FileReader接口无法读取文件内容')
            } else {
                if (!isfalse(e.target.value)) {
                    self.setState({ //状态更新,弹出框控制
                        visible: true,
                                    titleValue: e.target.value
                    });
                } else {
                    self.setState({ //状态更新,弹出框控制
                        visible: true,
                                    titleValue: e.target.parentNode.value
                    });
                }
            }
        }

        const insertObject = ()=>{
            var pnode, img, inode, ready;
            if (!isfalse(self.state.imgSrc)) { //添加图片 //在添加的过程中还好像是没有好好的清除这个状态了
                if (isfalse(this.state.locationValue) || !isNode(this.state.locationValue.node)){
                    inode = this.insertContentNode('img');
                } else {
                    inode = this.insertContentNode('img', this.state.locationValue.node, this.state.locationValue.location);
                }
                if (!isNode(inode)){
                    alert('插入图片失败，请重试');
                    return
                }
                //为新建的元素标签添加属性和值
                inode.setAttribute('src', self.state.imgSrc);
                inode.className = 'image';
                moveCaretRight(this.state.locationValue.node, this.state.locationValue.location);
                //在下拉列表出现时使image的属性发生变化
                delete self.state.imgSrc;  //创建并添加成功后删除
                self.setState({imgSrc: ''});
            }
            else if (!isfalse(self.state.videoSrc)) { //添加视频
                if (isfalse(this.state.locationValue) || !isNode(this.state.locationValue.node)){
                    inode = this.insertContentNode('video');
                } else {
                    inode = this.insertContentNode('video', this.state.locationValue.node, this.state.locationValue.location);
                }
                if (!isNode(inode)){
                    alert('插入视频失败，请重试');
                    return
                }
                moveCaretRight(this.state.locationValue.node, this.state.locationValue.location);
                //为新建的元素标签添加属性和值
                inode.setAttribute('src', self.state.videoSrc);
                inode.className = 'video';
                inode.setAttribute('controls', 'controls');//添加控件
                
                self.setState({videoSrc: ''});
                delete self.state.videoSrc;  //在创建并添加成功后,删除 
            }
            moveCaretRight(this.state.locationValue.node, this.state.locationValue.location);
            setTimeout(()=>{self.refs.editor.focus();
                this.setState({
                    locationValue: getCaretPosition()
                })
            }, 100)
        }
        
        const handleOk = () => {
            self.setState({
                confirmLoading: true,
            });
            var isInsertDataReady = ()=>{
                //检查插入的数据是否准备好
                ready = !isfalse(self.state.imgSrc) || !isfalse(self.state.videoSrc);
                if (ready){
                    self.setState({
                        visible: false,
                        confirmLoading: false,
                    });
                    insertObject();
                } else {
                    setTimeout(isInsertDataReady, 100);
                }
            }
            isInsertDataReady();
            //self.refs.editor.focus();
        }
        
        const handleCancel = () => { //点击弹出框取消按钮
            self.setState({
                visible: false,
            });
            //在点击取消或者确定时要重新获取到编辑框的焦点
            self.refs.editor.focus();
        }
        
        const onblur = () => { //在失去焦点时,保存修改的内容
            props.onOk(self.refs.editor.innerHTML);
        }

        const paste = (evt)=>{
            var txt = evt.clipboardData.getData('text/plain');
            var span = this.insertContentNode('span');
            span.textContent = txt;
            stopEventPropagate(evt);

        }
        
        const selectChange = (value) => {

            //使用实例直接对样式进行修改,不是通过样式来进行修改的,
            if (value == 'small') {
                self.refs.editor.style.fontSize = '12px';
            } else if (value == 'large') {
                self.refs.editor.style.fontSize = '18px';
            } else {
                self.refs.editor.style.fontSize = '14px';
            }

        }



        const { visible, confirmLoading } = self.state; //接受当前state内的内容

        return (
            <div style={{ minHeight: '400px', width: '180%', marginLeft: "100px" }} >
            <div style={{ height: '50px', lineHeight: '50px', backgroundColor: 'gray' }}>
            <a title='插入图片'><button onClick={showModal} value='插入图片' className='ant-btn'  >
            <Icon type='file-jpg' />
            </button></a>
            <a title='插入视频'><button onClick={showModal} value='插入视频' className='ant-btn'>
            <Icon type='play-circle' />
            </button></a>
            <a title='代办事件'><button onClick={showModal} value='待办事件' className='ant-btn'>
            <Icon type='file-text' />
            </button></a>
            <a title='字体'><Select defaultValue="middle" onChange={selectChange}>
            <Option value="large">large</Option>
            <Option value="middle">middle</Option>
            <Option value="small">small</Option>
            </Select></a>
            </div>

            <div style={{ minHeight: '350px', border: '1px solid gray', fontSize: '14px' }}  onKeyDown={onKeyDown} ref='fd' onBlur={onblur} onMouseDown={onMouseDown} onMouseUp={mouseUp} onKeyUp={keyUp} onPaste={paste} className="siyue-editor-wrap">
            <p ref='editor' contentEditable='true' className="siyue-editor"><br/></p>
            </div>
            <Modal title={self.state.titleValue}
                    visible={visible}
                    onOk={handleOk}
                    confirmLoading={confirmLoading}
                    onCancel={handleCancel}
                >
                    <p> <input type={self.state.titleValue == '待办事件' ? 'text' : 'file'} onChange={fileChange} ref='files' /></p>
                </Modal>
            </div>
        )

    }
}

const WrappedDbEditor = createWidget(textEditor);

const SiYueEditor = ({ field, props }) => {
    return (

        <WrappedDbEditor defaultValue={isfalse(props['value']) ? '' : props['value']} props={props} />

    );
};

SiYueEditor.prototype.propTypes = {
    field: PropTypes.object,
    props: PropTypes.object,
};

registryFormWidget(SiYueEditor,'SiYueEditor');
//registryFormWidget(SiYueEditor, 'html');
export default SiYueEditor;

