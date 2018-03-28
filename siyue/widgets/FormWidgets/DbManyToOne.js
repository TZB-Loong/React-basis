/**
 * Created by hongmei on 2017/6/21.
 */
// import {PropTypes} from 'react';
import PropTypes from 'prop-types';
import {Input,Select,Spin} from 'antd';
import createWidget from '../_createWidget';
import {store} from '../../midware';
import {registryFormWidget,registryWidget} from '../_widgets';
import {isfalse} from '../../utils';
// import InputOption from '../InputOption';
// import DbComboBox from './DbComboBox';
import InputOption from '../InputOption';


const WrappedDbInputoption = createWidget(InputOption)
const DbManyToOne = ({field, props}) =>{
    var _props = {...props}
    return  ( <WrappedDbInputoption addonBefore={field.string} defaultValue={ isfalse(_props['value'])?"":_props['value'][1]} props={props} field={field}/>)
};

DbManyToOne.prototype.propTypes = {
    field: PropTypes.object,
    model: PropTypes.func,
    props: PropTypes.object,
    error: PropTypes.object
};

registryFormWidget(DbManyToOne);
registryFormWidget(DbManyToOne,'many2one');
export default DbManyToOne;


