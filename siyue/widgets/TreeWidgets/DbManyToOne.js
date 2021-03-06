// import {PropTypes} from 'react';
import PropTypes from 'prop-types';
import {Input, Select} from 'antd';
import createWidget from '../_createWidget';
import {registryTreeWidget,registryWidget} from '../_widgets';
import {isfalse} from '../../utils';
import InputOption from '../InputOption'

const InputGroup = Input.Group;
const  option =Select.option;



const WrappedDbInput = createWidget(Input);


const TopWrap = ({props,children}) => {
    var Child = children;
 

    return <Child.type {...Child.props} />
};

TopWrap.prototype.propTypes = {
    field: PropTypes.object,
    model: PropTypes.func,
    props: PropTypes.object,
    error: PropTypes.object,
    children:PropTypes.object
};


const  DbManyToOne = ({field, model, props}) =>{


    var isReadOnly = field.readonly || props.readOnly;
    return (
        <TopWrap >
            {isReadOnly ? <div className="db-table-cell-nowrap" style={{width:props.width}}>{props.value[1]}</div> : <div>

                <InputOption props={props} field={field}/>
            </div>}


        </TopWrap>
    );
};

DbManyToOne.prototype.propTypes = {
    field: PropTypes.object,
    model: PropTypes.func,
    props: PropTypes.object,
    error: PropTypes.object
};

registryTreeWidget(DbManyToOne);
registryTreeWidget(DbManyToOne,'many2one');
export default DbManyToOne;

