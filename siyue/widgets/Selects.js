// import { PropTypes } from 'react';
import PropTypes from 'prop-types';
import { Tag, Input, Tooltip, Button, Select, Spin } from 'antd';
import createWidget from './_createWidget';
import { store } from '../midware'
import { registryFormWidget, registryWidget } from './_widgets';
import { isfalse } from '../utils';
import Action from './Action';
import './InputOption.css'
import './Form.css';


const Option = Select.Option; //采用蚂蚁金服中select选择器组件

class Selects extends React.Component {

    constructor(props) { //组件初始化是执行
        super(props);
        this.state = { Loading: true, appends: [] };
    }

    componentWillUpdate(newProps) {
        //组件传入新的props 时，清除前面的状态 并触发name_search（生命周期:props更新时执行  在render执行之前）
        //this.props 更新之前的props   this.state. 之前的状态]
        if (isfalse(this.props.resId) == false && newProps.resId != this.props.resId) {
            this.setState({
                appends: [],
                Loading: !this.state.Loading
            })
        }
    }
    render() {
        const newProps = { ...this.props };
            /*
        appId:应用空间id
        id:datasourceId
        defaultValue:父组件传过来的props.value
        resid:父组件 中props.resid
        field:父组件中 field
        addonBefore：field.string 
        */
        var self = this;
        var ds = store.getAppDatasource(newProps.appId, newProps.id)
        if (self.state.Loading == true) {
            ds.name_search(ds.props.domain, { name: '' });
            ds.setState('browse');
            self.setState({
                Loading: !self.state.Loading,
            })
        }
        var res = [], zres = [], defaultChildren = [];
        //console.log('selects',ds, ds.props.rows);
        
        res = isfalse(ds.props.rows) ? []: [...Object.values(ds.props.rows)]; //拿到你所请求的数据(对象转换为数组)
        if (isfalse(...self.state.appends) == false) {
            //当新增加标签时，更新保存数据的列表（res）使得下拉菜单中的内容与数据库一致
            for (var j in self.state.appends) { // 多次添加
                res.push(self.state.appends[j])
            }
        }
        const getOptionList = function (rowObject) {
            var list = rowObject
            return list.map(item => {
                return <Option key={item[1]} value={item} >{item[1]}</Option>
            })

        }
        const children = getOptionList(res); //下拉列表中的Option

        if (isfalse(newProps.defaultValue) == false) {
            //触发onChange函数时，经过onOk函数拼接，newProps.defaultValue由array[n]变成array[6,fase,array[n]]
            if (newProps.defaultValue[0][1] == false) {
                for (var z in res) {
                    for (var k in newProps.defaultValue[0][2]) {
                        if (res[z][0] == newProps.defaultValue[0][2][k]) {
                            zres.push(res[z])
                        }
                    }
                }
            } else {
                for (var z in res) {
                    //newProps.defaultValue是一个id数组，通过这些Id从res中取出相应的值并保存到一个zres数组内  
                    for (var k in newProps.defaultValue) {
                        if (res[z][0] == newProps.defaultValue[k]) {
                            zres.push(res[z])

                        }
                    }
                }

            }
        }
        if (isfalse(...self.state.appends) == false) {
            for (var j in self.state.appends) { // 多次添加
                zres.push(self.state.appends[j])
            }
            // 当值发生变化时，对正在显示的值也进行改变  通过改变zres来改变
        }
        for (var j in zres) {
            isfalse(zres[j][1]) ? '' :
                defaultChildren.push(zres[j])
        }
        const onCreate = function (evt) {
            var data = evt.data.data[0];
            var nid = data.result;
            var row = data.param.params.args[0]; //row 弹出框的input里面的value
            row.id = nid;
            var ostate = { ...self.state }
            if (isfalse(row.parent_id) == false) {
                //当在创建多级标签时，对ostate.value进行拼接
                for (var g in res) {
                    //根据row.parent_id 来获取到的数据（res）中取出对应的值
                    if (res[g][0] == row.parent_id) {
                        var parentValue = res[g][1]
                    }
                }
                ostate.value = [row.id, parentValue + '/' + row.name]
            } else {
                ostate.value = [row.id, row.name];
            }
            ostate.appends.push([...ostate.value])
            self.setState(ostate);
        }
        const onCreateCancel = function () {
            //当点击关闭按钮时，需要关闭的窗口的id
            var said = store.apps[newProps.appId].app.subApps.pop();
        }

        children.push((< Option key='-1' className="selectList_ExtOption"> < Action type='view' pane="创建并编辑..." rootAppId={newProps.appId} props={{ model: ds.props.model, view: 'form', target: 'new', parentField: newProps.field, type: 'new' }} binds={{ onOk: onCreate, onClose: onCreateCancel }} /></Option >))


        const onChange = function (value) {
            //对标签进行修改是触发的函数(此函数会触发两遍在onBlur时会再次触发)
            var lit = []
            for (var i in value) {
                //isfalse(value[i][0]) 判断传入的值是否为数
                if (typeof (value[i]) == 'string') {
                    if (isfalse(self.state.appends) == false) {
                        value[i] = self.state.appends[self.state.appends.length - 1] //将-1替换掉
                    } else {
                        delete value[i]
                    }
                } else {
                    isfalse(value[i][0]) ? '' : lit.push(value[i][0]);
                }
            }
            self.props.onOk([[6, false, lit]]) // 执行更新，更新到数据库
        }
        return (
                <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="Please select"
                    value={defaultChildren}
                    disabled={newProps.readOnly ? true : false}
                    allowClear='true'
                    onChange={onChange}
                    onBlur={onChange}>
                    {children}
                </Select> 
        );
    }
}


//Selects.formatter = (value, format) => {
    //console.log('select', value, format);
   // return isfalse(value)? '': value;
//}

Selects.prototype.propTypes = {
    addonBefore: PropTypes.string,
    props: PropTypes.object,
    defaultValue: PropTypes.array,
    appId: PropTypes.string,
    id: PropTypes.string
};
export default Selects;
