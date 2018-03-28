import { Component} from 'react';
import PropTypes from 'prop-types';
import createWidget from './_createWidget';
import {registryWidget, NoWrap} from './_widgets';
import {isfalse, stopEventPropagate} from '../utils';
import './SyTag.css';


const SyTag = ({id, closable, onClose, children})=>{

    const close = (evt)=>{
        if (!isfalse(onClose)){
            onClose([id,children]);
        }
    }
    return (
        <span className="siyue-tag ant-tag">
        {children}
        {isfalse(closable)?null: <span key={id} data-id={id} onClick={close}><i className="siyue-tag-close"/></span>}
        </span>
    )
    
}


SyTag.prototype.propTypes = {
    id: PropTypes.number,
    closable: PropTypes.bool,
    onClose: PropTypes.func,
    children: PropTypes.any,
};

registryWidget(SyTag, 'SyTag');
export default SyTag;
