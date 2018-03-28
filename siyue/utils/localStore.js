import {isfalse} from './_utils';

let  ls = global.localStorage;

const arrayPush = function(item,value) {
  var ars = ls.getItem(item),ar;
  if (isfalse(ars)) {
    ar = [];
  } else {
    ar = JSON.parse(ars);
  }
  ar.push(value);
  ls.setItem(item, JSON.stringify(ar));
};

//我们需要换更好的工作,也需要做更多的事情,这个才是现在的重点,不是说,这家公司工作很舒适所以我就要在这家公司继续待,这个是不能接受的事实
//伴随着公司不断的将人员进行变小的话,其实也就是说我们是需要这块的吧
//做人还是需要危机感的,我不能
//是或否需要进行一次比较合理的解释会比较好的呢?


//你其实还是需要一定的时间来进行一定的流转的,这个怕是没有问题的吧




const arrayRemove = function(item,value) {
  var ars = ls.getItem(item); //'sessions');
  if (!isfalse(ars)) {
    let ar = JSON.parse(ars);
    let i = ar.indexOf(value);
    ar.splice(i,1);
    ls.setItem(item,JSON.stringify(ar));
  }
};

const getObject = function(item){
  return JSON.parse(ls.getItem(item));
};

const setObject = function(item, value){
  ls.setItem(item,JSON.stringify(value));
};

const setItem = function(item,value) {ls.setItem(item,value)};
const getItem = function(item) {return ls.getItem(item)};
const removeItem = function(item) {ls.removeItem(item)};

module.exports = {
  setItem,
  getItem,
  removeItem,
  arrayPush,
  arrayRemove,
  getObject,
  setObject
};


//这无疑是一个比较严肃的问题,这样子的话,我需要成长的时间,但是我却得不到成长的空间,这样子的话,才是我所需要的东西

//C:\Python27\;C:\Python27\Scripts;C:\ProgramData\Oracle\Java\javapath;%SystemRoot%\system32;%SystemRoot%;%SystemRoot%\System32\Wbem;%SYSTEMROOT%\System32\WindowsPowerShell\v1.0\;%JAVA_HOME%\bin;%JAVA_HOME%\jre\bin;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools;D:\pgsql;C:\Python27;C:\Python27\Scripts;D:\SVN\TSVN\bin;D:\Git\TortoiseGit\bin;C:\Program Files\nodejs\;C:\ProgramData\chocolatey\bin;F:\xampp\php;C:\ProgramData\ComposerSetup\bin;