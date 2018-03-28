// import { PropTypes } from 'react';
import PropTypes from 'prop-types';
import {registryWidget } from './_widgets';
import { isfalse} from '../utils';

const SyCheckbox = ({value, readOnly, onOk, className}) => {
    /*测试一种机制利用节点保存节点自身状态
       当节点值发生变化时通过onOk方法通过上层更改传入值重新渲染组件
       在不涉及到节点增删情况下可以使用这种方式实现无状态组件
    */
    let _refInput;
    var ckClass = isfalse(value)? 'ant-checkbox': 'ant-checkbox ant-checkbox-checked';

    const onClick = (evt)=>{
        if (readOnly){
            _refInput.checked = !isfalse(value);
        } else{
            if(_refInput.checked){
                evt.currentTarget.classList.add('ant-checkbox-checked');
            } else {
                evt.currentTarget.classList.remove('ant-checkbox-checked');
            }
            onOk &&  onOk(!value);
        }
    }
    
    return (
        <span className={'ant-checkbox-wrapper'}>
        <span className={ckClass} onClick={onClick}>
        <input type='checkbox' className={'ant-checkbox-input'} ref={e=>{_refInput = e; if(e!=undefined){e.checked=!isfalse(value)}}}/>
        <span className={'ant-checkbox-inner'}/>
        </span>
        </span>
    )
};

SyCheckbox.propTypes = {
    value: PropTypes.boolean,
    readOnly:PropTypes.boolean,
    onOk: PropTypes.func,
    className: PropTypes.string,    
};

registryWidget(SyCheckbox, 'SyCheckbox');
export default SyCheckbox;
