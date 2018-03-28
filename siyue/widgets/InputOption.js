
// import { PropTypes } from 'react';
import PropTypes from 'prop-types';
import { Input, Select, Button } from 'antd';
import { store, triggers, apps } from '../midware'
import { isfalse, checkChain } from '../utils';
import Action from './Action';
import './InputOption.css'

const Option = Select.Option;

class InputOption extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            Loading: true,
            appends: [],
            list: null
        };
    }


    weight = (arr) => { //数组去重
        /*
        arr:要去重的数组
        */
        var dffLiChildren = [];
        for (var i in arr) {
            if (JSON.stringify(dffLiChildren).indexOf(JSON.stringify(arr[i])) == -1) {
                dffLiChildren.push(arr[i])
            }
        }
        return dffLiChildren;
    }



    render() {
        var { props, field } = this.props;
        var self = this;
        var isReadOnly = field.readonly || props.readOnly;
        var ds = store.getAppDatasource(props.appId, props.datasourceId);
        var mds = store.getAppDatasource(props.appId, props.masterDatasourceId);
        if (!isReadOnly && self.state.Loading == true) {
            ds.name_search(ds.props.domain, { name: '' });

            self.setState({
                Loading: !self.state.Loading

            })
        }

        const getOptionList = function (rowObject) {
            rowObject = isfalse(rowObject) ? {} : rowObject;
            var list = [...Object.values(rowObject), ...self.state.appends];
            return list.map(item => {
                return <Option key={item[0]} value={item}>{item[1]}</Option>
            })
        };


        const optionList = getOptionList(isfalse(self.state.list) ? ds.props.rows : self.state.list);   
       
        var Commit = function (props) {
            //BUG FIXED 提交会影响应所有相同modal名称的datasource dirty内容,不太确定是否是此组件引起 Mu 17/7/28 Fixed models/datasource.defaultDatasourceProps.dirty被作为全局变量重复使
            //提交的commit是有问题的,没有区分提交
            var vl = props.value ? props.value : props.defaultValue ? props.defaultValue : '';
            //    console.log('vl',vl)
            // if (vl != self.state.value) { // 过滤掉 当前选择的内容是已经选择过的内容 的情况
                var updater = {};
                //将非数据列表中的内容转为空白
                vl = ['-1', '-2'].indexOf(self.state.value) != -1 ? '' : self.state.id;
                updater[self.props.props.field.name] = vl;

                var modi = {
                    type: 'modi',
                    updater: updater
                };
                console.log('updater', updater)

                mds.commit(modi)
            // }
        };

        var onVaChange = function (evt, ...kws) {
            console.log(evt, 'evt+evt')
            if (evt != self.state.value) {
                self.setState({
                    value: evt,
                    id: evt[0]
                });

                Commit({ ...props, value: evt });
            }

        };

        var blur = function () {
            Commit(props);
        };

        var onCreate = function (evt) {
            const _callBack = (data) => {  //根据id查找对应的记录之后,执行的回调函数
                if (!isfalse(data.result.records[Object.keys(data.result.records)])) {

                    onVaChange([data.result.records[Object.keys(data.result.records)].id, data.result.records[Object.keys(data.result.records)].name]);


                    if (typeof ds.props.rows == 'object') {

                        var zList = [...Object.values(ds.props.rows)]
                        zList.push([data.result.records[Object.keys(data.result.records)].id, data.result.records[Object.keys(data.result.records)].name])

                        var pList = self.weight(zList);//数组去重

                        self.setState({  //更新这个数组(只做列表显示)
                            list: { ...Object.values(pList) }
                        })
                    }
                }
            }

            ds.search2(['id', 'name'], [['id', '=', evt.data.result]], {}, {}, 'ignore', _callBack);

        }

        var onCreateCancel = function () {

            var said = store.apps[props.appId].app.subApps.pop();
        }

        //如何将actionId传进来，在没有指定actionId时如何打开应用视图，执行model的fields_view_get方法返回默认的view
        //http://localhost:8069/web/dataset/call_kw/res.partner.title/fields_view_get
        //根据view Field options定义参数创建“搜索”及“新增”选项
        if (!props.options || props.options.no_search != true) {
            //显示“搜索”选项
            optionList.push((<Option key='-2' className="selectList_ExtOption"><Action type='views' rootAppId={props.appId} pane="搜索..." props={{ model: ds.props.model, views: ['search', 'list'] }} /></Option>));
        }
        if (!props.options || props.options.no_create != true) {
            //新增选项
            optionList.push((<Option key='-1' className="selectList_ExtOption"><Action type='view' pane="创建并编辑..." rootAppId={props.appId} props={{ model: ds.props.model, view: 'form', target: 'new', parentField: props.field, type: 'new' }} binds={{ onOk: onCreate, onClose: onCreateCancel }} /></Option>));
        }
        //BUG 当props.value为空值时显示内容没有显示为空,还是显示上一次选择的值    
        var dfv = this.state.value ? ["-1", "-2"].indexOf(this.state.value) == -1 ? this.state.value[1] : '' : isfalse(props.value) ? '' : props['value'][1];
        if (props.readOnly) {
            return (
                <Input value={dfv} style={{ border: 'none', borderBottom: '1px solid #EEEEEE' }} />
            )
        } else {
            return (
                <Select style={{ width: '100%' }} value={dfv} mode={this.props.mode ? this.props.mode : false} onChange={onVaChange} onBlur={blur} readOnly={props.readOnly ? true : false} >
                    {optionList}
                </Select>
            )
        }

    }

}

InputOption.formatter = (value, format) => {
    return isfalse(value) ? '' : value;
}

InputOption.prototype.propTypes = {
    field: PropTypes.object,
    props: PropTypes.object,

};
export default InputOption;
