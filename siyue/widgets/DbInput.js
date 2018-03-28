// import {PropTypes} from 'react';
import PropTypes from 'prop-types';
import  {Input} from 'antd';
import createWidget from './_createWidget';
import {registryWidget} from './_widgets';
import {isfalse} from '../utils';

const WrappedDbInput = createWidget(Input);

const DbInput = ({field, model, props}) =>{
   
   
    return (
       
        <WrappedDbInput addonBefore={field.string} defaultValue={props['value']}  props={props} />
    );
};

DbInput.prototype.propTypes = {
    field: PropTypes.object,
    model: PropTypes.func,
    props: PropTypes.object,
    error: PropTypes.object
};

registryWidget(DbInput);
registryWidget(DbInput,'char');
export default DbInput;

