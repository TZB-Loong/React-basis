// import {PropTypes} from 'react';
import PropTypes from 'prop-types';
import {windgets,getToolButton,registryWidget} from './_widgets';
import ToolAction from './ToolAction';
//var ToolAction = SiYue.widgets.ToolAction;
//var ToolAction = widgets.ToolAction;

const ToolGroup = ({name,buttons}) => {
    var bts = buttons.reduce(function(cur,pre){
        cur.push({key:pre,name:pre});
        return cur
    },[]);
    return (
        <span style={{'margin-left':'3px'}}>
        {bts.map(button => <ToolAction key={button.key} button={getToolButton(button.name)}  />)}
        </span>
    )
}

ToolGroup.prototype.propTypes = {
    name: PropTypes.string,
    buttons: PropTypes.array,
};

registryWidget(ToolGroup);
export default ToolGroup;
