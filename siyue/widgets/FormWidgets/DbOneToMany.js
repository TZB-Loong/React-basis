// import { PropTypes } from 'react';
import PropTypes from 'prop-types';
import { Input, Checkbox, Select } from 'antd';
import createWidget from '../_createWidget';
import { registryFormWidget, registryWidget } from '../_widgets';
import { isfalse } from '../../utils';
import { store } from '../../midware'
const { TextArea } = Input

const children = [];

class Prompt extends React.Component {

    constructor(props) {  //组件初始化调用函数
        super(props);
        this.state = { //设置默认的状态值
            dataSource: [],
        }
    }

    render() {      //渲染时调用函数

        const props = { ...this.props }
      
        const valueChange = (value) => {
            
        }
        const getOptionList = function (rowObject) {
            var list = rowObject
            return list.map(item => {
                return <Option key={item} value={item} >{item}</Option>
            })

        }
        const children = getOptionList(props.data); //下拉列表中的Option
        const onSelect = () => {
            //每选中完一次调用一次这个函数
            props.show()
        }
        return (

            <Select
                mode="tags"
                style={{ width: '100%', border: 'none' }}
                onChange={valueChange}
                tokenSeparators={[',']}
                defaultValue={props.defaultValue}
                mode='tags'
                getPopupContainer={triggerNode => triggerNode.parentNode}
                dropdownStyle={{ display: props.isShow ? 'block' : 'none' }}
                onSelect={onSelect}
            >
                {children}
            </Select>
        )
    }

}


class DbOneToManyList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            Loading: true,
            data: [],
            overTime: '',
            ind: '',
            show: false
        }
    }


    static defaultProps = { //设置默认的pros的值
        things: [{ data: '预计完成日期', matter: '需要处理事件摘要', principal: '完成事项的人', endTime: '实际完成日期' }, { data: '2017-7-6', matter: '代办事件组件的编写', principal: 'TZB丶Loong', endTime: '2017-9-3' },
        { data: '2017-7-6', matter: '尽快完成erp', principal: 'TZB丶Loong', endTime: '2017-12-3' },
        { data: '2017-7-6', matter: '未完成事件一', principal: 'TZB丶Loong', endTime: '' },
        { data: '2017-7-6', matter: '未完成事件二', principal: 'TZB丶Loong', endTime: '' }],
        overThings: [{ data: '2017-7-6', matter: '代办事件组件的编写', principal: 'TZB丶Loong', endTime: '2017-9-3' },
        { data: '2017-7-6', matter: '尽快完成erp', principal: 'TZB丶Loong', endTime: '2017-12-3' },]
    }
    //对于时间的这块，是传过来，还是勾选之后自动获取，还是在勾选时可以选择性的编辑
    render() {
        var newProps = { ...this.props };
        var self = this;

        //获取当前系统时间函数
        const getNowFormatDate = () => {
            var date = new Date();
            var seperator1 = "-";
            var seperator2 = ":";
            var month = date.getMonth() + 1;
            var strDate = date.getDate();
            if (month >= 1 && month <= 9) {
                month = "0" + month;
            }
            if (strDate >= 0 && strDate <= 9) {
                strDate = "0" + strDate;
            }
            var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate

            return currentdate;
        }
        const getData = getNowFormatDate();

        const toggleOnClick = (e) => {
            console.log('checked = ', e.target.checked, e.target);

            //在这里重新写数据源的值 既然拿到了i的值，就可以回写到数据源
            if (e.target.checked) {
                newProps.things[self.state.ind].endTime = getData
            } else {
                newProps.things[self.state.ind].endTime = '未完成'

            }

        }

        //将修改状态show封装为函数，将函数传入select组件中去,使得可以改变父组件的状态
        const show = () => {
            self.setState({
                show: false
            })
        }


        const handleClick = (e) => {
            e.preventDefault();    // 阻止默认事件  
            e.stopPropagation(); //阻止冒泡事件

            e.target.onkeydown = function (event) {
                var e = event || window.event || arguments.callee.caller.arguments[0];
                if (e && e.keyCode == 16) {
                    //键盘监听事件，当按下shift时开始加载数据，请求数据，当然只是对这个数据开始加载，下一个待办事件的数据怎么处理？
                    //还是要通过shift来控制下拉表的显示框   
                    
                    if (isfalse(self.state.data)) {

                        self.setState({
                            data: ['王大', '王二', '王三', '王四']
                        })
                    }
                    self.setState({
                        show: true
                    })
                }
            }
        }



        const IClick = (i) => {
            //通过参数绑定传进来的，以便从数据源上进行修改
            //差最后一个数据绑定后调用commit函数了
            self.setState({
                ind: i
            })
        }
        const plainOptions = (list, overList) => {
            var newList = [], newOverList = []

            for (var j in overList) {
                newOverList.push(overList[j].matter)
            }
            return list.map((item, i) => {
                if (newProps.readOnly) {
                    return <Checkbox key={item.matter} disabled defaultChecked={newOverList.indexOf(item.matter) > -1 ? true : false} style={{ display: 'block', marginTop: '20px' }}  >
                        <span style={{ color: '#5E5E5E', cursor: 'default' }}> <span> {item.data} </span> <span>{item.matter}</span> <span >{item.principal}</span> <span>{item.endTime}</span></span> </Checkbox>
                } else {
                    return <div onClick={IClick.bind(this, i)} >
                        <Checkbox key={item.matter} value={item.data} defaultChecked={newOverList.indexOf(item.matter) > -1 ? true : false} onChange={toggleOnClick} style={{ display: 'block', marginTop: '20px' }}> <span> {item.data} </span> <span>{item.matter}</span> <div style={{ display: 'inline-block', border: 'none' }}
                            onClick={(e) => { handleClick(e) }} ><Prompt props={newProps.props} defaultValue={item.principal} data={self.state.data} show={show} isShow={self.state.show} /></div> <span>{item.endTime}</span> </Checkbox></div>
                }
            })
        }
        const getPainOptions = plainOptions(newProps.things, newProps.overThings);



        return (
            <div>
                <div style={{ borderBottom: '1px solid #E9E9E9' }}>
                    代办事件
                </div>
                <br/>
                    {getPainOptions}
            </div>
        );
    }
}

const WrappedDbInput = createWidget(DbOneToManyList);
const DbOneToMany = ({ field, props }) => {

    return (

        <WrappedDbInput defaultValue={isfalse(props['value']) ? '' : props['value']} props={props} />

    );
};

DbOneToMany.prototype.propTypes = {
    field: PropTypes.object,
    props: PropTypes.object,
};

registryFormWidget(DbOneToMany);
// registryFormWidget(DbOneToMany, 'one2many');
export default DbOneToMany;


