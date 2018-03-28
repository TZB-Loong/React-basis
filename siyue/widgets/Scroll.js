import React from 'react';
import { isfalse,isNode } from '../utils';
import { store } from '../midware';
import { registryWidget } from './_widgets';
import './Scroll.css';
class Scroll extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            time:null
         }
    }



    
    // componentWillUpdate(){  //当状态刷新一次就更新一次(根据传入的props来决定)
    //         console.log(this.props,'this.props')
        
    //             // var dds = store.getAppDatasource(this.props.props.appId,this.props.props.datasourceId)
        
    //             // console.log(dds.props.rowsKeys.indexOf(this.props.props.props.id),'index',this.state.defaultProps.rowHeight)
        
    //         }


    render() {
        var props = { ...this.props }
        // console.log('{...this.props}',props)
        var self = this;
        var pageUp = null;
        var pageDwon = null;
        const appProps = store.props.apps[props.datasource.props.appId].app; //app
        
        const totalLength = props.datasource.props.totalLength;  //数据的总条数
        const rowsPerpage = props.datasource.props.rowsPerPage;  //每次查询到的是数组的数量
        // const dataCache = props.datasource.props.dataCache;      //上一次缓存的数据的起点
        const scrollHeight = props.datasource.props.totalLength * props.Props.rowHeight; //文本总高度 
        const rowsKeyLenght = props.datasource.props.rowsKeys.length;  //已经请求到的数据的实际条数
        /*
        {

            props.datasource.props.totalLength   数据的总条数
            props.datasource.props.rowCount   数据的数量
            props.datasource.props.rowsPerpage  请求一次数据的数量
            props.datasource.props.dataCache*props.datasource.props.props.rowsPerpage   本地缓存数据所允许的最大数目
            修改数据的请求方式
            ds.name_sraech() 由原本的将数据进行覆盖改变为,追加数据(在原本的数据上进行追加)
            flush 返回数据的设置方法，'replace'/'append'，replace将完全替换，append在原来的基础上追加数据
            self.refs.tableBody.clientHeight  //数据文本的高度
            self.refs.VisualArea.scrollTop  //滚动条距离顶部的高度
            self.refs.VisualArea.clientHeight  //可视区的高度         
        }
    */

        const handerScrollUp = (tboy) => {
            if (props.datasource.props.dataCache - rowsPerpage >= 0) {
                // var timer = null ;
                if (pageUp != props.datasource.props.dataCache) {
                    pageUp = props.datasource.props.dataCache;
                    //不做数据的预留
                    props.datasource.search(appProps.fields, appProps.domain, appProps.context, { offset: props.datasource.props.dataCache - rowsPerpage });
                    //在做跳转的时候 不能这样直接为100吧,如果这样子的话不就是不能做到最开始的作展示
                    tboy.scrollTop=self.refs.tableBody.clientHeight - tboy.clientHeight; 
                    /*
                    //预留一页的数据
                    // Bug 在高度还没有被撑起来的同时,我们已近同时触发了两次的数据请求
                    props.datasource.search(appProps.fields, appProps.domain, appProps.context, { offset: dataCache - rowsPerpage }, 'preppend');
                    // console.log('rowsKeylength', rowsKeyLenght, 'newRowsKeyLength', props.datasource.props.rowsKeys.length)
                    setTimeout(function () {
                        if (props.datasource.props.rowsKeys.length > 2 * rowsPerpage) {  //删除后80条记录
                            // console.log('totalLength',totalLength - dataCache - rowsPerpage*2 ,dataCache)
                            if (totalLength - dataCache - rowsPerpage * 2 < 0) {
                                props.datasource.removeMultiple(dataCache, totalLength - dataCache)
                                // console.log('None')
                                //删除之后不到一页的内容
                            } else {
                                props.datasource.removeMultiple(rowsKeyLenght - rowsPerpage, rowsPerpage); //删除-页的内容
                            }
                        }
                    }, 150)
                    */

                }
            }
        }


        const handerScrollDown = (tboy) => {
            if ((totalLength - props.datasource.props.dataCache - rowsPerpage) / rowsPerpage >= 0) {   //首先判断有在后面还有没有数据
                /*
                    rowskeyLenght:当前的数据
                    dataCache:上一次开始请求的位置
                */
                //限制其在这个条件范围内只会查询一次数据
                if (pageDwon != props.datasource.props.dataCache) { //当其不会相等时开始进行
                    pageDwon = props.datasource.props.dataCache;
                    //不做数据预留
                    props.datasource.search(appProps.fields, appProps.domain, appProps.context, { offset: props.datasource.props.dataCache + rowsPerpage })
                    // console.log('this.props.limit',props.datasource)
                    tboy.scrollTop=5; 
                    /*预加载的数据(两页的数据)
                    // console.log('dataCache+rowsPerpage', dataCache, rowsPerpage)
                    props.datasource.search(appProps.fields, appProps.domain, appProps.context, { offset: dataCache + rowsPerpage }, 'update')  //进行数据请求

                    // console.log(props.datasource.props.rowsKeys.length, { ...props.datasource.props.rowsKeys.length }, 'befor', rowsKeyLenght)

                    setTimeout(function () {
                        // console.log('plass', rowsKeyLenght, props.datasource.props.rowsKeys.length)
                        if (props.datasource.props.rowsKeys.length > 2 * rowsPerpage) { //进行数据的清理
                            //         //删除最开始的第一页的数据 
                            props.datasource.removeMultiple(0, rowsPerpage); //删除最前面的80条数据
                        }
                    }, 150)
                    */

                }
            }
        }


        const scrollFunc = (tboy,e) => {
            // console.log('tboy',tboy,isfalse(tboy.clientHeight))
            if(!isfalse(tboy.clientHeight)){
                /*
                在这里获获取到当前选择的id之后在进行滚轮高度的计算
                */
              
                var textTop  =  tboy.scrollTop; 
                var clientHeight = tboy.clientHeight;
                var scrollBot = self.refs.tableBody.clientHeight -textTop-clientHeight
            
                e = e || window.event;
                
                    //在一直向上滚的时候滚到底的时候还在往上面滚的时候在进行加载
                    if (textTop == 0) { 
                
                        if (e.wheelDelta) { //除去火狐以外的浏览器
    
                            if (parseInt(e.wheelDelta) > 0) {  //滚轮往上滚动
    
                                handerScrollUp(tboy);
                            }
                        } else if (e.detail) {  //兼容火狐
    
                            if (!parseInt(e.detail) <= 0) { //滚轮往上滚
    
                                handerScrollUp(tboy);
                            }
                        }
                    } else if (scrollBot == 0) {
                        if (e.wheelDelta) {  //除去火狐浏览器以外浏览器
    
                            if (parseInt(e.wheelDelta) <= 0) {  //滚轮向下滚
    
                                handerScrollDown(tboy);
                            }
                        } else if (e.detail) {  //兼容火狐
    
                            if (parseInt(e.detail) > 0) { //滚轮向下滚
                                handerScrollDown(tboy);
                            }
                        }
                    } else {
                            pageDwon = null;
                            pageUp = null;
                        }
            }
         
        }

       
        const VisualArea = (e)=>{
            if(!isfalse(e)){  //确定初始的滚轮位置及响应点击改变状态
                var z = props.datasource.props.rowsKeys.indexOf(props.SelectId);
                if(z == -1 ){
                    e.scrollTop = 0
                }else{
                    if(z != self.state.time){
                        self.setState({  //点击相同的Id只会响应一次(避免滚动窗上下来回的跳动)
                            time:z
                        })
                        e.scrollTop =  z *props.Props.rowHeight
                    }
                }
                var textTop  =  e.scrollTop
                var clientHeight = e.clientHeight
                e.addEventListener('scroll', scrollFunc.bind(this,e))
                // 火狐浏览器
                if (e.addEventListener) {
                    e.addEventListener('DOMMouseScroll', scrollFunc.bind(this,e), false);
                }
                e.onmousewheel =scrollFunc.bind(this,e);
            }
        }


        return <div className="scrollBoxWrap " ref={VisualArea} >
            <div ref='tableBody'>
                {props.renderBody}
            </div>
        </div>
    }

}

export default Scroll;