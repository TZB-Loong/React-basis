/*
本文件属于“思悦ERP项目”软件组成内容，相关权利属于深圳市莱克斯瑞智能家居有限公司所有，
并受中华人民共和国和相关国际版权条约、法律、法规，以及其它知识产权法律和条约的保护。
具体权利声明请看“版权声明”或http://www.siyue.it/copyright。

copyright 深圳市莱克斯瑞智能家居有限公司 2017
*/

import localStore from './localStore';
import {arequest, srequest} from './request';

import {xurlform,url2params,isfalse,CallableObject,globalMouseDrop,checkChain,_globals, fieldFalseValue, stopEventPropagate} from './_utils';
import {createReactDom, getCaretPosition, getRectLocation, setCaretPosition, clearCaretSelection} from './domUtils';
import browsers from './browsers';

//python常量定义
window.True = true;
window.False = false;
window.None = null;

// 连字符转驼峰
String.prototype.hyphenToHump = function () {
  return this.replace(/-(\w)/g, (...args) => {
    return args[1].toUpperCase();
  });
};

// 驼峰转连字符
String.prototype.humpToHyphen = function () {
  return this.replace(/([A-Z])/g, '-$1').toLowerCase();
};

let html_escape = {
    "&lt;"  : "<", 
    "&gt;"  : ">", 
    "&amp;" : "&", 
    "&nbsp;": " ", 
    "&quot;": "\"", 
    "&copy;": "©"
};

String.prototype.toHtml = function(){
    
}

Array.prototype.digitSort = function(){
    this.sort(function(a, b) {
        return a - b;
    });
  return this;
};

// 日期格式化
Date.prototype.format = function (format) {
  const o = {
    'M+': this.getMonth() + 1,
    'd+': this.getDate(),
    'h+': this.getHours(),
    'H+': this.getHours(),
    'm+': this.getMinutes(),
    's+': this.getSeconds(),
    'q+': Math.floor((this.getMonth() + 3) / 3),
    S: this.getMilliseconds()
  };
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, `${this.getFullYear()}`.substr(4 - RegExp.$1.length));
  }
  for (let k in o) {
    if (new RegExp(`(${k})`).test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : (`00${o[k]}`).substr(`${o[k]}`.length));
    }
  }
  return format;
}


module.exports = {
    xurlform,
    url2params,
    isfalse,
    CallableObject,
    localStore,
    arequest,
    srequest,
    globalMouseDrop,
    checkChain,
    _globals,
    fieldFalseValue,
    stopEventPropagate,
    createReactDom,
    getCaretPosition,
    getRectLocation,
    setCaretPosition,
    clearCaretSelection,
    browsers
}
