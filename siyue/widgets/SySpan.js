import {registryMarkdownWidget} from '../utils/markdown';
import { PropTypes, createElement, Component } from 'react';
import {isfalse} from '../utils';

class SySpan extends Component {
    constructor (props){
        super(props)
    }

    render() {

        const onmount = (node)=>{
            if (node !=null &&isfalse(this.props.children)&&node.childNodes.length==1){
                node.appendChild(document.createTextNode(''));
            }
        }
        
        return <span className={isfalse(this.props.children)?'siyue-empty-tag':undefined} ref={onmount}>{isfalse(this.props.children)?<input className='siyue-empty-tag-indicator'/>:this.props.children}</span>
    }
}

registryMarkdownWidget(SySpan, 'SySpan');
export default SySpan;
