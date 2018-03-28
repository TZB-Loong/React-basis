import React, {PropTypes, Component} from 'react';
import { render } from 'react-dom';
import antd, {Button, Icon, Input, Select} from 'antd';
import  './Tree.css';
import {globalMouseDrop, isfalse} from '../utils';
import {store,triggers} from '../midware';
import {TreeWidgets,registryWidget} from './_widgets';
import _Widgets,{UnDefined} from './TreeWidgets';
import Scroll from './Scroll';
// import SyScroll from './SyScroll';
const Option = Select.Option;

const defaultProps = { 
    rowHeight:38,
    pagination:true,
    colWidth:100,
  
}


class Table extends Component {
    constructor(props) {
        super(props);
        /*props参数
           
           datasorce,指定datasorce id，没指定时使用app默认datasource
           indicator,为true时，首列作为行指示标记
           foot,表格脚，在页脚可以加入一些统计功能，保留，在报表显示时比较有用
           rowHeight,int,默认行高，没指定时
           colWidth,int,默认列宽，没指定时100
           pagination,bool,是否使用分页，默认使用true

         */
       
        var field, fields=[], viewFields, app,datasource;
        datasource = store.getAppDatasource(props.props.appId, props.props.datasourceId);
        viewFields =datasource.fields;
        if (!isfalse(props.children)){
            var children = props.children;
            if (typeof props.children.map == 'undefined'){
                    children = [props.children];
            }
            children.map(child => {
                if (child.type.name === 'Field'){
                    field = Object.assign({}, viewFields[child.props.name]);
                    field.width = child.props.width ==undefined ? field.width == undefined ? '70' : field.width : child.props.width;
                    field.name = child.props.name;
                    fields.push(field);
                }   
            })
        }
        this.state = { 
            fields: fields,
            scrollLeft:0, 
            defaultProps:defaultProps,
            click:true,   //区分单击双击(用来控制定时器)
            select:null,   //选中的id
            jumpId:null,
            
        };
    }



    componentWillMount(){ 
        //在首次渲染之前调用,最后一次修改state的机会(避免里面没有内容时出现的错误)
        //传入选定的位置
        if(!isfalse(this.props.props.props)){
            this.setState({
                select:this.props.props.props.id
            })
        }
    };
    render(){
        var self = this;
        var mpos = [0, 0];
        var sizeCell = null ;
        var datasource;
        const Props = Object.assign({}, this.state.defaultProps,this.props);
        datasource = store.getAppDatasource(this.props.props.appId, this.props.props.datasourceId);
        const appProps = store.props.apps[datasource.props.appId].app;
        var viewFields,field ;
        if (isfalse(this.props.fields) && !isfalse(datasource)){
            viewFields = isfalse(this.props.indicator) ? [] : [{}];
            this.state.fields.map(rfield => {
                field = Object.assign({}, rfield, datasource.fields[rfield.name]);
                viewFields.push(field);
            });
           
        } else {
            viewFields = [{},...this.state.fields];
        }

        //表头
        const columnSizerMove = function(evt){
            var p, dx=0, sizeField, w, state;
            if (evt.target,evt.buttons == 1){
                state = {...self.state}
                p = evt.target.parentNode;
                dx = evt.clientX - mpos[0]
                sizeField = state.fields[sizeCell];
                if (typeof sizeField != 'undefined'){
                    sizeField.width = parseInt(sizeField.width) + dx;
                    mpos = [evt.clientX, evt.clientY];
                    self.setState(state);
                }
            }
        }
        
        const columnSizerMouseDown = function(evt){
            if (evt.target,evt.buttons==1){
                globalMouseDrop.bind(columnSizerMove);
                mpos =  [evt.clientX, evt.clientY];
                sizeCell = evt.target.parentNode.cellIndex;
            }
        }
        
        const columnSizerMouseUp = function(evt){
            if (evt.target,evt.buttons==1){
                globalMouseDrop.unbind();
            }
        }

        const renderHeader = function(children){
            
            var headerEvent = {
                onMouseMove:columnSizerMove,
                onMouseDown:columnSizerMouseDown,
                onMouseUp:columnSizerMouseUp
            };
            
            return (
                <div className="db-table-header" style={{"margin-left":(0-self.state.scrollLeft)+'px'}}>
                <table>
                <colgroup>
                {viewFields.map(fn =>{return <col key={fn.name+(++ci)} />})}
                </colgroup>
                <thead className="db-table-thead" >
                <tr>
                {viewFields.map(fn =>{
                    
                    return <th style={{width:(fn.width+'px')}}  key={fn.name+(++ci)} ><div className="db-table-header-title" style={{width:(fn.width+'px')}}>{fn.string}</div><div className="db-table-colume-sizer" {...headerEvent} ></div></th>})}
                </tr>
                </thead>
                </table>
                </div>
            )
        }

        var editState = store.apps[self.props.props.appId].app.editState;  //当前状态
        const trOnClick=(rowid,e)=>{ //组件刷新后会恢复,所以不能直接改
            datasource.goto({id:parseInt(rowid)});
        }
        
        const dbtrOnClick = (rowid)=>{ //双击,单击
            this.props.onDoubleClick&&this.props.onDoubleClick(rowid);
        }
        
        // 表身
        const renderBody = function(datasource, children){
            var ci=0, field, component, widget, row;
            const getFieldWidth = function(name,ci){
                return viewFields[ci-1].width;
            }

            return (
                <table>
                <tbody>
                {datasource.props.rowsKeys.map(rowid => {
                    ci = 0;
                    row = datasource.props.rows[rowid];
    
                    return (<tr className= {datasource.props.currentId === rowid ?"db-table-row-select db-table-row":"db-table-row"} key={rowid} style={{height:Props.rowHeight+'px'}} onClick={trOnClick.bind(this,rowid)}  onDoubleClick={dbtrOnClick.bind(this,rowid)} data-resid={rowid}>
                        {children.map(Cel => {
                          
                            field = datasource.fields[Cel.props.name];
                            widget = isfalse(Cel.props.widget)? field.type: Cel.props.widget;
                            component = TreeWidgets[widget];
                            component = isfalse(component)? UnDefined : component;
                            delete Cel.props.props
                            
                            return (
                                <td key={Cel.props.name+(++ci)} style={{width:getFieldWidth(Cel.props.name, ci)}} ><Cel.type name={Cel.props.name} props={{...Cel.props, width:getFieldWidth(Cel.props.name, ci)+'px', component:component, widget:widget,value:row[Cel.props.name], rawValue:row[Cel.props.name],appId:datasource.props.appId, datasourceId:datasource.props.id, resId:rowid}} /></td>
                            )
                        })}
                        </tr>
                    )
                })}
                </tbody>
                </table>
            )
        }

        //scroll，处理表格滚动
        //计算表格数据显示高度,总显示高度＝记录数量*每行显示高度
        var scrollHeight = datasource.totalLength*Props.rowHeight;
        //每页数据显示高度＝每页行数*每行显示高度
        var pageHeight = datasource.rowsPerPage*Props.rowHeight;
        const prependBuffer = function(){
            //前面插入数据请求,在scroll组件里已实现
        }

        const appendBuffer = function(){
            /* 后面追加数据请求
               服务端是否还有数据可加载？
               
             */
        }
        
        var scrollCallbackFlags = [],viewlen;
        const scrollCallback = function(evt){
            setTimeout(function(){
                if (scrollCallbackFlags.length > 1&& scrollCallbackFlags[scrollCallbackFlags.length-1][0] == evt.timeStamp){
                    var tableNode = evt.target.children[0].children[0];
                    var marginTop = parseInt('0'+tableNode.style.marginTop.replace('px',''));
                    //滑块所在页码
                    var scrollPage = parseInt(evt.target.scrollTop/pageHeight);
                    //判断当前滚动位置是否需要加载缓存数据
                    
                    var direction;
                    if (scrollCallbackFlags[scrollCallbackFlags.length-2][1] < scrollCallbackFlags[scrollCallbackFlags.length-1][1]){
                        //向后加载缓存
                        viewlen = parseInt((tableNode.clientHeight - evt.target.scrollTop)/evt.target.clientHeight)
                        direction = 0;
                        if (viewlen <= 2){
                            appendBuffer(scrollPage, viewlen);
                        }
                    } else {
                        //向前加载缓存
                        viewlen = parseInt((evt.target.scrollTop-marginTop)/evt.target.clientHeight);
                        direction = 1;
                        if (viewlen <= 2){
                            prependBuffer(scrollPage, viewlen);
                        }
                    }
                    scrollCallbackFlags = [];
                }
            },200)
            
        }
        const tableScroll = function(evt){
            //无分页滚动连续自动获取数据，滚动停止后再获取数据，使用timeout 延时检查evt.timestamp和最后一个evt.timestamp对比，判断是否为最后一个触发scroll事件；要等到前一个获取数据动作完成后再执行下一个获取动作。
            if (evt.target.className.indexOf('db-table-content')==-1){
                return
            }
            var state = {...self.state};
            if (state.scrollLeft != evt.target.scrollLeft) {
                state.scrollLeft = evt.target.scrollLeft;
                self.setState(state);
            } else {
                scrollCallbackFlags.push([evt.timeStamp,evt.target.scrollTop]);
                scrollCallback({timeStamp:evt.timeStamp,target:evt.target})
            }
        }

        //处理分页
        //表身中间浮动分页器，编辑状态时隐藏
        const renderPagination = function(datasource){
            var curPage,rpp ;
            const pages = [];
            var totalPage = parseInt(datasource.props.totalLength/datasource.props.rowsPerPage)+1;
            for (let i = 1; i <= totalPage; i++) {
                pages.push(<Option key={i.toString() }>{i.toString()}</Option>);
            }
            
            const pageChange = function(evt){
                rpp = datasource.props.rowsPerPage;
                curPage = datasource.props.dataCache/rpp
                
                datasource.search(appProps.fields,appProps.domain,appProps.context,{offset:(parseInt(evt)-1)*rpp});
                self.refs.scrollLayer.scrollTop=5;
            }
            const goToFirstPage = function(evt){
                rpp = datasource.props.rowsPerPage;
                curPage = datasource.props.dataCache/rpp
                
                datasource.search(appProps.fields,appProps.domain,appProps.context,{offset:0});
                }
            const goToLastPage = function(evt){
                rpp = datasource.props.rowsPerPage;
                curPage = datasource.props.dataCache/rpp
                datasource.search(appProps.fields,appProps.domain,appProps.context,{offset:(totalPage-1)*rpp});
                }
            const goToPrevPage = function(evt){
                rpp = datasource.props.rowsPerPage;
                curPage = datasource.props.dataCache/rpp
                if (curPage>0){
                 datasource.search(appProps.fields,appProps.domain,appProps.context,{offset:(curPage-1)*rpp});
                }
            }
            const goToNextPage = function(evt){
                 rpp = datasource.props.rowsPerPage;
                 curPage = datasource.props.dataCache/rpp
                if (curPage<totalPage-1){
                 datasource.search(appProps.fields,appProps.domain,appProps.context,{offset:(curPage+1)*rpp});
                }
            } 

                var   pg = datasource.props.dataCache/datasource.props.rowsPerPage+1;

            return (
                <div className="db-table-pagination"  style={{"margin-button":"-10px"}}>
                <Button  size="large" ghost icon='verticle-right' onClick={goToFirstPage}/>
                <Button  size="large" ghost icon='left' onClick={goToPrevPage}/>
                <Select   className="db-table-pagination-pagenumber" value={pg} onChange={pageChange}>
                {pages}
                </Select>                
                <div className="db-table-pagination-totalpage"></div>
                <Button  size="large" ghost icon='right' onClick={goToNextPage} />
                <Button  size="large" ghost icon='verticle-left' onClick={goToLastPage}/>
                </div>
            )
        }

        var ci=1;
        var tableWidth = this.props.width ? this.props.width : '100%';
        var tableHeight = this.props.height ? this.props.height : '100%';
        //子tree时props.children无法直接传进来，Field组件重载了props属性
        var children = isfalse(this.props.children) ? this.props.props.children : this.props.children;
        if (typeof children.map == 'undefined'){
            children = [children];
        }

        return (
            <div className='db-table db-table-bordered'  style={{width:tableWidth }}>
            <div className="db-table-content"  onScroll={tableScroll}>
            {renderHeader(children)}
            <div className="db-table-body"  ref='scrollLayer'>
            {isfalse(datasource)? null :<Scroll  datasource={datasource} renderBody={renderBody(datasource,children)} Props={Props} SelectId ={self.state.select} />}
            </div>
            {isfalse(this.props.foot)? null :
             <div className="ant-table-footer" style={{"margin-left":(0-self.state.scrollLeft)+'px'}}></div>}
            <div> {datasource.props.totalLength>0 ? renderPagination(datasource):null}</div>
            </div>
            </div>
        )
    }
}


registryWidget(Table);
export default Table;
