// import {PropTypes} from 'react';
import PropTypes from 'prop-types';
import {Input} from 'antd';
import createWidget from '../_createWidget';
import {registryTreeWidget,registryWidget} from '../_widgets';
import {isfalse} from '../../utils';


const WrappedDbInput = createWidget(Input);

const TopWrap = ({props,children}) => {
    var Child = children;
    //console.log('TopWrap', props, Child)
    
    return <Child.type {...Child.props} />
}

TopWrap.prototype.propTypes = {
    field: PropTypes.object,
    model: PropTypes.func,
    props: PropTypes.object,
    error: PropTypes.object,
    children:PropTypes.object
};


const DbInput = ({field, model, props}) =>{
    //console.log('tree dbinput', props, field, model);
    //var vl = props['value'];
    var isReadOnly = field.readonly || props.readOnly;
    return (
        <TopWrap>
        {isReadOnly ? <div className="db-table-cell-nowrap" style={{width:props.width}}>{props.value}</div> : <WrappedDbInput  defaultValue={props['value']}  props={props} />}
        </TopWrap>
    );
};

DbInput.prototype.propTypes = {
    field: PropTypes.object,
    model: PropTypes.func,
    props: PropTypes.object,
    error: PropTypes.object
};

registryTreeWidget(DbInput);
registryTreeWidget(DbInput,'char');
export default DbInput;

