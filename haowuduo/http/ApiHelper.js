/**
 * Created by lipeiwei on 16/10/3.
 */

import apiCache from './ApiCache'

const baseUrl = 'http://127.0.0.1:8000/';

const showLog = __DEV__;

/**
 * @param url 完整路径
 */
const getFetch = (url, cached) => {
  const fetchFunc = () => {
    return fetch(url, {
      method: 'GET',
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json'
      }
    }).then(convertRespToJson)
  };
  return apiCache(url, fetchFunc, cached).then(defaultAnalyse);
};

/**
 * @param url 完整路径
 */
const postFetch = url => jsonData => {
  return fetch(url, {
    method: 'POST',
    headers: {
      Accept: '*/*',
      'Content-Type': 'multipart/form-data'
    },
    body: jsonData
  }).then(convertRespToJson).then(defaultAnalyse);
};

//拼接参数
const getParam = data => {
  return Object.entries(data).map(([key, value]) => {
    return `${key}=${value}`//TODO 是否得用encodeURI函数
  }).join('&');
};

/**
 * @param cached 是否优先本地缓存
 * @param path 相对路径
 */
const get = cached => (path, data) => {
  let url = `${baseUrl}${path}`;
  if (data) {
    url.append(`?${getParam(data)}`)
  }
  return loggerWrap(`GET  ${url}`)(() => {
    return getFetch(url, cached);
  });
};

/**
 * @param path 相对路径
 */
export const post = path => data => {
  // var jsonData = JSON.stringify(data);
  var url = baseUrl + path;
  // console.log('the url is '+url+";the jsonData is "+jsonData)
  return loggerWrap(`POST  ${url}  ${data}`)(() => {
    return postFetch(url)(data);
  });
};

/**
 * 日志打印
 * @param requestInfo
 */
const loggerWrap = requestInfo => fetchFunc => {
  if (showLog) {
    let startTime = new Date().getTime();//开始请求时间
    return fetchFunc().then(result => {
      console.log(`${requestInfo}  success  result = ${JSON.stringify(result)} cost time = ${new Date().getTime() - startTime}ms`);
      return result;
    }).catch(err => {
      console.warn(`${requestInfo}  ${err}`);
      return Promise.reject(err);
    });
  }
  return fetchFunc();
};

const convertRespToJson = response => {
  return response.json();
};

const defaultAnalyse = response => {
  if(response.data){
    return response.data;
  }
  return response;
};

export const getFetchFromCache = get(true);//缓存
export const getFetchNeverCached = get(false);//不缓存