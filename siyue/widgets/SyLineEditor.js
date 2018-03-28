// <<<<<<< Updated upstream
// // import { PropTypes, createElement, Component } from 'react';
// =======
import { Input, Button, Modal, Select, Icon } from 'antd';
import { Component, createElment } from 'react';
import PropTypes from 'prop-types';
import React from 'react';
// >>>>>>> Stashed changes
import createWidget from './_createWidget';
import { registryFormWidget, registryWidget } from './_widgets';
import {browsers, isfalse, stopEventPropagate} from '../utils';
import {hasClass, isNode, indexOfNodes, getCaretPosition, setCaretPosition, clearCaretSelection, moveCaretLeft, moveCaretRight, createReactDom } from '../utils/domUtils';
import {renderMarkdown, parse_tag, renderTag} from '../utils/markdown';
import markdown from '../utils/markdown';
import {apps, store } from '../midware';
import './SiYueEditor.css'
import SyMention from './SyMention';
import SyTodoItem from './SyTodoItem';
import SySpan from './SySpan';
import SyVideo from './SyVideo';
import './SiYueEditor.css';

const InputGroup = Input.Group;
const Option = Select.Option;

//chrome中选择内容后无法直接输入文本进行替换

class SyLineEditor extends Component {
    /*
       |---|---|---|---|---|
       |名称|类型|说明|默认值|是否必须|
       |defaultValue|string|需要显示的内容|''|否|
       |mentionQuery|func|联系人查找方法|无|否|
       |onOk|func|编辑完成后回调的函数|无|否|

       ----

       组件相关值的状态:
       属性值, this.props
       旧属性值,在componentWillUpdate方法中的this.props
       新属性值,在componentWillUpdate方法中的传入的属性参数
       状态值,this.state
       
       为了减少文本转换markdown的转换次数,只有在必要时才做一次转换.
       1. 将转换的markdown对象暂存在state.markdownTags中  
       2. 将暂存的markdown对象文本暂存在state.text
       3. 要及时清理暂存的markdown对象.
       比传进来的新文本和state缓存的文本state.text,两者不一致时更新暂存的文本和对象

     */
    constructor(props) { //默认时开始的
        super(props)
        var html = isfalse(this.props.defaultValue)? '': this.props.defaultValue.replace(/(^\<p[\d\D]*?\>)|(\<\/p\>$)/g,'');
        this.selection_start = ['i', {className:'selection-start'}, ''];
        this.selection_end = ['i', {className:'selection-end'}, ''];
        var npts = parse_tag(html);
        if (npts.length==0){
            npts.splice(0, 0, ['SySpan', {}, '']);
        } else {
            if (npts[0][0]!='SySpan'){
                npts.splice(0, 0, ['SySpan', {}, '']);
            }
            if (npts[npts.length-1][0]!='SySpan'){
                npts.push(['SySpan', {}, '']);
            }
        }
        this.state = {
            dialogVisible: false,
            focusin: false,
            left: '',
            top: '',
            mentions:{newid:1},
            ismodified: false,
            caretPosition: false,
            selectedTags: false,
            markdownTags: npts,
            text: this.props.html,
            todoItemValue: {},
            activeMention: undefined,
            caretBackward: false,
            chineseInput: false,
        }
    }

    componentWillUpdate(newProps){
        if (isfalse(newProps.value)){
            this.state.markdownTags = [['SySpan', {}, '']];
        } else if (this.state.text!=newProps.value){
            var npts = parse_tag(newProps.value);
            this.state.text = newProps.value;
            this.state.markdownTags = ntps;
            this.setState({markdownTags: ntps});
        }
    }
    

    isBlurInEditor = (evt)=>{
        /*检测焦点是否还在编辑器内
         */
        var np = evt.relatedTarget;
        if (this.state.dialogVisible){
            return true}
        while(np!=null && !hasClass(np, 'siyue-editor-frame')){
            np = np.parentNode;
        }
        return np!=null 
    }

    deleteSelectedTags = (update)=>{
        /*删除已选择的内容
           update,删除后是否更新内容,默认为true
         */
        if(isfalse(this.state.selectedTags)){
            return;
        }
        var [sni, eni] = this.state.selectedTags;
        var cpos = this.state.caretPosition;
        var tgs = this.state.markdownTags, ipos =sni;
        var stg = tgs[sni[0]], etg = tgs[eni[0]];
        var si, ei, tg1, tg2;
        if (etg[0]=='SySpan' && eni[1]>=etg[2].length || etg[0]!='SySpan'){
            //结束选择点位于节点末,整个节点将被删除
            ei = eni[0];
        } else if (eni[1]==0){
            //结束选择点位于节点首位,删除不影响结束选择节点
            ei = eni[0]-1;
        }else {
            //结束选择点位于节点中间,拆分节点
            [tg1, tg2] = this.tagSplice(...eni);
            tgs.splice(eni[0], 1, tg1, tg2);
            ei = eni[0];
        }
        if (stg[0]=='SySpan' && sni[1]==0 || etg[0]!='SySpan'){
            //开始选择点位于节首,整个节点将被删除
            si = sni[0];
            ipos = [si, 0]
        } else if (sni[1]>=stg[2].length){
            //开始选择点位于节点末,删除不影响开始选择节点
            si = sni[0]+1;
        }else {
            //开始选择点位于节点中间,拆分节点
            [tg1, tg2] = this.tagSplice(...sni);
            tgs.splice(sni[0], 1, tg1, tg2);
            si = sni[0]+1;
            ei++;
            ipos = [sni[0], tg1[2].length]
        }

        tgs.splice(si, ei-si+1);
        this.state.selectedTags = false;
        this.state.caretPosition = ipos;
        if(update!==false){
            this.setState({selectedTags:false, caretPosition: ipos, updateCaret: true});
        }
    }

    _setDomCaretPosition = (node, position)=>{
        /*设置浏览器实际节点的光标位置

           |---|---|---|---|---|
           |名称|类型|说明|默认值|是否必须|
           |node|dom|浏览器节点|无|是|
           |position|int|光标在节点的位置|无|是|

         */
        var range = document.createRange();
        var sel = window.getSelection();
        try {
            range.selectNode(node);
            range.setStart(node, position);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        } catch (err) {
            console.log('_setDomCaretPoisition error:\n', node, position, err)
        }        
    }
    
    setCaretPosition = (tagPosition, caretPosition)=>{
        /*根据虚拟节点设置光标位置

           |---|---|---|---|---|
           |名称|类型|说明|默认值|是否必须|
           |tagPosition|int|标签位置|无|是|
           |caretPosition|int|光标在标签内的位置|无|是|

         */
        var tgs = this.state.markdownTags;
        var ctg = tgs[tagPosition];
        var editor = this.state.editorNode;
        if (ctg==undefined){
            return;
        }
        var pos = caretPosition, cnode;
        if (ctg[0]=='SySpan'){
            pos = pos <= ctg[2].length? pos: ctg[2].length;
            if (isfalse(ctg[2])){
                cnode = this.state.editorNode.childNodes[tagPosition];
                pos = 1;
            } else {
                cnode = this.state.editorNode.childNodes[tagPosition].firstChild;
            }
            this._setDomCaretPosition(cnode, pos);
        }
        else {
            //指定位置的标签不可移入光标,尝试将光标前后标签
            if (tgs[tagPosition-1][0]=='SySpan'){
                this.state.caretPosition = [tagPosition-1, tgs[tagPosition-1][2].length];
                this.setCaretPosition(tagPosition-1, tgs[tagPosition-1][2].length);
            } else {
                //前后都不可移入光标,插入空白节点
                tgs.splice(tagPosition, 0, ['SySpan', {}, '']);
                this.state.caretPosition = [tagPosition, 0]
                this.setState({caretPosition: this.state.caretPosition});
            }
        }
    }
    
    setEditorSelection = ()=>{
        /*设置选择效果
         */
        if (this.state.selectedTags==false){
            return
        }
        var [sni, eni] = this.state.selectedTags;
        var snode = this.state.editorNode.childNodes[sni[0]].firstChild;
        var enode = this.state.editorNode.childNodes[eni[0]].firstChild;
        if (snode==null || enode==null) return;
        try {
            var selection = document.getSelection();
            if (this.state.caretBackward){
                selection.setBaseAndExtent(enode, hasClass(enode, 'siyue-empty-tag-indicator')?0: eni[1], snode, hasClass(snode, 'siyue-empty-tag-indicator')?0: sni[1]);
            } else {
                selection.setBaseAndExtent(snode, hasClass(snode, 'siyue-empty-tag-indicator')?0: sni[1], enode, hasClass(enode, 'siyue-empty-tag-indicator')?0: eni[1]);
            }
        } catch (err) {
            console.log('error', err);
        }        
    }
    
    editorSelectRange = ()=>{
        var sel1 = window.getSelection(), rng, scnd, ecnd;
        var backwards = false;
        if (!sel1.isCollapsed) {
            var range = document.createRange();
            range.setStart(sel1.anchorNode, sel1.anchorOffset);
            range.setEnd(sel1.focusNode, sel1.focusOffset);
            backwards = range.collapsed;
        }
        for (var i=0;i<sel1.rangeCount; i++){
            rng = sel1.getRangeAt(i);
            scnd =  this.findEditorChildNode(rng.startContainer);
            ecnd =  this.findEditorChildNode(rng.endContainer);
            if (scnd!=null || rng.startContainer==this.state.editorNode ||ecnd!=null || rng.endContainer==this.state.editorNode){
                return [rng, scnd, ecnd, backwards];
            }
        }
        return false;
    }

    selectRangeToPosition = (selection)=>{
        var [rng, stn, endn, backwards] = selection, sni, eni;
        if (stn!==null){
            sni = Array.prototype.indexOf.call(this.state.editorNode.childNodes, stn);
            sni = [sni, rng.startOffset];
        } else {
            sni = [0, 0];
        }
        if (endn!==null){
            eni = Array.prototype.indexOf.call(this.state.editorNode.childNodes, endn);
            eni = [eni , rng.endOffset];
        } else {
            var ltg = this.state.markdownTags[this.state.markdownTags.length-1];
            eni = [this.state.markdownTags.length-1, ltg[0]=='SySpan'? ltg[2].length: 0]
        }
        return [sni, eni];
    }

    tagSplice = (tagPosition, splicePosition)=>{
        /*将span标签分拆为两个
         */
        var tg = this.state.markdownTags[tagPosition], s1, s2, tg1, tg2;
        if (tg[0]=='SySpan'){
            s1 = tg[2].substr(0, splicePosition);
            s2 = tg[2].substr(splicePosition, tg[2].length);
            tg1 = ['SySpan', {...tg[1], children:s1}, s1];
            tg2 = ['SySpan', {...tg[1], children:s2}, s2];
            return [tg1, tg2];
        }
        return false;
    }

    insertTag = (tag, pos)=>{
        /*插入标签

           |---|---|---|---|---|
           |名称|类型|说明|默认值|是否必须|
           |tag|array|react定义数组|无|是|
           |pos|array|插入标签的位置数组,[节点在编辑器内位置,坐标在节点内位置]|无|否|
           
         */
        var [cpos, ipos] = pos==undefined?this.state.caretPosition: pos, tg, s1, s2;
        if (this.state.selectedTags==false){
            tg = this.state.markdownTags[cpos];
            if (tg[0]=='SySpan'){
                s1 = tg[2].substr(0, ipos);
                s2 = tg[2].substr(ipos, tg[2].length);
                this.state.markdownTags.splice(cpos, 1);
                this.state.markdownTags.splice(cpos, 0, ['SySpan', {...tg[1], children:s2}, s2]);
                this.state.markdownTags.splice(cpos, 0, tag);
                this.state.markdownTags.splice(cpos, 0, ['SySpan', {...tg[1], children:s1}, s1]);
                this.state.caretPosition = [cpos+2, 0];
                this.setState({caretPosition: this.state.caretPosition});
            }
        }
    }
    
    mentionOk = (data)=>{
        var mention = this.state.activeMention;
        var mtg = this.state.markdownTags[this.state.activeMention[0]+1];
        Object.assign(mtg[1], {value: data, showList: false});
        this.state.editorNode.focus();
        this.state.caretPosition = [this.state.caretPosition[0]+1, 0];
        this.setState({activeMention: undefined, updateCaret: true});
    }

    toMarkDown = ()=>{
        var mktxt='', mkln=[], mklns=[], mks;
        this.state.markdownTags.map(tag=>{
            switch (tag[0]){
                case 'SyMention':
                    mks = markdown.mention_tag.to_markdown(tag)
                    break;
                case 'img':
                    mks = markdown.image_tag.to_markdown(tag)
                    break;
                case 'br':
                    mks = markdown.br_tag.to_markdown(tag)
                    break;
                case 'SyVideo':
                    mks = markdown.video_tag.to_markdown(tag);
                    break
                case 'SyTodoItem':
                    mks = markdown.todo_tag.to_markdown(tag);
                    break
                default:
                    mks = tag[2]
            }
            mkln.push(mks);
        });
        mktxt = mkln.join('')
        return mktxt;
    }

    findEditorChildNode = (node)=>{
        /*根据指定的节点查找编辑器下的相应的子节点
         */
        var np = node;
        while (np!=null && np.parentNode!=this.state.editorNode){
            np = np.parentNode;
        }
        return np;
    }

    deleteCharBackward = ()=>{
        var [npos, cpos] = this.state.caretPosition;
        var nd = this.state.editorNode.childNodes[npos];
        var tg = this.state.markdownTags[npos];
        var nxtg = this.state.markdownTags[npos+1];
        var prtg = this.state.markdownTags[npos-1], txt, update=false, skipEvent=false, s1, s2, otgslen = this.state.markdownTags.length;
        var etg = hasClass(nd, 'siyue-empty-tag');
        if (this.state.markdownTags.length==1&&etg){
            skipEvent = true;  
        } else if (tg[0]=='SySpan'){
            if (etg||cpos==0|| tg[2].length==1) {
                //光标在句首,删除当前节点及前面一个非空白节点后的空白节点
                //skipEvent = true;
                while ((etg||cpos==0)&&prtg!=undefined && prtg[0]=='SySpan' &&prtg[2].length==0){
                    this.state.markdownTags.splice(npos-1, 1);
                    npos--;
                    prtg = this.state.markdownTags[npos-1];
                }
                if ((etg||cpos==0)&& prtg!=undefined){
                    if (prtg[0]!='SySpan' || prtg[2].length==1){
                        //删除对象节点及一个字符的文本节点
                        this.state.markdownTags.splice(npos-1, 1);
                        this.state.caretPosition = [npos-1, 0];
                    } else {
                        //删除文本节点的第一个字符
                        prtg[2] = prtg[2].substr(0, prtg[2].length-1);
                        prtg[1].children = prtg[2];
                        skipEvent = prtg[2].length==0
                        //skipEvent = false;
                    }
                }
                if (!etg&&cpos!=0){
                    //光标不在开始位置时,清除节点文本
                    tg[2] = '';
                    tg[1].children = '';
                    this.state.caretPosition = [npos, 0];
                    this.setState({caretPosition: this.state.caretPosition});
                    skipEvent=True
                } else if (etg){
                    this.state.markdownTags.splice(npos, 1);
                    if (npos>0){
                        tg = this.state.markdownTags[npos-1];
                        this.state.caretPosition = [npos-1, tg[0]=='SySpan'? tg[2].length: 1];
                    } 
                    this.setState({caretPosition: this.state.caretPosition});
                }
                if (otgslen!=this.state.markdownTags.length){
                    this.setState({caretPosition: this.state.caretPosition});
                    skipEvent=True
                }
                
            } else {
                //删除标签内的字符
                s1 = tg[2].substr(0, cpos-1);
                s2 = tg[2].substr(cpos, tg[2].length);
                tg[2] = s1+s2
                tg[1].children = tg[2];
                this.state.caretPosition = [npos, cpos-1];
                skipEvent = tg[2].length==0;
            }
        }
        else{
            this.state.markdownTags.splice(npos, 1);
            this.setState({caretPosition: this.state.caretPosition});
            skipEvent = true;
        }
        return skipEvent;
    }

    deleteChar = ()=>{
        var [npos, cpos] = this.state.caretPosition;
        var nd = this.state.editorNode.childNodes[npos];
        var tg = this.state.markdownTags[npos];
        var nxtg = this.state.markdownTags[npos+1];
        var prtg = this.state.markdownTags[npos-1], txt, update=false, skipEvent=false, s1, s2, otgslen = this.state.markdownTags.length;
        if (tg[0]=='SySpan'){
            if (cpos>=tg[2].length || tg[2].length==1) {
                //光标在句末,删除当前节点及后面一个非空白节点前的空白节点
                while (nxtg!=null && nxtg[0]=='SySpan' &&nxtg[2].length==0){
                    this.state.markdownTags.splice(npos+1, 1);
                    nxtg = this.state.markdownTags[npos+1];
                }
                if (cpos>=tg[2].length&& nxtg!=null){
                    if (nxtg[0]!='SySpan' || nxtg[2].length==1){
                        //删除对象节点及一个字符的文本节点
                        this.state.markdownTags.splice(npos+1, 1);
                    } else {
                        //删除文本节点的第一个字符
                        nxtg[2] = nxtg[2].substr(1, nxtg[2].length);
                        nxtg[1].children = nxtg[2];
                        skipEvent = nxtg[2].length==0
                    }
                }
                if (cpos==0){
                    tg[2] = '';
                    tg[1].children = '';
                    this.state.caretPosition = [npos, 0];
                    this.setState({caretPosition: this.state.caretPosition});
                    skipEvent=True
                }
                if (otgslen!=this.state.markdownTags.length){
                    this.setState({caretPosition: this.state.caretPosition});
                    skipEvent = true;
                }
            } else {
                //删除标签内的字符
                s1 = tg[2].substr(0, cpos);
                s2 = tg[2].substr(cpos+1, tg[2].length);
                tg[2] = s1+s2
                tg[1].children = tg[2];
                skipEvent = tg[2].length==0;
            }
        }
        else{
            this.state.markdownTags.splice(npos, 1);
            this.setState({caretPosition: this.state.caretPosition});
            skipEvent = true;
        }
        return skipEvent;
    }
    
    render() {
        /*
           在xml定义字段时mentionDatasourceId属性指定关联联系人的数据源id,没有指定mentionDatasourceId的编辑器禁用联系人关联功能
           
         */
        var props = { ...this.props }
        var self = this;

        const keyUp = (evt) => {
            /*松开按键
               将输入框内的内容更新到编辑器中
             */
            
            if (evt.type=='compositionend' && this.state.chineseInput){
                var [npos, cpos] = this.state.caretPosition;
                this.state.chineseInput=false;
                var tg = this.state.markdownTags[npos];
                var nd = this.state.editorNode.childNodes[npos];
                tg[2]= nd.innerText;
                tg[1].children = tg[2];
                this.state.ismodified = true;
            }else if (evt.target==this.refs.inputGhost){
                if (evt.keyCode==46&&!(evt.shiftKey||evt.ctrlKey||evt.altKey||evt.metaKey) || this.refs.inputGhost.value!=""){
                    //delete或替换文字
                    this.state.editorNode.focus()
                    this.deleteSelectedTags(false);
                    var cpos = this.state.caretPosition, stg, ns;
                    if (cpos[0]<this.state.markdownTags.length){
                        stg = this.state.markdownTags[cpos[0]];
                    } else {
                        stg = ['SySpan',{},''];
                    }
                    if (this.refs.inputGhost.value!=""){
                        if (cpos[1]==0){
                            ns = this.refs.inputGhost.value+stg[2];
                        } else {
                            ns = stg[2]+this.refs.inputGhost.value;
                        }
                        this.state.caretPosition = [cpos[0], ns.length];
                        stg = ['SySpan', {...stg, children:ns}, ns];
                        if (cpos[0]<this.state.markdownTags.length){
                            this.state.markdownTags.splice(cpos[0], 1, stg);
                        } else {
                            this.state.markdownTags.push(stg);
                        }
                        this.refs.inputGhost.value = "";
                    }
                    if (this.state.markdownTags.length==0){
                        this.state.markdownTags.push(stg);
                    }
                    if (browsers.is_firefox){
                        this.setState({caretPosition: this.state.caretPosition, updateCaret: true});
                    }
                }
            } else {
                var nevt = evt.nativeEvent;
                if (this.state.markdownTags.length==0){
                    this.state.markdownTags.push(['SySpan', {}, '']);
                    this.state.caretPosition = [0,0];
                    this.state.selectedTags = false;
                    this.setState({caretPosition: this.state.caretPosition,updateCaret: true});
                } else {
                    onSelect(nevt);
                    if ([12, 16, 17, 18, 19, 20, 33, 34, 35, 36, 37, 38, 39, 40, 45, 144, 8, 46].indexOf(evt.keyCode)==-1 && evt.keyCode<121){
                        var [npos, cpos] = this.state.caretPosition;
                        var tg = this.state.markdownTags[npos];
                        var nd = this.state.editorNode.childNodes[npos];
                        if (tg[0]=='SySpan'){
                            tg[2] = nd.innerText;
                            tg[1].children = tg[2];
                            if (hasClass(nd, 'siyue-empty-tag')){
                                this.setState({caretPosition: this.state.caretPosition});
                            }
                        }
                    }
                }
                stopEventPropagate(evt);
            }
            if (this.state.selectedTags!=false){
                if(evt.ctrlKey||evt.shiftKey){
                    if (browsers.is_firefox){
                        this.state.editorNode.contentEditable="false";
                        this.refs.inputGhost.focus();
                    }
                } else {
                    //按键全松开有选择内容
                    //this.setCaretPosition(...this.state.caretPosition);
                }
            }
            var [np, cp] = this.state.caretPosition;
        }

        const onKeyDown = (e) => {
            var evt = e || window.event || arguments.callee.caller.arguments[0], node, i, lc;
            var pos = this.state.caretPosition, tgsel, unsel=-1, addsel=-1, ipos;
            if (evt.type=="compositionstart"||evt.type=='compositionupdate' ||this.state.chineseInput || evt.key=="Process"){
                this.state.chineseInput = true;
                if (evt.key=='Process' && this.state.selectedTags!=false){
                    this.deleteSelectedTags(false);
                    this.setState({selectedTags: false, updateCaret: true});
                }
                stopEventPropagate(evt);
            } else if (evt.keyCode == 13 &&!(evt.shiftKey||evt.ctrlKey||evt.altKey||evt.metaKey)&&!this.state.chinesInput){
                //enter
                var [cpos, ipos] = this.state.caretPosition, tg, s1, s2;
                this.insertTag(['br', undefined, undefined]);
                stopEventPropagate(e);
            }
            else if (evt.keyCode == 8 &&!(evt.shiftKey||evt.ctrlKey||evt.altKey||evt.metaKey)){
                //backspace后删键
                if (this.deleteCharBackward()){
                    stopEventPropagate(evt);
                }
            }
            else if (evt.keyCode == 46 &&!(evt.shiftKey||evt.ctrlKey||evt.altKey||evt.metaKey)){
                //删除键,删除本节点,删除下一节点
                if (this.deleteChar()){
                    stopEventPropagate(evt);
                }
            }
            else if (evt.keyCode == 50 && evt.shiftKey) {
                //shift+2 @键 英文状态下, 光标在联系人位置时按@会用删除原联系人,然后选择新的联系人
                var mention = this.state.markdownTags[this.state.caretPosition[0]];
                if (mention!=null&&mention[0]=='SyMention'){
                    this.state.markdownTags.splice(this.state.caretPosition[0],1);
                    mention = ['SyMention', {query: this.props.mentionQuery, showList: true, onOk:this.mentionOk}, []];
                    this.state.activeMention = this.state.caretPosition;
                    this.insertTag(mention, [this.state.caretPosition[0],0]);
                } else{
                    mention = ['SyMention', {query: this.props.mentionQuery, showList: true, onOk:this.mentionOk}, []];
                    this.state.activeMention = this.state.caretPosition;
                    this.insertTag(mention);
                }
                stopEventPropagate(e);
            }
            if ([12, 16, 17, 18, 19, 20, 33, 34, 35, 36, 37, 38, 39, 40, 45, 144].indexOf(evt.keyCode)==-1 && evt.keyCode<121){
                //12 clear 
                //16 shift,17 ctrl,18 alt,19 pause, 20 caps,
                //33 pgup, 34 pgdn, 35 end,36 home
                //37 left, 38 up,39 right, 40 down, 45 insert
                //144 Num Lock,
                this.state.ismodified = true;
                if (this.state.selectedTags!=false){
                    if (browsers.is_firefox){
                        this.state.editorNode.contentEditable="false";
                        this.refs.inputGhost.focus();
                    } else if (!(evt.shiftKey||evt.ctrlKey||evt.altKey||evt.metaKey)){
                        this.state.editorNode.contentEditable="true";
                        this.deleteSelectedTags();//false);
                        stopEventPropagate(e);
                    }
                }
            } else if ([33, 34, 35, 36, 37, 38, 39, 40].indexOf(evt.keyCode)!=-1){
                //方向键
                this.state.updateCaret = false;
                if (this.state.selectedTags!=false){
                    this.state.editorNode.contentEditable="true";
                    this.state.editorNode.focus();
                }
            }
        }
        
        const onFocus = (evt)=>{
            this.state.focusin = true;
        }
        
        const onBlur = (evt) => { //在失去焦点时,保存修改的内容
            this.state.focusin = false;
            var ineditor = this.isBlurInEditor(evt) ;
            if (!ineditor && this.state.ismodified){
                this.state.ismodified = false;
                this.state.text = this.toMarkDown();
                props.onOk(this.state.text);
            }
        }

        const onMouseDown = (evt)=>{
            if (this.state.selectedTags!=false){
                this.state.selectedTags = false;
                clearCaretSelection();
                this.setState({selectedTags:this.state.selectedTags});
            }
        }

        const onSelect = (evt)=>{
            var rng = this.editorSelectRange(), sni;
            var tg, rpos;
            this.state.caretBackward = rng[3];
            if (rng!==false){
                if (rng[1]==rng[2] && (rng[0].startOffset==rng[0].endOffset || rng[1]==null)) {
                    if (rng[1]==null){
                        if (rng[0].endContainer==this.state.editorNode && rng[0].startOffset!=rng[0].endOffset){
                            this.state.selectedTags = this.selectRangeToPosition(rng);
                        } else {
                            this.state.caretPosition = [rng[0].startOffset, 0]
                            this.state.selectedTags = false;
                        }
                    } else {
                        sni = Array.prototype.indexOf.call(this.state.editorNode.childNodes, rng[1])
                        this.state.caretPosition = [sni, rng[0].startOffset]
                        this.state.selectedTags = false;
                    }
                } else {
                    this.state.selectedTags = this.selectRangeToPosition(rng);
                }
                if (this.state.caretPosition[0]>=this.state.markdownTags.length){
                    tg = this.state.markdownTags[this.state.markdownTags.length-1];
                    rpos = (tg[0]=='SySpan')? tg[2].length: 0;
                    this.state.caretPosition = [this.state.markdownTags.length-1, rpos];
                }
                if (this.state.selectedTags==false&&this.state.markdownTags[this.state.caretPosition[0]][0]=='br'){
                    this.setCaretPosition(...this.state.caretPosition);
                }
            }
            if (this.state.selectedTags!=false){
                this.state.updateCaret = false;
                if (rng[3]){
                    this.state.caretPosition = this.state.selectedTags[0];
                } else {
                    this.state.caretPosition = this.state.selectedTags[1];
                }
                this.setState({selectedTags: this.state.selectedTags});
            } else {
                this.state.editorNode.contentEditable = 'true';
                this.state.updateCaret = true;
            }
        }

        const onMouseUp = (evt)=>{
            var nevt = evt.nativeEvent;
            onSelect(nevt)
        }
        
        const onCopy = (evt)=>{
            console.log('copy unusable.');
            //return true;
        }
        
        const paste = (evt)=>{
            var txt = evt.clipboardData.getData('text/plain');
            txt = txt.replace(/\n/g, '  \n');
            var pts = parse_tag(txt);
            this.deleteSelectedTags(false);
            this.state.markdownTags.splice(this.state.caretPosition[0], 0 , ...pts)
            this.setState({caretPosition: this.state.caretPosition});
            stopEventPropagate(evt);
        }
        
        const { dialogVisible, confirmLoading } = self.state; //接受当前state内的内容
        var mk = this.state.markdownTags.map(tag=>{
            return renderTag(tag, {SyTodoItem:{readOnly:true, onReLoad: this.props.todoReLoad}});
        })

        return (
            <span  ref='fd' onBlur={onBlur} onFocus={onFocus}   onPaste={paste} onCopy={onCopy} onKeyUp={keyUp} className="siyue-line-editor-wrap siyue-input" onMouseDown={onMouseDown} onMouseUp={onMouseUp} onBlur={onBlur} onFocus={onFocus} onKeyDown={onKeyDown}>
            <p className="siyue-line-editor" contentEditable='true' tabIndex="-1" ref={
                e=>{
                    if(isNode(e)){
                        if (browsers.is_chrome){
                            e.addEventListener('compositionend', keyUp);
                            e.addEventListener('compositionstart', onKeyDown);
                            e.addEventListener('compositionupdate', onKeyDown);
                        }
                        this.state.editorNode = e;
                        if (this.state.caretPosition &&  this.state.focusin && this.state.updateCaret){
                            e.contentEditable="true";
                            this.setCaretPosition(...this.state.caretPosition);
                        } else if (this.state.selectedTags!=false){
                            if(browsers.is_firefox){
                                e.contentEditable="false";
                                this.refs.inputGhost.focus();
                                this.setEditorSelection();
                            } else {
                                this.setEditorSelection();
                            }
                        }
                    }
                }
            } >
            {mk} 
            </p>
            <input ref="inputGhost" className="siyue-input-ghost"/>
            </span>        
        )
    }
}

registryWidget(SyLineEditor,'SyLineEditor');
export default SyLineEditor;

