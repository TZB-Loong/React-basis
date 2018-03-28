var fetch = dvalib.fetch;

function parseJSON(response) {
  return response.json();
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export async function arequest(url, options) {

  options['redirect'] = 'manual';
  options['credentials'] = 'include'; //请求包含cokie
  options['mode'] = 'cors';
   
  const  response = await fetch(url, options);
  let data=0,success=false,error = '';
    try {
        checkStatus(response);
        var ct = response.headers.get("content-type");
        var len = response.headers.get("content-length");
        
        if (ct.indexOf('javascript') == -1 && len!="0") {
            data = await response.json();
        } else {
            data = await response.text();
        }
        success = true;
    } catch (e) {
        console.log('error', e);
        error = e;
    }
    
    const ret = {
        success,
        error,
        data,
        headers: {},
    };
    return ret;
}


export function srequest (url, options){
    options['redirect'] = 'manual';
    options['credentials'] = 'include'; //请求包含cokie
    options['mode'] = 'cors';

    var hd = new Headers();

    var opt = {
        method: 'GET',
        headers: hd,
        mode: 'cors',
        cache: 'default',
        ...options
    };
    let data=null,success=false,error = '',rp;
    return fetch(url,opt).then(function(response) {
        try {
            checkStatus(response);
            var ct = response.headers.get("content-type");
            var len = response.headers.get("content-length");
            if (ct.indexOf('javascript') == -1 && len!="0") {
                rp = response.json();
            } else {
                rp = response.text();
            }
            success = true;
        } catch (e) {
            console.log('error', e);
            error = e;
        }
        if (success){
            return rp.then(function(data){
                if (data.error){
                    error = data.error;
                    data = '';
                    success = false;
                }
                const ret = {
                    success,
                    error,
                    data,
                    headers: {},
                };
                return ret;
            });
        }
        const ret = {
            success,
            error,
            data,
            headers: {},
        };
        return ret;
    })
}

