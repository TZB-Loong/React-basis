
/*
   本文件属于“思悦ERP项目”软件组成内容，相关权利属于深圳市莱克斯瑞智能家居有限公司所有，
   并受中华人民共和国和相关国际版权条约、法律、法规，以及其它知识产权法律和条约的保护。
   具体权利声明请看“版权声明”或http://www.siyue.it/copyright。

   copyright 深圳市莱克斯瑞智能家居有限公司 2017
 */

import {isfalse} from '../utils';


export default {
    reducers:{
        gotoRow:function(state, action){
            /*# 跳转到指定的记录
               目前只能跳到已加载的记录

               ##参数

               action.payload为参数对象

               |---|---|---|---|---|
               |名称|类型|说明|默认值|是否必须|
               |appId|int|指定的app id|无|是|
               |datasourceId|int|指定的datasource id|无|是|
               |id|int|跳转到的记录id|无|是|
               |index|int|跳转到的第记录id|无|是|

               > index未实现
               
             */
            var ostate = {...state};
            var ds = ostate.apps[action.payload.appId].datasources[action.payload.datasourceId];
            if (ds.totalLength>0){
                var i =  action.payload.id;
                var pid = ds.currentId;
                var nr = ds.rows[i];
                if (! isfalse(nr)) {
                    ds.currentIndex = ds.rowsKeys.indexOf(i);
                    ds.currentId = i;
                    ds.currentRow = nr;
                }
                ds.prevSelectId = pid;
            }
            return ostate;
        },
        modelNextRow:function(state,action){
            var ostate = {...state};
            var ds = ostate.apps[action.payload.appId].datasources[action.payload.datasourceId];
            var i =  ds.currentIndex+1;
            var pid = ds.currentId;
            if (! isfalse(ds.rowsKeys[i])) {
                var nr = ds.rows[ds.rowsKeys[i]];
                ds.currentIndex = i;
                ds.currentId = nr.id;
                ds.currentRow = nr;
            }
            ds.prevSelectId = pid;
            return ostate;
        },

        modelPrevRow:function(state,action){
            var ostate = {...state};
            var ds = ostate.apps[action.payload.appId].datasources[action.payload.datasourceId];
            var i =  ds.currentIndex-1;
            var pid = ds.currentId;
            if (! isfalse(ds.rowsKeys[i])) {
                var nr = ds.rows[ds.rowsKeys[i]];
                ds.currentIndex = i;
                ds.currentId = nr.id;
                ds.currentRow = nr;
            }
            ds.prevSelectId = pid;
            return ostate;
        },
        modelEdit:function(state,action){
            var ostate = {...state};
            var ds = ostate.apps[action.payload.appId].datasources[action.payload.datasourceId];
            ostate.apps[action.payload.appId].app.editState = 'edit';
            ds.state = 'edit';
            return ostate;
        },
        modelSaving:function(state,action){
            var ostate = {...state};
            var ds = ostate.apps[action.payload.appId].datasources[action.payload.datasourceId];
            ds.state = 'saving';
            return ostate;
        },
        modelRollback:function(state,action){
            /*# 取消未保存到服务端的修改
               
               ## 参数
               action.payload为参数对象,定义如下:  

               |---|---|---|---|---|
               |名称|类型|说明|默认值|是否必须|
               |appId|int|指定的app id|无|是|
               |datasourceId|int|指定的datasource id|无|是|

             */
            var ostate = {...state};
            var ds = ostate.apps[action.payload.appId].datasources[action.payload.datasourceId];
            ostate.apps[action.payload.appId].app.editState = 'browse';
            ds.state = 'browse';
            Object.keys(ds.dirty).map(key => {
                //还原ds.rows内容
                if(typeof key=='string'){
                    delete ds.rows[key];
                } else {
                    ds.rows[key] = ds.dirty[key].raw;
                }
            });
            
            if (ds.rowCount==0){
                //取消新增的第一条记录
                var cid = ds.rowsKeys.indexOf(ds.currentId);
                ds.rowsKeys.splice(cid,1);
                ds.currentId = -1;
                ds.currentRow = {}
            } else {
                if (ds.prevSelectId!=-1 && typeof ds.currentId=='string'){
                    //新增记录
                    ds.currentRow = ds.rows[ds.prevSelectId];
                    ds.currentId = ds.prevSelectId;
                    ds.currentIndex = ds.rowsKeys.indexOf(ds.currentId);
                }
                else {
                    //修改记录
                    if (ds.dirty[ds.currentId]){
                        ds.currentRow = ds.dirty[ds.currentId].raw;
                    }
                }
            }
            
            ds.dirty={};
            return ostate;
        },
    }
}

