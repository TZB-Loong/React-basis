const xurlform = function(params) {
    return Object.keys(params) .map(key=>encodeURIComponent(key)+'='+encodeURIComponent(params[key])) .join('&');
};

const stopEventPropagate = function(event){
    event = event || window.event;  //用于IE  
    if(event.preventDefault) event.preventDefault();  //标准技术  
    if(event.returnValue) event.returnValue = false;  //IE  
    return false;
}

const url2params = function(urlstr){
    var u = decodeURIComponent(urlstr);
    var args = {};
    var item = null;
    urlstr.split("&").map(itm => {
        item = itm.split('=');
        args[item[0]?item[0]:''] = item[1] ? decodeURIComponent(item[1] ): "";
    });
    delete args[''];
    return args;
};

const isfalse = function(param) {
    let r = ['',undefined,null,false,0,].indexOf(param)>=0;
    if (r === false ) {
        if(param.length === 0){  
            // if (typeof param=='function'){ 
            //     r = false;
            // }
            // else if  ( param.length === 0 ){
            r = true;
        } else if (param.construtor){
            r = Object.keys(param).length === 0  ;
        } else if (typeof param == 'object'){
            r = Object.keys(param).length === 0  ;
        }
    }
    return r;
};

const checkChain = function(){
    var chn;
    for(var i = 0;i<arguments.length;i++){
        chn = arguments[i];
        if (typeof chn == 'function'){
            chn = chn();
        }
        if (!isfalse(chn)){
            return chn;
        }
    }
    return '';
}

var _fieldFalseValueMap = {
    'char':'',
    'boolean':false,
    'datetime':0,
    'date':0,
    'integer':0,
    'float':0.0,
    'text':'',
    'html':'',
    'many2many':[],
    'many2one':[],
    'one2many':[],
    
};

const fieldFalseValue = function(fieldtype){
    /*获取字段类型对应的空值内容
     */
    return _fieldFalseValueMap[fieldtype];
}

const CallableObject = function(caller){
    const __call__ = caller;
    __call__.proto=CallableObject.prototype;
    return __call__;
};
CallableObject.prototype = Object.create(Function.prototype);

var globalMouseDrop = function(){};
globalMouseDrop.prototype.mouseDrop = null;
globalMouseDrop.bind = function(doMouseDrop){
    globalMouseDrop.prototype.mouseDrop = doMouseDrop;
}
globalMouseDrop.unbind = function(){
    globalMouseDrop.prototype.mouseDrop = null;
}
Object.defineProperty(globalMouseDrop, 'isBound', { get: function () { return globalMouseDrop.prototype.mouseDrop!=null } });
Object.defineProperty(globalMouseDrop, 'pull', { get: function () { return globalMouseDrop.prototype.mouseDrop } });


//Siyue全局变量管理
const _globals = function(){return _globals.prototype._env};
_globals.prototype._env={'apps':{'newAppIds':[]}};

Object.defineProperty(_globals, 'env', {get:function(){
    return _globals.prototype._env;
}})

Object.defineProperty(_globals, 'apps', {get:function(){
    return _globals.prototype._env['apps'];
}})

_globals.get = function(){
    /*
       按指定参数获取内容
       使用默认参数列表进行逐步读取
     */
    var env =  _globals.prototype._env;
    for(var i=0;i<arguments.length;i++){
        env = env[arguments[i]]
    }
    return env;
}

_globals.getDefault = function(item,value=null){
    /*
       按指定参数获取内容
       使用默认参数列表进行逐步读取
     */
    if (typeof _globals.prototype._env[item] == 'undefined'){
	_globals.prototype._env[item] = value
    } else {
	value = _globals.prototype._env[item];
    }
    return value;
}

_globals.set = function(){
    /*
       按指定参数获取内容
       使用默认参数列表进行逐步读取
     */
    var env =  _globals.prototype._env;
    var value = arguments[arguments.length-1]
    var key = arguments[arguments.length-2]
    for (var i =0;i<arguments.length-2;i++){
        env = env[arguments[i]];
    }
    env[key] = value;
}

_globals.remove = function(){
    /*
       按指定参数获取内容
       使用默认参数列表进行逐步读取
     */
    var env =  _globals.prototype._env;
    var key = arguments[arguments.length-1]
    for (var i =0;i<arguments.length-1;i++){
        env = env[arguments[i]];
    }
    delete env[key];
}

const createRegistry = function(){
    /*创建注册器
     */
    var registryFactory = function(){};
    registryFactory.prototype._entries={};
    registryFactory.registry=function(entry,name='', props={}){
        /*注册对象
           注册后就可以通过import注册器进行全局来访问已注册对象.

           |---|---|---|---|---|
           |名称|类型|说明|默认值|是否必须|
           |entry|function/object|需要注册的对象或方法|无|是|
           |name|string|注册后使用指定的name来访问entry,没指定时会自动使用entry对应的名称进行访问|''|否|
           |props|object|指定额外的属性,指定props后,返回的是一个对象{'entry':entry, 'props': props}|{}|否|
           
         */
        
        name = isfalse(name)?  entry.name : name;
        if (isfalse(name)){
            name = Object(entry).prototype.constructor.displayName;
        }

        if(!isfalse(props)){
            entry = {'entry': entry, 'props': props}
        }
        
        if (isfalse(registryFactory.prototype._entries[name])){
            registryFactory.prototype._entries[name]=entry;
            Object.defineProperty(registryFactory, name, { get: function () { return registryFactory.prototype._entries[name]; } });
        }
    }
    return registryFactory;
}


module.exports = {
    xurlform,
    url2params,
    isfalse,
    CallableObject,
    globalMouseDrop,
    checkChain,
    _globals,
    fieldFalseValue,
    stopEventPropagate,
    createRegistry,
}
