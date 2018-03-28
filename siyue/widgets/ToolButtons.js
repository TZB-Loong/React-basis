import {isfalse} from '../utils';
import {registryToolButton} from './_widgets';

var ButtonStates = ['normal', 'disabled', 'hidden'];

var checkStateChain = function(){
    /*
       检查并决定按键状态
       检查arguments列表中各个值，返回第一个存在ButtonStates的的值
     */
    var chn;
    for(var i = 0;i<arguments.length;i++){
        chn = arguments[i];
        if (typeof chn == 'function'){
            chn = chn();
        }
        if (ButtonStates.indexOf(chn)>-1){
            return chn
        }
    }
    return 'hidden';
}

  //根据注册的toolbutton生成工具栏
registryToolButton({
  component:'ToolButton',
  name:'First',
  icon:'verticle-right',
  title:'首行',
  showTitle:false,
  tooltip:'定位到第一条记录',
  group:'Navi',
  sequence:1,
  trigger:'First',
  state:'normal',
  update:function(session,app,datasource){
      /*
         根据session.state、app.type及datasource.props.state三者的状态决定toolbutton的最新状态
       */
      return checkStateChain(
          datasource.props==undefined ?  'disabled' : '',
          datasource.props.currentId == -1 ? 'disabled' : '',
          datasource.props.rowCount == 0 ? 'disabled' : '',
          app.app.editState == 'edit' ? 'disabled' : '',
          datasource.props.state == 'fetching' ? 'disabled' : '', 
          datasource.props.currentIndex == 0 && datasource.props.pageRange[0] == 0 ? 'disabled' : 'normal',
      );
  }
});


registryToolButton({
    component:'ToolButton',
    name:'Prev',
    icon:'left',
    title:'前一条',
    showTitle:false,
    tooltip:'定位到前一条记录',
    group:'Navi',
    sequence:2,
    trigger:'Prev',
    state:'normal',
    update:function(session,app,datasource){
        /*
           根据session.state、app.type及datasource.props.state三者的状态决定toolbutton的最新状态
         */
        return checkStateChain(
            datasource.props.currentId == -1 ? 'disabled' : '',
            datasource.props.rowCount == 0 ? 'disabled' : '',
            app.app.editState == 'edit' ? 'disabled' : '',
            datasource.props.state == 'fetching' ? 'disabled' : '', 
            datasource.props.currentIndex == 0 && datasource.props.pageRange[0] == 0 ? 'disabled' : 'normal',
        );
    }
});

registryToolButton({
    component:'ToolButton',
    name:'Next',
    icon:'right',
    title:'下一条',
    showTitle:false,
    tooltip:'定位到下一条记录',
    group:'Navi',
    sequence:3,
    trigger:'Next',
    state:'normal',
    update:function(session,app,datasource){
        /*
           根据session.state、app.type及datasource.props.state三者的状态决定toolbutton的最新状态
         */
        var total_page_number = Math.round(datasource.props.totalLength / datasource.props.rowsPerPage + 0.5);
        var current_page_number = datasource.props.pageRange[datasource.props.pageRange.length -1]
        
        return checkStateChain(
            datasource.props.currentId == -1 ? 'disabled' : '',
            datasource.props.rowCount == 0 ? 'disabled' : '',
            app.app.editState == 'edit' ? 'disabled' : '',
            datasource.props.state == 'fetching' ? 'disabled' : '', 
            datasource.props.currentIndex == datasource.props.rowsKeys.length-1 && current_page_number == total_page_number-1 ? 'disabled' : 'normal',
        );
        
    }

});


registryToolButton({
    component:'ToolButton',
    name:'Last',
    icon:'verticle-left',
    title:'末条',
    showTitle:false,
    tooltip:'定位到最后一条记录',
    group:'Navi',
    sequence:4,
    trigger:'Last',
    state:'normal',
    update:function(session,app,datasource){
        /*
           根据session.state、app.type及datasource.props.state三者的状态决定toolbutton的最新状态
         */
        var total_page_number = Math.round(datasource.props.totalLength / datasource.props.rowsPerPage + 0.5);
        var current_page_number = datasource.props.pageRange[datasource.props.pageRange.length -1]
        
        return checkStateChain(
            datasource.props.currentId == -1 ? 'disabled' : '',
            datasource.props.rowCount == 0 ? 'disabled' : '',
            app.app.editState == 'edit' ? 'disabled' : '',
            datasource.props.state == 'fetching' ? 'disabled' : '', 
            datasource.props.currentIndex == datasource.props.rowsKeys.length-1 && current_page_number == total_page_number-1 ? 'disabled' : 'normal',
        );
        
    }
});

registryToolButton({
    component:'ToolButton',
    name:'New',
    icon:'file',
    title:'新增',
    showTitle:false,
    tooltip:'新增一笔记录',
    group:'Edit',
    sequence:1,
    trigger:'New',
    state:'normal',
    update:function(session,app,datasource){
        /*
           根据session.state、app.type及datasource.props.state三者的状态决定toolbutton的最新状态
         */
        return checkStateChain(
            app.app.editState == 'edit' ?  'disabled' : '',
            app.app.state == 'loading' ? 'disabled' : '',
            datasource.props.state == 'fetching' ? 'disabled' : 'normal'
        );
    }
});


registryToolButton({
    component:'ToolButton',
    name:'Edit',
    icon:'edit',
    title:'编辑',
    showTitle:false,
    tooltip:'修改当前选定的记录',
    group:'Edit',
    sequence:2,
    trigger:'Edit',
    state:'normal',
    update:function(session,app,datasource){
        /*
           根据session.state、app.type及datasource.props.state三者的状态决定toolbutton的最新状态
         */
        return checkStateChain(
            app.app.editState == 'edit' ?  'disabled' : '',
            app.app.state == 'loading' ? 'disabled' : '',
            datasource.props.currentId == -1 ? 'disabled' : '',
            datasource.props.rowCount == 0 ? 'disabled' : '',
            datasource.props.state == 'fetching' ? 'disabled' : 'normal',
        );
    }
});

registryToolButton({
    component:'ToolButton',
    name:'Cancel',
    icon:'rollback',
    title:'取消',
    showTitle:false,
    tooltip:'取消已修改的内容',
    group:'Edit',
    sequence:4,
    trigger:'Cancel',
    state:'normal',
    update:function(session,app,datasource){
        /*
           根据session.state、app.type及datasource.props.state三者的状态决定toolbutton的最新状态
         */
        return checkStateChain(
            datasource.props.state == 'saving' ? 'disabled' :'', //保存中
            app.app.editState == 'edit' ? 'normal' : 'disabled' //应用是否处于编辑状态            
        )
    }
});

registryToolButton({
    component:'ToolButton',
    name:'Save',
    icon:'save',
    title:'保存',
    showTitle:false,
    tooltip:'保存已修改的内容',
    group:'Edit',
    sequence:3,
    trigger:'Save',
    state:'normal',
    update:function(session,app,datasource){
        /*
           根据session.state、app.type及datasource.props.state三者的状态决定toolbutton的最新状态
         */
        return checkStateChain(
            datasource.props.state == 'saving' ? 'disabled' :'', //保存中
            app.app.editState == 'edit' ? 'normal' : 'disabled' //应用是否处于编辑状态
        )
    }
});

registryToolButton({
    component:'ToolButton',
    name:'Delete',
    icon:'delete',
    title:'删除',
    showTitle:false,
    tooltip:'删除选定的记录',
    group:'Edit',
    sequence:5,
    trigger:'Unlink',
    state:'normal',
    update:function(session,app,datasource){
        /*
           根据session.state、app.type及datasource.props.state三者的状态决定toolbutton的最新状态
         */
        return checkStateChain(
            app.app.editState == 'edit' ?  'disabled' : '',
            app.app.state == 'loading' ? 'disabled' : '',
            datasource.props.currentId == -1 ? 'disabled' : '',
            datasource.props.rowCount == 0 ? 'disabled' : '',
            datasource.props.state == 'fetching' ? 'disabled' : 'normal',
        );
    }
});


registryToolButton({
    component:'ToolButton',
    name:'Form',
    view:'form',
    icon:'credit-card',
    title:'表单',
    showTitle:false,
    tooltip:'表单视图',
    group:'Views',
    sequence:0,
    trigger:'SwitchView',
    state:'normal',
    update:function(session,app,datasource){
        /*
           根据session.state、app.type及datasource.props.state三者的状态决定toolbutton的最新状态
           表单视图，编辑状态不允许切换到其它视图
         */
        var st;
        st = checkStateChain(
            //()=> {return (isfalse(session) || isfalse(session.state) || session.state != 9 || isfalse(datasource))? 'disabled':''}, //未登录或数据源未准备好
            //()=> {return (!isfalse(datasource) && datasource.props.state != 'browse') ? 'disabled': ''}, //未浏览状态
            () => {
                
                //console.log(app,'button-app')  修改参数的状态
                // window.history.pushState(document.location.href,'title','?actionId='+app.app.id+'&view='+app.app.currentView +'&res_id='+app.app.res_id);
                return app.app.currentView=='form'?'disabled':'normal'} //当前已选择
              
        );
        return st;
    }
});

registryToolButton({
    component:'ToolButton',
    name:'TreeView',
    view:'tree',
    icon:'bars',
    title:'列表',
    showTitle:false,
    tooltip:'列表视图',
    group:'Views',
    sequence:1,
    trigger:'SwitchView',
    state:'normal',
    update:function(session,app,datasource){
        /*
           根据session.state、app.type及datasource.props.state三者的状态决定toolbutton的最新状态
           表单视图，编辑状态不允许切换到其它视图
         */
        var st;
        st = checkStateChain(
            //(isfalse(session) || isfalse(session.state) || session.state != 9 || isfalse(datasource))? 'disabled':'', //未登录或数据源未准备好
            //(!isfalse(datasource) && datasource.props.state != 'browse') ? 'disabled': '', //未浏览状态
            datasource.props.state == 'edit' ? 'disabled' : false,
            app.app.currentView=='tree'?'disabled':'normal' //当前已选择
        );
        return st;
    }
});

