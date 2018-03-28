import React, {PropTypes, Component} from 'react';
import { render } from 'react-dom';
import antd,{Table,Tabs} from 'antd';
const TabPane = Tabs.TabPane;
import {triggers, store} from '../midware';

class AppTabs extends Component {

    constructor(props){
        super(props)
        this.state = {'activeKey':'1'};
    }
    render(){
        var self = this;
        var onAppSwitch = function(evt){
            triggers.pull('SyState/switchApp',parseInt(evt));
            self.setState({activeKey:evt});
        }
        var aid =store.apps.activeAppId.toString();
        if (aid!=this.state.activeKey && store.apps.activeAppId>0) {
            self.setState({activeKey:aid});
        }
        return <Tabs onChange={onAppSwitch} {...this.props} activeKey={this.state.activeKey} />
    }
}

export default AppTabs;
