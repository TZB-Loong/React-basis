import {PropTypes, Component} from 'react';
import createWidget from './_createWidget';
import {registryWidget, NoWrap} from './_widgets';
import {isfalse, stopEventPropagate} from '../utils';
import SyList from './SyList';
import SyInput from './SyInput';
import SyTag from './SyTag';
import './SySelect.css';
import { store } from '../midware';
import SyScroll from "./SyScroll";

class SySelect extends Component {
    /*选择框

       ## 参数

       |---|---|---|---|---|
       |名称|类型|说明|默认值|是否必须|
       |selected|array|已选择的选项|无|否|
       |items|array/func|需要显示的列表或可返回数据列表的方法|无|是|
       |onOk|func|选择完成后调用的方法,单选时在选择后触发,多选时按回车后触发|无|否|
       |multiSelect|bool|是否可以多选|false|是|
       |onChange|func|当可多选时,每选择一次就会调用一次该方法|无|否|

       ----
       在多选情况下只有整个组件失去焦点后,选择列表才会自动消失.
       按esc键可以临时关闭选择列表,在输入内容和重新获取焦点时再次显示选择列表

     */
    constructor(props){
        super(props)
        this._refNode=null;
        this.state = {
            items: [],
            selected: this.props.selected, 
            showSelect: false,
            isfocus: false,
            searchValue: '',
            owenDs: {},
            inputValue: '',
            searchProps: {...this.props.dataSearchProps, domain:[]},
        };
        this._isfocus = false;
    }

    componentWillUpdate(newProps) { //清理上条记录余留的状态
        //组件传入新的props 时，清除前面的状态 并触发name_search（生命周期:props更新时执行）
        //this.props 更新之前的props   this.state. 之前的状态]
        if (isfalse(this.props.resId) == false && newProps.resId != this.props.resId) {
            this.setState({
                selected: undefined,
                showSelect: false,
                isfocus: false,
                searchValue: '',
                searchProps: {...newProps.dataSearchProps, domain: []},
            })
        } else {
            this.state.searchProps = {...newProps.dataSearchProps,...this.state.searchProps};
            //比较selected属性新值是否有更新
            if (JSON.stringify(newProps.selected)!=JSON.stringify(this.props.selected)){
                
                this.state.selected = newProps.selected;
            }
            //this.setState({searchProps: this.state.searchProps});
        }
    }
  
    itemSelected = (items)=>{
        this._isfocus = true;
        this.setState({selected: items, isfocus: true});
        this.props.onChange && this.props.onChange(items);
    }

    selecteOk = (items)=>{

        
        this.refs.editor._reactInternalFiber.return.stateNode.focus();

        this.setState({selected: items, isfocus: true, showSelect: false});
        this.props.onOk && this.props.onOk(items) ;
    }
    
    removeSelecte = (item)=>{
        this._isfocus = true;
        var slt = this.state.selected==undefined? this.props.selected: this.state.selected, i=0;
        slt.some(sitem=>{
            if (sitem[0]==item[0]){
                slt.splice(i,1)
                return true;
            }
            i++;
        });
        this.selecteOk(slt);
    }
    
    inputFocus = (evt)=>{
        this._isfocus = true;
        this.state.isfocus = true;
        if (!this.state.showSelect){
            this.state.showSelect = true;
            this.setState({isfocus: true, showSelect: true});
        }
    }
    
    inputBlur = (evt)=>{ //这样是会有时差的
        this._isfocus = false;
        this.isInFocus();
    }
    
    isInFocus = ()=>{
        //在点击保存的时候,onOk还没有执行(当列表还存在的时候)
        setTimeout(()=>{
            if (!this._isfocus){
                this.setState({showSelect: false});
                var selected = this.state.selected==undefined? this.props.selected: this.state.selected;
                selected = isfalse(selected)? []: selected;
                if(this.refs.editor._reactInternalInstance!=undefined){
                    
                    this.refs.editor._reactInternalFiber.return.stateNode.value='';
                }
                this.props.onOk && this.props.onOk(selected) ;
                // this.props.onOk && this.props.onOk([[6, false,selected.map(item=>{
                    //     return item[0];
                    // })]]) ;
                }
            }, 50);
        }
        
        inputKeyDown = (evt)=>{
            if (evt.keyCode==8){
                //backspace
                if (!isfalse(this.state.selected) && evt.target.selectionEnd==0){
                    this.state.selected.pop();
                    this.setState({selected: this.state.selected});
                    stopEventPropagate(evt);
                }
            }
        }
    

    inputPress = (evt)=>{
        if(evt.keyCode==40){
            //向下
            this.refs.selector._reactInternalInstance._renderedComponent._renderedComponent._hostNode.focus();
        } else if (evt.keyCode==27){
            //esc
            this.setState({showSelect:false});
        }
    }

    inputOk = (evt)=>{
        this.state.inputValue = evt;
        this.state.searchProps.startOffset = 0;
        if (evt!=''){
            this.state.searchProps.domain=[['name', 'ilike', evt]];
        } else {
            this.state.searchProps.domain=[];
        }
    this.setState({searchProps: this.state.searchProps});
    }

    listFocus = (evt)=>{
        this._isfocus = true;
    }

    listBlur = (evt)=>{
        this._isfocus = false;
        this.isInFocus();
    }

    
    
    render(){
        var props = this.props;
        var selected = this.state.selected;
        selected = isfalse(selected)? []: selected;
        var multiSelect = !isfalse(props.multiSelect);
        var readOnly = !isfalse(props.readOnly);
        
        const readOnlyRender = ()=>{
            return (
                <span className='siyue-Syselect' >
                <span className="siyue-select siyue-input " >
                {selected.map(item=>{return <SyTag closable={true&&!readOnly} id={item[0]} onClose={this.removeSelecte} >{item[1]}</SyTag>})}
                </span>
                </span>
            )
        }
        
        const onScroll = (event)=>{
            this.state.items = event.fetchedData;
            this.setState({items: this.state.items});
        }
        
        const editableRender = ()=>{
            var items = this.state.items;
            return (
                <span className='siyue-syselect' >
                <span className="siyue-select siyue-input " ref={e => (this._refNode = e)} onClick={this.inputFocus}>
                
                {selected.map(item=>{return <SyTag closable={true&&!readOnly} id={item[0]} onClose={this.removeSelecte} >{item[1]}</SyTag>})}
                
                <SyInput ref='editor'  onFocus={this.inputFocus} onBlur={this.inputBlur} onKeyUp={this.inputPress} onKeyDown={this.inputKeyDown} onOk={this.inputOk} readOnly={readOnly} value={this.state.inputValue}/>
                </span>
                
                {this.state.showSelect&&!readOnly?
                 <span className='siyue-selecte-scroll-wrap' >
                    <SyScroll dataSearch={this.props.dataSearch} dataSearchProps={this.state.searchProps} viewHeight={160} onScroll={onScroll}>
                    <SyList ref='selector' onFocus={this.listFocus} onChange={this.itemSelected} multiSelect={multiSelect} items={items} onBlur={this.listBlur} visible={this.state.showSelect&&!readOnly} onOk={this.selecteOk} selected={selected} searchValue={this.state.searchValue} multiSelect='true'/>
                    </SyScroll>
                    </span>:null
                }
                </span>
            )                
        }
        
        return (
            <NoWrap>{readOnly?readOnlyRender(): editableRender()}</NoWrap>
        )
    }
}

registryWidget(SySelect, 'SySelect');
export default SySelect;
