import {isfalse} from '../utils';
import store from './store';
import apps from './apps';
//import models from './models';

/*
   本文件属于“思悦ERP项目”软件组成内容，相关权利属于深圳市莱克斯瑞智能家居有限公司所有，
   并受中华人民共和国和相关国际版权条约、法律、法规，以及其它知识产权法律和条约的保护。
   具体权利声明请看“版权声明”或http://www.siyue.it/copyright。

   copyright 深圳市莱克斯瑞智能家居有限公司 2017
 */

const triggers = function(){};
triggers.prototype._triggers = {};

triggers.bind = function(trigger,reducer){
    /*
       绑定
       参数：
       trigger, 字符类型的作为trigger名称
       reducer,字符类型dva model定义的reducer或effect；
       方法的话，则直接调用。
     */
    if (isfalse(triggers.prototype._triggers[trigger])){
        var pull;
        if( (typeof reducer) == 'string') {
            pull =  function(payload){
                store.dispatch({type:reducer,payload:payload});
            }
        } else if ((typeof reducer) == 'function') {
            pull = reducer;
        }
        triggers.prototype._triggers[trigger] = {pull:pull};//reducer;
        Object.defineProperty(triggers,trigger,{get:function(){return triggers.prototype._triggers[trigger]}});

    } else {
        throw(`trigger '${trigger}' has binded`);
    }

};

triggers.pull = function(reducer,payload){
    //没有绑定情况下可直接执行dispatch方法
    if (reducer.indexOf('SyState/')<0){
        reducer = 'SyState/' + reducer;
    }
    store.dispatch({type:reducer,payload:payload});
};

triggers.bind('First','SyState/modelFirst');
triggers.bind('Prev','SyState/modelPrevRow');
triggers.bind('Next','SyState/modelNextRow');
triggers.bind('Last','SyState/modelLastRow');
//triggers.bind('Edit','SyState/modelEdit');
triggers.bind('Edit',(payload)=>{
    apps.getApp(payload.appId).edit();
});
triggers.bind('Saving','SyState/modelSaving');

triggers.bind('New',function(payload){
    apps.getApp(payload.appId).create();
});


triggers.bind('Save',function(payload){
    /*# Save 保存应用所有变更内容

       # 参数
       payload字典参数说明  

       |---|---|---|---|---|
       |名称|类型|说明|默认值|是否必须|
       |appId|数字|需要保存应用的Id|无|是|
     */
    apps.getApp(payload.appId).save();
});

triggers.bind('Write',function(payload){
    /*# Write 保存指定datasource变更内容
       只保存修改的内容,不会保存新建的内容  

       # 参数
       payload字典参数说明  

       |---|---|---|---|---|
       |名称|类型|说明|默认值|是否必须|
       |appId|数字|需要保存应用的Id|无|是|
       |datasourceId|字符串|需要保存的datasource Id|无|是|

     */
    
    var ds = store.getAppDatasource(payload.appId,payload.datasourceId);
   
    ds.write()
});
triggers.bind('AppOpen','SyState/openApp');
triggers.bind('AppLoad',store.action_load);
triggers.bind('AppClose','SyState/closeApp'); 
triggers.bind('Commit','SyState/modelCommit');
triggers.bind('Cancel',function(payload){
    /*取消编辑的内容

    # 参数
    payload字典参数说明  

    |---|---|---|---|---|
    |名称|类型|说明|默认值|是否必须|
    |appId|数字|需要保存应用的Id|无|是|
    */
    apps.getApp(payload.appId).cancel();
    
});
triggers.bind('Unlink',function(payload){
    apps.getApp(payload.appId).unlink();
});
triggers.bind('ErrorTips','SyState/errorTips');
triggers.bind('SysInitialing','SyState/initialing');
triggers.bind('SysInit','SyState/init');
triggers.bind('SysLogin','SyState/login');
triggers.bind('SysLogout','SyState/logout');
triggers.bind('SessionLoad','SyState/sessionLoad');
triggers.bind('SwitchView','SyState/switchView')
triggers.bind('SetAppState','SyState/setAppState');
triggers.bind('FieldsViewGet','SyState/fieldsViewGet')

export default triggers;



