import {widgets,registryWidget} from './_widgets';
import {store,triggers,apps} from '../midware';
import {Modal, Spin} from 'antd';
import {isfalse,_globals} from '../utils';
import './AppRoot.css'
import PropTypes from 'prop-types';
// const PropTypes = React.PropTypes;
const Component = React.Component;

var ModalAppType = {'new':'新增', search:'查询', view:'查看', modi:'编辑'}

var ModalApp = ({props,pane,binds={}}) => {
    /*# ModalApp 打开应用内对话框(子应用)  
       在页签应用内打开相应的对话框.
       在同一页签应用中打开多个对话框,只会显示最新一个,当前着当前的对话框后会依次显示其父级对话框.  
       通过应用事件绑定实现对话框应用结果的返回处理.  
       事件的绑定可以通过3种方式实现.  
       1.通过ModalApp组件binds属性传入事件绑定内容
       2.通过apps.bind方法绑定事件
       3.使用apps.createApp创建应用并传binds属性绑定事件
       4.通过Action组件传入binds属性传入事件绑定内容(已验证)  
       > 通过Action绑定事件可以参照InputOption组件中"创建并编辑"选项的实现.  

       ## 打开对话框数据编辑类型
       编辑类型有“新建new”、“搜索search”、“查看browse”、“修改modi”等方式.  
       它是通过app属性中的action.type来指定.  
       action.type决定对话框的处理方式.  


       ## 参数

       |---|---|---|---|---|
       |名称|类型|说明|默认值|是否必须|
       |props|对象|pane组件所需的参数,为app属性,具体内容看systate.openApp方法说明|无|是|
       |pane|组件|在需要对话框创建的组件|无|是|
       |binds|对象|绑定的事件,见下表|{}|否|

     **props.action**
       ModalApp组件通过props.action对象传递必要参数  


       |---|---|---|---|---|
       |名称|类型|说明|默认值|是否必须|
       |type|string|应用编辑类型|否|是|
       |recId|int/object|记录id或记录内容对象|否|是|


       type编辑类型定义:“新建new”、“搜索search”、“查看browse”、“修改modi”

       ## binds绑定事件
       
       |----|----|
       |事件|说明|
       |onClose|关闭对话框时触发,回调函数不带数据|
       |onOk|点"确认"按键时触发,并将当前修改的数据传给事件回调|
       
       ----
       ModalApp使用流程:  

       1.容器定义及创建容器  

       由于antd库Modal组件限制,ModalApp每个页签应用必须有一个固定容器来放置,在AppContiner组件中可以查看到相关代码.  
       当需要显示对话框时先将组件加载到Modal中,然后再显示Modal.  

       在AppContainer组件定义ModalApp容器   
       ` <TabPan {...this.props} ><Spin spinning={app.app.state!='ready'} ><AppComponent  app={app} props={{props:{props:{...ds.props.currentRow}, datasourceId:ds.props.id, appId:app.app.appId}}}  /><ModalApp props={opt} pane={SApp}/></Spin></TabPan> `

       2. 事件绑定  
       以InputOption为例  
       ` <Action type='view' pane="创建并编辑..."  rootAppId={props.appId} props={{model:ds.props.model,view:'form',target:'new',parentField:props.field,type:'new'}} binds={{ onOk:onCreate, onClose:onCreateCancel}} />`
       是通过Action组件传递binds到app.createApp进行绑定  
       Action组件中的createApp使用  
       ` apps.createApp(type, rootAppId, props, binds)`

       3. 加载实现显示组件
       当传入props参数满足后ModalApp会加载指定的组时并进行显示  
       即应用加载状态为ready及已加载了相应字段信息后开始显示相应组件  
       可看代码中visible和sfields使用  
       
       4. 数据回调
       绑定事件及通过显示的组件完成操作后,可以点击"取消"或"确认"按键.  
       "取消"按键使用ModalApp的onCancel方法进行处理,它调用apps中的close直接关掉应用.  
       "确认"按键调用ModalApp中的onOk方法进行处理.  如果是新增的话会先调用保存`sapp.save`新增的数据,然后再将保存结果返回再执行`sapp.close({modal:'ok',data:result});`,将保存结果交给close方法进行处理.

       5. app事件处理  
       在apps库中,Apps.getApp中的close方法是用来应用处理关闭操作.  
       传给close的数据会再次打包.  
       `var evt = {appId:appId,data:data};`  
       然后根据传进来的参数(modal)判断关闭事件

       ```javascript

       //关闭应用
       if(data && data.modal=='ok'){
       //触发onOk事件
       _apps[appId].events.onOk && _apps[appId].events.onOk.map(closeBind => {
       evt.type = 'onOk';
       closeBind(evt)
       });
       } else {
       
       //触发onClose事件
       _apps[appId].events.onClose && _apps[appId].events.onClose.map(closeBind => {
       evt.type = 'onClose';
       closeBind(evt)
       });
       }
       
       ```
       会对每一个符合条件的绑定函数进行一次调用并传速重新打包的事件数据

       6. 事件回调函数
       回到InputOption组件中,上面将onCreate函数绑定到onOk事件上`binds={{ onOk:onCreate, onClose:onCreateCancel}}`  

       ```javascript

       var onCreate = function(evt){
       var data = evt.data.data[0];
       var nid = data.result;
       var row = data.param.params.args[0];
       row.id = nid;
       var ostate = {...self.state}
       ostate.value = [row.id,row.name];
       ostate.appends.push([...ostate.value])
       self.setState(ostate);
       }
       ```
       onCreate函数需要处理传速进来的数据evt,由于app.close接收的数据不统一,close方法不对数据进行解释,而是由绑定的回调函数自己处理返回的数据.  

       7. ModalApp的销毁  
       在循环调用关联关子应用的close后,最后调用`store.dispatch('closeApp', {appId:appId});`在state中清除ModalApp相关数据后即可销毁并关闭ModalApp.
       
     */

    let _ref;
    var Pane = pane;
    var action = props.action, type;
    var field = {}, title='',sfields={};
    var visible = props.state=='ready';
    var isloading = true;
    var rapp,sapp, sds; //,sapp=props;
    if (props.appId){
        sapp = apps.getApp(props.appId);
       
        if (sapp.vars.tempAppId){
            apps.removeTempAppId(sapp.vars.tempAppId);
            delete sapp.vars.tempAppId
        }
        title = ModalAppType[props.action.type];
        title = title ? title+' : '+ props.action.parentField.string: '';
        if (props.datasourceId){
            sds = sapp.defaultDatasource;
            sfields = sapp.defaultDatasource.fields;
        }
        if (sapp.props.state=='creating' && !isfalse(sfields)&&sfields!='loading'){
            //根据打开类型是否加载数据
            //转换为loading
            if (sapp.props.action.type=='new'){
                sapp.setState('ready');
                sapp.create();
                
            }else if (sapp.props.action.type=='modi'){
                sapp.setState('loading');
                var rid = sapp.props.action.recId;
                if (rid.id!=undefined){
                    //传入需要修改的记录内容
                    sapp.defaultDatasource.read([0],[],{},{},{},'replace',(payload) => {
                        payload.result = [rid];
                        store.dispatch('modelData', payload)
                    },{});
                    sapp.defaultDatasource.setProps('currentId', rid.id);
                    sapp.defaultDatasource.setProps('currentRows', rid);
                    sapp.defaultDatasource.setProps('state', 'ready');
                    
                } else {
                    //传入需要修改的记录id
                    var rec = 0;
                    try{
                        rec = parseInt(sapp.props.action.recId);
                    } catch(e){
                    }
                    if (rec){
                        sapp.defaultDatasource.read([rec]);
                    }
                }
            }
            else {
                sapp.setState('loading');
                sapp.defaultDatasource.search(sapp.props.fields, sapp.props.domain);
            }
        } else if (sapp.props.state=='ready'){
            //当子应用就绪后,根据页签应用的编辑状态设置自身编辑状态
            rapp = apps.getApp(props.action.rootAppId);
            if (sapp.props.editState != rapp.props.editState){
                sapp.setEditState(rapp.props.editState);
            }
        }
        isloading = sapp.props.state!='ready' ;
    }
    var onCancel = function(){
        sapp.close();
    }
    var createData = function(){
    }
    var onOk = function(){
        /*响应OK事件
           one2many字段的子应用不直接保存记录
         */
        var afterok = function(result){
            sapp.close({modal:'ok',data:result});
        }
        var r, i;
        
        if (['new','modi'].indexOf(sapp.props.action.type)!=-1){
            if (props.action.parentField.type=='one2many'){ //当字段类型为one2many时,返回updata和id
                i = sapp.defaultDatasource.props.currentId;
                if(isfalse(sapp.defaultDatasource.props.dirty[i])){ 
                    //在未进行修改或者内容的添加(dirty里面没有内容时直接关闭弹出框)
                    
                    sapp.close();
                }else{
                    r = {...sapp.defaultDatasource.props.dirty[i].updater};
                    sapp.close({modal:'ok', data: r});
                }
            } else {
                //保存之后执行的函数并么有得到执行
                sapp.save(afterok);
            }
        } else if (sapp.props.action.type=='search'){
            r = {...sapp.defaultDatasource.props.currentRow};
            sapp.close({modal:'ok',data:r}); 
        } else {
            sapp.close();
        }
    
    }

    return (
        <div key={'modalwrap_'+props.appId}>
        <div className="appmark subappmount"  key={'modal_mount_'+props.appId} ref={e => (_ref = e)}></div>
        <Modal  width="80%" key={'modal'+props.appId} maskClosable={false} title={title} visible={visible} onCancel={onCancel} onOk={onOk} getContainer={()=>_ref}><Spin spinning={isloading}>
        {isfalse(sfields)? null :<Pane  key={props.appId}  app={sapp.props} props={{props:{ props:{...sds.props.currentRow},datasourceId:props.datasourceId, appId:props.appId}}}/>}
        </Spin>
        </Modal>
        </div>
    )
}

ModalApp.propTypes = {
    props:  PropTypes.object,
    pane:  PropTypes.any,
    binds:  PropTypes.objecy,
};

registryWidget(ModalApp);
export default ModalApp;

