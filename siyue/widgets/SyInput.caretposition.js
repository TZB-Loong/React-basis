import {PropTypes, Component} from 'react';
import {Input, Menu, Dropdown} from 'antd';
import {registryFormWidget,registryWidget, NoWrapp} from './_widgets';
import {isfalse, stopEventPropagate} from '../utils';
//import "./DbResponseInput.css"

/*
测试设置编辑框光标位置
*/
class SyInput extends Component{
    constructor(props){
        super(props)
        //this.state = {value:''}
        this._refNode = null;
        this._lastKeyCode = false;
        this._lastCaretPosition = 0;
        this._lastValue = this.props.value;
        SyInput.prototype.reset = this.reset;
        //SyInput.reset = this.reset;
        console.log('syinput', props);
        props.reset = this.reset;
        
    }

    reset = () => {
        /*重置组件状态*/
        console.log('responseInput reset', this.props.value);
        //delete this.state.value;
        this._lastKeyCode = false;
        //this._lastCaretPosition = 0;
        this._lastValue = this.props.value;
    }

    focus = (evt) => {
        
    }

    keyDown = (event) => {
        this._lastKeyCode = event.keyCode;
        var p = this.getCaretPosition();
        //console.log('kewDown', p)
        this._lastCaretPosition = p;
        this._lastValue = event.target.innerText;
        if (this.props.readOnly && (event.key.length==1 || ['Enter', 'Backspace', 'Delete'].indexOf(event.key)!=-1)){
            return stopEventPropagate(event)
        } else {
            if (event.keyCode== 13){
                return stopEventPropagate(event)
            } else if (this.props.onKeyDown){
                this.props.onKeyDown(event);
            }
        }
        
    }
    

    getCaretPosition = () => {
        var savedRange;
        if(window.getSelection && window.getSelection().rangeCount > 0) {
            //FF,Chrome,Opera,Safari,IE9+
            savedRange = window.getSelection().getRangeAt(0).cloneRange();
        } else if(document.selection) {
            //IE 8 and lower
            savedRange = document.selection.createRange();
        }
        return savedRange.endOffset;
    }


    setCaretPosition = (ctrl,pos) => {
        if (ctrl.setSelectionRange){
            ctrl.focus();
            ctrl.setSelectionRange(pos,pos);
        } else {
            var range = document.createRange();
            var sel = window.getSelection();
            try {
                range.setStart(ctrl.childNodes[0], pos);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            } catch (err){
            }
        }
    }

    keyInput = (event) => {
        if (this.props.readOnly){
            var val;
            if (this._lastKeyCode == 0){

                if (isfalse(this._lastValue)){
                    val = isfalse(this.props.value)? '': this.props.value;
                } else {
                    //val = this.state.value;
                    val = this._lastValue
                }
                event.target.innerText= val;
                this.setCaretPosition(event.target, this._lastCaretPosition);
            }
            return stopEventPropagate(event)
        }
    }

    keyUp = (event) => {
        if (this.props.readOnly && (event.key.length==1 || ['Enter', 'Backspace', 'Delete'].indexOf(event.key)!=-1)){
            return stopEventPropagate(event)
        } else {
            if (event.keyCode== 13){
                console.log('press ENTER', this.props.onOk, this.props);
                if (this.props.onOk){
                    this.props.onOk(this._lastValue);
                }
                return stopEventPropagate(event)
            } else if (this.props.onKeyUp){
                this.props.onKeyUp(event);
            }
            var di = event.target.innerText.length - this._lastValue.length;
            var nps = this._lastCaretPosition+di;
            var nv = event.target.innerText.replace(/\n/, ' ')
            if (nv != this._lastValue) {
                    if (di != 0){
                    this._lastCaretPosition = nps;
                } else if (event.key=='ArrowLeft'){
                    this._lastCaretPosition--;
                } else if (event.key=='ArrowRight'){
                    this._lastCaretPosition++;
                } 
                this.setCaretPosition(event.target, this._lastCaretPosition);
            }
            this._lastValue = nv;
            //this.setState({value:nv})
        }
    }

    blur = (event) => {
        console.log('syinput blur', this);
        if (this.props.onBlur){
            this.props.onBlur(event);
        }
    }

    componentDidMount(){
        var eid = this._refNode.childNodes.length-1;
        var enode = this._refNode.childNodes[eid];
        enode.onkeydown=this.keyDown;
        enode.onkeyup=this.keyUp;
        //enode.onkeypress=this.keyUp;
        enode.oninput=this.keyInput;
        console.log('didMount', this);
    }
    
    render(){
        //console.log('render', this.props.value, this);
        let _ref;
        var inputWidth = "", val="";
        if (isfalse(this._lastValue)){
            val = isfalse(this.props.value)? '': this.props.value;
        } else {
            //val = this.state.value;
            val = this._lastValue
        }
        this._lastValue = this.props.value;        
        if (!isfalse(this.props.domSize)){
            var size = this._refNode.getBoundingClientRect();
            var pssize = this._refNode.previousElementSibling.getBoundingClientRect();
            var snode;
            var width = 0;
            for (var i=0; i<this._refNode.childElementCount-2; i++){
                snode = this._refNode.childNodes[i].getBoundingClientRect()
                width =  width+snode.width;
            }
            width = width+pssize.width;
            inputWidth = this.props.domSize.width-width;
        }
        //<div  className="response-line-edit" style={{"white-space":"nowrap", "width":inputWidth, 'overflow': 'hidden'}} contentEditable={"true"} onFocus={this.focus} onBlur={this.blur}>{val}</div> 
        return (
            <span className="ant-input-wrapper ant-input-group" style={{"display": "table"}} ref={e => (this._refNode = e)}>
            <input  className="response-line-edit" style={{"white-space":"nowrap", "width":inputWidth, 'overflow': 'hidden'}} onFocus={this.focus} onBlur={this.blur} />
            </span>
        )
    }
}

/* SyInput.prototype.propTypes = {
 *     readOnly: PropTypes.boolean,
 *     value: PropTypes.string,
 * };
 * */

registryWidget(SyInput);
export default SyInput;

