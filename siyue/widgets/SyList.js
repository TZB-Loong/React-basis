import {PropTypes, Component} from 'react';
import createWidget from './_createWidget';
import {registryWidget, NoWrap} from './_widgets';
import {isfalse, stopEventPropagate} from '../utils';
import './SyList.css';
//<Icon type="check" />

class SyList  extends Component {
    /* # 创建选择列表

       ## 参数
       |---|---|---|---|---|
       |名称|类型|说明|默认值|是否必须|
       |searchValue|string|查询内容,为空时返回所有内容|''|否|
       |items|array/func|需要显示的列表或可返回数据列表的方法|无|是|
       |onOk|func|选择完成后调用的方法,单选时在选择后触发,多选时按回车后触发|无|否|
       |visable|bool|是否显示列表|true|否|
       |selected|array|已选择的选项|无|否|
       |multiSelect|bool|是否可以多选|false|是|
       |onChange|func|当可多选时,每选择一次就会调用一次该方法|无|否|
       
       
       ### items数据列表定义

       |---|---|---|---|---|
       |名称|类型|说明|默认值|是否必须|
       |id|int|列表项组件键|无|是|
       |name|string|列表显示的文本内容|无|是|
       
     */

    constructor(props){
        super(props)
        this.state = {
            showList: [],
            selected: [],
            itemsdata:undefined
        };
        this._searchValue = undefined;
    }

    select = (item)=>{
       
        var slt, isslt=false, i;
        slt = this.state.selected;
        
        if (this.props.multiSelect){
            i=0;
            isslt = this.state.selected.some(sitem=>{
                if (sitem[0]==item[0]){
                    slt.splice(i,1)
                    return true;
                }
                i++;
            });
            if (isfalse(isslt)){
                slt.push(item);
            }
            this.props.onChange && this.props.onChange(slt);
        } else {
            slt = [item];
            this.props.onOk && this.props.onOk(slt)
        }
        this.setState({selected: slt});
    }
    
    itemClick = (evt) => {
        this.select([parseInt(evt.target.dataset.id), evt.target.dataset.name])
    }

    listFocus = (evt)=>{
        if(evt.target.nodeName=='UL'){
            evt.target.firstChild.focus();
        } else {
            this.state.focusItem = [parseInt(evt.target.dataset.id), evt.target.dataset.name];
        }
        this.props.onFocus && this.props.onFocus(evt)
    }

    listBlur = (evt)=>{
        this.props.onBlur && this.props.onBlur(evt)        
    }
    
    keyUp = (evt)=>{
        if (evt.keyCode==40 && evt.target.nextSibling!=null){
            //向下键
            evt.target.nextSibling.focus()
        } else if (evt.keyCode==38 && evt.target.previousSibling!=null){
            //向上键
            evt.target.previousSibling.focus()
        } else if (evt.keyCode==32){
            //空格键
            if(!isfalse(this.state.focusItem)){
                this.select(this.state.focusItem);
            }
        } else if (evt.keyCode==13){
            //回车键
            this.props.onOk && this.props.onOk(this.state.selected)
        }
    }

    render(){
        var props = this.props;
        
                //统一将查询接口设为_itemQuery,传入数组时也可以进行查找
                if (typeof props.items=='function'){
                    this._itemQuery = props.items;
                } else {  //在这里进行数据更新的话,无论怎么样,最终还是要用到callBack
                    
                    this._itemText = '\t'+props.items.join('\t\t')+'\t';
        
                    this._itemQuery = (name, callback)=>{
                        var rs;
                        if(isfalse(name)){
                            rs = props.items;
                            
                        } else {
        
                            var re = new RegExp('\t\d+\,[^\t]*?'+name+'[^\t]*?\t', 'g');
                            rs = this._itemText.match(re);
                            
                            if (isfalse(rs)){
                                rs = [];
                            } else {
                                rs = rs.map(item=>{
                                    item = item.replace(/\t/gi, '').split(',');
                                    item[0] = parseInt(item[0]);
                                    return item;
                                });
                            }
                        }
                        callback(rs);
                    }
                }



        var i = 0, searchValue = isfalse(props.searchValue)?'' :props.searchValue;
        var visible = !isfalse(props.visible) || props.visible==undefined;
       
        var selected = isfalse(props.selected)?this.state.selected:props.selected
        selected = isfalse(selected)? []: selected;
        
        if (visible){
            
            if (this._searchValue != searchValue) {
                this._searchValue = searchValue;
                
                this._itemQuery(searchValue, (data) => { //数据的更新是个大问题
                   
                    this.setState({
                        showList: isfalse(data.result) ? data : data.result,
                        selected:selected
                    });
                })

            } else if (typeof props.items == 'object' && props.items != this.state.itemsdata) { //两次更新有冲突
                this.setState({
                    showList: props.items,
                    itemsdata: props.items
                });
            }
        }

        return  (
            <NoWrap>
            {visible? <ul className="sy-list ant-dropdown-menu ant-dropdown-menu-vertical ant-dropdown-menu-light ant-dropdown-menu-root"  tabIndex="0" {...props} onFocus={this.listFocus} onKeyUp={this.keyUp} onBlur={this.listBlur}>
                {visible? this.state.showList.map(l => {
                    var isslt = false;
                    
                    isslt = this.state.selected.some(sitem=>{
                        return sitem[0]==l[0];
                    });
                   
                    
                    return <li tabIndex="0" data-id={l[0]} data-name={l[1]} onClick={this.itemClick} className="ant-dropdown-menu-item">{isslt? <i className="sy-list-check"></i>:null}{l[1]}</li>
                }): null}
                </ul>: null}
            </NoWrap>
        )
    }
}

registryWidget(SyList, 'SyList');
export default SyList;


