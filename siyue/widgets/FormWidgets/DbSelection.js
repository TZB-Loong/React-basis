
// import { PropTypes } from 'react';
import PropTypes from 'prop-types';
import { Select,Input } from 'antd';
import createWidget from '../_createWidget';
import {NoWrapp,registryFormWidget, registryWidget } from '../_widgets';
import { isfalse } from '../../utils';

const Option = Select.Option;


class getSelect extends React.Component{
    constructor(props){
        super(props)
        this.state={}
    }

    render(){
        var newprops = {...this.props} 
        const onChage = (value)=>{
            //传回数据库的是id不是值
            for(var z in newprops.options){
                if(newprops.options[z][1] == value){
                    newprops.onOk(newprops.options[z][0]) // 执行更新，更新到数据库
                }
            }
        }
        const getOption = (object)=>{
            if(!isfalse(object)){
                return  object.map(item=>{
                    return  <Option key={item[0]} value={item[1]}>{item[1]}</Option>
                })
            }
        } 
        const optionsResult = getOption( newprops.options)  
        for(var i in newprops.options){
            if(newprops.options[i][0]==newprops.defaultValue){
                var vl =newprops.options[i][1];
            }
        }
        
        return( <NoWrapp>{ newprops.readOnly?<Input value={vl}/>: <Select   defaultValue={vl}
            style={{ width: 200 }} onChange={onChage}>
            {optionsResult}
            </Select>}</NoWrapp>)
    }
}

const WrappedDbAdress = createWidget(getSelect);

const  DbSelection = ({ field, props }) => {
    return (
        <WrappedDbAdress addonBefore={field.string} defaultValue={props.value ? props.value : ""} options={field.selection} props={props} />
    );
};

DbSelection.prototype.propTypes = {
    field: PropTypes.object,
    props: PropTypes.object,
};
registryFormWidget( DbSelection);
registryFormWidget( DbSelection, 'selection');
export default DbSelection;
