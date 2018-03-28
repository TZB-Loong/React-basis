import { registryWidget } from './_widgets';
import AppContainer from './AppContainer';
import SyMenu from './SyMenu';
import Field from './Field';
import SyToolBar from './SyToolBar';
import AppTabs from './AppTabs';
import { triggers, store, apps } from '../midware';
import { Tabs, Spin, notification } from 'antd';
import { isfalse, globalMouseDrop } from '../utils';
import './AppRoot.css';
import UserInfo from './UserInfo'
import PropTypes from 'prop-types';
const TabPane = Tabs.TabPane;
// const PropTypes = React.PropTypes;

let defaultApp = '';

const AppRoot = ({ state, kargs }) => {

    var aid = store.apps.activeAppId.toString();
    const onUserLogout = ({ button }) => {
        triggers.pull();
    };

        
 
    if (defaultApp == "" && !isfalse(kargs.act)) {  
        console.log('kargs-view',kargs)
        defaultApp = kargs.act;
        apps.createApp('action', apps.activeAppId, { actionId: defaultApp });
    }



    /*
    //开发状态,kargs为开发应用的参数，kargs由url参数传入 
    //
    if (kargs.dev == '1' && !isfalse(kargs.view)) {
        if (isfalse(state.appsMap[kargs.view])) {
            console.log('dev==1',kargs)
            //未加载开发测试应用，将kargs转为应用数据格式，并申请打开应用
            kargs['domain'] = JSON.parse(kargs.domain);
            kargs['appName'] = kargs.view;
            kargs.defaultView = kargs.view;
            kargs.displayName = kargs.displayName ? kargs.displayName : kargs.name ? kargs.name : kargs.view;
            kargs.viewType = kargs.viewType ? kargs.viewType : 'form';

            triggers.AppOpen.pull(kargs)
            //creaApp 是创建一个应用(我觉得是要使用后者)
            //triggers.AppOpen.pull(kargs) //申请打开已经加载的应用(不知道能不能打开还未加载的应用)
         }
    }

    */

    var panes = [];
    state.apps.appIds.map(pid => {
        panes.push(state.apps[pid]);
    });
    if (!isfalse(state.error.type) && isfalse(state.error.target)) {
        notification.error({
            message: '错误',
            description: state.error.message,
            onClose: function () {
                triggers.ErrorTips.pull({});
            }
        });
        triggers.ErrorTips.pull({});
    }
    const onAppSwitch = function (evt) {
        triggers.pull('SyState/switchApp', parseInt(evt));
    }

    //全局鼠标拖放调用
    const mouseMove = function (evt) {
        if (globalMouseDrop.isBound) {
            if (evt.buttons == 1)
                globalMouseDrop.pull(evt);
            else
                globalMouseDrop.unbind();
        }
    }

    const onTabEdit = function (tabIndex, action) {
        if (action == 'remove') {
            /*关闭应用
               appId,需要关闭的应用id
               nextAppId,关闭应用后选择的应用id
               如果没指定nextAppId或nextAppId不存在，选择关闭应用的下一个应用，如果是最后一个应用则选择前一个应用
             */
            triggers.pull('SyState/closeApp', { 'appId': tabIndex });
        }
    }

    // console.log(state,'AppRoot-state')
    
 
    return (
        <div className="siyue-ui-root" onMouseMove={mouseMove}>
            <Spin spinning={typeof state.menus.menus == 'undefined'}>
                <div className='siyue-menu-bar' >
                    <UserInfo session={state.session} state={state} kargs={kargs} />
                </div>
                <div className="siyue-tools-bar" style={{ 'margin-left': '240px', minWidth: '320px' }}>
                    {isfalse(store.activeApp) ? null : <SyToolBar app={state.apps[state.apps.activeAppId].app} />}
                </div>
                <AppTabs className="siyue-tabs" type='editable-card' hideAdd={true} style={{ height: '100%' }} onEdit={onTabEdit} >

                    {panes.map(pane => <AppContainer className="siyue-tabpane" tab={pane.app.display_name} key={'' + pane.app.appId} component={pane.app.currentViewName} app={pane} isShow={aid ==-1 ? true : pane.app.appId == aid ? true : false} />)}
                </AppTabs>
            </Spin>
        </div>
    )
}

AppRoot.propTypes = {
    state: PropTypes.object,
    kargs: PropTypes.object
}

registryWidget(AppRoot);
export default AppRoot;
