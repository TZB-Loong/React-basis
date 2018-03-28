// import {PropTypes} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {DatePicker} from 'antd';
import createWidget from '../_createWidget';
import {registryFormWidget,registryWidget} from '../_widgets';
import {isfalse} from '../../utils';

class CusDatePicker extends React.Component {
    constructor(props) {
        super(props);
        this.state={};
    }

    componentWillUpdate(newProps){
        
    }

    render() {
        const self = this;

        const onOk = (datetime)=>{
            var dts = datetime.format(datetime._f)
            this.state.value = false
            self.props.commit && self.props.commit(dts)
        }
        
        const onValueChange = function(datetime,...kws){
            var dts = datetime.format(datetime._f)
            self.setState({value: datetime});
        }
        
        var vl = isfalse(this.state.value) ? this.props.defaultValue : this.state.value  ;
        vl = isfalse(vl) ? null : moment(vl,this.props.format);
        if(this.props.addonBefore){
            return (
                <div>
                <span>{this.props.addonBefore}</span>
                <DatePicker showTime {...this.props} disabled={this.props.readOnly}  value={vl}  onChange={onValueChange} onOk={onOk}/>
                </div>
            )
        }
        return (
            <DatePicker showTime {...this.props} disabled={this.props.readOnly}  value={vl}    onChange={onValueChange} onOk={onOk} />
        )
    }
}

CusDatePicker.formatter = (value, formate) => {
    return isfalse(value)? '': value;
}

const WrappedDbDatetime = createWidget(CusDatePicker);
const dateFormat = "YYYY-MM-DD HH:mm:ss";
const DbDatetime = ({field, props}) =>{
    
    return (
        <WrappedDbDatetime addonBefore={field.string}  format={dateFormat} props={props} defaultValue={props.value} commit={props.commit}/>
    );
};

DbDatetime.prototype.propTypes = {
    field: PropTypes.object,
    props: PropTypes.object,
};

registryFormWidget(DbDatetime);
registryFormWidget(DbDatetime,'datetime');
export default DbDatetime;
