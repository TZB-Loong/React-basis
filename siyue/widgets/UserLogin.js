import {triggers} from '../midware';
import { Form, Icon, Input, Button, Checkbox ,Row, Col,Spin,Alert } from 'antd';
import styles from './UserLogin.css';
//const Form = antd.Form
import PropTypes from 'prop-types';
const FormItem = Form.Item;
// const PropTypes = React.PropTypes;
import {isfalse} from '../utils';
import lcs from '../utils/localStore';

const ProxyUserLogin = ({
    dispatch, userlogin,session,error,
    form: {
        getFieldDecorator,
        validateFieldsAndScroll,
        getFieldProps
    },
}) => {
    const  onLogin = function(data){
        data['rpc']= '1';
        data['csrf_token'] = session.csrf_token;
        data['redirect'] = '';
        if (isfalse(session.csrf_token)){
            triggers.SysInitialing.pull(data);
            triggers.SysInit.pull({db:data.db});
        }
        else {
          
            triggers.SysLogin.pull({db:data.db,login: data.login, password: data.password, csrf_token: session.csrf_token,rpc:1}  );
        }
    }
    const rememberUser =(data) =>{
      if(data.remember){
        let loginData = {};
        loginData.login = data.login;
        loginData.db = data.db;
        lcs.setObject("loginData",loginData);
      }else{
        lcs.removeItem("loginData");
      }
    }
    function handleSubmit () {
        validateFieldsAndScroll((errors, values) => {
            if (errors) {return}
            rememberUser(values);
            onLogin(values);
        });
    }

    if (session.state == 0) {
        triggers.SysLogin.pull({db:userlogin.db,login: userlogin.login, password: userlogin.password, csrf_token: session.csrf_token,rpc:1});
    }
    let errmsg = '';
    if (error.message){
        errmsg = error.message;
    } else if (userlogin.error) {
        errmsg = userlogin.error;
    }
    let loginid = userlogin.login ? userlogin.login :'';
    let loginData = lcs.getObject("loginData");
    let default_login = "";
    let default_db = "";
    if(loginData){
      default_login=loginData.login;
      default_db=loginData.db;
    }
    return (
        // <div>zji</div>
        <Row  className={styles.container} type="flex" justify="space-around" align="middle" >
        <Col span={6}>
        <Spin tip={"登录中..."} spinning={[-1,0,1,-7].indexOf(session.state)>=0} size="large">
        <form>
        <FormItem>
        {getFieldDecorator('login', {
            rules: [{ required: true, message: '帐号不能为空!' }],
            initialValue: default_login,
        })(
            <Input onPressEnter={handleSubmit} prefix={<Icon type="user" style={{ fontSize: 13 }} />}  placeholder="请输入帐号" />
        )}
        </FormItem>
        <FormItem>{getFieldDecorator('password', {
                rules: [{ required: true, message: '密码不能为空!' }],})
                (<Input onPressEnter={handleSubmit}  prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="请输入密码" />)}
        </FormItem>
        <FormItem>
            {getFieldDecorator('db', {
                rules: [{ required: true, message: '公司代号不能为空!' }],
                initialValue: default_db,
                })(
                    <Input onPressEnter={handleSubmit}  prefix={<Icon type="database" style={{ fontSize: 13 }} />}  placeholder="请输入公司代号" />
                )}
        </FormItem>
        <FormItem>
                {getFieldDecorator('remember',{
                    valuePropName: 'checked',
                    initialValue: true,
                })(<Checkbox>记住帐号</Checkbox>)}
                <Button type="primary" onClick={handleSubmit} className={styles.login_button}>登录</Button>
        </FormItem>
        </form>
        </Spin>
        </Col>
       </Row>
    );
 }

ProxyUserLogin.propTypes = {
    getFieldDecorator: PropTypes.func,
    getFieldProps: PropTypes.func,
    validateFieldsAndScroll: PropTypes.func,
    location: PropTypes.object,
    dispatch: PropTypes.func,
    userlogin:  PropTypes.object,
    session: PropTypes.object,
    error: PropTypes.any, //object,
};

const UserLogin = Form.create()(ProxyUserLogin);

export default  UserLogin;
