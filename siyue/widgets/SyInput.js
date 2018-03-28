import { Component} from 'react';
import PropTypes from 'prop-types';
import {registryFormWidget,registryWidget, NoWrapp} from './_widgets';
import {isfalse, stopEventPropagate} from '../utils';
import "./SyInput.css"


class SyInput  extends Component{
    constructor(props){
        super(props)
        this.state = {value: this.props.value,
                      timer: null,
        }
    }

    onKeyDown = (evt)=>{
        if(this.state.timer!=null){
            clearTimeout(this.state.timer);}
        var n = evt.target;
        this.state.value = n.value;
        this.state.timer = setTimeout(()=>{
            this.props.onOk && this.props.onOk(n.value);
        }, 50);
        this.props.onKeyDown && this.props.onKeyDown(evt);
    }

    render(){
        var props = {...this.props};
        var val="";
        val = isfalse(props.value)? '': props.value;
        var clsName = isfalse(props.className)? "siyue-input": "siyue-input " + props.className;

        return (
            <input {...props} className={clsName} value={props.readOnly? val: undefined} onKeyDown={this.onKeyDown} ref={node=>{
                if(node!=null){
                    if (!props.readOnly){
                        node.value = val;
                    }
                }
            }
            }/>
        )
    }
}

SyInput.formatter = (value, format) => {
    return isfalse(value)? '': value;
}


SyInput.prototype.propTypes = {
    props: PropTypes.object,
    readOnly: PropTypes.boolean,
    value: PropTypes.string,
};


registryWidget(SyInput);
export default SyInput;

