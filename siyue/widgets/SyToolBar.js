import {isfalse} from '../utils';
import {registryWidget,getToolGroups} from './_widgets';
import ToolGroup from './ToolGroup';
import SySearch from "./SySearch";
import './SyToolBar.css';
import PropTypes from 'prop-types';
// const PropTypes = React.PropTypes;

const SyToolBar = (props) => {
    
//    console.log('props-SyToolBar',props)
    var gr_seqs = {...getToolGroups().sequences};
    var gr_seq_ks = Object.keys(gr_seqs),gr_name;
    gr_seq_ks.sort();
    var bt_seqs,bt_seqs_ks,bt_group,tb_group=[];
    gr_seq_ks.map(key => {
        bt_seqs = {...gr_seqs[key]};
        gr_name = bt_seqs.name;
        delete bt_seqs.name;
        bt_seqs_ks = Object.keys(bt_seqs);
        bt_seqs_ks.sort();
        bt_group=bt_seqs_ks.reduce((prev,cur) => {
            return [...prev,...bt_seqs[cur]];
        },[gr_name]);
        tb_group.push(bt_group);
    });
   
    return (
        <div style={{width:'100%',height:'38px'}}>
        <div style = {{"padding-top":'2px',overflow:'hidden'}}>
        {tb_group.map(group =><ToolGroup name={group[0]} key={group[0]} buttons={group.slice(1,group.length)} />)}
        {props.app.currentView=='form'?null: <SySearch app={props.app}/>}
         
        </div>
        </div>

    )
}

SyToolBar.propTypes = {
    props:PropTypes.object
}

registryWidget(SyToolBar);
export default SyToolBar;
