import {registryWidget} from './_widgets';
// import {PropTypes} from 'react'
import PropTypes from 'prop-types';
import {isfalse} from '../utils';
import './ValueLabel.css'

const ValueLabel = ({props}) => {
    var clsName = isfalse(props.className)? "valuelabel": "valuelabel "+props.className;
    var val = isfalse(props.formatter)? props.value: props.formatter(props.value, props.format);
    return (
        <div className={clsName}>{val}</div>
    )
}

ValueLabel.prototype.propTypes = {
    props: PropTypes.object,
};

registryWidget(ValueLabel);
export default ValueLabel;
