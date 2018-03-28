import {CallableObject,isfalse} from '../utils';
import store from './store';

/*
   本文件属于“思悦ERP项目”软件组成内容，相关权利属于深圳市莱克斯瑞智能家居有限公司所有，
   并受中华人民共和国和相关国际版权条约、法律、法规，以及其它知识产权法律和条约的保护。
   具体权利声明请看“版权声明”或http://www.siyue.it/copyright。

   copyright 深圳市莱克斯瑞智能家居有限公司 2017
 */

const models = function(){};
models.prototype._apps={};

models.call_kw = function(modelName,method,action='call_kw',kwargs = {appId:'', datasourceId:'',args:[],kwargs:{},context:{},params:{}, flush:'replace'}){
    /*
       参数为后端call_kw函数所需的格式
       method: odoo调用方法
       args: 列表式参数
       kwargs:字典式参数
       context: 上下文参数
       params: 查询其它参数，params和context最终会按后端要求参数格式合并到kwargs中
       flush:'append'/'replace',数据更新到state的方式；append，追加，将数据追加在原有数据后；replace，代替，代替原有的数据。
     */
    var tkws = {appId:'', datasourcId:'',args:[],kwargs:{},context:{},params:{}, flush:'replace'}
    Object.assign(tkws,kwargs);
    var {appId, datasourceId,args,kwargs,context,params, flush} = tkws;

    //modelName = isfalse(modelName)? store.apps[appId].app.model : modelName;
    var paramsMix = isfalse(context.params) ? {} : context.params;
    paramsMix = {...paramsMix,...params};
    var kws = {
        ...kwargs,
        context:  {...context,...store.session.context,params:paramsMix}
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
        csrf_token: store.session.csrf_token,
        params:  {...pa}
    };
    var url = `/web/dataset/call_kw/${modelName}/${method}`;
    var dparam = {url: url,param: call_kw_param, flush: flush,datasourceId: datasourceId,appId: appId};
    store.dispatch({type:'SyState/'+action, payload:dparam});
}

models.action_load = function(params){
    var tid = Math.round(Math.random()*Math.pow(10,9));
    var call_params = {
        id: tid,
        jsonrpc: '2.0',
        method: 'call',
        csrf_token: store.session.csrf_token,
        params:  {...params}
    };
    var dparam = {param: call_params}
    store.dispatch({type:'SyState/loadApp', payload:dparam});
    
}    

//绑定应用
models.bind = function(appProps){
    var appModels = {};
    if (isfalse(models.prototype._apps[appProps.appId])){
        models.prototype._apps[appProps.appId] = appModels;
        appModels._model={};
        appModels._app=appProps;

        
        appModels.getModel = function(modelName){
            //根据model_name获取相应的model对象
            modelName = modelName.replace('_','.');
            var mn = modelName.replace('.','_');
            return appModels._model[mn];
        };

        //在models应用空间中注册一个modle
        appModels.registry=function(modelName, datasourceId=''){
            /*
	       注册model
	       参数：
	       model_name: 对应odoo model名称
	       datasource: 数据源名称，区分相同model在不同组件中的数据。

             */
            modelName = modelName.replace('_','.');
            const alias = modelName.replace('.','_');
            datasourceId = datasourceId == '' ? alias : datasourceId.replace('.','_');
            if (appModels._model[alias] != undefined){
	        //已存在同名的model不能再注册
                throw(`model ${modelName} has registryed`);
                return;
            }

            const _datasource = CallableObject(
                function(method,args=[],kwargs={},context={},params={}, flush='replace',action='call_kw'){
                    /*
                       参数为后端call_kw函数所需的格式
                       method: odoo调用方法
                       args: 列表式参数
                       kwargs:字典式参数
                       context: 上下文参数
                       params: 查询其它参数，params和context最终会按后端要求参数格式合并到kwargs中
                       flush:'append'/'replace',数据更新到state的方式；append，追加，将数据追加在原有数据后；replace，代替，代替原有的数据。
                     */
                    var paramsMix = isfalse(context.params) ? {} : context.params;
                    paramsMix = {...paramsMix,...params};
                    var kws = {
                        ...kwargs,
                        context:  {...context,...store.session.context,params:paramsMix}
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
                        csrf_token: store.session.csrf_token,
                        params:  {...pa}
                    };
                    var url = `/web/dataset/call_kw/${modelName}/${method}`;
                    var dparam = {url: url,param: call_kw_param, flush: flush,datasourceId: datasourceId,appId: appProps.appId};
                    store.dispatch({type:'SyState/'+action, payload:dparam});
                }
            );
            _datasource.getFields = function(){
                _datasource('fields_get',[],{},{},{},'replace','modelFieldsGet');
            };

            //model_search
            _datasource.search=function(fields=[], domain=[], context={},params={}, flush='replace' ){
                /*
                   参数为odoo端所需的格式
                   field: 返回的字段
                   domain: 查找(过滤)条件
                   context: 上下文参数
                   params: 查询其它参数
                   flush:'append'/'replace',数据更新到state的方式；append，追加，将数据追加在原有数据后；replace，代替，代替原有的数据。
                 */
                
                var pa = {
                    ...params,
                    context: {...context,...store.session.context},
                    domain: [...domain],
                    fields: [...fields],
                    model:modelName
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
                var dparam = {url: url,param: search_param, flush: flush,datasourceId: datasourceId,appId: appProps.appId};
                store.dispatch({type:'SyState/modelSearch', payload:dparam});

            };
            store.dispatch({type:'SyState/registryModel',payload:{appId:appProps.appId ,datasourceId:alias,model: modelName}});
            _datasource.commit = function(modi){
                store.dispatch({type:'SyState/modelCommit',payload:{appId:appProps.appId ,datasourceId:alias,modi:modi}});
            }
            appModels._model[alias] = _datasource;

            Object.defineProperty(appModels, alias, { get: function () { return _datasource; } });
            _datasource.getFields();
        };
        appModels.registry(appProps.res_model);
        Object.defineProperty(models,appProps.appId,{get:function(){    return models.prototype._apps[appProps.appId];   }});

    } else {
        appModels = models.prototype._apps[appProps.appId];
    }
    return appModels;
};

//store.models = models;
export default models;
