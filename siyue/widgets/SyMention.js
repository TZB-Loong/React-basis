import { PropTypes } from 'react';
import { Input, Button, Modal, Select, Icon } from 'antd';
import createWidget from './_createWidget';
import { registryWidget } from './_widgets';
import { isfalse, stopEventPropagate} from '../utils';
import {hasClass, isNode, indexOfNodes, getCaretPosition, setCaretPosition, clearCaretSelection, moveCaretLeft, moveCaretRight, createReactDom, moveCaretToNextSibling} from '../utils/domUtils';
import {registryMarkdownWidget} from '../utils/markdown'
import {apps, store } from '../midware';
import SyList from './SyList';
import SyScroll from "./SyScroll";

const InputGroup = Input.Group;
const Option = Select.Option;


class SyMention extends React.Component {
    constructor(props){
        /*
           props.props

           |---|---|---|---|---|
           |名称|类型|说明|默认值|是否必须|
           |query|func|用于查询联系人列表的方法|无|否|
           |showList|bool|是否显示选择列表|false|否|
           |onOk|func|选择列表完成选择后调用的函数|无|否|
           |queryProps|object|查找方法的参数|无|否|

           查询方法query参数说明
           没指定时使in用SyMentino.query进行查询
           参数1,对象,查询条件
           参数2,回调函数,完成查询后返回使用回调函数传递参数
         */
        super(props)
        this.state = {
            showList: null,
            mentionList: [],
            selectedIndex: -1,
            value: [],
            inputValue: '',
            searchValue: undefined,
            searching:false,
            searchProps:  this.props.queryProps==undefined? {}: this.props.queryProps,
            searchName:'',
        }
        /* this._searchValue = null;
         * this._searching = false;*/
        this._timer=null;
        this._refNode = null;
    }

    componentWillUpdate(newProps){
        var sname = this.state.inputValue.substring(1);
        if (this.state.seachName!=this.state.inputValue){
            this.state.seachName = this.state.inputValue;
            this.state.searchProps.domain=[['name', 'like', this.state.inputValue.substring(1)]];
        }
    }
    
    keyDown = (evt) => {
        if (evt.keyCode == 13){
            //回车键，选择第一个选项
            moveCaretToNextSibling(this._refNode.parentNode);
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
        if (isfalse(evt.target.textContent)){
            evt.target.textContent = '@';
            setCaretPosition(evt.target, 1);
        } else {
            if(!isfalse(this._timer)){
                clearTimeout(this._timer);
            }
            //为减少连续输入时查询次数，输入结束延时0.5秒后再执行查询
            this._timer = setTimeout(()=>{
                this.state.inputValue = evt.target.textContent;
                this.setState({inputValue:evt.target.textContent});
            }, 100);
        }
    }

    mentionSelect = (evt)=>{
        var item = evt[0];
        moveCaretToNextSibling(this._refNode.parentNode);
        this.setState({selectedIndex: 0, showList: false, value: item});
        if (this.props.onOk){
            this.props.onOk(item);
        }
    }

    query = (evt)=>{
        console.log('metion query', evt);
    }

    render() {
        var props = this.props;
        var query = typeof props.query=='function'? props.query: SyMention.query;
        
        var items = this.state.mentionList;
        var showSelection = !isfalse(typeof this.state.showList=='undefined'||this.state.showList==null? props.showList: this.state.showList);
        
        const onScroll = (event)=>{
            this.state.mentionList = event.fetchedData;
            this.state.searching = false;
            this.setState({mentionList: event.fetchedData, searchinge: false});
        }
        var val = isfalse(this.state.value)? isfalse(props.value)?[0,'']: props.value  :this.state.value;
        var clsname = "siyue-mention-wrap no-caret";
        clsname = !isfalse(props.className)? clsname+' '+props.className: clsname;
        
        return (
            <span contentEditable={false} className={clsname} ref={e=>{
                if (isNode(e)){
                    this._refNode = e;
                }
            }}>
            {!showSelection? <span className="siyue-mention" data-id={val[0]} data-name={val[1]} ref={e => {
                if(isNode(e)){
                    while(!hasClass(e, 'siyue-mention-wrap')){
                        e = e.parentNode;
                    }
                    e.style.position = "relative";
                }}}>@{val[1]}
                </span>:

                <p className="siyue-mention-input" contentEditable="true" onKeyDown={this.keyDown}  ref={e => {
                    if(isNode(e)){
                        e.focus();
                        if (e.textContent=='@'){
                            setCaretPosition(e, 1);
                        }
                        e.style.position = "relative";
                        e.focus();
                        e.onkeydown=this.keyDown;
                        e.onkeyup=this.keyUp;
                    }}} >@</p>
            }
            
            {showSelection?
             <span className='siyue-mention-scroll-wrap' >
                <SyScroll dataSearch={query} dataSearchProps={this.state.searchProps} viewHeight={160} onScroll={onScroll}>
                <SyList ref='selector' onFocus={this.listFocus} items={items} onBlur={this.listBlur} visible={showSelection} onOk={this.mentionSelect} searchValue={this.state.searchValue}/>
                </SyScroll>
                </span>:null
            }
            

            
            </span>
        )
    }
}

SyMention.query = (name, callback)=>{
    console.log('symention', name, callback);
}

registryWidget(SyMention, 'SyMention');
registryMarkdownWidget(SyMention, 'SyMention');
export default SyMention;
