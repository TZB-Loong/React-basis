import { widgets, registryWidget } from './_widgets';
import { store, triggers, apps } from '../midware';
import { Modal, Spin, Tabs, notification } from 'antd';
import { isfalse } from '../utils';
import './AppRoot.css'
import ModalApp from './ModalApp';
import Dialog from './Dialog';
import PropTypes from 'prop-types';
// const PropTypes = React.PropTypes;
const Component = React.Component;
const TabPan = Tabs.TabPane;


class AppContainer extends Component {
    //const AppContainer = ({component, app, props}) => {
    /*
       component，应用组件名称
       app，应用数据空间
       创建应用组件，同时将应用绑定到odoo model

       应用接口参数
       app，应用数据空间
       props，应用当前记录内容，以及__app__应用定义内容

     */
    constructor(props) {
        super(props);
        this.state = { isLoad: false }
        this._refNode;
    }

    render() {
        var self = this;
        var { component, app } = this.props;

        var OApp = apps.getApp(app.app.appId);

        var AppComponent = component ? widgets[component] : widgets.Null;
        var opt = {};
        if (OApp.props.state == 'creating' && !OApp.vars.loadView) {
            OApp.loadView();

        } else {
            var ds = false;
            if (!isfalse(app.app.res_model)) {
                store.registryDatasource(app.app.appId, app.app.res_model);
                ds = store.getAppDatasource(app.app.appId, app.app.res_model);
            }

            if (ds && typeof ds.fields == 'object' && !this.state.isLoad) {
                this.setState({ isLoad: true });
                ds.search(app.app.fields, app.app.domain, app.app.context);
                ds.setState('browse')
            }

            //弹出框可重复弹出(确定时间无法多次绑定);
            var said, sapp;
            if (isfalse(app.app.subApps)) {
                said = 0;
                sapp = apps.getApp(said);
            } else {
                said = app.app.subApps[app.app.subApps.length - 1];
                sapp = apps.getApp(said);
                while (!isfalse(sapp.props.subApps)) {
                    said = sapp.props.subApps[sapp.props.subApps.length - 1];
                    sapp = apps.getApp(said);
                }
            }
            opt = sapp ? sapp.props : { action: {} };
            //显示子应用,只显示最后一个子应用
            //子应用只有在加载组件后再显示
            //根据状态作不同处理

            var isloading = app.app.state != 'ready' || isfalse(OApp.defaultDatasource) || ['creating', 'fetching', 'saving'].indexOf(OApp.defaultDatasource.props.state) > -1
            if (sapp) {
                if (opt.state == 'creating') {
                    sapp.loadView();
                }
            }
            var SApp = sapp ? widgets[sapp.props.currentViewName] : null;
        }
        if (!isfalse(store.error)) {
            if (store.error.target == app.app.appId) {
                notification.error({
                    message: '错误',
                    description: store.error.message,
                    onClose: function () {
                        triggers.ErrorTips.pull({});
                    }
                });
                triggers.ErrorTips.pull({});
                if (app.app.state != 'ready') {
                    OApp.setState('ready');
                }
            }
        }

        const unlink = () => {
            OApp.defaultDatasource.unlink(OApp.props.unlink);
            OApp.defaultDatasource.remove(OApp.props.unlink);
            OApp.setProps({ unlink: false });
            OApp.defaultDatasource.next();

        }

        const cancelUnlink = () => {
            OApp.setProps({ unlink: false });
        }

        return (
            <TabPan {...this.props} >

                {this.props.isShow ? <div className="siyue-app"><Spin key={'tabAppSpin' + app.app.appId} spinning={isloading} >
                    <AppComponent key={'AppComponent_' + app.app.appId} app={app} props={{ props: { props: ds ? { ...ds.props.currentRow } : {}, datasourceId: ds ? ds.props.id : 0, appId: app.app.appId } }} /><ModalApp key={'ModalApp_' + app.app.appId} props={opt} pane={SApp} />
                    <Dialog title="提示" visible={!isfalse(OApp.props.unlink)} onOk={unlink} onCancel={cancelUnlink} inapp={true} content="删除的记录将不可恢复,是否确定继续删除当前记录?" />
                </Spin>
                </div> : null}

            </TabPan>
        );
    }
};

AppContainer.propTypes = {
    component: PropTypes.string,
    app: PropTypes.object,
};

registryWidget(AppContainer);
export default AppContainer;
