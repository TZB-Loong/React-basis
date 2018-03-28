// import {PropTypes} from 'react';
import PropTypes from 'prop-types';
import {Switch} from 'antd';
import createWidget from '../_createWidget';
import {registryFormWidget,registryWidget, NoWrap} from '../_widgets';
import {isfalse} from '../../utils';

const WrappedSwitch = createWidget(Switch);


const DbSwitch = ({field, props}) =>{
    var vl = isfalse(props['value'])?false:props['value'];
    
    const onClick=(evt)=>{
        props.commit && props.commit(evt);
    }

    return (
        <NoWrap>{props.readOnly? <WrappedSwitch className='siyue-widget-wrap'  addonBefore={field.string} checked={vl} props={props}/>: <WrappedSwitch className='siyue-widget-wrap'  addonBefore={field.string} defaultValue={vl} defaultChecked={vl}  props={props} onChange={onClick}/>}</NoWrap>
    );
}

DbSwitch.prototype.propTypes = {
    field: PropTypes.object,
    props: PropTypes.object,
};

registryFormWidget(DbSwitch, 'DbSwitch');
registryFormWidget(DbSwitch,'boolean');
export default DbSwitch;

