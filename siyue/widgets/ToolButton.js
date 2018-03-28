import {registryWidget} from './_widgets';
import {Button} from 'antd';
import PropTypes from 'prop-types';
// import { prototype } from 'stream'
const ToolButton = ({button,session,app,datasource,error}) => {
    return (
        <Button {...button.props} icon={button.icon}  disabled={button.state=='disabled'} onClick={button.onClick}>{button.showTitle?button.title:null}</Button>
    )
};

// ToolButton.prototype.propTypes = {
//     button:React.PropTypes.object,
//     session: React.PropTypes.object,
//     app: React.PropTypes.object,
//     datasource: React.PropTypes.object,
//     error: React.PropTypes.object
// };


registryWidget(ToolButton);
export default ToolButton;

