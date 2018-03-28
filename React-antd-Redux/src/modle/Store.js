import { createStore, applyMiddleware, combineReducers, bindActionCreators } from 'redux';
import thunk from 'redux-thunk';
import *as Reduxs from '../Redux';
import *as actions from '../Action';
import { createLogger } from 'redux-logger'
import Login from '../Redux/Login';
import { create } from 'domain';
import reduxPromiseMiddleware from 'redux-promise'; //也是中间件

var store = {}
const logger = createLogger({  //创建日志中间件
	predicate: (getState, action) => false,
	collapsed: true,
	duration: true,
  colors: {
    prevState: () => `#FFEB3B`,
    nextState: () => `#4CAF50`,
  },
  diff: true,
});

const Redux = combineReducers(Reduxs); 
const configStore = applyMiddleware(thunk,reduxPromiseMiddleware,logger)(createStore) //这个是引入中间件
export default  store = configStore(Redux,window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()); //与redux的工具进行连接(失败)

//这个会把allActions 与dispatch 全部绑定成一个函数,可供直接调用
const Allactions =  bindActionCreators(actions, store.dispatch)

console.log( Allactions,'all- actions')

// module.exports = store;
store.getLogin=()=>{

  Allactions.getLogin_data()

}
