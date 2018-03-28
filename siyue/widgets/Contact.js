import {  Component } from 'react';
import PropTypes from 'prop-types';
import SyList from "./SyList";  //列表下滑的的基础组件
import {
    registryWidget,
    widgets,
    TreeWidgets,
    FormWidgets,
    KanbanWidgets,
    registryFormWidget,
    registryTreeWidget,
    registryKanbanWidget
} from './_widgets';
import { store, apps } from '../midware';
import { Icon, Popover, message, Tooltip } from 'antd';
import createWidget from './_createWidget';
import { isfalse } from '../utils';
import Action from './Action';
import './Contact.css';

class CusContact extends Component {
    constructor(props) {
        super(props);
        let self = this;
        self.fields = [];
        self.state = {
            visible: false,  //控制冒泡卡片显示
            newDs:null,  //在卡片内显示的内容
            recId:null,
            newdata:false
        };
        props.props.children.map(child => {
            if (child.type.name === 'Field') {
                self.fields.push(child.props);
            }
        })
    }

    //是不是需要做一个状态的清理?
    componentDidUpdate(newPoprs){

        //解决状态遗留问题
        if(!isfalse(newPoprs.props.resId)&&newPoprs.props.resId !=this.props.props.resId ){
              this.setState({
                visible: false,  //控制冒泡卡片显示
                newDs:null,  //在卡片内显示的内容
                recId:null,
                newdata:false
              })  
        }

    


    }


    render() {
        var self = this;
        var datasource = store.getAppDatasource(self.props.props.appId, self.props.props.datasourceId);
        var list = isfalse(datasource.props.rows) ? [] : [...Object.values(datasource.props.rows)];

       
        const onCreate = function (evt) { //弹出框确定按钮响应事件
            

            var data = evt.data
            var modi = {
                type: 'modi',
                updater: data
            }
            var nid = isfalse(self.state.recId) && !isfalse(list) ? list[0].id : self.state.recId
            modi.updater.id = nid;
            datasource.goto({id:nid})
        
            if(  self.state.newdata&&Object.keys(evt.data).indexOf('name')==-1){ //新增为空时 
              
                datasource.remove([datasource.props.rowsKeys[datasource.props.rowsKeys.length-1]])
                alert('name is null ')
            }else{

                datasource.commit(modi);
            }
            self.setState({  //区分新增与编辑
                newdata:false
            })

        };

        const onCreateCancel = function () {  //关闭弹出框(子应用)响应事件
            var said = store.apps[self.props.props.appId].app.subApps.pop();
            if(self.state.newdata){
                datasource.remove([datasource.props.rowsKeys[datasource.props.rowsKeys.length-1]])
            }
        };


        const openView = (rowid) => {  //打开弹出框(子应用) //响应函数 (双击)
            self.setState({ //关闭信息展示窗口
                visible: false,
                recId:rowid
            });
            clearTimeout(t);  //清除掉延迟开发

            /*
            apps.cereateApp((type, rootAppId, pane, props, binds )
            具体参数说明参考 ModalApp.js 中ModalApp
            */
           
            //当有id值传进来时,编辑id对应的记录  当无id值传进来时,新增
            var sapp = store.apps[store.apps[self.props.props.appId].app.subApps.length - 1];

            if (isfalse(rowid)) {  //创建编辑及新增 

                self.setState({
                    newdata:true
                })

                datasource.create();
                var binds = { onOk: onCreate, onClose: onCreateCancel };
                var rootAppId = self.props.props.appId;
                var _props = { model: datasource.props.model, view: 'form', target: 'new', parentField: self.props.field, type: 'new' };
                var rapp = apps.getApp(rootAppId);
                var sapp = apps.getApp(rapp.props.subApps.length - 1);  //这个会覆盖点前面的内容
                this.setState({ current: list.length, recId: datasource.props.currentId });
                if (isfalse(sapp) || (sapp && sapp.props.state != 'creating')) {
                    apps.createApp('view', rootAppId, _props, binds);
                }
            } else { //修改编辑当前记录
             
                if (isfalse(sapp) || (sapp && sapp.app.state != 'creating')) {
                    apps.createApp('views', self.props.props.appId, { model: datasource.props.model, view: 'form', target: 'new', parentField: self.props.props.field, type: 'modi', recId: rowid }, { onOk: onCreate, onClose: onCreateCancel })
                }
            }
        };



        var t ; //单击，双击的标识
        const handOnOk = (row, newProps) => {  //单击(是卡片的详细信息)
            //使用延迟settimeOut,对单击双击函数进行区分          
          
            const change = () => {
            
                //首先这条记录是可以从dataSources上面直接获取到的
    
                //首先这是从后台获取到的数据(那么在新增的时候就会发生错误)
                // dds.read(row, dds.props.field, dds.props.domain, {}, {}, 'replace');
                var dds = {...datasource.props.rows[row]}
               
                //在只读的状态下,读取对应的记录信息 flush='replace' 是覆盖原来的内容
                self.setState({
                    newDs:dds,
                    visible: true
                });
            }

            clearTimeout(t);  //清除延迟触发的函数效果
            if (self.props.readOnly) { //当为只读的状态下是,直接执行函数
                change();
            } else {
                t = setTimeout(() => { //当为编辑状态下,延迟触发,以免双击函数重复触发
                    change();
                }, 300)
            }
        };



        const cardContent = () => {  //只读装态下,点击弹出卡片内容
            var cardList = ['name', 'mobile', 'phone', 'street', 'title', 'company_id', 'function'];
          
            if (!isfalse(self.state.newDs)) {
                
                var field = datasource.fields;  //使用的数据源是新建数据源,避免数据混乱影响
               
                return (<ul>
                    {cardList.map(item => {
                        return (
                            <li key={item}> {field[item].string} :{self.state.newDs[item]}</li>
                        )
                    })}
                </ul>);
            };
        };


        const cardOption = cardContent();

        const iconOnClick = (rowid, e) => {   //删除响应事件

            e.preventDefault();    // 阻止默认事件
            e.stopPropagation(); //阻止冒泡事件

            self.setState({
                visible: false
            });

            datasource.remove([rowid]);  //先使用remove从本地进行删除,之后使用apps.save 进行统一删除
        };

        const options = () => {
            //主体显示内容(self.props.readOnly 对象当前的显示状态  )
            return datasource.props.rowsKeys.map((rowid, i) => {
                let row = datasource.props.rows[rowid];
                return (
                    <span className={self.props.readOnly ? 'contactBox' : 'edit-contactBox'}
                        onClick={handOnOk.bind(this, row.id, self.fields['0'].props)} onDoubleClick={self.props.readOnly ? '' : openView.bind(this, row.id)}>

                        {self.fields.map(field => {
                            if (field['icon']&&!isfalse(row[field['name']])) {
                                return (
                                    <span className={'field field_' + field['name']}>
                                        <Icon type={field['icon']} />
                                        {row[field['name']]}
                                    </span>
                                )
                            } else {
                                return (
                                    <span className={'field field_' + field['name']}>
                                        {row[field['name']]}
                                    </span>
                                )
                            }
                        })}

                        {self.props.readOnly ? '' :
                            <span className='span-icon'>
                                <Icon type='close-circle' onClick={iconOnClick.bind(this, rowid)} style={{ color: '#ADAAAA' }} />
                            </span>
                        }
                    </span>
                )
            })
        };

        const listOption = options(); //数据加载完成需要一定的时间,在前面的一段时间会有空白时间段

        const mouseleaveing = () => { //鼠标移出响应事件(鼠标移出是,关闭信息展示卡片)
            self.setState({
                visible: false
            });
        };


        if (!self.props.readOnly) {  //添加创建并编辑按钮 (Action 自定义组件)
            listOption.push(<span className={self.props.readOnly ? 'contactBox' : 'edit-contactBox'} onClick={openView.bind(this, null)}>创建并编辑...</span>);
        };

        //Popover参数说明详见蚂蚁金服(Popover组件)  //每个标签对应每个的内容
        return (
            <div className={self.props.readOnly ? 'contact' : 'edit-contact'} onMouseLeave={mouseleaveing}>
                <Popover content={cardOption} title={self.props.field.string}
                    trigger="click"
                    visible={self.state.visible}
                    placement="topLeft"
                    arrowPointAtCenter
                >
                    {listOption}
                </Popover>
            </div>
        );

    };
};

const WrappeContact = createWidget(CusContact);

const Contact = ({ field, props }) => {
    return (
        <WrappeContact addonBefore={field.string} props={props} />
    );
};

Contact.prototype.propTypes = {
    field: PropTypes.object,
    props: PropTypes.object,
};

widgets.registry(Contact);
export default Contact;
