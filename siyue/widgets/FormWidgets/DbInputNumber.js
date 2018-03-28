// import {PropTypes} from 'react';
import PropTypes from 'prop-types';
import {InputNumber} from 'antd';
import createWidget from '../_createWidget';
import {registryFormWidget,registryWidget} from '../_widgets';
import {isfalse} from '../../utils';
import './DbInputNumber.css';

const WrappedDbInputNumber = createWidget(InputNumber);

const DbInputNumber = ({field, props}) =>{
    return (
        <WrappedDbInputNumber addonBefore={field.string} defaultValue={ isfalse(props['value'])?"":props['value']}  props={props} />
    );
};

DbInputNumber.prototype.propTypes = {
    field: PropTypes.object,
    props: PropTypes.object,
};

registryFormWidget(DbInputNumber);
registryFormWidget(DbInputNumber,'integer');
export default DbInputNumber;

