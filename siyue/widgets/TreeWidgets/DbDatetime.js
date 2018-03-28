// import {PropTypes} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {DatePicker} from 'antd';
import createWidget from '../_createWidget';
import {registryTreeWidget,registryWidget} from '../_widgets';
import {isfalse} from '../../utils';
class CusDatePicker extends React.Component {
    constructor(props) {
        super(props);
        this.state={};
    }

    render() {
        const self = this;
        var onValueChange = function(evt,...kws){
            if (kws[0] != self.state.value){
                self.props.onOk(kws[0]);
            }
        }
        var vl = isfalse(this.state.value) ? this.props.defaultValue : this.state.value  ;
        vl = isfalse(vl) ? null : vl;
        return (
            <DatePicker showTime {...this.props} disabled={this.props.readOnly}  value={moment(vl,this.props.format)}   onChange={onValueChange} />
        )
    }
}

const WrappedDbDatetime = createWidget(CusDatePicker);
const dateFormat = "YYYY-MM-DD HH:mm:ss";
const DbDatetime = ({field, props}) =>{
    return (
        <WrappedDbDatetime  format={dateFormat} props={props} defaultValue={props.value}/>
    );
};

DbDatetime.prototype.propTypes = {
    field: PropTypes.object,
    props: PropTypes.object,
};

registryTreeWidget(DbDatetime);
registryTreeWidget(DbDatetime,'datetime');
export default DbDatetime;
