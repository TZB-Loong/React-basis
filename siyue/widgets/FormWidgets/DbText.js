// import {PropTypes} from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';
import createWidget from '../_createWidget';
import {registryFormWidget,registryWidget} from '../_widgets';
import {isfalse} from '../../utils';
const {TextArea} = Input

const WrappedDbInput= createWidget(Input);

const DbText = ({field, props}) =>{
    
        
    return (

        <WrappedDbInput defaultValue={ isfalse(props['value'])?'':props['value']} props={props} type='textarea' rows={6}  />
        
    );
};

DbText.prototype.propTypes = {
    field: PropTypes.object,
    props: PropTypes.object,
};

registryFormWidget(DbText);
registryFormWidget(DbText,'text');
export default DbText;

