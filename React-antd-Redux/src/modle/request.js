/*
 * description: 网络请求工具类
 * author: 麦芽糖
 * time: 2017年03月12日19:23:15
 */


 //我现在使用他本身的数据结构来获取数据来看看,只是用他的数据逻辑处理方式来进行数据的获取
 //在进行数据的获取及处理的方式用他的逻辑来理顺以减少开发时间


 'use strict'
 import queryString from 'query-string'
 import fetch from 'isomorphic-fetch'
 // import Mock from 'mockjs'
 import config from './confing'
 
 var request = {}
 
 request.get = (url, params, successCallBack, failCallBack) => {
   if (params) {
     url += '?' + queryString.stringify(params)
   }
   // console.log('httpUtil -- GET -- URL : ' + url)
   //先不管跨域的问题,我们先代理来进行请求
   return fetch(url,{
    // headers:{
    //   'content-Type':'application/x-www-form-urlkencoded;charset=UTF-8',
    //   'Access-Control-Allow-Origin':'http://localhost:8088/',
    //   mode:'cors'
    // }
   })
     mode:'cors'
     .then((response) => response.json())
     .then((response) => {
       successCallBack(response)
     })
     .catch((error) => { 
       console.log(error)
       failCallBack(error)
     })
 }
 
 request.post = (url, body, successCallBack, failCallBack) => {
   var options = _.extend(config.header, {
     body: JSON.stringify(body)
   })
   // console.log('httpUtil -- POST -- URL : ' + url + ' -- BODY : ' + body )
   return fetch(url, options)
     .then((response) => response.json())
     .then((response) => {
       successCallBack(response)
     })
     .catch((error) => {
       failCallBack(error)
     })
 };
 export  default  request;
 //module.exports = request