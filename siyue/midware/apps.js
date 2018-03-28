/*
   本文件属于“思悦ERP项目”软件组成内容，相关权利属于深圳市莱克斯瑞智能家居有限公司所有，
   并受中华人民共和国和相关国际版权条约、法律、法规，以及其它知识产权法律和条约的保护。
   具体权利声明请看“版权声明”或http://www.siyue.it/copyright。

   copyright 深圳市莱克斯瑞智能家居有限公司 2017
 */

/*
   app库为应用提供管理接口
   创建应用
   绑定事件
   获取应用
   关闭应用
   应用实时状态，不方便通过state管理的状态

   #app事件

   |----|----|
   |事件|触发时机|
   |onCreate|开始创建应用时触发|
   |onAfterCreate|创建成功后触发|
   |onBeforeSave|保存数据前时触发|
   |onSave|保存数据时触发|
   |onAfterSave|数据保存完成后触发|
   |onClose|关闭应用触发|
   |onAfterClose|关闭应用后触发|
   |onReady|应用就绪|


 **onBeforeSave事件实现流程**
   使用app.bind绑定onBeforeSave事件,调用app.save,设置defaultDatasource状态为saving,检查是否存在onBeforeSave事件,有则调用绑定的方法.  

   app.defaultDatasource下的是否存在onBeforeSave数据对象,如果存在就会调用app.bind绑定的方法.  

   onBeforeSave数据对象由app.bindr方法处理,可以绑定多个处理方法.  

   绑定的方法执行完成后返回onBeforeSave对象id,则会自动删除相应内容;或由绑定的方法自行删除已保存的对应onBeforeSave对应的数据id,这时返回false.  

   绑定的方法会在组件刷新时重复调用,直到onBeforeSave对象为空,然后进入app.save保存方法过程.


 */

import {isfalse,_globals} from '../utils';
import store from './store';
//import triggers from './triggers';

const _apps = _globals().apps;
const newAppIds = _apps.newAppIds;

const Apps = function(){};

Apps.newAppId  = function(){
    /*# newAppId 生成新应用id

       ##参数
       无

       # 返回结果
       数组,[应用id,临时应用id]

       ----
       为防止id冲突,会使用一个随机数作为临时app id,会在全局数组追加随机数,然后根据随机数在数组中的位置来决定app id,当应用创建后,会在数组中删除相应的随机数

     */
    var rndid = parseInt(Math.random()*1000000);
    var ks = Object.keys(store.apps);
    newAppIds.push(rndid);
    var iks = [], i;
    ks.map(k => {
        i = parseInt(k);
        i ? iks.push(i):null;
    });
    iks.sort();
    var nid = iks[iks.length-1]+newAppIds.indexOf(rndid)+1;
    nid = nid? nid : 1;
    return [nid,rndid];
}

Apps.removeTempAppId = function(tappId){
    var i = newAppIds.indexOf(tappId);
    if (i>-1){
        newAppIds.splice(i,1)
    }
}

Apps.bind = function(appId, event,callback){
    /*应用事件绑定
       事件绑定还可以通过定义AppContainer组件进行统一绑定。  
       使用apps.bind可以针对指定应用进行绑定。  
     **参数**
       appId,int,应用id
       event,string,事件
       callback,function,回调方法
     */
    var binds = _apps[appId].events[event];
    if (isfalse(binds)){
        binds = [callback];
    } else {
        if (binds.indexOf(callback)==-1){
            binds.push(callback);
        }
    }
    _apps[appId].events[event] = binds;
};

Apps.unbind = function(appId, event){
    /*应用事件解绑
       appId,int,应用id 
       event,string,事件
     */
    delete _apps[appId].event[event];
};

Apps.registryApp = function(appId,props){
    /*注册应用
       openApp后自动注册，不用特别去注册
       appId,应用id
       props,注册属性
     */
    //if (!_apps[appId])
    _apps[appId] = Object.assign({events:{}},_apps[appId]) ;
}

Apps.createApp = function(type, rootAppId, props, binds){
    
    /*# createApp 创建应用
       统一创建应用接口，根据参数构建必须的创建应用参数，然后调用相应的接口加载应用数据，并初始化必须应用环境。  

       # 参数

       |---|---|---|---|---|
       |名称|类型|说明|默认值|是否必须|
       |type|字符串|action类型,有action/view/views/object,详细说明见下表"type类型定义"|无|是|
       |rootAppId|数字或字符串|页签应用app id|无|是|
       |pane|string/组件/html|显示内容|无|否|
       |props|object|执行相应action所需的参数，不同类型的action对应的参数不一样,详细说明见下表"props说明"|无|是|
       |binds|object|应用事件绑定,可绑定事件见下表"可绑定事件"|无|否|

       ## type类型定义
       
       |---|---|
       |名称|说明|
       |action|应用，根据actionId从act_window表中相应的action加载应用|
       |view|单视图，使用视图名称打开相应视图；|
       |views|多视图，从ui_views表中加载指定model的视图列表，然后打开相应应用视图和app处理差不多，只是加载方式和入口不一样；|
       |object|指令，执行相应的指令，可能没有窗口出现，如非编辑状态更新相关数据。|
       

     **type='action'**

       |---|---|---|---|---|
       |名称|类型|说明|默认值|是否必须|
       |actionId|数字或字符串|act_window表中相应的id或xml定义action的xml_id|无|是|
       
     **type='views'**

       |---|---|---|---|---|
       |名称|类型|说明|默认值|是否必须|
       |model|字符串|views对应的model|无|是|
       |views|数组|指定需要加载的视图类型|无|是|
       |target|字符串|打开应用的位置及方式,有inline/main/new/current，详细说明看`target说明`|'current'|否|

     **type='view'**

       |---|---|---|---|---|
       |名称|类型|说明|默认值|是否必须|
       |model|字符串|views对应的model|无|是|
       |view|字符串|指定需要加载的视图类型|无|是|
       |target|字符串|打开应用的位置及方式,有inline/main/new/current，详细说明看`target说明`|'new'|否|               



       ## props说明

       |---|---|---|---|---|
       |名称|类型|说明|默认值|是否必须|
       |model字符串|应用需要使用的模型|无|是|
       |parentField|对象|父级字段|无|否|
       |target|字符串|打开应用的位置及方式,有inline/main/new/current，详细说明看`target说明`|无|否|
       |type|字符串|打开应用后的编辑类型,'new'新建,'modi'编辑当前记录,'search'搜索,'browse'搜索|无|否|
       |view|字符串|打开的视图类型,xml文件定义的视图类型form/tree/...|无|否|


       ## binds可绑定事件

       |---|---|
       |事件|说明|
       |onOk|响应modal方式应用点OK按键事件|
       |onClose|应用关闭|


     **target说明** (现在我不太明白的是这个的作用是什么?打开新的视图来实现这个跳转?)

       |---|---|
       |名称|说明|
       |inline|,新打开视图代替现应用|
       |main|全局视图|
       |new|应用内弹窗视图|
       |current|一般页签应用|

       # 返回结果
       无

       ----
       程序实现逻辑说明
       
       按不同类型的应用组合为可加载的应用形式，然后提交请求进行渲染
       单视图->多视图->action（视图组合）
       如果有绑定事件的话,先绑定事件,然后加载组件
       在绑定事件前必须有应用id,在未加载应用组件前必须先分配应用id,AppRoot先加载一个空白的应用,在感受响应速度有所加快.

       调用createApp方法后马上分配一个应用id,注册应用空间,绑定应用事件,AppRoot加载空白的应用,加载组件,初始化应用参数,openApp

     */

    //看下传进来的都是些什么玩意 ,如果使用的是creetApp的话
    

    if(['action', 'views', 'view', 'object'].indexOf(type)==-1){
        notification.error({
            message: '错误',
            description: '指定action type错误，指令无法执行。',
        });            
        return
    }
    var [appId,tempAppId] = Apps.newAppId();
    var app = {...props,appId:appId,rootAppId:rootAppId,target:props.target,state:'creating'}, iserror=false;
    _apps[appId] = {events:{},vars:{tempAppId:tempAppId}}
    binds && Object.entries(binds).map(bind => {
        Apps.bind(appId,bind[0], bind[1]);
    });
    var target = type=='action' ? 'current': props.target;
    if(!target){
        type == 'views'? 'current': 'new';
    }
    app.target = target;
    //app 里面是没有对其作出相依的 ,最终还是在调用这个 creatApp的这个问题的
    console.log(app,'open-app')

    store.dispatch('createApp',app);
    return Apps.getApp(appId);
}

Apps.getApp = function(appId){
    /*
       获取指定appId对象
       返回app操作对象
       只有注册后才能获取到
     */
    
    if (_apps[appId]) {
        var app = {
            close:function(data){
                var evt = {appId:appId,data:data};
                //关闭子应用
                app.props.subApps.map(sapp => {
                    sapp.close();
                })
                
                //关闭应用
                if(data && data.modal=='ok'){
                    //触发onOk事件
                    _apps[appId].events.onOk && _apps[appId].events.onOk.map(closeBind => {
                        evt.type = 'onOk';
                        evt.data = data.data;
                        closeBind(evt)
                    });
                } else {
                    
                    //触发onClose事件
                    _apps[appId].events.onClose && _apps[appId].events.onClose.map(closeBind => {
                        evt.type = 'onClose';
                        closeBind(evt)
                    });
                }
                //清除全局变更
                //需要删除页签应用subApps下关联appId
                delete _apps[appId];
                store.dispatch('closeApp', {appId:appId});
            },
            bind:function(event, callback){
                //绑定应用事件
                Apps.bind(appId, event, callback);
                
            },
            unbind:function(){
                //解绑事件
                Apps.unbind(appId, event);
            },
            loadView:function(force=false){
                /*loadView 请求加载视图
                   加载应用视图,默认情况下只加载一次,force参数等于true时例外.
                   # 参数

                   |---|---|---|---|---|
                   |名称|类型|说明|默认值|是否必须|
                   |force|boolean|是否强制加载视图|false|否|
                   
                   ----
                   执行请求后,需要增加已提交请求标识,避免重复请求,浪费资源.
                 */
                if (isfalse(app.vars.loadView) || force){
                    app.vars.loadView = true;
                    //判断加载类型
                    if (app.props.target=='new' && app.props.view){
                        store.dispatch('loadView',{...app.props});
                    } else if (app.props.target == 'current' && app.props.action.actionId){
                        store.action_load({action_id:app.props.action.actionId,props:{...app.props}});
                    }
                }
                
            },
            unlink:function(){
                /*#unlink 删除指定id记录
                   ----
                   弹出对话框让用户确认是否删除,确认后直接删除相应记录
                   AppContainer中判断是否存在app.props.unlinik属性而显示对话框
                 */
                var ids = isfalse(app.defaultDatasource.props.selectedRows)?[app.defaultDatasource.props.currentId]: Object.keys(app.defaultDatasource.props.selectedRows);
                app.setProps({unlink: ids});
            },
            
            setProps: function(props){
                store.dispatch('setAppProps',{props: props, appId:appId});
            },

            setState:function(state){
                store.dispatch('setAppState',{state:state, appId:appId});
            },
            getState:function(){
                return store.apps[appId].app.state;
            },
            setEditState:function(state){
                store.dispatch('setAppEditState',{state:state, appId:appId});
            },
            getEditState:function(){
                return store.apps[appId].app.editState;
            },
            getDatasources:function(){
                return store.apps[appId].datasources;
            },
            getDatasource:function(datasourceId){
                return store.getAppDatasource(appId,  datasourceId);
            },
            create:function(){
                /*# create 使用默认datasource新建记录
                 */
                app.setEditState('edit');
                app.defaultDatasource.create();
            },

            edit: function(){
                store.dispatch('switchView', { target: { view: 'form' }, appId: app.props.appId, datasourceId: app.props.datasourceId });
                store.dispatch('modelEdit',{ target: { view: 'form' }, appId:app.props.appId, datasourceId: app.props.datasourceId });
            },
            
            cancel: function(){
                /*取消变更
                   ----
                   需要将从数据源的变更也一并取消
                 */
                var dss = app.getDatasources(), sds;
                Object.keys(dss).map((key ) => {
                    // 目前只对主表(主数据源)有直接关联的从表获取变化的内容合并表主表的记录中进行统一保存
                    sds = app.getDatasource(key); //dss[key];
                    sds.cancel();
                    sds.setState('browse');
                })
                app.setEditState('browse');
            },

            _save: function(callback=false,callbackParams={}){
                /*保存应用中的变更*/
                var mds = app.defaultDatasource;
                var dss = app.getDatasources();
                var sds, sfupdater, c;
                //变更的one2many内容
                var updater = {};
                //根据id类型判断当前记录属于新增还是修改
                var scmd =  Number.isInteger(mds.props.currentId)? 1: 0;
                Object.keys(dss).map((key ) => {
                    // 目前只对主表(主数据源)有直接关联的从表获取变化的内容合并表主表的记录中进行统一保存
                    sds = app.getDatasource(key); //dss[key];
                    if (mds.props.id == sds.props.master && !isfalse(sds.props.dirty) && sds.props.relationType=='one2many'){
                        sfupdater = [];
                        Object.keys(sds.props.dirty).map((dk) => {
                            c = dk.charCodeAt(0);
                            if (c>=48 && c<=57){
                                if(sds.props.dirty[dk].type =='delete'){

                                    sfupdater.push([2,parseInt(dk),sds.props.dirty[dk].updater]);
                                }else{
                                    sfupdater.push([1, parseInt(dk), sds.props.dirty[dk].updater]);
                                }
                            } else {
                                if(sds.props.dirty[dk].type !='delete'){
                                    
                                    sfupdater.push([0, 0, sds.props.dirty[dk].updater]);
                                }
                            }
                        });
                        updater[sds.props.relationField] = sfupdater;
                    }    
                })
                var mdt;
                if (isfalse(mds.props.dirty[mds.props.currentId])){
                    mdt = {}
                } else {
                    mdt = {...mds.props.dirty[mds.props.currentId].updater};
                    Object.keys(mdt).map(k=>{
                        if (mds.fields[k].type=='many2many'){
                            var zfupdater = [];
                            zfupdater.push([6, false, mds.props.dirty[mds.props.currentId].updater[k].map(item => {
                                return typeof item=='number'? item: item[0];
                            })]);
                            updater[k] = zfupdater;
                        }
                    })
                    mdt = {...mds.props.dirty[mds.props.currentId].updater};
                }
                Object.assign(mdt, updater);
                if (scmd == 1){
                        if(!isfalse(callback)){
                        //编辑
                        mds.call_kw2('write',[[parseInt(mds.props.currentId)],mdt],{},{},{},'replace',callback, {});
                    }else{
                        mds.call_kw2('write',[[parseInt(mds.props.currentId)],mdt],{},{},{},'replace','', {});   
                    }
                } else if(scmd  == 0){
                    //新增
                    if(!isfalse(callback)){
                        mds.call_kw2('create',[mdt],{},{},{},'replace',callback, {id:mdt.id});
                    }else{
                        mds.call_kw2('create',[mdt],{},{},{},'replace','', {id:mdt.id});
                    }
                } 
            },
            
            save:function(callback=false,callbackParams={}){
                /*#save 保存应用中已做的变更

                   # 参数 

                   |---|---|---|---|---|
                   |名称|类型|说明|默认值|是否必须|
                   需要对应用内所有datasource的全部变更进行保存,变更类型会有修改/删除/新增.  
                   |callback|字符串或方法|指定处理操作的方法,字符串时由systate中的相应的方法处理,否则由指定的方法处理|false|否|                   
                   默认情况下只会保存app默认数据源的数据,默认数据源的one2many或many2many字段内容的变更使用,最后保存时使用默认数据源的write方法一次写入所有数据,而不用分多次将多条记录分别保存到服务端,节省交互时间提高响应速度.

                   保存前需要对defaultDatasource中one2many字段类型从数据源的变更合并到defaultDatasource变更中,然后一起提交保存
                   更新one2many及many2many类型字段的子命令定义如下:
                   One2many and Many2many use a special "commands" format to manipulate the set of records stored in/associated with the field.

                   This format is a list of triplets executed sequentially, where each triplet is a command to execute on the set of records. Not all commands apply in all situations. Possible commands are:

                   (0, _, values)
                   adds a new record created from the provided value dict.
                   (1, id, values)
                   updates an existing record of id id with the values in values. Can not be used in create().
                   (2, id, _)
                   removes the record of id id from the set, then deletes it (from the database). Can not be used in create().
                   (3, id, _)
                   removes the record of id id from the set, but does not delete it. Can not be used on One2many. Can not be used in create().
                   (4, id, _)
                   adds an existing record of id id to the set. Can not be used on One2many.
                   (5, _, _)
                   removes all records from the set, equivalent to using the command 3 on every record explicitly. Can not be used on One2many. Can not be used in create().
                   (6, _, ids)
                   replaces all existing records in the set by the ids list, equivalent to using the command 5 followed by a command 4 for each id in ids.

                 */
                var beforesaves = _apps[appId].events['onBeforeSave'];
                beforesaves = isfalse(beforesaves)? []: beforesaves;
                var tasks, all_tasks=[];
                beforesaves.map(bs =>{
                    tasks = bs();
                    all_tasks.splice(all_tasks.length, 0, ...tasks);
                });
                if (all_tasks.length>0){
                    all_tasks.reduce(function(cur, next) {
                        return cur.then(next);
                    }).then(function() {
                        app._save(callback,callbackParams);
                    });
                } else {
                    app._save(callback,callbackParams);
                }
            },

            onAfterSave: function(event){
                //保存后事件
                var ids=false, ds;
                Object.keys(app.getDatasources()).map(key =>{
                    ds = app.getDatasource(key);
                    if(Object.keys(ds.props.dirty).length>0){
                        ds.dispatch('datasourceClearDirty', {});
                    }
                });
                if (event.param.params.method=='create'){
                    ids = [event.result];
                } else if (event.param.params.method=='write'){
                    ids = event.param.params.args[0];
                }
                ids && app.defaultDatasource.read(ids,[],{},{},{},'update');
            }
        }
        
        Object.defineProperty(app, 'props', {get:function(){
            //访问app定义属性
            return store.apps[appId].app;
        }});

        Object.defineProperty(app, 'defaultDatasource', {get:function(){
            return isfalse(app.props.datasourceId)? null :app.getDatasource(app.props.datasourceId);
        }});

        Object.defineProperty(app, 'vars', {get:function(){
            //访问app变量
            return _apps[appId].vars;
        }});
        
        return app;
    }
}

Object.defineProperty(Apps, 'activeAppId', {get: function(){
    return store.apps.activeAppId;
}})

Object.defineProperty(Apps, 'activeApp', {get: function(){
    return Apps.getApp(store.apps.activeAppId);
}})

export default  Apps;
