import { srequest, arequest,xurlform } from '../utils';

export async function syimport (params){
  
    var {module_name,version,config} = params;
    var cfg = Object.assign({},config);
    var fn = wpimport.findPath(module_name, version, cfg);

    var m = wpimport.prototype._modules[module_name];
    m = m==undefined ?  wpimport.prototype._modules[fn] : m;
    m = m==undefined ?  null : m;
    if (!m) {
        var rp = await arequest(fn,{
            method:'get',
        });
        if (rp.success){
            m = rp.data ? wpimport.exec(rp.data, module_name, fn) : false;
        }
    }
    return m
}


export async function modelSearch (params) {


    return arequest(params.url,{
        method:'post',
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(params.param)
    });
}


export async function call_kw (params) {

    return arequest(params.url,{
        method:'post',
        headers: {
            "Content-Type": 'application/json'
        },

        body: JSON.stringify(params.param)
    });
}

export function scall_kw (params) {

    return srequest(params.url,{
        method:'post',
        headers: {
            "Content-Type": 'application/json'
        },

        body: JSON.stringify(params.param)
    });
}



export async function actionLoad (params) {

    return arequest('/web/action/load',{
        method:'post',
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(params.param)
    });
}



export async function login (params) {
    return arequest( '/web/login',{
        method: 'post',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        },
        body: xurlform(params)
    })
}


export async function init (params) {
    //必须指定初始化的数据库params.db，否则会出错
    return arequest('/web/database/selector?rpc=1&db='+params['db'],{
        method: 'get',
    });
}


export async function logout (params) {
    return arequest('/web/session/logout?rpc=1',{
        method: 'get',
    })
}

export async function userInfo (params) {
    return arequest({
    url: '/api/userInfo',
    method: 'get',
    data: params,
  })
}

module.exports = {
    modelSearch,
    call_kw,
    scall_kw,
    init,
    login,
    logout,
    userInfo,
    actionLoad,
    syimport
}
