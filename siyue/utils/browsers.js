
function get_browser() {
    var ua=navigator.userAgent.toLowerCase(),tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []; 
    if(/trident/i.test(M[1])){
        tem=/\brv[ :]+(\d+)/g.exec(ua) || []; 
        return {name:'ie',version:(tem[1]||'')};
    }   
    if(M[1]==='chrome'){
        tem=ua.match(/\bopr|edge\/(\d+)/)
        if(tem!=null)   {return {name:'opera', version:tem[1]};}
    }   
    M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
    return {
        name: M[0],
        version: M[1]
    };
}

let _brs = get_browser();
_brs.version = _brs.version==''? 0 : parseFloat(_brs.version);
const browsers = {..._brs, ...{is_firefox: _brs.name=='firefox',
                        is_ie: _brs.name=='ie',
                        is_edge: _brs.name=='edge',
                        is_chrome: _brs.name=='chrome',
                        is_opera: _brs.name=='opera',
                        is_safari: _brs.name=='safari',}};

export default browsers;
