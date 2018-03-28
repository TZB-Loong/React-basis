// import {PropTypes} from 'react';
import PropTypes from 'prop-types';
import {Input, Select} from 'antd';
import createWidget from '../_createWidget';
import {registryTreeWidget,registryWidget} from '../_widgets';
import {isfalse} from '../../utils';
import InputOption from '../InputOption'

const InputGroup = Input.Group;
const  option =Select.option;





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


const  DbManyToMany = ({field, model, props}) =>{
    console.log('tree Appellation', props, field, model);
    console.log('@@@tree Appellation', props);
    console.log('tree Appellation',props.value);
    //var vl = props['value'];
    var isReadOnly = field.readonly || props.readOnly;
    return (
        <TopWrap >
            {/*{isReadOnly ? <div className="db-table-cell-nowrap" style={{width:props.width}}>{props.value}</div> : <WrappedDbInput  defaultValue={props['value']}  props={props} />}*/}
            {isReadOnly ?
            <div className="db-table-cell-nowrap" style={{width:props.width}}>{props.value[1]}</div>:
                <InputOption mode="multiple" field={field} props={props}/>
            }


                {/*: <WrappedDbInput  defaultValue={props['value']}  props={props} />*/}

        </TopWrap>
    );
};

DbManyToMany.prototype.propTypes = {
    field: PropTypes.object,
    model: PropTypes.func,
    props: PropTypes.object,
    error: PropTypes.object
};

registryTreeWidget(DbManyToMany);
registryTreeWidget(DbManyToMany,'many2many');
export default DbManyToMany;
