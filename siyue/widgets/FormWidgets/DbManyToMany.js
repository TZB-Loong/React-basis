/**
 * Created by hongmei on 2017/6/21.
 */import PropTypes from 'prop-types';
// import {PropTypes} from 'react';
import {Tag,Input,Tooltip,Button,Select,Spin} from 'antd';
import createWidget from '../_createWidget';
import {store} from '../../midware'
import {registryFormWidget,registryWidget} from '../_widgets';
import {isfalse} from '../../utils';
import '.././Form.css'; 
import Selects from '../Selects';
import SySelect from '../SySelect';

// const WrappedDbSelect = createWidget(Selects);
const WrappedDbSelect = createWidget(SySelect);


class DbManyToMany extends React.Component{
    /*多对多组件

       在Field定义中可指定的属性参数

       |---|---|---|---|---|
       |名称|类型|说明|默认值|是否必须|
       |rowsPerPage|int|每次请求返回的记录条数|无|是|
       |cacheRecoreds|int|缓存的记录条数|无|是|
       |cachePages|int|缓存的记录页数,不为0时进入数据预加载缓存模式|无|是|

       ----
       缓存模式下,保证当前面前后各有指定的缓存记录数

     */
    
        
    constructor(props) {
        super(props);
        var rpp = isfalse(this.props.props.rowsPerPage)? 0: parseInt(this.props.props.rowsPerPage),
            crds = isfalse(this.props.props.cacheRecords)? 0: parseInt(this.props.props.cacheRecords),
            cpgs = isfalse(this.props.props.cachePages)? 0: parseInt(this.props.props.cachePages);
        
        this.state={
            //fetchedData:[], //记录内容,使用状态来接收返回的数据
            fetchedData: [], //已获取的记录内容
            totalLength:0,
            rowsPerPage: rpp,
            cacheRecords: crds,
            cachePages: cpgs,
            Loading:true,
            defaultValue:[],
            recordOffset:0, //当前缓存记录开始位置
            activePage: 0, //当前页面序号

        };
    } 
    
    componentWillUpdate(newProps) { 
        //组件传入新的props 时，清除前面的状态 并触发name_search（生命周期:props更新时执行）
        //this.props 更新之前的props   this.state. 之前的状态]
        if (newProps.props.resId != this.props.props.resId) {
            this.setState({
                fetchedData:[], //使用状态来接收返回的数据
                totalLength:0,
                cacheRecords:0,
                rowsPerPage: isfalse(this.props.props.rowsPerPage)? 0: parseInt(this.props.props.rowsPerPage),
                Loading:true,
                defaultValue:[]
            });
        } else if(newProps.props.value!=this.props.props.value){
            if(isfalse(newProps.props.value)) {
                this.state.defaultValue = [];
            } else {
                this.defaultSearch(newProps.props.value);
            }
        }
    }

    getDomian=(ids)=>{
        var domain = [], mn;
        if (!isfalse(ids)) {
            for (var i in ids) {
                mn = ids[i];
                if (!isfalse(mn)) {
                    if (i > 0) {
                        domain.unshift('|')
                    }
                    if (typeof mn == 'number'){
                        domain.push(['id', '=', mn]);
                    } else {
                        domain.push(['id', '=', mn[0]]);
                    }
                }
            }
        }
        return domain
    }
    
    defaultSearch = (ids)=>{ //默认数据加载函数这里应该含有有个callback
        var  _callback2 = (data)=>{ // 默认数据(本地组件的)(search的回调函数)
            var childData = []
            data.result.records.map(item => {
                childData.push([item.id, item.name]);
            })
            this.setState({
                defaultValue: childData,
            })
        }
        var ds = store.getAppDatasource(this.props.props.appId,this.props.props.datasourceId);
        ds.search2(['id', 'name'],this.getDomian(ids),{},{},'ignore',_callback2); 
    }
    
    render(){
        //把结构在写一次
        var {field,props} =this.props;
        var self  = this;
        //把函数放到组件内部来
        var ds = store.getAppDatasource(this.props.props.appId,this.props.props.datasourceId);

        var cacheLength = (this.state.cachePages+1) * this.state.rowsPerPage+this.state.cacheRecords;
        //单向缓存记录数量
        var oside_cache_length = this.state.cachePages * this.state.rowsPerPage + this.state.cacheRecords;
        var total_cache_len = this.state.rowsPerPage + oside_cache_length*2;
        
        const getowenDs = ()=>{
                return {
                totalLength: this.state.totalLength,
                rowsPerPage: this.state.rowsPerPage,
                cacheRecords: this.state.cacheRecords
            }
        }

        const getDataSearchProps = ()=>{
            return {
                startOffset: this.state.recordOffset,
                totalLength: this.state.totalLength,
                rowsPerPage: this.state.rowsPerPage,
                cacheRecords: this.state.cacheRecords,
                cachePages: this.state.cachePages,
                fetchedLength: this.state.fetchedData.length,
            }
        }
        
        const dataSearch = (domain, offset, limit)=>{
            var prm = new Promise((resolve, reject)=>{
                var afterload = (data)=>{
                    data.searchResult = data.result.records.map(item=>{return [item.id, item.name]});; 
                    resolve(data);
                };
                domain = isfalse(domain)? []: domain
                ds.search2(['id', 'name'], domain, {}, { offset: offset, limit: limit},'ignore',afterload);
            })
            return prm;              
        }

        if (this.state.Loading == true && !isfalse(props.resId)) {
           if(!isfalse(props.value)){
               this.defaultSearch(props.value); // 进行一次默认数据的查询
           }

            dataSearch(0, oside_cache_length+this.state.rowsPerPage);  //列表显示的数据进行加载
            this.setState({
                Loading: !this.state.Loading,
            })
        }
        var selected = [];
        return (
            <WrappedDbSelect addonBefore={field.string}  props={props}   appId={props.appId} id={props.datasourceId} defaultValue={props.value} field={field} resId={props.resId} dataSearch={dataSearch} dataSearchProps={getDataSearchProps()} owenDs={getowenDs()} items={isfalse(this.state.fetchedData)?[]:this.state.fetchedData} selected={self.state.defaultValue} />
        )
    }
}
DbManyToMany.prototype.propTypes = {
    field: PropTypes.object,
    model: PropTypes.func,
    props: PropTypes.object,
    error: PropTypes.object
};

registryFormWidget(DbManyToMany);
registryFormWidget(DbManyToMany,'many2many');
export default DbManyToMany;
