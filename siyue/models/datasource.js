import {syimport, actionLoad, login, userInfo, logout,init,call_kw,modelSearch } from '../midware/backend';
import {isfalse} from '../utils';
import {apps}  from '../midware';

var defaultDatasourceProps = () => { return {

    id: -1,
    appId:-1,
    model: '',
    domain:[],
    fields:{},
    defaultFields: {},
    rows:{},
    rowsKeys:[],
    rowCount:0,
    totalLength:0,
    currentIndex:-1,
    currentId:-1,
    prevSelectId: -1,
    currentRow:{},
    dirty:{},
    state:'creating',
    pageRange:[],
    rowsPerPage:-1,
    dataCache:0  //ssearch时请求的次数

}};


export default {
    defaultDatasourceProps:defaultDatasourceProps,
    reducers: {
        cleanup:function(state, action){
            var ostate = {...state};
            var ds = ostate.apps[action.payload.appId].datasources[action.payload.datasourceId];
            var defaultprops = defaultDatasourceProps();
            ostate.apps[action.payload.appId].datasources[action.payload.datasourceId] = {
                ...defaultprops,
                id:action.payload.datasourceId,
                appId:action.payload.appId,
                datasourceId: ds.datasourceId,
                master: ds.master,
                relationField: ds.relationField,
                relationType: ds.relationType,
                model:ds.model,
                defaultFields:ds.defaultFields,
                rowsPerPage:ds.rowsPerPage,
                state:'ready'};
            return ostate;
        },
        
        registryDatasource:function(state,action){
            /*
               注册app数据源空间
               state:数据源状态
               browse,浏览状态
               edit,修改状态

             */
            var ostate = {...state};
            var ds = ostate.apps[action.payload.appId].datasources;
            var dss =ds[action.payload.datasourceId];
            var tst = typeof dss == 'undefined' ? 'creating' : dss.state;
            var defaultprops = defaultDatasourceProps();
            ds[action.payload.datasourceId] ={
                ...defaultprops,
                dirty:{},
                id:action.payload.datasourceId,
                appId:action.payload.appId,
                model:action.payload.model,
                state:tst,
                rowsPerPage:ostate.apps[action.payload.appId].app.limit,
                ...action.payload
            };
            return ostate;
        },
        updateDatasourceState (state, action){
            var ostate = {...state};
            ostate.apps[action.payload.appId].datasources[action.payload.datasourceId].state=action.payload.state;
            return ostate;
        },
        updateDatasourceProps (state, action){
            /*# 更新数据源

               ## 参数
               使用action.payload对象传递参数
               
               |----|----|----|----|----|
               |参数|类型|说明|默认值|是否必须|
               |appId|int|应用id|否|是|
               |datasourceId|int|应用中数据源id|否|是|
               |name|string|需要更新数据源属性名称|否|是|
               |value|任意|更新的数据|否|是|
               
             */
            var ostate = {...state};
            ostate.apps[action.payload.appId].datasources[action.payload.datasourceId][action.payload.name]=action.payload.value;
            return ostate;
        },
        updateFieldsGetState (state, action){
            var ostate = {...state};
            ostate.apps[action.payload.appId].datasourceFields[action.payload.param.params.model]=action.payload.result;
            return ostate;
        },
        datasourceFieldsGet (state, action){
            var ostate = {...state};
            ostate.apps[action.payload.appId].datasourceFields[action.payload.param.params.model]=action.payload.result;
            return ostate;
        },
        datasourceRollback(state, action){
            /*datasourceRollback, 回滚未提交到后端的修改

               ##参数

               使用action.payload对象传递参数
               
               |----|----|----|----|----|
               |参数|类型|说明|默认值|是否必须|
               |appId|int|应用id|否|是|
               |datasourceId|int|应用中数据源id|否|是|
               |ids|array|回滚指定的id,没指定时全部回滚|[]|是|

             */
            var ostate = {...state};
            var ds = ostate.apps[action.payload.appId].datasources[action.payload.datasourceId];
            var ids, c;
            if (isfalse(action.payload.ids)){
                ids = Object.keys(ds.dirty);
            } else {
                ids = action.payload.ids;
            }
            ids.map(id => {
                //判断id是否为数字
                c = id.toString().charCodeAt(0);
                if (c>=48 && c<=57){
                    //数字id,修改记录
                    if (!isfalse(ds.dirty[id])){
                        ds.rows[id] = ds.dirty[id].raw;
                        delete ds.dirty[id];
                    }
                } else {
                    //非数据id,新增记录
                    delete ds.dirty[id];
                    delete ds.rows[id];
                    ds.rowsKeys.splice(ds.rowsKeys.indexOf(id),1);
                }
            });
            //切换到最后一次选择的记录
            if (ds.currentId==undefined){
                ds.currentId = -1;
                ds.currentRow = [];
            } else {
                c = ds.currentId.toString().charCodeAt(0);
                if (c<48 || c>57){
                    if (ds.rowsKeys.indexOf(ds.prevSelectId)==-1){
                        ds.currentId = ds.rowsKeys[0];
                        ds.prevSelectId = ds.rowsKeys[0];
                    } else {
                        ds.currentId = ds.prevSelectId;
                    }
                }
                ds.currentRow = ds.rows[ds.currentId];
            }
            return ostate;
        },

        datasourceClearDirty(state, action){
            
            var ostate = {...state};
            var ds = ostate.apps[action.payload.appId].datasources[action.payload.datasourceId];
            ds.dirty = {};
            return ostate;
        },
        
        datasourceCommit(state, action){
            /*datasourceCommit, 提交组件变更到对应的datasource
               具体定义查看store.commit方法说明
             */
            var ostate = {...state};
            var ds = ostate.apps[action.payload.appId].datasources[action.payload.datasourceId];
            if(ds.currentId == -1&& action.payload.modi.type!='new'){
                return ostate;
            }
            if (isfalse(action.payload.modi.updater)){
                return ostate;
            }
            if (action.payload.modi.type=='new'){
                ds.currentId = action.payload.modi.updater.id;
            }
            var drt = ds.dirty[ds.currentId];
            if (isfalse(drt)){
                drt = {
	            type:action.payload.modi.type,
	            updater:{},
	            raw:{...ds.currentRow}
	        };
            }
            drt.updater={...drt.updater,...action.payload.modi.updater};
            Object.keys(action.payload.modi.updater).map(key => {
                
                if (drt.updater[key] == drt.raw[key] || (typeof drt.updater[key]=='undefined')){
                    delete drt.updater[key];
                }
            })
            
            
            ds.dirty[ds.currentId] = drt;
            
            ds.currentRow= {...drt.raw,...drt.updater};
            ds.rows[ds.currentId] = {...ds.rows[ds.currentId], ...ds.currentRow};
            if (ds.rowsKeys.indexOf(ds.currentId)==-1){
                ds.rowsKeys.push(ds.currentId);
            }
            return ostate;
        },
        datasourceCreate(state,action){
            /*# modelCreate 处理创建记录保存结果
               保存新记录时必须指定保存的临时id内容,action.payload.callbackParams.id
             */

            var ostate = {...state};
            var tid = action.payload.callbackParams.id;
            var nid = action.payload.result;

            if(isfalse(ostate.apps[action.payload.appId])){  //当应用已经被关闭时,返回原来的state,不做修改
                return ostate;
            }else{
                var ds = ostate.apps[action.payload.appId].datasources[action.payload.datasourceId];
                var _app = apps.getApp(action.payload.appId)
                if (parseInt(nid)>0){
                    ds.rowsKeys.splice(ds.rowsKeys.indexOf(tid),1,nid);
                    ds.rows[nid] = {...ds.dirty[tid].updater,id:nid}
                    ds.currentIndex = ds.rowsKeys.indexOf(nid);
                    ds.currentRow = ds.rows[nid];
                    ds.currentId=nid;
                    delete ds.rows[tid];
                    delete ds.dirty[tid];
                } else {
                    //返回错误结果
                }
                ds.state = 'ready';
                if (Object.keys(ds.dirty).length == 0){
                    //保存成功后，当dirty没有未保存数据时，将应用状态变为查看状态
                    ostate.apps[action.payload.appId].app.editState='browse';
                }
                setTimeout(function(){
                    _app.onAfterSave(action.payload)
                }, 1);
                return ostate;
            }
        },
        
        defaultGet(state,action){
            var ostate = {...state};
            var id = action.payload.callbackParams.id, pid;
            var nrow = {...action.payload.result,id:id};
            var ds = ostate.apps[action.payload.appId].datasources[action.payload.datasourceId];
            pid = isfalse(ds.currentRow)? -1: ds.currentRow.id;
            ds.rows[id]=nrow;
            ds.currentId=id;
            if (ds.rowsKeys.indexOf(id)==-1){
                ds.rowsKeys.push(id);
            }
            ds.currentIndex = ds.rowsKeys.indexOf(id);
            ds.currentRow = nrow;
            ds.dirty[id] = {type:'new',raw:nrow,updater:nrow};
            ds.state='ready';
            ds.prevSelectId = pid;
            return ostate;
        }
    },
    
    effects: {
        *modelFieldsGet ({payload} ,{ call, put}) {
            yield put({type:'updateFieldsGetState', payload:{...payload,result:'loading'}});
            const rp = yield call(call_kw, payload);
            if (rp.success){
	        payload.result = rp.data.result;
	        yield put({type:'datasourceFieldsGet', payload:{...payload}});
            } else {
	        //待处理：错误处理
            }
        },
        *modelSearch ({payload}, {call, put}) {
            const rp = yield call(modelSearch, payload);
            if (rp.success){
                if (isfalse(rp.data.error)){
                    payload.result = rp.data.result
                    if (typeof payload.callback == 'function'){
                        payload.callback(payload);
                    } else {
                        yield put({type:'modelData', payload:payload});
                    }
                } else {
                    payload.result = null;
                    payload.error = rp.data.error;
                    yield put({type:'updateDatasourceState', payload:{appId:payload.appId, datasourceId:payload.datasourceId, state:'ready'}});
                    yield put({type:'errorTips',payload:{type:'error', message:rp.data.error.data.message, target:payload.appId}});
                }
                
            } else {
	        //待处理：错误处理
                
            }
        },
        *modelWrite ({payload}, {call, put}) {
            //保存数据到服务器
            //yield put({type:'modelSaving', payload:payload});
            const rp = yield call(call_kw, payload);
            if (rp.success){
                payload.result = rp.data.result;
                yield put({type:'modelData', payload:payload});
            } else {
	        //待处理：错误处理
            }
        }
    }
}
