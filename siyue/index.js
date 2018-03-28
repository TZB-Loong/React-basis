/*
   本文件属于“思悦ERP项目”软件组成内容，相关权利属于深圳市莱克斯瑞智能家居有限公司所有，
   并受中华人民共和国和相关国际版权条约、法律、法规，以及其它知识产权法律和条约的保护。
   具体权利声明请看“版权声明”或http://www.siyue.it/copyright。

   copyright 深圳市莱克斯瑞智能家居有限公司 2017
 */

import Widgets from './widgets';
import midware from './midware';
import utils from './utils';
import systate from './models/systate';

/*
   使用module.exports = {}方法导出模块
   
   这样的方式结合了 export与export default优点
   即可同时使用这样的方式导入模块
   import midware,{store} from './midware';
 */

const _globals = utils._globals
    
module.exports = {
    Widgets,
    midware,
    systate,
    utils,
    _globals
}
