
import {syimport, actionLoad, login, userInfo, logout,init,call_kw,modelSearch } from '../midware/backend';
//import {cookie} from "dva";
import lcs from '../utils/localStore';
import {isfalse, url2params, _globals} from '../utils';
import navi from './navi';
import {store,apps}  from '../midware';
import {Widgets,registryWidget} from '../widgets';
import datasource from './datasource';

var cookie = dvalib.cookie;
/*
   本文件属于“思悦ERP项目”软件组成内容，相关权利属于深圳市莱克斯瑞智能家居有限公司所有，
   并受中华人民共和国和相关国际版权条约、法律、法规，以及其它知识产权法律和条约的保护。
   具体权利声明请看“版权声明”或http://www.siyue.it/copyright。

   copyright 深圳市莱克斯瑞智能家居有限公司 2017
 */
var urlParams = url2params(window.location.search.substr(1))

var closeSubApp = function(state, appid, nextAppId){
    var ostate = state;
    var aid = parseInt(appid)
    var app = ostate.apps[aid];
    store.cleanAppEnv(aid);
    if (app.app.subApps.length>0) {
        //如果有子应用，先清理子应用内容
        var said = app.app.subApps.pop();
        closeSubApp(ostate, said, nextAppId)
    }
    var appname = app.app.currentViewName+'_'+aid;
    delete ostate.apps[aid];
    delete ostate.appsMap[appname];
    delete ostate.appsMap[aid];
    /*
    if (!app.app.action.parentAppId){
        //关闭的是页签应用（一般应用，非子应用）
        var nextId = parseInt(nextAppId)>=0 ? parseInt(nextAppId) : -1;
        var aidx = ostate.apps.appIds.indexOf(aid)
        if (aidx != -1){
            ostate.apps.appIds.splice(aidx,1);
            if (nextId == -1) {
                nextId = aidx <= ostate.apps.appIds.length  ? aidx : ostate.apps.appIds.length;
            }

        }
    } else {
        nextId = app.app.action.parentAppId;
        //ostate.apps[nextId].app.subApps.pop()
    }
    if (nextId == -1) {
        nextId = ostate.apps.appIds.length>0  ? ostate.apps.appIds[ostate.apps.appIds.length-1] :nextId;
    }
    */
    return ostate;
}

export default {
    namespace: 'SyState',
    state: {
        // session.sate : -9: 登录失败;-8:初始状态，网页刚打开时；-7:会话状态恢复中； -3:获取服务器会话id失败；-2:未获取服务器会id；-1: 正在获取服务器会话id；0: 已获取服务器会话id，用户未登录；1: 用户登录中；9：登录成功
        error: {},
        menus: {state:0,menus:[]},
        session: {
            state: -8,
            csrf_token: '',
            session_id: ''
        },
        userlogin: {
            user:'',
            password: '',
            db: '',
            userInfo:[]
        },
        apps: {
            activeAppId:-1,
            activeAppPath:[], //应用激活路径
            appIds:[] //只有出现在appIds列表中的app id才会出现在界面app区
        },
        appsMap:{}

    },
    reducers: {
        setMenuState(state,action){
            var ostate = {...state};
            ostate.menus.state = action.payload.state;
            return ostate;
        },
        menuLoad (state,action){
            var ostate = {...state};
            ostate.menus.state = 2;
            ostate.menus.menus=action.payload.result.children;
            _globals.set('menus.state',2);
            return ostate;
        },
        loadingApp (state,action) {
            return {...state}
        },
        createApp (state, action){
          
            /*# createApp 创建空白app
               创建空白app,主要是用于注册空间及方便与midware.app.createApp方法使用appID实现应用事件注册.  

               # 参数
               参数由action.payload传入。

               |---|---|---|---|---|
               |名称|类型|说明|默认值|是否必须|
               |tempAppId|数字|临时应用id|无|是|
               |appId|数字|应用id|无|是|
               |rootAppId|数字|当前激的页签应用id|无|当target为new是为必须参数,其余为可选|
               |target|字符串|打开应用的方式,详细说明见下表"target说明"|无|是|

             */
            console.log(action.payload,'action')
            var {appId, rootAppId, target} = action.payload;
            var ostate = {...state}, rapp, papp;
            
            var appProps = {
                appId:appId,
                target:target,
                view:action.payload.view,
                res_model:action.payload.model,
                display_name:'',
                state:'creating',
                editState:'browse',
                subApps:[],
                action:action.payload
            };
           
            var app = {app:appProps,'datasources':{},'context':{},'datasourceFields':{}};
            if (target=='new' && rootAppId>0){
                rapp = ostate.apps[rootAppId].app;
                papp = rapp.subApps.length>0 ? rapp.subApps[rapp.subApps.length-1] : rootAppId;
                rapp.subApps = [...rapp.subApps,appId];
            } else {
                ostate.apps.appIds.push(appId)
            }
           
            ostate.apps[appId] = app;
            console.log(app,'open-app')
            return ostate;
        },
        closeApp (state, action) {
            /*关闭应用
            并清理应用相关的内容，如果有修改数据必须在关闭前已和用户确认将修改将会取消。
            
               参数
               action.payload.appId,需要关闭的应用id
               action.payload.nextAppId,关闭应用后选择的应用id
               如果没指定nextAppId或nextAppId不存在，选择关闭应用的下一个应用，如果是最后一个应用则选择前一个应用

             */
            var ostate = {...state};
            var aid = parseInt(action.payload['appId']);
            var app = ostate.apps[aid].app;
            var rapp = ostate.apps[app.action.rootAppId];
            ostate = closeSubApp(ostate, aid, action.payload['nextAppId'])
            if (ostate.apps.appIds.indexOf(aid)!=-1){
                //页签应用
                var aidx = ostate.apps.appIds.indexOf(aid)
                ostate.apps.appIds.splice(aidx,1);
                var i = ostate.apps.activeAppPath.indexOf(aid);
                ostate.apps.activeAppPath.splice(i,1);
                aidx = ostate.apps.activeAppPath[ostate.apps.activeAppPath.length-1];
                ostate.apps.activeAppId = aidx ? aidx :0;
            } else  if (rapp){
                //子应用
                var sapps = rapp.app.subApps;
                sapps.splice(sapps.indexOf(aid),1);
                rapp.app.subApps = sapps;
            }
            delete ostate.apps[aid];
            return ostate;
        },
        openApp (state,action) {

            //这里还有个打开新的应用,在打开新的应用的时候这个参数是怎么会事呢
            //应该使用的是打开新的应用而不是创建新的引用


            //最终还是会调用到当前的 openApp 
            //所以说 打开视图的这一块还是要放到这个位置里面

            /*# openApp 打开新应用
               初始化已加载的view，然后载入到views等待渲染。

               ## 参数
               参数由action.payload传入。

               |---|---|---|---|---|
               |名称|类型|说明|默认值|是否必须|
               |appId|数字|打开应用的id|无|是|
               |defaultView|字符串|默认视图类型|无|是|
               |currentViewName|字符串|当前视图完整名称(组件名称)|无|是|
               |editState|字符串|应用编辑状态,编辑edit或查看browse|browse|是|
               |fields|array|应用各个视图所用到的字段名称|无|是|
               |res_model|字符串|应用对应后端model名称|无|是|
               |display_name|字符串|标题名称|无|target为new时可选,其余为必须|
               |rootAppId|数字|当前激的页签应用id|无|当target为new是为必须参数,其余为可选|
               |state|字符串|应用状态|loading|是|
               |target|字符串|打开应用的方式,详细说明见下表"target说明"|无|是|
               |action|对象|发起openApp请求来源参数|无|是|
               |subApps|数组|子应用|[]|否|

               应用已载入，更新应用状态后打开
	       actiion.payload.app为已加载的应用对象。
	       打开后切换到新应用

             **target说明**

               |---|---|
               |名称|说明|
               |inline|,新打开视图代替现应用|
               |main|全局视图|
               |new|应用内弹窗视图|
               |current|一般页签应用|

               ----
               
               列出应用所有未分类的状态，创建中creating、加载中、就绪、数据保存中、数据读取中、正在修改、数据已被修改、正在查看、可修改、只读、准备关闭、关闭中、显示搜索栏、显示工具栏
               
               应用状态说明
               创建中creating,由createApp函数创建到组件及字段加载完成  
               加载中loading,组件与字段已加载进来,执行一次默认查询,等待数据加载及渲染组件  
               就绪ready,加载完成,可以进行其它操作.
               数据保存中saving,正在保存数据到服务端
               数据读取中fetching,正在从服务端读取数据

               只读状态,分应用后端只读,前端界面只读
               后端只读readOnly,是针对用户权限进行控制,用户没有修改权限，readOnly=true只读，不可进行后端数据修改，后端响应提交失败.
               前端只读editState,只是对界面状态进行识别,editState='browse'为只读.
               
               应用状态切换,

             */
            //打开页签时应用出现两个页签
            var ract;
            if (action.payload.action.props){
                ract = {...action.payload.action.props.action, ...action.payload.action.props};
                delete action.payload.action.props;
                delete ract.action;
            } else {
                ract = action.payload.action;
            }
            var ostate = {...state};
            var rid = ract.appId ;
            rid = rid ? rid: ostate.apps.appIds.length==0? 1 : ostate.apps.appIds[ostate.apps.appIds.length-1]+1;
            var app = {...action.payload,...ostate.apps[rid]}
            var fields = {}
            // app.currentView = 'tree';
            app.currentView = app.defaultView;  //这个视图并不能控制整个视图的变化(只是控制一部份)
            app.appId = rid;
            app.fields = app.fields ;//Object.keys(app.fields);
            app.editState = 'browse';
            app.readOnly = false; //设为只读只,不可修改内容，这个会与用户权限相关在loadApp/loadView时一并获取
            app.subApps = []; //子应用，target为new类型的应用
            var ds = {};
            var ds_id = app.res_model.split('.').join('_')
            var rpp = isfalse(app.limit) ? false : app.limit;
            var appname = app.currentViewName+'_'+rid;
            var defaultprops = datasource.defaultDatasourceProps();
            
            ds[ds_id] ={
                ...defaultprops,
                id:ds_id,
                appId:rid,
                model: app.res_model,
                rowsPerPage:rpp
            };
            app.datasourceId = ds_id;
            ostate.apps[rid] = {app:app, views:{}, datasources:ds,context:{},datasourceFields:{}};
            ostate.appsMap[rid] = appname
            ostate.appsMap[appname] = rid;
            if (app.target=='current'){
                // appIds为页签应用的id
                ostate.apps.activeAppId =  rid;
                ostate.apps.activeAppPath.push(rid);
            } else if (app.action.target=='new' && action.payload.rootAppId){
                var rapp = ostate.apps[action.payload.rootAppId].app;
                var paid = isfalse(rapp.subApps) ? action.payload.rootAppId : rapp.subApps[rapp.subApps.length-1]
                app.parentdAppId = paid;
                rapp.subApps = isfalse(rapp.subApps) ? [rid] : [...rapp.subApps,rid];
            }
            if (!isfalse(app.app)){
                Object.assign(app.action, app.app.action)
                delete app.app;
            }
            console.log(app,'tets-app')
               
            
            if(app.action.target!='new'){

                console.log(window.location.pathname,'window.location.pathname')


                window.history.pushState(document.location.href,'title','?actionId='+app.id+'&view='+app.currentView +'&res_id='+app.res_id);

                //那在这里进行保存下,我 们来看下子哦  
                //执行这个保存应该讲开发状态排除在外
                var newRecord ={
                    'actionId':app.id,
                    'view':app.currentView,
                    'res_id':app.res_id
                }
                lcs.setObject('record',newRecord); //在这里做一次保存,之后也要在某个地方做一次的提取,这样才会比较的合理 
                console.log(lcs.getObject('record'),'record-record-record')
            }
           

            return ostate ;
        },
        openView:function(state,action){
            /*
               openView打开的窗口不出现在页签中，不通过act_window加载，而是通过load_view或fields_view_get方法直接加载相应的view进行显示
             */
        },
        switchApp:function(state,action){
            //切换应用
            var ostate = {...state};
            ostate.apps.activeAppId =  action.payload;
            var i = ostate.apps.activeAppPath.indexOf(action.payload);
            ostate.apps.activeAppPath.splice(i,1);
            ostate.apps.activeAppPath.push(action.payload);

            return ostate;
        },
        switchView:function(state, action){
            /*# 切换视图

             **参数**
               action.payload对象定义相应参数   
               
               |---|---|---|---|---|
               |名称|类型|说明|默认值|是否必须|
               |target|点击的按键定义, 按键定义查看ToolButtons|无|是|
               |appId|切换视图的app id|无|是|
               |datasourceId|切换视图app的主数据源id|无|是|

               对于target对象,主要是使用到它的view属性,也就是需要切换到的视图类型  
               switchView的触发由点击相应按键发起,然后调用triggers触发, 可查看ToolAction组件代码.  
               ```
               button.onClick = isfalse(button.onClick)? function(){
               if (triggers[button.trigger]) {
               triggers[button.trigger].pull({target:button,appId:actApp.app.appId,datasourceId:actApp.app.datasourceId});
               }
               } : button.onClick;

               ```
               
             */
            var ostate = {...state};
            var app = ostate.apps[action.payload.appId];
            app.app.currentView = action.payload.target.view;
            app.app.currentViewName =[...(app.app.res_model.split('.')),action.payload.target.view].join('_')

             if(app.app.action.target != 'new'){
              window.history.pushState(document.location.href,'title','?actionId='+app.app.action.actionId+'&view='+app.app.currentView+'&res_id='+app.app.res_id);

              var newRecord ={
                'actionId':app.app.action.actionId,
                'view':app.app.currentView,
                'res_id':app.app.res_id
            }
            lcs.setObject('record',newRecord); //在这里做一次保存,之后也要在某个地方做一次的提取,这样才会比较的合理 
            console.log(lcs.getObject('record'),'record-record-record');
             }  


            return ostate;
        },
        setSystemState (state, action) {
            var ostate = {...state};
            ostate.apps[action.payload.name].state = 'initialing';
            return ostate;
        },
        setAppProps (state, action){
            var ostate = {...state};
            Object.assign(ostate.apps[action.payload.appId].app, action.payload.props);
            return ostate;
        },
        
        setAppState (state, action){
            var ostate = {...state};
            ostate.apps[action.payload.appId].app.state= action.payload.state;
            return ostate;
        },
        setAppEditState (state, action){
            var ostate = {...state};
            ostate.apps[action.payload.appId].app.editState= action.payload.state;
            return ostate;
        },
        errorTips (state, action) {
            //错误提示，action.payload.error为一个对象包含message,target,type;
            var ostate = {...state};
            ostate.error = action.payload;
            return ostate;
        },
        initialing (state, action) {
            var ostate = {...state};
            ostate.session.state = -1;
            ostate.error = {};
            ostate.userlogin.login=action.payload.login;
            ostate.userlogin.db=action.payload.db;
            ostate.userlogin.password=action.payload.password;
            return ostate;
        },
        initError (state, action) {
            lcs.removeItem(state.session.session_id);
            lcs.arrayRemove('sessions', state.session.session_id);
            var ostate = {...state};
            ostate.session = {state:-3};
            ostate.error = action.payload.error;
            return  ostate;
        },
        initialized (state,action) {
            var ostate = {...state};
            ostate.session.state = 0;
            ostate.error = {message : ''};
            Object.assign(ostate.session,action.payload);
            return ostate;
        },
        logining (state,action) {
            var ostate = {...state}
            ostate.session.state = 1;
            ostate.error = {message : ''};
            return {
	        ...ostate,
	        ...action.payload
            };
        },

        loginSuccess (state, action) {  //这个是保存在本地上的,不是在最开始的时候的,这个才是重点的,不是很多的,其实

            //这个框架中

            /*
               登录成功后将会话内容保存localStorage中
               sessions:会话id列表
               sessionid:会话内容
             */
            var ostate = {...state}
            ostate.session.state = 9;
            Object.assign(ostate.session,action.payload);
            var ses = lcs.getObject('sessions');
            if (!ses || ses.indexOf(ostate.session.session_id)==-1){
                lcs.arrayPush('sessions', ostate.session.session_id);
            }
            lcs.setObject(ostate.session.session_id,action.payload);
            return ostate;
        },
        loginFail (state, action) {
            var ostate = {...state}
            ostate.session.state = -9;
            ostate.error = {message:action.payload.error};
            return ostate;
        },
        sessionLoad (state, action) {
            /*会话恢复
               localStorage是否有保存会话内容，
               cookie sid和ls的sid不一致时，删除ls会话内容
               cookie sid和ls的sid一致时，还原ls会话内容
               cookie sid为空时，还原ls会话内容
             */
            var sids = lcs.getObject('sessions');
            var ostate = {...state};
            if (isfalse(sids)){
                ostate.session.state = -2;
            } else {
                //cookie.save('session_id', rp.data.session_id, {maxAge:360*12, path: '/' });

                var sid = cookie.get('session_id');
                if (isfalse(sid)) {
                    //还原会话
                    ostate.session.state = -7;
                    sid = sids[0];
                } else {
                    //判断是否还原会话
                    if (sids[0] == sid) {
                        ostate.session.state = -7;
                    } else {
                        lcs.arrayRemove('sessions',sids[0]);
                        lcs.removeItem(sids[0]);
                        ostate.session.state = -8; //检查旧会话id，直到全部清除完成
                    }
                }
            }
            if (state.session.state==-7) {
                //还原会话
                var se = lcs.getObject(sid);
                ostate.session = {...se};
                ostate.session.state = -7;
            }
            return ostate;
        },
        userLogout (state, action) {
            var ostate = {...state};
            lcs.removeItem(ostate.session.session_id);
            //var ses = lcs.getObject('sessions');
            lcs.arrayRemove('sessions',ostate.session.session_id);
            ostate.session ={ state: -2};
            ostate.userlogin={};
            ostate.apps = {
                activeAppId:-1,
                activeAppPath:[],
                appIds:[]
            };
            ostate.appsMap = {};
            ostate.menus =  {state:0,menus:[]}
            //在全局变量中设置菜单加载状态menus.state为0(未加载状态)
            _globals.set('menus.state', 0);
            return ostate;
        },
        infoUser (state,action){
            var ostate = {...state};
            ostate.userlogin.userInfo=action.payload.result;
            return ostate;

        },
        nameSearch (state, action){
            var ostate = {...state},lrows,drows={},rkeys=[];
            var ds = ostate.apps[action.payload.appId].datasources[action.payload.datasourceId];

            state.apps[action.payload.appId].app.state='ready';

            action.payload.result.map(row=>{
                drows[row[0]]=row;
                rkeys.push(row[0])

            })
            var offset = action.payload.param.params.offset;
            offset = isfalse(offset)? 0 : parseInt(offset/model.rowsPerPage);
            var method = action.payload.param.params.method;

            if (action.payload.flush=='replace'){
                if (action.payload.result.length>0){
                    ds.rows = drows;
                    ds.rowsKeys = rkeys;
                    ds.currentRow = action.payload.result[0];
                    ds.currentIndex = 0;
                    ds.currentId = action.payload.result[0][0];
                    ds.pageRange = [offset];

                } else {
                    ds.rows = {};
                    ds.rowsKeys = [];
                    ds.currentRow = {};
                    ds.currentIndex = -1;
                    ds.currentId =   -1;
                }
            } else {
                if (action.payload.result.length>0){
                    Object.assign(ds.rows,drows);

                }
            }
            ds.state = 'ready';
            ds.rowCount = isfalse(action.payload.result.length)?rkeys.length : action.payload.result.length;
            ds.totalLength = isfalse(action.payload.result.length)?rkeys.length : action.payload.result.length;
            return ostate;
        },
        
        modelRemove (state, action) {  //删除一条记录 指定id进行删除?)
            var ostate = {...state}, idx;
            var ds = ostate.apps[action.payload.appId].datasources[action.payload.datasourceId];
            action.payload.ids.map((id,i) => {
                if(typeof(i)!='function'){
                    if (id.indexOf==undefined || id.indexOf('new')==-1){
                        ds.dirty[id]={ 
                            type:'delete',
                            updater:ds.rows[id],
                            raw:ds.rows[id]
                        }
                    } else {
                        delete ds.dirty[id];
                    }
                    delete ds.rows[id];
                    idx = ds.rowsKeys.indexOf(id);
                    ds.rowsKeys.splice(idx,1);
                    /* if(['many2many'].indexOf(ds.relationType)!=-1){
                     *     //当为many2many时,删除父级数据源数据
                     *  }*/
                 }
            });
            return ostate;
        },
        
        modelData (state, action){
            var ostate = {...state},lrows,drows={},rkeys=[];
            var model = ostate.apps[action.payload.appId].datasources[action.payload.datasourceId]; //.fields=action.payload.result;
            //bug:保存出错时，payload.result值会是undefined
            ostate.apps[action.payload.appId].app.state='ready';
            if (typeof action.payload.result.join == 'undefined'){
                lrows = isfalse(action.payload.result.records)? action.payload.result.length==0 ? []:[action.payload.result]:action.payload.result.records;
            } else {
                lrows = action.payload.result;
            }
            var offset = action.payload.param.params.offset;
            offset = isfalse(offset)? 0 : parseInt(offset/model.rowsPerPage);
            !isfalse(lrows) && lrows.map(row =>  {
                drows[row.id]=row;
                rkeys.push(row.id);
            });
            var method = action.payload.param.params.method;
            if (method=='write'){
                var wid = action.payload.param.params.args[0][0];
                var updater = isfalse(model.dirty[wid])? {}:model.dirty[wid].updater;
                //var updater = model.dirty[wid].updater;
                var crow = model.rows[model.currentId];
                if (action.payload.result){
                    model.state = 'ready';
                    model.rows[wid] = {...model.rows[wid],...updater}
                    delete model.dirty[wid];
                    if (Object.keys(model.dirty).length == 0){
                        //保存成功后，当dirty没有未保存数据时，将应用状态变为查看状态
                        ostate.apps[action.payload.appId].app.editState='browse';
                    }
                    var _app = apps.getApp(action.payload.appId)
                    setTimeout(function(){
                        _app.onAfterSave(action.payload)
                    }, 1);
                } else {
                    model.state = 'edit';
                }
            } else if (method=='onchange'){
                var drt = model.dirty[action.payload.callbackParams.id];
                if (isfalse(drt)){
                    drt = {
	                type:'edit',
	                updater:{},
	                raw:{...model.currentRow}
	            };
                }
                drt.updater={...drt.updater,...action.payload.result.value};
                model.dirty[action.payload.callbackParams.id] = drt;
                //Object.assign(model.dirty[action.payload.callbackParams.id].updater, action.payload.result.value);
                Object.assign(model.currentRow, action.payload.result.value);
                model.state = 'ready';
            } else {
                switch(action.payload.flush){
                    case 'update' :
                    //更新记录(从最后一个开始追加)
                    //在这里也是不可进行修改的啊   
                    // console.log('model. dataCache',model. dataCache,action.payload)
                         
                           if (isfalse(lrows.concat)){
                            lrows = [lrows];
                        }
                        lrows.map(row => {
                            model.rows[row.id] = row;
                            if (model.rowsKeys.indexOf(row.id)==-1){
                                model.rowsKeys.push(row.id)
                            }
                        })
                        model.currentRow = model.rows[model.currentId];
                        break;
                    case 'replace':
                        //用新记录集替换全部记录

                        if (lrows.length >0){
                            model.rows = drows;
                            model.rowsKeys = rkeys;
                            model.currentRow = lrows[0];
                            model.currentIndex = 0;
                            model.currentId =   lrows[0].id;
                            model.pageRange = [offset];
                        } else {
                            model.rows = {};
                            model.rowsKeys = [];
                            model.currentRow = {};
                            model.currentIndex = -1;
                            model.currentId =   -1;
                        }
                        model.rowCount = isfalse(action.payload.result.length)?rkeys.length : action.payload.result.length;
                        model.totalLength = isfalse(action.payload.result.length)?rkeys.length : action.payload.result.length;
                        model.dataCache = isfalse(action.payload.param.params.offset)?0:action.payload.param.params.offset;                        
                        break;
                        
                    case 'preppend':
                        //更新行记录(从0开始追加)
                        // if (isfalse(lrows.concat)){
                        //     lrows = [lrows];
                        // }
                        // console.log('lrows',lrows)
                        lrows.map((row,i) => {
                            isfalse(row)?'':model.rows[row.id] = row;
                            if (model.rowsKeys.indexOf(row.id)==-1){ //第一个添加到第一个,之后在
                                if(!isfalse(row.id)){
                                    model.rowsKeys.splice(i,0,row.id)
                                    // model.rowsKeys.unshift(row.id)
                                }
                            }
                        })
                        model.currentRow = model.rows[model.currentId];
                        // console.log('model.rowKeys',model.rowsKeys.length)
                        break;
                    case 'fieldupdate':
                        //只对相应行的字段内容更新更新,而不是整行更新
                        if (isfalse(lrows.concat)){
                            lrows = [lrows];
                        }
                        lrows.map(row => {
                            if (model.rowsKeys.indexOf(row.id)==-1){
                                model.rows[row.id] = row;
                                model.rowsKeys.push(row.id)
                            } else {
                                Object.assign(model.rows[row.id], row);
                            }
                        })
                        model.currentRow = model.rows[model.currentId];
                        break;
                    case 'default':
                        
                }
                model.state = 'ready';
            }
            return ostate;
        },
        ...datasource.reducers,
        ...navi.reducers
    },
    
    effects: {

        *toolbarClick ({payload},{call, put}) {

            switch (payload.name){
                case 'poweroff':
                    yield put({type:'userLogout'});
                    break;
                case 'edit':
	            break;
            }
        },

        *init ({payload}, { call, put }) {
            const rp = yield call(init,payload);
            if (rp.success) {
                cookie.set('session_id', rp.data.session_id, {expires:1, path: '/' });
                if (rp.data.uid ){
                    yield put({
                        type: 'loginSuccess',
                        payload: {
                            ...rp.data
                        } });
                } else {
                    yield put({
                        type: 'initialized',
                        payload: {
                            ...rp.data
	                }
      	            });

	        }
            } else {

                yield put({type:'initError', payload: {error: rp.error}});
            }
        },
        
        *logout ({payload} , {call,put}) {

            const rp = yield call(logout, payload);
            yield put({type:'userLogout'});
        },
        *login ({payload, }, { call, put }) {
            yield put({ type: 'logining' });
            const rp = yield call(login, payload);
            if (rp.success ){
                if( rp.data.uid) {
                    yield put({
                        type: 'loginSuccess',
                        payload: {...rp.data}
                    });
                } else {
                    yield put({
                        type: 'loginFail',payload: {error: rp.data.error}
                    });
                }
            } else {
                //服务器异常
                yield put({type:'initError', payload: {error: rp.error}});
            }
        },
        *loadApp({payload},{call,put}){
            // console.log('pyload-payload',payload)
            /*
               从服务端加载视图
               读取action，转换为app定义，加载视图(已加载则略过)，请求打开应用视图
               子应用会有“new新建”、“search搜索”、“browse查看”、“modi修改”几种方式
               payload为Action定义的参数
               payload.actionId,对应后端actions model的action id
               payload.target，指定应用打开方式
               payload.parentField = ''; //对应父应用的字段名称

               payload.parentAppId，打开应用所属的父应用
               
               payload.parentAppField = ''; //对应父应用的字段名称
               
             */
            var default_view, view_name;
            var load_success = true;
            //var pa = {action_id:payload.action.actionId};
            // console.log('actionLoad-payload',payload)
            const rp = yield call(actionLoad, payload);
            
            if (rp.success){
                var result = rp.data.result;

                
                if(!isfalse(payload.action.props.view)){
                    default_view = payload.action.props.view
                }else{
                    if (result.view_id){
                        result.views.map(v => {
                            console.log('result-views',payload.action.props.view)
                            console.log(v,'vvvvv',result.view_id[0])
                            if (v[0] == result.view_id[0]) {
                              
                                // if (!isfalse(payload.action.props.view)) {
                                //     console.log('payload.action.view', payload.action.view)
                                //     default_view = payload.action.props.view
                                // } else {
                                // }
                                default_view = v[1];
                            }
                        })
                    } else {
                        default_view = result.views[0][1];
                    }
                }
                
                if (default_view=='list'){
                    default_view='tree'
                }
                
                result['defaultView'] =  default_view;
                view_name = [...(result.res_model.split('.')),default_view].join('_');
                result['currentViewName'] = view_name
                result['state'] = 'loading';
              
                var tid = Math.round(Math.random()*Math.pow(10,9)).toString(); //开发模式下的版本号
                var pid;  //非开发模式下的版本号
                if(!isfalse(rp.data.result)){
                    var val = Date.parse(rp.data.result.write_date)/1000;  //将标准事件转换为时间戳
                    pid = val.toString(16); //将时间戳(10进制)转换为16进制
                }else{
                    pid = null;
                }

                var fields = {};
                var errors = [], nview;
                for (var j =0;j<result.views.length;j++){
                    if (result.views[j][1]=='list'){
                        nview = [...(result.res_model.split('.')),'tree'].join('_');
                    } else {
                        nview = [...(result.res_model.split('.')),result.views[j][1]].join('_');
                    }
                    var p = urlParams['dev'] == '1' ? {module_name:nview,version:''+tid} : {module_name:nview,version:''+pid};
                    try {
                 
                        var md = yield call(syimport, p);
                       
                        if (isfalse(md)) {
                            yield put({type:'errorTips',payload:{type:'info', message:'module not found:'+nview}});
                            load_success = false;
                        } else {
                            md.fields.map(field => {
                                if(isfalse(fields[field])){
                                    fields[field] = true;
                                }
                            });
                            
                            registryWidget(md,nview);
                        }
                    } catch(e){
                        yield put({type:'errorTips',payload:{type:'info', message:'module load error:'+nview+'.\n'+e}});
                    }
                }
                result.fields = Object.keys(fields);
                result.target = payload.action.target ? payload.action.target : result.target;
                result.action = payload.action
              
                if (load_success){
                    yield put({type:'openApp',payload:result})
                    //当加载成功后 
                    //w我就像晓得 这个能不能修改

                }
            } else {
                //待处理：错误处理
                console.log('error',rp.data);
            }
        },
        *loadViews ({payload}, {call, put}) {
            /*# loadViews 加载多个视图
               从指定的model中加载指定的视图  
               # 参数
               payload是统一的参数入口,其中属性定义与app.createApp方法的type='views'时定义一致  

               |---|---|---|---|---|
               |名称|类型|说明|默认值|是否必须|
               |model|字符串|views对应的model|无|是|
               |views|数组|指定需要加载的视图类型|无|是|
               |rootAppId|数字或字符串|页签应用app id|无|是|
               |target|字符串|打开应用的位置及方式,有inline/main/new/current，详细说明看openApp方法说明|'current'|否|               
               ----
               主要作用是加载model相应视图组件，
             */
        },
        *loadView ({payload}, {call, put}) {
            /*# loadView 加载单个视图
               从指定的model中加载指定的视图  

               # 参数
               payload是统一的参数入口,其中属性定义与app.createApp方法的type='view'时定义一致  

               |---|---|---|---|---|
               |名称|类型|说明|默认值|是否必须|
               |model|字符串|views对应的model|无|是|
               |view|字符串|指定需要加载的视图类型|无|是|
               |rootAppId|数字或字符串|页签应用app id|无|是|
               |target|字符串|打开应用的位置及方式,有inline/main/new/current，详细说明看openApp方法说明|'new'|否|               

               ----
               加载model相应视图组件，初始化app属性，openApp
               
             */
            // console.log(rp,'rp-loadView')
            var tid = Math.round(Math.random()*Math.pow(10,9)).toString();
            
            var {res_model, view, rootAppId, target} = payload;
            var view_name = [...res_model.split('.'), view].join('_');
            var load_success = true, fields={}, app = {};
            var p = urlParams['dev'] == '1' ? {module_name:view_name,version:''+tid} : {module_name:view_name};
            try {
                var md = yield call(syimport, p)
                if (isfalse(md)) {
                    yield put({type:'errorTips',payload:{type:'info', message:'module not found:'+nview}});
                    load_success = false;
                } else {
                    app.fields = md.fields
                    registryWidget(md,view_name);
                }
            } catch(e){
                load_success = false;
                console.log('module load error:'+nview+'.\n'+e);
                yield put({type:'errorTips',payload:{type:'info', message:'module load error:'+nview+'.\n'+e}});
            }
            app.target = payload.target ? payload.target : 'new';
            app.action = payload.action
            app.res_model = payload.res_model;
            app.defaultView = payload.view;
            app.currentViewName = view_name;
            app.state = "creating";
            if (load_success){
                yield put({type:'openApp',payload:app})
            }
        },
        
        *call_kw ({payload} ,{ call, put}) {
            var appId = payload.appId;
            var updateState;
            if(typeof payload.callback!='function'){
                if(['create','write'].indexOf(payload.param.params.method)!=-1){
                    updateState = 'saving';
                } else {
                    
                    updateState = 'fetching';
                }
                yield put({type:'updateDatasourceState', payload:{appId:payload.appId, datasourceId:payload.datasourceId, state:updateState}});
            }
            const rp = yield call(call_kw, payload);
            if (rp.success && rp.data.result){
                payload = {...payload, appId: appId};
                payload.appId = appId;
                payload.result = rp.data.result;
                if(typeof payload.callback=='function'){
                    payload.callback(payload)
                }else  if(typeof payload.callback=='string' && payload.callback!=''){
                    
                    yield put({type:payload.callback, payload:payload});
                }else  if(payload.param.params.method == 'name_search'){
                    yield put({type:'nameSearch', payload:payload});
                } else if (payload.param.params.method == 'default_get'){
                    
                    yield put({type:'defaultGet', payload:payload});
                }else if (payload.param.params.method == 'create'){
                    yield put({type:'datasourceCreate', payload:payload});
                }else {
                    yield put({type:'modelData', payload:payload});
                }

            } else {
                //待处理：错误处理
                console.log('error',rp.data);
                var error={type:'error'};
                if(rp.data.error){
                    console.log(rp.data.error.data.exception_type);
                    console.log(rp.data.error.data.message);
                    error.message = rp.data.error.data.exception_type+'\n'+rp.data.error.data.message;
                } else {
                    error.message = rp.data;
                }
                yield put({type:'updateDatasourceState', payload:{appId:payload.appId, datasourceId:payload.datasourceId, state:'ready'}});
                yield put({type:"errorTips",payload:error})
            }
        },
        *loadMenu ({payload}, {call, put}) {
            //读取菜单
            yield put({type:'loadingMenu'});
            const rp = yield call(call_kw, payload);
            if (rp.success){
                payload.result = rp.data.result;
                yield put({type:'menuLoad', payload:payload});
            } else {
	        //待处理：错误处理
                _globals.set('menus.state',9)
            }

        },
        *userInfoLoad({payload},{call,put}){
            yield  put({type:'user'});
            const  rp = yield  call(call_kw,payload);
            if (rp.success){
                payload.result = rp.data.result;
                yield  put({type:'infoUser',payload:payload});
            }else{
                console.log('error',rp.data)
            }
        },

        *fields ({payload}, {call, put}) {
        },
        *create ({payload}, {call, put}) {
        },
        *delete ({payload}, {call, put}) {
        },
        ...datasource.effects

    },
    subscriptions: {
    },
};
