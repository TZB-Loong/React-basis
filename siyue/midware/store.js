/*
   本文件属于“思悦ERP项目”软件组成内容，相关权利属于深圳市莱克斯瑞智能家居有限公司所有，
   并受中华人民共和国和相关国际版权条约、法律、法规，以及其它知识产权法律和条约的保护。
   具体权利声明请看“版权声明”或http://www.siyue.it/copyright。

   copyright 深圳市莱克斯瑞智能家居有限公司 2017
 */

/*
   storeEngine库提供系统全局访问dva store及dispatch的方法。并提供方法简化对dva store的访问及操作。
 */

import {isfalse,_globals} from '../utils';
import {scall_kw} from './backend';

var _apps=_globals().apps;
const Store = function(){};
Store.prototype._env = {};
Store.prototype._fields_get_state = {};
Store.bind = function(dispatch,base){
    Store._dispatch = dispatch;
    Store.prototype._env = base;
};

Store.dispatch = function(){
    /*
       dipatch消息到store
       可以用两种参数方式，一种是dva方式，即用{type,payload}作为参数。
       另一种是(reducer,data)形式，reducer不用添加dva store空间，因为思悦框架下只用到一个store命名空间SyState，它会被自动补上去。
     */
    if (typeof arguments[0] == 'object'){
        Store._dispatch(arguments[0]);
    } else if (typeof arguments[0] == 'string'){
        var reducer = arguments[0];
        var payload = arguments[1];
        if (reducer.indexOf('SyState/')<0){
        
            reducer = 'SyState/' + reducer;
        }
        // console.log('payload',payload)
        Store._dispatch({type:reducer,payload:payload});
    }
}

Store.isNewRecord = function(rec){
    /*# 判断记录是否是新建的记录
       根据记录id判断指定的记录是否为新建记录.
       以非数字开头的id为新记录,以数字开头的为旧记录.

       ## 参数
       rec可以是对象和字符串.为对象时必须有id属性,id为记录的尖.
       rec为字符串时即为记录id.

       ## 返回

       true,新记录
       false,旧记录
       undefined, 非法参数
     */
    var c;
    if (rec.charCodeAt!=undefined){
        c = rec.charCodeAt(0);
        return !(c>=48 && c<= 57)
    } else {
        if (rec.id!=undefined && rec.id.charCodeAt!=undefined){
            c = rec.id.charCodeAt(0);
            return !(c>=48 && c<= 57)
        }
    }
    return undefined
}


Object.defineProperty(Store,'apps',{get:function(){
    return Store.prototype._env.apps;
}});

Object.defineProperty(Store,'activeApp',{get:function(){
    return Store.apps[Store.apps.activeAppId];
}});

Object.defineProperty(Store,'activeAppDatasources',{get:function(){
    return Store.apps[Store.apps.activeAppId].datasources;
}});
Object.defineProperty(Store,'activeAppDatasource',{get:function(){
    var dsid =Store.props.apps[Store.props.apps.activeAppId].app.datasourceId;
    
    return dsid? Store.getAppDatasource(Store.props.apps.activeAppId,dsid) : null;
}});


Object.defineProperty(Store,'session',{get:function(){
    return Store.prototype._env.session;
}});

Object.defineProperty(Store,'error',{get:function(){
    return Store.prototype._env.error;
}});

Object.defineProperty(Store,'props',{get:function(){
    return Store.prototype._env;
}});

Store.call_kw2 = function(modelName,method,kwargs = {args:[],kwargs:{},context:{},params:{}, flush:'replace'}, callback=null, callbackParams={appId:'', datasourceId:''}){
    /*对外call_kw调整接口参数
       action改为callback,call_kw2只由systate.call_kw执行数据请求动作,执行完数据请求后执行相应callback.
     */
    var tkws = {args:[],kwargs:{},context:{},params:{}, flush:'replace'}
    Object.assign(tkws,kwargs);
    var {args,kwargs,context,params, flush} = tkws;
    var {appId, datasourceId} = callbackParams;
    var paramsMix = isfalse(context.params) ? {} : context.params;
    paramsMix = {...paramsMix,...params};
    var context = {...context,...Store.props.session.context,params:paramsMix};
    var kws = {
        ...kwargs,
        context:  context
    };
    if (method=='onchange'){
        args.push(context);
        kws = {...kwargs};
    }
    
    var pa = {
        model: modelName,
        method: method,
        args: args,
        kwargs: kws
    };
    var tid = Math.round(Math.random()*Math.pow(10,9));
    var call_kw_param = {
        id: tid,
        jsonrpc: '2.0',
        method: 'call',
        csrf_token: Store.props.session.csrf_token,
        params:  {...pa}
    };
    var url = `/web/dataset/call_kw/${modelName}/${method}`;
    var dparam = {url: url,param: call_kw_param, flush: flush,callback:callback, callbackParams:callbackParams,datasourceId: datasourceId,appId:appId}
    Store.dispatch({type:'SyState/call_kw', payload:dparam});
}

Store.call_kw = function(modelName,method,action='call_kw',kwargs = {args:[],kwargs:{},context:{},params:{}, flush:'replace'}, callbackParams={appId:'', datasourceId:''}){
    /* #call_kw 后端call_kw接口调用
       构造后端call_kw接口参数,并进行调用  

       # 参数
       参数为后端call_kw函数所需的格式  

       |----|----|----|----|----|
       |参数|类型|说明|默认值|是否必须|
       |modelName|字符串|后端model名称|无|是|
       |method|字符串|在model上执行的方法|无|是|
       |action|字符串或方法|获取数据后回调的处理动作，如果是action是字符类型交给systate处理，如果是方法则由该方法进行处理|'call_kw'|是|
       |kwargs|对象|执行method所需的参数,详细说明见下表"kwargs参数说明"|无|是|
       |callbackParams|对象|执行action所需的额外参数|无|是|
       
     **kwargs参数说明**
       kwargs中的参数定义内容设定及要求视model及执行方法而定.  
       参数名称定义参看ds.call_kw参数定义.  

     */
    var tkws = {args:[],kwargs:{},context:{},params:{}, flush:'replace'}
        Object.assign(tkws,kwargs);
        var {args,kwargs,context,params, flush} = tkws;
        var {appId, datasourceId} = callbackParams;
        var paramsMix = isfalse(context.params) ? {} : context.params;
        paramsMix = {...paramsMix,...params};
        var kws = {
            ...kwargs,
            context:  {...context,...Store.props.session.context,params:paramsMix}
        };
        var pa = {
            model: modelName,
            method: method,
            args: args,
            kwargs: kws
        };
        var tid = Math.round(Math.random()*Math.pow(10,9));
        var call_kw_param = {
            id: tid,
            jsonrpc: '2.0',
            method: 'call',
            csrf_token: Store.props.session.csrf_token,
            params:  {...pa}
        };
    var url = `/web/dataset/call_kw/${modelName}/${method}`;
    var dparam = {url: url,param: call_kw_param, flush: flush,callbackParams:callbackParams, datasourceId: datasourceId,appId: appId};
    if (typeof action == 'string'){
        Store.dispatch({type:'SyState/'+action, payload:dparam});
    } else {
        action(dparam)
    }
}

Store.search=function(modelName, fields=[], domain=[], action='modelSearch', kwargs={appId:'', datasourceId:'', context:{},params:{}, flush:'replace'} ){
        /*
           参数为odoo端所需的格式
           field: 返回的字段
           domain: 查找(过滤)条件
           context: 上下文参数
           action:获取数据后回调的处理动作，如果是action是字符类型交给systate处理，如果是方法则由该方法进行处理
           params: 查询其它参数
           flush:'append'/'replace',数据更新到state的方式；append，追加，将数据追加在原有数据后；replace，代替，代替原有的数据。
         */
        var  kws = {appId:'', datasourceId:'', context:{},params:{}, flush:'replace'};
        Object.assign(kws, kwargs);
    var {appId, datasourceId,context,params, flush} = kws;
    var st = Store.getAppDatasource(appId, datasourceId)
    var flds = st.fields;
    var ffields = [];
    fields.map(field => {
        if (!isfalse(flds[field])){
            ffields.push(field);
        }
    })
    
    var pa = {
        ...params,
        context: {...context,...Store.props.session.context},
        domain: isfalse(domain) ? []: [...domain],
        fields: ffields, //[...fields],
        model:modelName
    };
    var tid = Math.round(Math.random()*Math.pow(10,9));
    var search_param = {
        id: tid,
        jsonrpc: '2.0',
        method: 'call',
        params:  {...pa}
    };
    var url = '/web/dataset/search_read';
    var dparam = {url: url,param: search_param, flush: flush,datasourceId: datasourceId,appId:appId};
    if (typeof action == 'string'){
        Store.dispatch({type:'SyState/modelSearch', payload:dparam});
    } else {
        action(dparam)
    }
};

Store.action_load = function(params){
    /*
       加载应用action数据
       参数：
       params.action_id,需加载的action id
     */
    var tid = Math.round(Math.random()*Math.pow(10,9));
    var call_params = {
        id: tid,
        jsonrpc: '2.0',
        method: 'call',
        csrf_token: Store.props.session.csrf_token,
        params:  {action_id:params.action_id}
    };
    var dparam = {param: call_params, action:params}
    Store.dispatch({type:'SyState/loadApp', payload:dparam});
}    


Store.registryDatasource = function(appId, model, props={}){
    /*注册数据空间
       appId,应用id
       model,model名称
       props,其它一些属性，将合并在数据源属性中
       props.datasourceId,数据源名称，没指定时自动生成
       props.master,主表数据源id，表格这个数据空间从属于哪个数据空间，会用于表明数据源的从属关系，没指定时表示为主表
       props.relationField,关联字段名称
       props.relationType,关系方式，主表field.type
       props.fetchType,关联表获取数据方式
       关系数据源时需要指定数据联动方式joinType，主数据记录选定时才获取数据（单条,one）、同时并列获取（多条,many），可以在Field中指定相应属性，默认使用单条
       单条，只获取主表选定对应的资料，
       多条，同时获取对应主表每一次记录的资料
       props.defaultFields，返回数据默认指定的字段列表

     */
    var dsid  = isfalse(props.datasourceId) ? model.split('.').join('_') : props.datasourceId, ds;
    props.model = model;
    props.datasourceId = dsid;
    props.id = dsid;
    props.appId = appId;
    ds = Store.prototype._env.apps[appId].datasources[dsid];
    if (typeof ds == 'undefined') {
        Store.dispatch('registryDatasource', props)
        Store.getAppDatasource(appId,dsid).fields;
    }
    ds = Store.getAppDatasource(appId,dsid);
    ds.fields;
    return ds;
}

Store.cleanAppEnv = function(appId){
    //Store.prototype._fields_get_state是用于保存app下是否已经发出获取model字段请求的状态，应用关闭后用于清除Store.prototype._fields_get_state保存获取字段状态，否则打开同名的应用时一直处于创建状态
    var app = Store.prototype._env.apps[appId];
    var models = Object.keys(app.datasourceFields);
    models.map(model => {delete Store.prototype._fields_get_state[`${appId}_${model}`]});
}

Store.getAppDefaultDatasource = function(appId){
    //获取指定appId默认datasource
    var dsid = Store.prototype._env.apps[appId].app.datasourceId;
    return Store.getAppDatasource(appId,dsid);
};

Store.getAppDatasource = function(appId,datasourceId){
    var dsid = datasourceId.split('.').join('_')
    datasourceId = dsid;
    var dsVars = _apps[appId][datasourceId];
    if(!dsVars){
        dsVars  = {NewId:1};
        _apps[appId][datasourceId] = dsVars;
    }
    var ds = {props:Store.prototype._env.apps[appId].datasources[dsid]};
    var appProps = Store.prototype._env.apps[appId].app;
    Object.defineProperty(ds,'fields',{get:function(){
        var fields, app =Store.prototype._env.apps[appId]
        if (isfalse(app)){
            fields = false;
        } else {
            fields = app.datasourceFields[ds.props.model];
            fields = isfalse(fields) ? false : fields;
        }
        if (typeof Store.prototype._fields_get_state[`${appId}_${ds.props.model}`] == 'undefined' ){
            //对已发字段请求的model作标记，避免重复请求
            Store.prototype._fields_get_state[`${appId}_${ds.props.model}`] = 'trigged';
            ds.fields_get();
        }
        return fields;
    }});

    ds.dispatch = function(reducer, props){
        props.appId = appId;
        props.datasourceId = datasourceId;
        Store.dispatch(reducer, props);
    }

    ds.call_kw2 = function(method,args=[],kwargs={},context={},params={}, flush='replace',callback='',callbackParams={}){
        
        /*# call_kw 执行数据源对应的后端call_kw方法
           
           ## 参数
           
           |----|----|----|----|----|
           |参数|类型|说明|默认值|是否必须|
           |method|字符串|在model上执行的方法|无|是|
           |args|数组|执行method所需的列表式参数|[]|是|
           |kwargs|对象|执行method所需的对象参数|{}|是|
           |context对象|执行method所需的对象环境参数|{}|是|
           |params|对象| 查询其它参数，params和context最终会按后端要求参数格式合并到kwargs中|{}|是|
           |flush|字符串|'append'或'replace',数据更新到state的方式；append，追加，将数据追加在原有数据后；replace，代替v，代替原有的数据。|replace|是|
           |callback|字符串或方法|执行完call_kw获取数据后回调的处理动作，如果是callback是字符类型交给systate处理，如果是方法则由该方法进行处理|无|否|
           |callbackParams|对象|执行action所需的额外参数|无|否|
           ----
           注:callback由之前action变更而成,action定义为执行数据请求的动作,callback改为执行数据请后后执行的动作,出现关联问题时请留意
         */
        
        var cp = {...callbackParams, appId:appId, datasourceId:datasourceId}
        Store.call_kw2(ds.props.model, method, {args:args, kwargs:kwargs, context:context, params:params, flush:flush},callback, cp);
        
    }
    
    ds.call_kw = function(method,args=[],kwargs={},context={},params={}, flush='replace',action='call_kw',callbackParams={}){
        /*call_kw 执行数据源对应的后端call_kw方法
           
         **参数**
           
           |----|----|----|----|----|
           |参数|类型|说明|默认值|是否必须|
           |method|字符串|在model上执行的方法|无|是|
           |args|数组|执行method所需的列表式参数|[]|是|
           |kwargs|对象|执行method所需的对象参数|{}|是|
           |context对象|执行method所需的对象环境参数|{}|是|
           |params|对象| 查询其它参数，params和context最终会按后端要求参数格式合并到kwargs中|{}|是|
           |flush|字符串|'append'或'replace',数据更新到state的方式；append，追加，将数据追加在原有数据后；replace，代替，代替原有的数据。|replace|是|
           |callback|字符串或方法|执行完call_kw获取数据后回调的处理动作，如果是callback是字符类型交给systate处理，如果是方法则由该方法进行处理|无|否|
           |callbackParams|对象|执行action所需的额外参数|无|否|
           ----
           注:callback由之前action变更而成,action定义为执行数据请求的动作,callback改为执行数据请后后执行的动作,出现关联问题时请留意
         */
        var cp = {...callbackParams, appId:appId, datasourceId:datasourceId}
        Store.call_kw(ds.props.model, method, action, {args:args, kwargs:kwargs, context:context, params:params, flush:flush},cp);
    }

    ds.goto = function(goto){
        /* # 跳转到指定的记录

           ## 参数
           goto对象参数说明

           |---|---|---|---|---|
           |名称|类型|说明|默认值|是否必须|
           |id|int|跳转到的记录id|无|是|
           |index|int|跳转到的第记录id|无|是|

           > index未实现

         */
        Store.dispatch('gotoRow',{appId:appId, datasourceId:datasourceId,...goto});
    }

    ds.next = function(){
        Store.dispatch('modelNextRow',{appId:appId, datasourceId:datasourceId});
    }

    ds.prev = function(){
        Store.dispatch('modelPevRow',{appId:appId, datasourceId:datasourceId});
    }
    
    ds.cleanup = function(){
        Store.dispatch('cleanup',{appId:appId, datasourceId:datasourceId});
    }
    
    ds.fields_get = function(){
        ds.call_kw('fields_get',[],{},{},{},'replace','modelFieldsGet');
    }
    
    ds.read = function(keys,fields=[], kwargs={}, context={}, params={}, flush='replace', callback='', callbackParams={}){
        /*从后台读取指定id key的记录

           # 参数
           参数为后端call_kw函数所需的格式  

           |----|----|----|----|----|
           |参数|类型|说明|默认值|是否必须|
           |keys|array|记录id列表|无|是|
           |fields|array|返回的字段列表,默认为[],表示返回所有字段内容|[]|是|
           

         */
        if (callback!=''){
            ds.setState('fetching');
        }
        var args=[keys,isfalse(fields)? ds.fields : fields];
        //ds.call_kw('read',args,kwargs,context,params,flush);
        ds.call_kw2('read',args,kwargs,context,params,flush, callback, callbackParams);
    }

    ds.cancel = function(ids=[]){
        Store.dispatch('datasourceRollback', {appId:appId, datasourceId:datasourceId, ids:isfalse(ids)? []: ids});
    }
    
    ds.setState =function(state){
        Store.dispatch('updateDatasourceState',{appId:appId, datasourceId:datasourceId, state:state})
    }

    ds.setProps = function(name, value){
        /*#设置数据源属性值

           ##参数

           |---|---|---|---|---|
           |名称|类型|说明|默认值|是否必须|
           |name|字符串|数据源属性名称|否|是|
           |value|任意|数据源属性值|否|是|

         */
        Store.dispatch('updateDatasourceProps',{appId:appId, datasourceId:datasourceId, name: name, value: value})
    }

    ds.getChangeField = function(){
        /*# 获取响应onchage事件的字段清单
         */
        var fields = {...ds.fields};
        var keys = Object.keys(fields);
        var changefield = {};
        keys.map(key => {
            changefield[key] = fields[key].onchange? '1' :'';
        })
        return changefield;
    }
    
    ds.change  = function(ids, field, value, callback='', callbackParams={}){
        /*# 响应对应组件值发生改变事件

           ## 参数
           |---|---|---|---|---|
           |名称|类型|说明|默认值|是否必须|
           |ids|数组|变更的id|无|是|
           |field|字符串|变更的字段名称|无|是|
           |value|对象|发生变更的记录内容|无|是|
           |callback|方法|onchange返回结果后的处理方法|''|否|
           |callbackParams|对象|callback需要的额外参数|{}|否|

           当callback为''时,使用systate中的modelData方法进行统一处理返回结果,它会将返回结果更新到相应记录id的dirty中,让前端去更新相应的值.

           ----
           onchange事件使用分析
           . 新建时发送一个默认值内容到服务端  
           . 相应字段变化后再发送一次变更值内容到服务端  

           odoo原生js端args参数分析  
           . 第一个参数，发生变更的记录id  
           . 第二个参数，变更记录的变更后内容  
           . 第三个参数，变更的字段名称  
           . 第四个参数，带有onchange装饰器的字段  
           . 第五个参数， context内容，默认值及其它一些参数，根据不同环境会可能有不同的参数,(one2many字段中可能会有field_parent会指定这记录的父记录字段名称)
         */
        var changefields = ds.getChangeField();
        ds.call_kw2('onchange',[ids, value, field, changefields] , {}, {}, {}, 'reaplace', callback,callbackParams);
    }

    ds.search=function(fields=[], domain=[], context={},params={}, flush='replace' ){
        /*
           参数为odoo端所需的格式
           field: 返回的字段
           domain: 查找(过滤)条件
           context: 上下文参数
           params: 查询其它参数
           flush:'append'/'replace',数据更新到state的方式；append，追加，将数据追加在原有数据后；replace，代替，代替原有的数据。
         */
        var flds = ds.fields;
        var ffields = [];
        fields.map(field => {
            if (!isfalse(flds[field])){
                ffields.push(field);
            }
        })

        var pa = {
            ...params,
            context: {...context,...Store.props.session.context},
            domain: isfalse(domain) ? []: [...domain],
            fields: ffields, //[...fields],
            model:ds.props.model
        };
        if (isfalse(params.limit) && appProps.limit>0){
            pa.limit=appProps.limit;
        }
        var tid = Math.round(Math.random()*Math.pow(10,9));
        var search_param = {
            id: tid,
            jsonrpc: '2.0',
            method: 'call',
            params:  {...pa}
        };
        var url = '/web/dataset/search_read';
        var dparam = {url: url,param: search_param, flush: flush,datasourceId: datasourceId,appId:appId};
        Store.dispatch({type:'SyState/modelSearch', payload:dparam});
    };

    ds.search2=function(fields=[], domain=[], context={}, params={}, flush='replace', callback=null, callbackParams={}){
        /*
           参数为odoo端所需的格式
           field: 返回的字段
           domain: 查找(过滤)条件
           context: 上下文参数
           params: 查询其它参数
           flush:'append'/'replace',数据更新到state的方式；append，追加，将数据追加在原有数据后；replace，代替，代替原有的数据。
         */
        var flds = ds.fields;
        var ffields = [];
        fields.map(field => {
            if (!isfalse(flds[field])){
                ffields.push(field);
            }
        })

        var pa = {
            ...params,
            context: {...context,...Store.props.session.context},
            domain: isfalse(domain) ? []: [...domain],
            fields: ffields, //[...fields],
            model:ds.props.model
        };
        if (isfalse(params.limit) && appProps.limit>0){
            pa.limit=appProps.limit;
        }
        var tid = Math.round(Math.random()*Math.pow(10,9));
        var search_param = {
            id: tid,
            jsonrpc: '2.0',
            method: 'call',
            params:  {...pa}
        };
        var url = '/web/dataset/search_read';
        var dparam = {url: url,param: search_param, flush: flush,datasourceId: datasourceId,appId:appId, callback: callback, callbackParams: callbackParams};
        Store.dispatch({type:'SyState/modelSearch', payload:dparam});
    };

    
    ds.name_search = function(args=[],kwargs={},context={},params={}, flush='replace',callback='', callbackParams={}){
        /*按名称name字段查询名称列表
           kwargs.name属性为查询内容
           kwargs.operator为查询操作符
         */
        kwargs = {operator: 'ilike', name: '', ...kwargs}
        ds.call_kw2('name_search', args, kwargs, context, params, flush, callback, callbackParams);
    }

    ds.newId = function(){
        var nid = 'NEW'+dsVars.NewId;
        dsVars.NewId++;
        return nid;
    }
    
    ds.create = function(){
        /*# create 新建记录
           从后端获取相应的默认值作为记录的初始内容
           # 参数
           无
           ----
           调用create后创建新记录临时id,然后和服务端生成的默认值合并生成记录加到datasource中
           新建记录临时ID以"NEW"+数字组成
           
         */
        
        //ds.create = function(args=[],kwargs={},context={},params={}, flush='replace',action='call_kw'){
        /*# create 新建记录
           
         */
        ds.setState('edit');
        var nid = ds.newId();
        ds.setProps('currentId', nid);
        ds.call_kw('default_get',[appProps.fields] , {}, {}, {}, 'reaplace', 'call_kw',{id:nid});        
    }

    ds.saveCreate2 = function(id, callback='', callbackParams={}){
        /*#saveCreate 保存新增的记录

           # 参数

           |---|---|---|---|---|
           |名称|类型|说明|默认值|是否必须|
           |id|字符串|需要保存新建记录的id,没指定时保存所有新建记录|无|否|
           |callback|字符串或方法|指定处理操作的方法,字符串时由systate中的相应的方法处理,否则由指定的方法处理|'call_kw'|否|

           ----
           保存新建记录
           调用后端model create方法 
           //http://localhost:8069/web/dataset/call_kw/res.partner.title/create
           根据返回的id更新目前记录的id.
           
         */
        var dk,bidx,updater;
        if(id && ds.props.dirty[id]){
            if(ds.props.dirty[id].type=='new'){
                updater = {...ds.props.dirty[id].updater};
                //var dirty = {...ds.props.dirty[writeId].updater};
                var fields = ds.fields;
                Object.keys(updater).map(fn => {
                    //针对字段类型进行数据格式转换
                    if (fields[fn].type == 'many2one'){
                        if (['object', 'array'].indexOf(typeof updater[fn])>-1){
                            updater[fn] = updater[fn][0];
                        }
                    }
                });
                
                ds.call_kw2('create',[updater] , {}, {}, {}, 'reaplace', callback,{id:id});        //'call_kw'
            }
        } else if(!id)  {
            bidx = ds.props.rowsKeys.length-Object.keys(ds.props.dirty).length;
            for(bidx;bidx<ds.props.rowsKeys.length;bidx++){
                dk = ds.props.rowsKeys[bidx];
                if(ds.props.dirty[dk] && ds.props.dirty[dk].type=='new'){
                    ds.saveCreate2(dk,callback, callbackParams);
                }
            }
        }
    }

    ds.saveRemove2 = function(id, callback=null, callbackParams={}){
        /*#saveRemove 保存删除的记录
           
         */
        
        
    }


    ds.write2 = function(writeId,callback=null, callbackParams={}){
        if (!writeId){
            Object.keys(ds.props.dirty).map(did => {
                if(ds.props.dirty[did].type=='modi'){
                    ds.write2(did,callback, callbackParams);
                }
            });
        } else {
            var dirty = {...ds.props.dirty[writeId].updater};
            if(isfalse(dirty)){
                return
            }
            var fields = ds.fields;
            Object.keys(dirty).map(fn => {
                //针对字段类型进行数据格式转换
                if (fields[fn].type == 'many2one'){
                    if (['object', 'array'].indexOf(typeof dirty[fn])>-1){
                        dirty[fn] = dirty[fn][0];
                    }
                }
            });
            ds.call_kw2('write',[[parseInt(writeId)],dirty],{},{},{},'replace',callback,callbackParams);
        }
    }

    ds.write = function(writeId,callback='modelWrite'){
        /*# write 保存修改的记录

           # 参数 

           |---|---|---|---|---|
           |名称|类型|说明|默认值|是否必须|
           |writeId|数字|指定保存的记录id，没指定时会保存所有已变更的记录|无|否|
           |callback|字符串或方法|指定处理操作的方法,字符串时由systate中的相应的方法处理,否则由指定的方法处理|'modelWrite'|否|

           ----
           对datasource回写后端函数作独立包装，方便对数据格式进行转换控制
         */
        //BUG "客户资料"保存"街道"内容时没有写到服务端,其它字段内容正常写入  Mu 17-7-27
        if (!writeId){
            Object.keys(ds.props.dirty).map(did => {
                if(ds.props.dirty[did].type=='modi'){
                    ds.write(did,callback);
                }
            });
        } else {
            var dirty = {...ds.props.dirty[writeId].updater};
            if(isfalse(dirty)){
                return
            }
            var fields = ds.fields;
            Object.keys(dirty).map(fn => {
                //针对字段类型进行数据格式转换
                if (fields[fn].type == 'many2one'){
                    if (['object', 'array'].indexOf(typeof dirty[fn])>-1){
                        dirty[fn] = dirty[fn][0];
                    }
                }
            });
            ds.call_kw('write',[[writeId],dirty],{},{},{},'replace',callback);
        }
        
    }
    
    ds.unlink = function(ids,callback='', callbackParams={}){
        /*#unlink 删除指定id记录
           直接删除指定id记录.
           saveRemove是将dirty中标记删除的记录进行删除操作,即调用ds.remove操作.

           #参数

           |---|---|---|---|---|
           |名称|类型|说明|默认值|是否必须|
           |ids|数字数组|需要删除的记录id数组|无|是|
           |callback|字符串或方法|指定处理操作的方法,字符串时由systate中的相应的方法处理,否则由指定的方法处理|'call_kw'|否|
         */
        ds.call_kw2('unlink',[ids],{},{},{},'ignore',callback,callbackParams);
        
    };

    ds.remove = function(ids){  //ids :数组
        //从props中删除指定的记录
        ds.dispatch('modelRemove', {ids: ids});
    }
    ds.removeMultiple = function(start,number){
        /*
            start:开始的位置
            number:移除的数量
               调用ds.remove 的操作
            当只传入一个数字时,默认从0开始,往下删除
        */
        var newdeleteArray = []
        if(isfalse(number)){ 
            var   deleteArray = ds.props.rowsKeys.splice(1,start)
        }else{

            var deleteArray = ds.props.rowsKeys.splice(start,number);   
        }
        for(var i in deleteArray){
            if(isfalse(deleteArray[i])){
                newdeleteArray.push(deleteArray[i])
            }
        }
        ds.remove(newdeleteArray)  //调用remove来执行删除(本地记录的删除)
    }
    
    ds.save = function(callback='',callbackParams={}){
        /*#save 保存datasource所有变更内容

           #参数

           |---|---|---|---|---|
           |名称|类型|说明|默认值|是否必须|
           |callback|字符串或方法|指定处理操作的方法,字符串时由systate中的相应的方法处理,否则由指定的方法处理|'call_kw'|否|


           #返回
           处理结果列表,对应修改列表返回相应的处理结果

           ----
           按"修改"->"删除"->"新增"顺序保存已变更的内容.  
           执行结果放到列表中,当dirty为空时说明所有修改已保存完成.

         */
        var results = [];
        var dks = Object.keys(ds.props.dirty);
        var aftercall = function(result){
            results.push(result)
            if(results.length>=dks.length){
                callback(results)
            }
        }
        //保存修改的内容
        ds.write2(0, callback?aftercall:null, callbackParams);
        //保存删除的内容
        ds.saveRemove2(0, callback?aftercall:null, callbackParams)
        //保存新增的内容
        ds.saveCreate2(0, callback?aftercall:null, callbackParams)
    }
    
    ds.commit = function(modi){
        /*commit, 提交组件变更到对应的datasource
           
           # 参数
           具体参数包含在modi对象中,下表为对modi对象属性的说明.

           |----|----|----|----|----|
           |参数|类型|说明|默认值|是否必须|
           |type|字符|修改的类型,modi表示修改,new表示新增记录|无|是|
           |updater|对象|变更的内容对象|无|否|

           新增的时候使用models.datasource.defaultGet自动将dirty类型设为new.后面提交的变更将会保存原来的类型而不会变为指定的type.
         */
        Store.dispatch({type:'SyState/datasourceCommit',payload:{appId:appId ,datasourceId:datasourceId,modi:modi}});
    }
    
    return ds ;
}

//一个应用中所有model共用字段空间内容,fields_get返回字段内容保存在应用空间，而不是datasource空间
//每个model在应用空间都必须有字段列表
//获取关联model数据
//
Store.getValue = function(appId, datasourceId, rowId, fieldName, values){
    var vl = Store.prototype._env.apps, ds;
    if (typeof values != 'undefined'){
        ds = Store.getAppDatasource(appId,datasourceId);
    } else {
        for (var i = 0;i<arguments.length;i++){
            if (arguments[i] != undefined){
                vl = vl[arguments[i]];
                if (isfalse(vl)){
                    break
                }
            } else {
                break;
            }
        }
    }
    return vl;
}

export default Store;
