import {isfalse} from './_utils';
    
const isNode = (node)=>{
    return node!=null && typeof node !='undefined' && node.nodeType!=null;
}

const hasClass = (node, className)=>{
    return  isNode(node) && node.classList && node.classList.contains(className);
}

const indexOfNodes = (nodes, node)=>{
    /*node在nodes列表中的位置*/
    var i;
    for (i=0;i<nodes.length;i++){
        if (nodes[i]===node){
            break;
        }
    }
    if (i==nodes.length){
        i=-1
    }
    return i;
}
Node.prototype.hasClass = hasClass;

const clearCaretSelection = () => {
    //清除选择器
    if (window.getSelection && window.getSelection().rangeCount > 0) {
        window.getSelection().removeAllRanges();
    } else if (document.selection) {
        document.selection.empty();
    }
}    

/* 获取光标位置的函数 */
const getCaretPosition = () => { //获取到光标的位置
    var savedRange;
    if (window.getSelection && window.getSelection().rangeCount > 0) {
        //FF,Chrome,Opera,Safari,IE9+
        savedRange = window.getSelection().getRangeAt(0).cloneRange();
    } else if (document.selection) {
        //IE 8 and lower
        savedRange = document.selection.createRange();
    }
    
    return {
        location: typeof savedRange=='undefined'?0 :savedRange.endOffset,
        node: window.getSelection().focusNode,
        nodePartent: window.getSelection()
    };
}

//获取到光标的坐标位置
const getRectLocation = (selection) => {
    var x = 0;
    var y = 0;
    //var sel = window.getSelection();
    var sel = selection;
    if (sel.rangeCount) {
        var range = sel.getRangeAt(0).cloneRange();
        if (range.getClientRects()) {
            range.collapse(true);
            var rect = range.getClientRects()[0];
            if (rect) {
                y = rect.top;
                x = rect.left;
            }
        }
    }
    return {
        x: x,
        y: y
    };
}

const setCaretPosition = (node, position) => {
    /*设置编辑器的光标位置
       node, 节点
       position, 数字/head首位/tail末位/
       如果光标指定位置为不可编辑的节点，在该位置添加空文本节点再设置光标
       如果指定的位置为负数，则为0
       
     */
    
    if (node==undefined){
        return
    }
    var mlen = node.nodeName=='#text'? node.length: node.childNodes.length;
    position = position=='head'?0 : position;
    position = position=='tail'?mlen : position;
    try{
        position = parseInt(position)
    } catch (e){
        position = 0;
    }
    position = position>mlen? mlen: position;
    position = position<0? 0: position;                
    var pnode;
    if (node.nodeName=='#text'){
        //指定节点为文本节点
        pnode = node;
    } else {
        if (position>=node.childNodes.length){
            //移到最后
            if (node.childNodes[mlen-1].nodeName=='#text'){
                //最后一个为文本节点
                pnode = node.childNodes[mlen-1];
                position = node.childNodes[mlen-1].length;
            } else {
                pnode = document.createTextNode('');
                position = 0;
                node.appendChild(pnode);
            }
        } else if (position==0){
            //移到最前
            if (node.childNodes[0].nodeName=='#text'){
                pnode = node.childNodes[0];
            } else {
                pnode = document.createTextNode('');
                node.insertBefore(pnode, node.childNodes[0]);
            }
        } else {
            //在编辑器中间
            if (node.childNodes[position-1].nodeName=='#text'){
                pnode = node.childNodes[position-1];
                position = node.childNodes[position-1].length
            } else if (node.childNodes[position].nodeName=='#text'){
                pnode = node.childNodes[position];
                position = 0;
            } else {
                pnode = document.createTextNode('');
                node.insertBefore(pnode, node.childNodes[position]);
                position=0;
            }
        }
    }
    
    if (node.setSelectionRange) {
        node.focus();
        node.setSelectionRange(positon, position); //isfalse(position.location) ? position : position.location, isfalse(position.location) ? position : position.location);
    } else {
        var range = document.createRange();
        var sel = window.getSelection();
        try {
            range.selectNode(node);
            range.setStart(node, position);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        } catch (err) {
        }
    }
}

const moveCaretToPrevSibling  = (node, skip)=>{
    /*移动光标到前一非空白节点前
       node: 当前节点
       skip: 是否跳过末节点或字符. true,跳过末节点或字符, 适用当前节点为空文本节点或在文本节点首位,实现移到光标到前一文本节点末个字符前,或移到前一个不可移入光标节前效果;false,移到前一下节点后
       ----
       . 当前节点为不可移入光标节点,跳出当前节点,光标移动下一节点前,下一节点为不可编辑节点则在前面加入空白文本节点

       . 当前节点为空文本节点或在文本节点最后, 移到光标到下一文本节点第一个字符后,或移到下一个不可移入光标节点后
       
       .下一节点为空时用父级节点向下查找,直到父级节点contentEditable==true

     */
    var nnode = node.previousSibling, vnode=false, n2node, crnode=false, ncrtnode;
    vnode = findLastNotEmptyNode(node);
    if (!isNode(vnode)){return}
    ncrtnode = isNoCaretNode(vnode)
    if (isNode(ncrtnode)){
        //前一节点为不可移入光标节点
    } else if (isNode(vnode)){
        //前一节点为可移入光标节点
        ncrtnode = vnode;
    } else {
        //第一个节点 , 要测试是否会重复插入空节点
        ncrtnode = document.createTextNode('');
        node.parentNode.insertBefore(ncrtnode, node);
        skip = false;
    }
    if (ncrtnode.nodeName=='#text'){
        //前一节点为文本节点
        if (skip){
            setCaretPosition(ncrtnode,ncrtnode.length-1);
        } else {
            setCaretPosition(nctrnode,ncrtnode.length);
        }
    } else {
        //前一节点不是文本节点
        if(isNode(n2node)&&n2node.nodeName=='#text'){
            crnode = n2node;
        } else {
            crnode = document.createTextNode('');
            ncrtnode.parentNode.insertBefore(crnode, ncrtnode);
        }
        if (skip){
            //跳过最后一个符或前一个节点
            /* n2node = ncrtnode.previousSibling;
             * if(isNode(n2node)&&n2node.nodeName=='#text'){
             *     crnode = n2node;
             * } else {
             *     crnode = document.createTextNode('');
             *     ncrtnode.parentNode.insertBefore(crnode, ncrtnode);
             * }*/
            setCaretPosition(crnode, crnode.length>0? crnode.length-1: 0);
        } else {
            //光标移到节点前
            /* n2node = ncrtnode.previousSibling;
             * if (isNode(n2node)){
             *     if(n2node.nodeName=='#text'){
             *         crnode = n2node;
             *     } else {
             *         crnode = document.createTextNode('');
             *         n2node.parentNode.insertBefore(crnode, ncrtnode);
             *     }
             * }*/
            setCaretPosition(crnode, 'tail');
        }
    }
}

const moveCaretLeft = (node, position)=>{
    /*向左移动光标
       node,光标当前所在节点
       position,光标当前所在位置
     */
    if (!isfalse(node.contentEditable)){
        //在编辑器节点内移动光标
        if (node.childNodes.length==0 || position==0){return}
        if (position >= node.childNodes.length){
            node = node.lastNode;
        } else {
            node = node.childNodes[position-1];
        }
    }
    var ncrt = isNoCaretNode(node);
    if (isNode(ncrt)){
        //当前节点为不可移入光标节点
        moveCaretToPrevSibling(ncrt);
    } else if (node.nodeName=='#text'){
        if(position<=0){
            //在文本节点首位
            moveCaretToPrevSibling(node, true);
        }else {
            //在文本节点中间,光标前移一个字符
            setCaretPosition(node, position-1);
        }
    } else {
        //当前节点为非文本其它节点
        moveCaretToPrevSibling(node);
    }
}

const isNoCaretNode = (node)=>{
    /*判断节点是否属于光标不可移入节点或属于不可移入光标的子节点
       在上逆父节点时需要设定一个边界防止死循环
       不可移入光标节点包含类名'no-caret'或img/video节点
     */
    var nocaret=false;
    if (!isNode(node)){return false;}
    while(!(node.contentEditable==true|| node.contentEditable=='true' || node.nodeName=='BODY')){
        if ((hasClass(node, 'no-caret') && !hasClass(node.parentNode, 'no-caret'))||node.nodeName=='IMG'||node.nodeName=='VIDEO'){
            nocaret = true;
            break
        }
        node = node.parentNode;
    }
    return nocaret? node: nocaret;
}

const lastNotEmptyNode = (node)=>{
    /*返回节点内最后一个可视节点
       ----
       可视节点,#text,img,vedio
     */
    if (!isNode(node)){return false;}
    if (node.nodeName=='#text'){
        return node.length>0? node: null;
    } else if (['#comment', 'BR'].indexOf(node.nodeName)!=-1){
        return null;
    }
    var nnode = node.lastChild, tnode=null;
    while (isNode(nnode)){
        if (nnode.nodeName=='#text' && nnode.length>0){
            //文本节点
            tnode = nnode;
            break
        } else if (['#comment', 'BR', '#text'].indexOf(nnode.nodeName)==-1){
            //其它节点从子节点搜索
            tnode = lastNotEmptyNode(nnode);
            if (isNode(tnode)){
                break
            }
        }
        nnode = nnode.previousSibling;
    }
    return tnode;
}

//const getPreviousSibling 

const findLastNotEmptyNode = (node)=>{
    /*从节点node开始向前查找编辑器内最后一个可视节点
       不包含node节点
     */
    
    if(!isNode(node)){return false}
    var pnode = node, is_first_node=false, lnmnode = false;
    while(!isNode(lnmnode)&&!is_first_node){
        //当前节点没找到可视节点
        if (isNode(pnode.previousSibling)){
            //还有前一个节点
            pnode = pnode.previousSibling;
        } else {
            //当前节点是第一个节点
            while (!(pnode.contentEditable==true||pnode.contentEditable=='true')){
                if(isNode(pnode.parentNode.previousSibling)){
                    pnode = pnode.parentNode.previousSibling;
                    break;
                } else {
                    pnode = pnode.parentNode;
                }
            }
            if (pnode.contentEditable==true||pnode.contentEditable=='true'){
                //已到编辑器的第一个节点
                is_first_node = true;
                break;
            }
        }
        lnmnode=lastNotEmptyNode(pnode);
    }
    return lnmnode
}

const firstNotEmptyNode = (node)=>{
    /*返回节点中第一可视节点
       
       ----
       可视节点,#text,img,vedio
     */
    if(!isNode(node)){return false}
    if (node.nodeName=='#text'){
        return node.length>0? node: null;
    } else if (['#comment', 'BR'].indexOf(node.nodeName)!=-1){
        return null;
    }
    
    var nnode = node.firstChild, tnode=null;
    while (isNode(nnode)){
        if (nnode.nodeName=='#text' && nnode.length>0){
            //文本节点
            tnode = nnode;
            break
        } else if (['#comment', 'BR', '#text'].indexOf(nnode.nodeName)==-1){
            //不可见节点
            //} else {
            //其它节点从子节点搜索
            tnode = firstNotEmptyNode(nnode);
            if (isNode(tnode)){
                break
            }
        }
        nnode = nnode.nextSibling;
    }
    return tnode;
}

const findFirstNotEmptyNode = (node)=>{
    /*从节点node开始向后查找编辑器内第一个可视节点
     */
    
    if(!isNode(node)){return false}
    var pnode = node, is_last_node=false, lnmnode=false;
    //var lnmnode = firstNotEmptyNode(node);
    while(!isNode(lnmnode)&&!is_last_node){
        //当前节点没找到可视节点
        if (isNode(pnode.nextSibling)){
            //还有前一个节点
            pnode = pnode.nextSibling;
        } else {
            //当前节点是第一个节点
            while (!(pnode.contentEditable==true||pnode.contentEditable=='true')){
                if(isNode(pnode.parentNode.nextSibling)){
                    pnode = pnode.parentNode.nextSibling;
                    break;
                } else {
                    pnode = pnode.parentNode;
                }
            }
            if (pnode.contentEditable==true||pnode.contentEditable=='true'){
                //已到编辑器的最后一个节点
                is_last_node = true;
                break;
            }
        }
        lnmnode=firstNotEmptyNode(pnode);
    }
    return lnmnode
}

const isEmptyNode = (node)=>{
    /*无文本内容的空节点
       不是图片/视图节点
     */
    //wholeText
    return node.wholeText==='';
}

const moveCaretToNextSibling = (node, skip)=>{
    /*移动光标到下一非空白节点前
       node: 当前节点
       skip: 是否跳过第一个节点或字符. true,跳过第一个节点或字符, 适用当前节点为空文本节点或在文本节点最后,实现移到光标到下一文本节点第一个字符后,或移到下一个不可移入光标节点后效果;false,移到一下节点前
       ----
       . 当前节点为不可移入光标节点,跳出当前节点,光标移动下一节点前,下一节点为不可编辑节点则在前面加入空白文本节点

       . 当前节点为空文本节点或在文本节点最后, 移到光标到下一文本节点第一个字符后,或移到下一个不可移入光标节点后
       
       .下一节点为空时用父级节点向下查找,直到父级节点contentEditable==true

     */
    
    var nnode = node.nextSibling, vnode=false, n2node, crnode=false, ncrtnode;
    vnode = findFirstNotEmptyNode(node);
    ncrtnode = isNoCaretNode(vnode)
    if (isNode(ncrtnode)){
        //下一节点为不可移入光标节点
    } else if (isNode(vnode)){
        //下一节点为可移入光标节点
        ncrtnode = vnode;
    } else {
        //最后一个节点, 要测试是否会重复插入空节点
        ncrtnode = document.createTextNode('');
        if(isNode(nnode)){
            node.parentNode.insertBefore(ncrtnode, nnode);
        } else {
            node.parentNode.appendChild(ncrtnode);
        }
        skip = false;
    }
    
    if (ncrtnode.nodeName=='#text'){
        //下一节点为文本节点
        if (skip){
            setCaretPosition(ncrtnode,1);
        } else {
            setCaretPosition(ncrtnode,0);
        }
    } else {
        //下一节点不是文本节点
        if (skip){
            //跳过第一个字符或下一个节点
            n2node = ncrtnode.nextSibling;
            if(isNode(n2node)){
                if(n2node.nodeName=='#text'){
                    crnode = n2node;
                } else {
                    crnode = document.createTextNode('');
                    n2node.parentNode.insertBefore(crnode, n2node);
                }
            } else {
                crnode = document.createTextNode('');
                ncrtnode.parentNode.appendChild(crnode);
            }
            setCaretPosition(crnode, 0);
        } else {
            //光标移到节点前
            n2node = ncrtnode.previousSibling;
            if (isNode(n2node)){
                if(n2node.nodeName=='#text'){
                    crnode = n2node;
                } else {
                    crnode = document.createTextNode('');
                    n2node.parentNode.insertBefore(crnode, ncrtnode);
                }
            }
            setCaretPosition(crnode, 'tail');
        }
    }
}

const moveCaretRight = (node, position)=>{
    /*向右移动光标
       node,光标当前所在节点
       position,光标当前所在位置

       ----
       对于非文本节点要区分可移入光标和不可移入光标节点
       不可移入光标节点使用类名'no-caret'进行识别
       如果当前节点为不可移入光标,则移到下一可移入光标节点
     */
    var i, pnode;
    var ncrt = isNoCaretNode(node);
    if (!isfalse(node.contentEditable)){
        //在编辑器节点内移动光标
        if (node.childNodes.length==0){return}
        if (position==0){
            //ncrt = isNoCaretNode(node.firstChild);
            if (isNoCaretNode(node.firstChild)){
                //no caret in 节点
                moveCaretToNextSibling(node.firstChild);
            } else {
                pnode = firstNotEmptyNode(node.firstChild);
                if (isNode(pnode)){
                    setCaretPosition(pnode, 1);
                } else {
                    moveCaretToNextSibling(node.firstChild, true);
                }
            }
        } else {
            moveCaretToNextSibling(node.childNodes[position-1], true);
        }
    }
    else if (isNode(ncrt)){
        //当前节点为不可移入光标节点
        moveCaretToNextSibling(ncrt);
    } else if (node.nodeName=='#text'){
        if(position>=node.length){
            //在文本节点最后
            moveCaretToNextSibling(node, true);
        }else {
            //在文本节点中间,光标下移一个字符
            setCaretPosition(node, position+1);
        }
    } else {
        moveCaretToNextSibling(node);
    }
}

const createReactDom = function(Component, props, dom){
    /*createReactDom 创建react dom
       在指定的节点dom下,使用数据props,创建react组件Componet的节点

       |---|---|---|---|---|
       |名称|类型|说明|默认值|是否必须|
       |Component|func|react组件|否|是|
       |props|对象|数据对象|{}|是|
       |dom|html node|浏览器节点|否|是|
     */
    ReactDOM.render(React.createElement(Component, props), dom);
}

module.exports = {
    hasClass,
    isNode,
    indexOfNodes,
    setCaretPosition,
    getCaretPosition,
    clearCaretSelection,
    moveCaretRight,
    moveCaretLeft,
    createReactDom,
    moveCaretToNextSibling,
    moveCaretToPrevSibling,
    findLastNotEmptyNode,
    findFirstNotEmptyNode,
    isNoCaretNode,
}
