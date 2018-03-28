import React from 'react';
import { isfalse, isNode } from '../utils';
import { store } from '../midware';
import { registryWidget } from './_widgets';
import './Scroll.css';


class SyScroll extends React.Component {
    //这个只是能适用在之外这里,如果说在其他的地方的话,是不太可能的,兄弟
    //并不能将 scroll替换成这个,这个是不合理的,其实,在scroll里面是要考虑到当前的table
    //table 里面的头底3中都是被分开进行组合的,这个就是会有问题的,其实
    //我咋又混了一天呢,这个问题很严重的,兄弟
    //我决定要把眼镜带回去,这个才是重点
    //所以就导致了现在的这个问题,不是全部的问题都在这俩里面的,而是我们都是一样的
    /*滚动列表容器
       
       ## 参数
       |---|---|---|---|---|
       |名称|类型|说明|默认值|是否必须|
       |dataSearch|func|执行搜索的方法|无|是|
       |dataSearchProps|object|dataSearch用到的参数|无|是|
       |SelectTop|int|滚动条每次滚动偏移量|无|否|
       |rowHeight|int|每行记录显示的高度(像素)|32|否|

     **dataSearchProps参数说明**

       |---|---|---|---|---|
       |名称|类型|说明|默认值|是否必须|
       |startOffset|int|记录开始序号|无|是|
       |cacheRecords|int|缓存的记录条数|无|是|
       |cachePages|int|缓存的记录页数数|无|是|
       |rowsPerPage|int|每次请求返回的记录条数|无|是|
       |totalLength|int|记录总条数|无|是|
       |fetchedLenght|当前数据总长度|无|是|
       |domain|array|dataSearch查询条件,需符合后台查询条件格式|[]|否|
       

     **单向缓存记录数**
       单向缓存记录数=cachePages*rowsPerPage+cacheRecords
       
     */
    constructor(props) {
        super(props)
        var searchProps = this.props.dataSearchProps==undefined? {}: this.props.dataSearchProps;
        var {cacheRecords, cachePages, rowsPerPage, domain, startOffset} = searchProps;
        cacheRecords = cacheRecords==undefined? 0: cacheRecords;
        cachePages = cachePages==undefined? 0: cachePages;

        rowsPerPage = rowsPerPage==undefined? 0: rowsPerPage;
        //domain = domain==undefined? []: domain;
        startOffset = isfalse(startOffset)? 0: startOffset;
        
        var rheight = isfalse(this.props.rowHeight)? 32: parseInt(this.props.rowHeight);
        var oside_cache_len = cachePages*rowsPerPage+cacheRecords;
        this.state = {
            domain: domain,
            fetchedData: [],
            startOffset: startOffset, //记录开始行位置
            activeOffset: 0, //当前记录开始行位置
            rowHeight: rheight,
            pageHeight: rheight*rowsPerPage,
            currentPos: 0,  //滚动条当前位置
            totalPages: 0,  //总页数
            fetching: false, //标记是否正在获取数据,避免重复获取同样的数据,前一次请求未完成,不执行下一次请求
            searchPool: false, //数据请求队列,当fetching为true时,searchPool保留最后一次请求内容
        }
        this._scrollTimer = null;
        this.onSearch(domain,0, oside_cache_len);
    }

    componentWillUpdate(newProps){
        var update = false;
        if (JSON.stringify(newProps.dataSearchProps.domain) != JSON.stringify(this.state.domain)){
            var {cacheRecords, cachePages, rowsPerPage, domain, startOffset} = newProps.dataSearchProps;
            cacheRecords = cacheRecords==undefined? 0: cacheRecords;
            cachePages = cachePages==undefined? 0: cachePages;
            rowsPerPage = rowsPerPage==undefined? 0: rowsPerPage;
                var oside_cache_len = cachePages*rowsPerPage+cacheRecords;
                
            this.state.domain = newProps.dataSearchProps.domain;
            this.state.startOffset = 0;
            update = true
            this.onSearch(newProps.dataSearchProps.domain,0, oside_cache_len);
        }
        if(newProps.dataSearchProps.startOffset != this.props.dataSearchProps.startOffset){
            this.state.startOffset = newProps.dataSearchProps.startOffset;
            update = true;
        }
        if (newProps.dataSearchProps.totalLength!=this.props.dataSearchProps.totalLength || newProps.dataSearchProps.rowsPerPage!=this.props.dataSearchProps.rowsPerPage){
            this.state.totalPages = parseInt(newProps.dataSearchProps.totalLength/newProps.dataSearchProps.rowsPerPage);
            update = true;
        }
        if (update){
            this.setState({totalPages: this.state.totalPages});
        }
        
    }

    onSearch = (domain, offset, limit, params)=>{
        /*调用传进来的dataSearch方法进行查询内容
           dataSearch返回为Promise对象
           ----
           如何实现缓存数据更新
           cachePages>0时才会考虑缓存问题
           要考虑跳页的问题,数据拼接,数据清空更新
           数据连续时拼接,不连续时清空
           
           如何判断数据是否连续
           recordOffset和fetchedData长度与offset和返回的数据长度进行比较
           
         */
        if (this.state.fetching){
            //this.state.searchPool = [domain, offset, limit, params];
            return;
        }
        this.state.fetching = true;
        var {cacheRecords, cachePages, rowsPerPage, domain} = this.props.dataSearchProps;
        cacheRecords = cacheRecords==undefined? 0: cacheRecords;
        cachePages = cachePages==undefined? 0: cachePages;

        rowsPerPage = rowsPerPage==undefined? 0: rowsPerPage;
        domain = isfalse(domain)? []: domain;
        if (this.state.totalLength!=undefined && offset >= this.state.totalLength && this.state.totalLength>0){
            this.state.fetching = false;
            return
        }
        this.props.dataSearch(domain, offset, limit, params).then((data) => {  //传入到子组件scroll查询callback方法
            var childData = [];
            childData = data.searchResult;
            
            this.state.totalLength = data.result.length;
            var oside_cache_length = cachePages * rowsPerPage + cacheRecords;
            var total_cache_len = rowsPerPage + oside_cache_length*2;

            if (childData.length==0){
                this.state.fetchedData = []; 
                this.state.totalLength = 0; 
                this.state.startOffset = 0; 
                this.state.scrollTop = 0; 
            }  else {
                //数据更新
                if (cachePages<1){
                    this.state.startOffset = offset;
                    this.state.fetchedData = childData;
                    this.state.totalLength = data.result.length;
                    this.setState({
                        totalLength:data.result.length,
                    })
                } else {
                    if (offset<this.state.startOffset){
                        //向前加载
                        if((offset+childData.length)==this.state.startOffset){
                            //数据连续
                            this.state.fetchedData.splice(0, 0, ...childData);
                            if (this.state.fetchedData.length>total_cache_len){
                                //缓存数据数量超过指定的数量,截掉后面的数据
                                var dlen = this.state.fetchedData.length-total_cache_len;
                                this.state.fetchedData.splice(total_cache_len, dlen);
                            }
                            this.state.startOffset = offset;
                        } else {
                            //数据有间隔
                            this.state.fetchedData = childData;
                        }
                    } else {
                        //向后加载
                        if(offset==(this.state.startOffset+this.state.fetchedData.length)){
                            this.state.fetchedData.splice(this.state.fetchedData.length, 0, ...childData);
                            //数据连续,保证前后都有缓存
                            if (this.state.fetchedData.length>total_cache_len){
                                //缓存数据数量超过指定的数量,截掉前面的数据
                                var dlen = this.state.fetchedData.length-total_cache_len;
                                this.state.startOffset += dlen;
                                this.state.fetchedData.splice(0, dlen);
                            }
                        } else {
                            //数据有间隔
                            this.state.startOffset = offset;
                            this.state.fetchedData = childData;
                        }
                    }
                    this.state.totalLength = data.result.length;
                    this.setState({
                        totalLength:data.result.length,
                        fetchedData: this.state.fetchedData,
                    })
                }
            }
            this.state.fetching = false;
            var evt = {
                fetchedData: this.state.fetchedData,
                totalLength: this.state.totalLength,
                startOffset: this.state.startOffset,
                scrollTop: this.state.currentPos,
            }
            this.props.onScroll && this.props.onScroll(evt);
            if (this.state.searchPool!=false){
                var sp = this.state.searchPool, self=this;
                this.state.searchPool = false;
                /* setTimeout(()=>{
                 *     self.onSearch(...sp);
                 * }, 1)*/
            }
        });
    }
    
    render() {
        var props = { ...this.props }
        var self = this;
        var pageUp = null;
        var pageDwon = null;
        var {cacheRecords, cachePages, rowsPerPage, domain} = this.props.dataSearchProps;
        cacheRecords = cacheRecords==undefined? 0: cacheRecords;
        cachePages = cachePages==undefined? 0: cachePages;
        rowsPerPage = rowsPerPage==undefined? 0: rowsPerPage;
        domain = domain==undefined? []: domain;
        var fetchedLength = this.state.fetchedData.length;
        //单向缓存记录数=cachePages*rowsPerPage+cacheRecords
        var oside_cache_len = cachePages*rowsPerPage+cacheRecords;
        const onScroll = (node, event)=>{
            if (isfalse(node.clientHeight)){
                return;
            }
            //对比滚动条当前位置与当前缓存记录位置,到达重新获取数据的阀值
            var scroll_diff = node.scrollTop/this.state.pageHeight;
            var active_pg = parseInt(scroll_diff);
            var pass_pg = scroll_diff%1;
            if (this.state.currentPos < node.scrollTop){
                //向下翻
                
                var end = (active_pg+2)*rowsPerPage+oside_cache_len;
                var diff = end - this.state.startOffset-fetchedLength;
                if (diff>0){
                    this.onSearch(domain,this.state.startOffset+fetchedLength, diff)
                }
            } else if (this.state.currentPos > node.scrollTop){ 
                //向上翻
                var start = active_pg * rowsPerPage - oside_cache_len;
                start = start<0? 0: start;
                var diff = this.state.startOffset - start;
                if (diff>0){
                    this.onSearch(domain, start, diff);
                }
            }
            this.state.currentPos = node.scrollTop;
        }

        const scrollFunc = (tboy, e) => { //绑定滚动及滚轮函数(手动绑定)
            var self = this;
            if (this._scrollTimer==null){
                this._scrollTimer = setTimeout(()=>{
                    onScroll(tboy, e);
                }, 100);
            } else {
                clearTimeout(this._scrollTimer);
                this._scrollTimer = null;
                this._scrollTimer = setTimeout(()=>{
                    onScroll(tboy, e);
                }, 100);
            }
        }

        const VisualArea = (e) => {  //e 是当前节点
            if (!isfalse(e)) {
                //确定初始的滚轮位置及响应点击改变状态
                /* if (this._firstScrollPosition){
                 *     e.scrollTop = this._firstScrollPosition;
                 *     this._firstScrollPosition = false;
                 * }*/
                //其它浏览器绑定滚动条事件
                e.addEventListener('scroll', scrollFunc.bind(this, e));
                // 火狐浏览器 (绑定滚动条事件)
                if (e.addEventListener) {
                    e.addEventListener('DOMMouseScroll', scrollFunc.bind(this, e), false);
                }
                //滚轮事件绑定
                e.onmousewheel = scrollFunc.bind(this, e);
            }
        }
        
        var view_height = this.props.viewHeight+'px',
            scroll_height =this.state.totalLength*this.state.rowHeight+'px',
            offset_height = this.state.startOffset * this.state.rowHeight + 'px';

        return <div className="siyue-scroll-box-wrap ant-dropdown-menu ant-dropdown-menu-vertical ant-dropdown-menu-light ant-dropdown-menu-root" ref={VisualArea}  style={{height:view_height}}>
        <div className="siyue-scroll-box " ref='tableBody' style={{height:scroll_height}}>
        <div className="siyue-scroll-view" style={{"padding-top": offset_height}}>
        {props.children}
        </div>
        </div>
        </div>
    }

}

export default SyScroll;
