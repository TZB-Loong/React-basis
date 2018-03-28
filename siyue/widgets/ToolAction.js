import midware,{store,models,triggers} from '../midware';
import {widgets,registryWidget} from './_widgets';
import {isfalse} from '../utils';
import {Tooltip} from 'antd';
import PropTypes from 'prop-types';
// var Tooltip = antd.Tooltip;

const ToolAction = ({button}) => {
    var session = store.session;
    var actApp = store.activeApp;
    var datasource = store.activeAppDatasource;
    var state=isfalse(button.update) ? button.state : button.update(session,actApp,datasource) ;
    var ToolComponent = widgets[button.component];
    button.onClick = isfalse(button.onClick)? function(){
        if (triggers[button.trigger]) {
            triggers[button.trigger].pull({target:button,appId:actApp.app.appId,datasourceId:actApp.app.datasourceId});
        }
    } : button.onClick;
    button.state=state;
    return (
        <Tooltip placement='bottom' title={button.tooltip}>
          <a>
            <ToolComponent button={button} session={session} app={actApp} datasource={datasource} />
          </a>
        </Tooltip>
    );
};

// ToolAction.prototype.propTypes = {
//     button:React.PropTypes.object,
// };

registryWidget(ToolAction);
export default ToolAction;
