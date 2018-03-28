
// import { PropTypes } from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';
import createWidget from '../_createWidget';
import { registryFormWidget, registryWidget } from '../_widgets';
import { isfalse } from '../../utils';
import { call_kw } from '../../midware/backend';
import {store}  from '../../midware';
// import '.././Form.css';
const Option = Select.Option;
class CusSelect extends React.Component {
  constructor(props) {
      super(props);
      this.city2code = {} // 名称和code转换，通过名称获取code
      this.state={
        options:[],
        value:[]
      };
    
  };

  getArea(domain=[]){
    /**
     * 后台获取城市数据
     */
    let self = this;
    let clearIndex = domain[0][2].indexOf("_") //排除_为00的值
    store.call_kw('chinacity.city','search_read',function(parms){
      call_kw(parms).then((ret)=> {
        if(ret.data.result){
          let options = [];
          for (let {code,name} of ret.data.result){
            if (code.substr(clearIndex,2) == '00'){
              continue;
            }else{
              self.city2code[name] = code;
              options.push(<Option key={name}>{name}</Option>);
            }
          }
          self.setState({options});
        }
    });
    },{args:[domain,["name",'code']]});
  }
  async getCode(vals){
    /*
    返回地区的数据库编码.
    当有地址有默认值时，首次加载city2code为空，需要从后台直接获取vals的code;
     parm: vals = '深圳市'
     return code='12132131' 
     */
    let self = this;
    let code = self.city2code[vals];
    if ( isfalse(code) ){
      await new Promise(function (resolve, reject) {

        store.call_kw('chinacity.city','search_read',async function(parms){
        await call_kw(parms).then((ret)=> {
          if(ret.data.result){
            code = ret.data.result[0]['code'];
          }
      });
      resolve('ok');
      },{args:[[['name','=',vals]],['code']]})});
    }
    return code;

  }
  async updateOptions(){
    /**
     * 根据value更新选项内容
     */
    let self = this;
    let value = isfalse(self.props.defaultValue) ? [] : self.props.defaultValue;
    if( value.length==0 ){
      self.getArea([['code','=like','__0000']]); // 结尾4个0表示省，2个00表示市
    }else if (value.length==1){
      let code = await self.getCode(value[0])
      let start= code.substring(0,2);
      self.getArea([['code','=like',`${start}__00`]]);
    }else if (value.length==2){
       let code = await self.getCode(value[1])
      let start= code.substring(0,4);
      self.getArea([['code','=like',`${start}__`]]);
    }else{
      self.setState({options:[]});
    };
  };
  render() {
    const self = this;
    var onValueChange = function(value){
      self.setState({value},function(){
        self.updateOptions(); 
      });
      let val = value.join(' ');
      self.props.onOk(val);
    }
    let onFocus = function(){
      self.updateOptions(); 
    }
    let vals = isfalse(this.props.defaultValue) ? [] : this.props.defaultValue;
    return(
      <Select 
      mode="tags"
      style={{ width: '100%' }}
      value={vals}
      disabled={self.props.readOnly} 
      onChange = {onValueChange}
      onFocus = {onFocus}
      >
      {this.state.options}
      </Select>
    )
  };
};
const WrappedDbAdress = createWidget(CusSelect);

const DbAdress = ({ field, props }) => {
  return(
    <WrappedDbAdress addonBefore={field.string} props={props} defaultValue={props.value?props.value.split(' '):null} />
  );
};

DbAdress.prototype.propTypes = {
  field: PropTypes.object,
  props: PropTypes.object,
};
registryFormWidget(DbAdress);
registryFormWidget(DbAdress, 'address');
export default DbAdress;
