import React from 'react';
import { Select, Input, Button, Icon } from 'antd';
import { isfalse } from '../utils';
import { store, apps } from '../midware'
import { registryWidget } from './_widgets';
import "./SySearch.css"

const option = Select.option

class SySearch extends React.Component {
    constructor(props) {
        super(props);
        var app = apps.getApp(this.props.app.appId)
        this.state = {
            showSearch: false,    //控制下拉列表的显示
            searchValue: '',    //输入的值
            liChildren: [],     // 获取到点击列表的值得集成数组
            dsField: null,      //字段名和string
            enterKey: false,    //是否点击了回车键
        };
    }

    componentWillUpdate(newProps){
        //切换应用时dsFiel没有更新
        
        
        if (newProps.app.appId != this.props.app.appId){
            var app = apps.getApp(newProps.app.appId);
            var ds = app.defaultDatasource;
            var fieldList = []; //接受字段名与string
            for (var i in app.props.fields) {
                if (!isfalse(app.props.fields[i])) {
                    fieldList.push([app.props.fields[i], ds.fields[app.props.fields[i]].string])
                }
            }
            this.state.dsField = fieldList;
            this.state.liChildren = isfalse(app.vars.searchDomain)? []: app.vars.searchDomain;
        }
    }
    
    componentWillMount() {   //在组件挂载的时候,把数据源拿到(在render执行之前执行(只执行一次))

        var ds = store.getAppDatasource(this.props.app.appId, this.props.app.datasourceId)
        console.log(ds.fields,'componentWillMount')
        var fieldList = []; //接受字段名与string
        if(ds.fields!= false){

            for (var i in this.props.app.fields) {
                if (!isfalse(this.props.app.fields[i])) {
                    fieldList.push([this.props.app.fields[i], ds.fields[this.props.app.fields[i]].string])
                }
            }
        }
                this.setState({
                    dsField: fieldList //[字段名,string]
                })
    }

    searchOperate = (liChildren) => {  //查询操作 
        /*
           lichildren:  要查询的数组 [[字段名,字段string,输入的内容],...]
           this.props.fields:当前应用下的所有字段
           this.props.app.context:当前应用下的context
         */
        var domain = []; //筛选条件数组
        if (!isfalse(liChildren)) {
            for (var i in liChildren) {
                if (!isfalse(liChildren[i])) {
                    if (i > 0) {
                        domain.unshift('|')
                    }
                    domain.push([liChildren[i][0], 'ilike', liChildren[i][2]]);
                }
            }
        }
        var ds = store.getAppDatasource(this.props.app.appId, this.props.app.datasourceId)
        ds.search(this.props.app.fields, domain, this.props.app.context); //执行查询操作
    }

    weight = (arr) => {   //数组去重的函数
        /*
           arr:要去重的数组
         */
        var difLiChildren = [], dffLiChildren = [];
        for (var i in arr) {
            if (!isfalse(arr[i]) && difLiChildren.indexOf(arr[i][0] + arr[i][2].replace(/^\s*|\s*$/g, "")) == -1) {
                difLiChildren.push(arr[i][0] + arr[i][2]);
                dffLiChildren.push(arr[i])
            }
        }
        return dffLiChildren
    }

    merge = (arr) => {  //合并字段名相同的数组
        /*
           arr:要合并的数组
         */
        var mvalue = [], smallMvalue = [], newMvalue = [];
        arr.map((item, i) => {
            if (mvalue.indexOf(item[0]) == -1) { //把输入内容完全相同的部分去掉,但是后台却可以继续的查询 
                mvalue.push(item[0]);
                newMvalue.push(item);  //这是那些不同的,不存在相同的那么,这里是会把所有相同的都在归拢在一个数组里
            } else {
                smallMvalue.push(item)   //mvalue数组里面有的数组
            }
        })
        //将字段名称相同的数组进行合并
        smallMvalue.map(item => {
            for (var x in newMvalue) {
                if (!isfalse(newMvalue[x])) {
                    if (newMvalue[x][0] == item[0]) {
                        newMvalue.splice(x, 1, [newMvalue[x][0], newMvalue[x][1], typeof (newMvalue[x][2]) == 'object' ? newMvalue[x][2].concat(item[2]) : [newMvalue[x][2], item[2]]])
                    }
                }
            }
        })
        return newMvalue
    }

    render() {
        var props = { ...this.props };
        var self = this;
        var app = apps.getApp(props.app.appId)
        
        const handChange = (e) => {  //监听输入框中的值得变化
            if (isfalse(e.target.value)) { //当输入框中没有值时下拉框不显示
                self.setState({
                    showSearch: false,
                })
            } else {
                self.setState({
                    searchValue: e.target.value,
                    showSearch: true
                })
            }
        }

        const listClick = (e) => {      //下拉菜单的点击事件
          var liValue = e.target.dataset.value.split(',');
          var liChildren = [...Object.values({ ...self.state.liChildren })]; //拷贝这个数组的内容
          liChildren.push(liValue);
          if (!isfalse(liChildren)) { //去掉liChildren 数组里面相同的数组
              var dffLiChildren = self.weight(liChildren);
          }
            app.vars.searchDomain = dffLiChildren;
          self.setState({
              liChildren: dffLiChildren,  //更新数据数组
              showSearch: false,          //关闭下拉框
              searchValue: ''             //手动清空从输入框中获取到的值
          })
            self.searchOperate(dffLiChildren);
        }

        const getList = () => {
            //dsField [字段名称,string] ><button
            return <ul className='siyue-search-list ant-dropdown-menu ant-dropdown-menu-vertical ant-dropdown-menu-light ant-dropdown-menu-root'>
            {self.state.dsField.map(item => {
                return <li key={item}  className='siyue-search-list-item' onClick={listClick} data-value={[item, self.state.searchValue]}>搜索: {item[1]} : {self.state.searchValue}</li>
            })}
            </ul>
        }
        var dropDownList = getList();  //接收下拉列表内容

        const iconOnClick = (item) => { //在这里进行删除数组的选项(点击图标删除事件)
            var newLichildren = []
            for (var p in self.state.liChildren) {
                if (self.state.liChildren[p][0] != item[0] && !isfalse(self.state.liChildren[p])) {
                    newLichildren.push(self.state.liChildren[p])
                }
            }
            app.vars.searchDomain = newLichildren;
            self.setState({
                liChildren: newLichildren
            })
            self.searchOperate(newLichildren);
        }

        const getDivList = () => {
            var listData = self.state.liChildren.slice(0);  //把liChildren里面的数组拷贝到listData里面来
            if (!isfalse(listData)) {
                var newMvalue = self.merge(listData)   //合并字段名相同的数组
                return newMvalue.map((item, i) => {
                    return <div className='siyue-search-item' key={i}>
                    <span className='siyue-search-item-title'>{item[1]}</span>
                    <span className='siyue-search-item-text'>{typeof (item[2]) == 'object' ? item[2].join('  或 ') : item[2]}</span>
                    <span className='siyue-search-item-close'><Icon type='close-circle' onClick={iconOnClick.bind(this, item)} /></span>
                    </div>
                })
            }
        }

        var DivList = getDivList();  //接收输入框中显示的内容
        const onKeyDow = (e) => {   //键盘监听事件
            //敲回车时,进行检索
            var e = e || window.event || arguments.callee.caller.arguments[0];
            if (e && e.keyCode == 13) {        //回车键 事件监听
                if (!isfalse(e.target.value)) {  //当不点击下拉的列表直接敲回车时发生发生的事件
                    var textValueEnter = e.target.value
                    self.state.liChildren.push([self.state.dsField[0][0], self.state.dsField[0][1], textValueEnter])
                    var dffLichildren = self.weight(self.state.liChildren)  //数组去重
                    app.vars.searchDomain = dffLiChildren;
                    self.setState({
                        showSearch: false,
                        liChildren: dffLichildren,
                        enterKey: true,
                    })
                    
                    self.searchOperate(dffLichildren)
                    e.target.value = '';  //清空输入框
                }
                //屏蔽掉原本的回车事件
                if (e.preventDefault) e.preventDefault();  //标准技术  
                if (e.returnValue) e.returnValue = false;  //IE  
            } else if (e && e.keyCode == 8) {     //退格按键触发的事件
                if (isfalse(e.target.value) && !isfalse(self.state.liChildren)) {
                    self.state.liChildren.pop(); //每一次的退格,删除一个元素(从后往前删除)
                    app.vars.searchDomain = self.state.liChildren;
                    self.setState({
                        liChildren: self.state.liChildren,
                    })
                }
                self.searchOperate(self.state.liChildren)
            }
        }
        const inputOnBlur = (e) => {  //当输入框失去坐标时,清空输入框中的内容,收起下拉列表
            e.target.value = '';
            setTimeout(function () {    //跳出React时序(不跳出时序的话,下拉表的收起会在你点击获取到的值之之前) 
                self.setState({
                    showSearch: false
                })
            }, 300)
        }

        return (
            <span className='siyue-search'>
            <div className='siyue-search-input-wrap'>
            {DivList}
            <input type='text' placeholder='搜索' className='siyue-search-input' onChange={handChange}
            onKeyDown={onKeyDow} onBlur={inputOnBlur} />
            <button className='siyue-search-action' >
            <Icon type="search" />
            </button>
            </div>
            <div className='siyue-search-dropdown' style={{ display: self.state.showSearch ? 'block' : 'none' }}>
            {dropDownList}
            </div>
            </span>

        );
    }
}

registryWidget(SySearch);
export default SySearch;
