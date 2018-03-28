// import {PropTypes} from 'react';
import PropTypes from 'prop-types';
import {Input} from 'antd';
import createWidget from '../_createWidget';
import {registryFormWidget,registryWidget} from '../_widgets';
import {isfalse} from '../../utils';
import SyInput from '../SyInput';


//const WrappedDbInput = createWidget(Input);
const WrappedDbInput = createWidget(SyInput);

const DbInput = ({field, props}) =>{
    return (
        <WrappedDbInput style={{'outline':'none'}} addonBefore={field.string} defaultValue={ isfalse(props['value'])?"":props['value']}  props={props} />
    );
};

DbInput.prototype.propTypes = {
    field: PropTypes.object,
    props: PropTypes.object,
};

registryFormWidget(DbInput);
registryFormWidget(DbInput,'char');
export default DbInput;

