// import { PropTypes } from 'react';
import PropTypes from 'prop-types';
import { Input, Steps, Button, Modal,Tooltip } from 'antd';
import createWidget from '../_createWidget';
import { registryFormWidget, registryWidget } from '../_widgets';
import { isfalse } from '../../utils';
import { store, apps } from '../../midware';
import Action from '../Action';
import {image_tag, renderMarkdown, mention_tag, video_tag, todo_tag} from '../../utils/markdown';
import '../SyTodoItem.css'
import '../siyue.css'
import './DbActivityLog.css'

const Step = Steps.Step
const steps = [];

const  getUserInfo = ()=>{
    return SiYue.systate.state.userlogin.userInfo[0];
}

class GetStep extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 0,
            perform: 0,
            changeButton: 0,
            Loading: true,
            recId: '',
            dataSource: '',
            markdownObjects: {},
            updatedMarkdown: false,
        }

        var app = apps.getApp(props.props.appId);
        //app.bind('onBeforeSave', this.onBeforeSave);
        this._AttachmentDs = store.registryDatasource(props.props.appId, 'ir.attachment', {datasourceId: 'ir_attachment_backend'});
        this._TodoDs = store.registryDatasource(props.props.appId, 'todo.todo', {datasourceId: 'todo_todo_backend'});
    }

    loadTodo = (todo_id)=>{
        /*根据id加载待办事项内容
           返回Promise对象
         */
        var prm = new Promise((resolve, reject)=>{
            var afterload = (data)=>{
                resolve(data);
            };
            this._TodoDs.read([todo_id], 'id,name,state,start_datetime,end_datetime,handler_id,attendee_ids,progress'.split(','), {}, {}, {}, 'ignore', afterload, {});
        })
        return prm;
    }
    
    mentions = (mention_text_list)=>{
        /*文本内容转为联系人对象列表*/
        var mns={};
        mention_text_list.map(mn => {
            mn = mn.match(/\([\d\D]*?\)/);
            mn = py.eval(mn[0]);
            mns[mn[0]] = mn;
        });
        return mns;
    }

    images = (image_text_list)=>{
        /*将图片状态文本列表转为图片状态对象列表*/
        var imgs = {}, img,ismodi;
        image_text_list.map(imgtxt=>{
            img = imgtxt.match(/\s+\w+?\]/);
            img = img[0].substring(0, img[0].length-1);
            ismodi = img.indexOf('*')!=-1
            img = img.replace('*', '');
            imgs[img] = {raw: imgtxt, isnew: img.indexOf('NEW')!=-1, ismodi: ismodi}
        });
        return imgs;
    }

    videos = (video_text_list)=>{
        /*将视频状态文本列表转为视频状态对象列表*/
        
        var vd, vds={}, ismodi;
        video_text_list.map(vdtxt=>{
            vd = vdtxt.split(' ')[1];//
            vd = vd.substr(0, vd.length-1);
            ismodi = vd.indexOf('*')!=-1
            vd = vd.replace('*', '');
            vds[vd] = {raw: vdtxt, isnew: vd.indexOf('NEW')!=-1, ismodi: ismodi}
        });
        return vds;
    }

    todos = (todo_text_list)=>{
        /*将待办事项状态文本列表转为待办事项状态对象列表*/
        var td, tds={}, ismodi;
        todo_text_list.map(tdtxt=>{
            td = tdtxt.split(' ')[1];//
            td = td.substr(0, td.length-1);
            ismodi = td.indexOf('*')!=-1
            td = td.replace('*', '');
            tds[td] = {raw: tdtxt, isnew: td.indexOf('NEW')!=-1, ismodi: ismodi}
        });
        return tds;
    }

    markdownObjectState = (markdown_text)=>{
        /*提取markdown文本中图片/视频/联系人/待办事项等对象状态
           返回对象id与id状态的对象

           待办事项的联系人暂时不更新到线索的联系人中
         */
        var mktxt = markdown_text, mns=false, mdObjs={}, imgs=false, vds=false, tds=false, ads=false;
        if (!isfalse(mktxt)){
            mns = mktxt.match(/@\[mention[\d\D]*?\]\([\d\D]*?\)/g);//mention_tag.pattern);
            imgs = mktxt.match(/!\[[\d\D]*?\]/g);
            vds = mktxt.match(/@\[video[\d\D]*?\]/g);
            ads = mktxt.match(/@\[audio[\d\D]*?\]/g);
            tds = mktxt.match(/@\[todo[\d\D]*?\]/g);
        }
        if (!isfalse(mns)){
            mdObjs.mentions = this.mentions(mns);
        }
        if (!isfalse(imgs)){
            mdObjs.images = this.images(imgs);
        }
        if (!isfalse(vds)){
            mdObjs.videos = this.videos(vds);
        }
        if (!isfalse(tds)){
            mdObjs.todos = this.todos(tds);
        }

        return mdObjs;
    }
    
    componentWillUpdate(newProps) {
        //当组件的传入的resId发生变化时(进入下一页的时候),手动清除掉之前的状态
        if (isfalse(this.props.props.resId) == false && newProps.props.resId != this.props.props.resId) {
            this.setState({
                current: 0,
                perform: 0,
                changeButton: 0,
                Loading: true,
                recId: '',
                dataSource: ''
            })
        } else{
            var nvs = JSON.stringify(newProps.value.sort())
            var vl = isfalse(this.props.value)? []: this.props.value;
            var vls = JSON.stringify(vl.sort())
            if (nvs!=vls){
                //活动记录id发生变化
                var ds = store.getAppDatasource(this.props.props.appId, this.props.props.datasourceId);
                if (Object.keys(ds.props.dirty).length==0){
                    //dirty下没有内容,重新获取活动记录内容
                    var sdvs = JSON.stringify(Object.keys(ds.props.rows).sort());
                    if (nvs!=sdvs){
                        ds.search2([], [['id', 'in', newProps.value]]);
                    }
                }
            }
        }
    }
    
    render() {
        var self = this;
        var props = { ...this.props };
        var ds = store.getAppDatasource(this.props.props.appId, this.props.props.datasourceId);
        var mds = store.getAppDatasource(props.props.appId, ds.props.master);
        var list = isfalse(ds.props.rows)? []: [...Object.values(ds.props.rows)]; //将ds转换为数组进行遍历

        const detele = () => {
            //删除就是需要定位到哪一条,然后删除,数据源上的删除,和显示上的删除
            console.log('删除一天记录,在显示方面也删除一条记录')
        }

        const handleOnclick = (i, item) => {
            //将点击的第几行进行传入,便于指定删除的记录,指定修改的记录
            ds.goto({ id: item.id });
            self.setState({
                current: i,
                recId: item.id
            })
        }

        const refn = (e) => { //用函数的方式来接收ref
            
            if (!isfalse(e)) {
                var i = parseInt(e.attributes['data-item'].value);
                if (!isfalse(list[i])) { 
                    e.innerHTML = isfalse(list[i].note) ? '<p><br></p>' : list[i].note;
                }
            }
        }

        const onCreate = function (evt) { //数据写入成功后触发的函数
            var data = evt.data, md_objs={};
            var nid = isfalse(self.state.recId) && !isfalse(list) ? list[0].id : self.state.recId;
            //执行commit把数据回写到对应记录的dirty空间中去
            var modi = {
                type: nid.indexOf==undefined?'modi': nid.indexOf('NEW')==-1? 'modi': 'new',
                updater: data
            }
            var mids = [];
            if (mds.props.currentRow.mention_ids){
                mids = [...mds.props.currentRow.mention_ids];
            }
            if(!isfalse(evt.data.note)){
                /* 将线索活动记录中提及的联系人更新到"关联联系人"中
                 * 由于当前编辑的记录可能只是部份联系人,不能全部替换"关联联系人"中的内容
                   只能对"关联联系人"内容进行增加,不能删除,如果要删除需要用户手动删除
                 * */
                md_objs = self.markdownObjectState(evt.data.note);
                if(!isfalse(md_objs.mentions)){
                    Object.keys(md_objs.mentions).map(mid=>{
                        mid = parseInt(mid);
                        if(mids.indexOf(mid)==-1){
                            mids.push(mid);
                        }
                    });
                    
                    mds.commit({type:'edit', updater: {mention_ids: mids}});
                }
            }
            
            modi.updater.id = nid;
            ds.commit(modi);
            var crow = isfalse(list[self.state.current]) ? {} : list[self.state.current];
            var zData = Object.assign(crow, evt.data);
            //Object.assgin(object1,object2) 将两个对象(可以是多个对象源)进行合并,object2的值将会覆盖到object1中,并返回object1
            self.setState({
                dataSource: zData
            })
        }

        const handleNewClick = () => {
            //增加活动记录
            ds.create();
            var binds = { onOk: onCreate}; //, onClose: onCreateCancel };
            var rootAppId = props.props.appId;
            var _props = { model: ds.props.model, view: 'form', target: 'new', parentField: props.field, type: 'new' };
            var rapp = apps.getApp(rootAppId);
            var sapp = apps.getApp(rapp.props.subApps.length - 1);
            this.setState({ current: list.length, recId: ds.props.currentId });
            if (isfalse(sapp) || (sapp && sapp.props.state != 'creating')) {
                apps.createApp('view', rootAppId, _props, binds);
            }
        }

        const handleModi = (evt) => {
            //最后一个应用状态处于creating时不能再创建一个子应用

            var binds = { onOk: onCreate}; // , onClose: onCreateCancel }
            var rootAppId = props.props.appId;
            var rid = isfalse(self.state.recId) && !isfalse(list) ? list[0].id : self.state.recId;
            self.state.recId = rid;
            if (!isfalse(ds.props.dirty[rid])) {
                rid = list[self.state.current];
            }

            var _props = { model: ds.props.model, view: 'form', target: 'new', parentField: props.field, type: 'modi', recId: rid };
            var rapp = apps.getApp(rootAppId);
            var sapp = apps.getApp(rapp.props.subApps.length - 1);
            if (isfalse(sapp) || (sapp && sapp.props.state != 'creating')) {
                //进入编辑状态前提取相关对象状态
                
                if (rid){
                    if (this.state.markdownObjects[self.state.recId]==undefined){
                        this.state.markdownObjects[self.state.recId] = this.markdownObjectState(ds.props.rows[self.state.recId].note);
                    }
                    apps.createApp('view', rootAppId, _props, binds)
                }
            }
        }


        //点击删除指定的记录
        const handleDelete = () => {
            ds.remove([self.state.recId])   //删除指定的记录 ,功能还未实现

        }

        var readChage = self.state.perform != 0 || self.state.changeButton != 0

        if (!isfalse(self.state.dataSource)) {
            list[self.state.current] = self.state.dataSource  //在进行修改时,将合并好的数据替换掉前面的数据
            delete self.state.dataSource  //在替换渲染之后,删除点合并好的数据,只改变当前选择的记录
        }

        const avatar = (uid)=>{
            var avatar = '/web/image?model=res.users&field=image_small&id='+uid;
            return <img className="siyue-activity-log-avatar img-circle"  src={avatar}/>
        }

        const genTitle = (props) => {

            const doModify = (evt)=>{
                self.state.recId = props.id;
                ds.goto({id: props.id});
                handleModi()
            }

            const doDelete = (evt)=>{
                self.state.recId = props.id;
                ds.goto({id: props.id});
                handleDelete()
            }
            
            return <span className="siyue-activity-log-title">
            <span ></span>
            <span style={{ 'padding-left': '15px' }}>{isfalse(props.write_date) ? '' : props.write_date}</span>
            <div style={{marginLeft:5, display: this.props.readOnly?'none': 'inline-block'}}>
            <Tooltip placement="bottom" title="修改">
            <Button icon='edit' onClick={doModify}/>
            </Tooltip>
            <Tooltip placement="bottom" title="删除">
            <Button icon='delete' onClick={doDelete}/>
            </Tooltip>
            </div>
            </span>
            
        };

        return (<div  className="siyue-activity-log-frame">
            <div className="siyue-activity-log-action-bar" style={{ marginBottom: 20, marginLeft:-5, display: props.readOnly ? 'none' : 'block' }}>
            <Tooltip placement="right" title="新增活动记录" defaultVisible={true}>
            <Button className="siyue-activity-log-new" icon="file" onClick={handleNewClick} />
            </Tooltip>
            </div>
            <Steps current={self.state.current} direction="vertical" size="small" >
            {
                list.map((item, i) => {
                    var wdate = isfalse(item.write_date) ? '' : item.write_date;
                    var html = isfalse(item.note)? '': item.note.replace(/(^\<p[\d\D]*?\>)|(\<\/p\>$)/g,'');
                    if(item.create_uid==undefined){
                        var uinfo = getUserInfo();
                        item.create_uid = [uinfo.id, uinfo.name];
                    }
                    return <Step key={item.id}
                    icon={avatar(item.create_uid[0])}
                    title={genTitle(item)}
                    description={
                        <div className="siyue-activity-log-note">
                        {renderMarkdown(html, {SyTodoItem:{readOnly:true, onReLoad: this.loadTodo}})}
                        </div>
                    }
                    onClick={handleOnclick.bind(this, i, item)} />
                })
            }
            </Steps>
            </div>)
    }
}

const WrappedDbInput = createWidget(GetStep);

const DbActivityLog = ({ field, props }) => {
    return (
        <WrappedDbInput defaultValue={isfalse(props['value']) ? '' : props['value']} props={props} field={field} />
    );
};

DbActivityLog.prototype.propTypes = {
    field: PropTypes.object,
    props: PropTypes.object,
};

registryFormWidget(DbActivityLog);
registryFormWidget(DbActivityLog, 'DbActivityLog');
export default DbActivityLog;

