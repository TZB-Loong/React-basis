// import {PropTypes} from 'react';
import PropTypes from 'prop-types';
import {InputNumber} from 'antd';
import createWidget from '../_createWidget';
import {registryFormWidget,registryWidget} from '../_widgets';
import {isfalse} from '../../utils';
import './DbInputNumber.css';

const WrappedDbInputFloat = createWidget(InputNumber);

const DbInputFloat = ({field, props}) =>{
    var step = field.digits? 1/Math.pow(10, field.digits[1]) : 0.1
    return (
        <WrappedDbInputFloat addonBefore={field.string} defaultValue={ isfalse(props['value'])?"":props['value']} step={step} props={props} />
    );
};

DbInputFloat.prototype.propTypes = {
    field: PropTypes.object,
    props: PropTypes.object,
};

registryFormWidget(DbInputFloat);
registryFormWidget(DbInputFloat,'float');
export default DbInputFloat;

