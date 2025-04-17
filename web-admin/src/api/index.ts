import { queryPOST } from './config';

function post(url: string) {
  return function (data: any, config = {}) {
    return queryPOST(url, data, config);
  };
}

export default {
  user: {
    login: post('/adminapi/user/login'), //门店详情
    upload: post('/adminapi/user/upload'), // 更新个人信息
    add: post('/adminapi/user/add'), // 添加用户
    list: post('/adminapi/user/list'), // 用户列表
    delete: post('/adminapi/user/delete'), // 删除用户
    update: post('/adminapi/user/update') // 修改用户
  },
  news: {
    add: post('/adminapi/news/add'), // 添加文章
    list: post('/adminapi/news/list'), // 文章列表
    delete: post('/adminapi/news/delete'), // 删除文章
    update: post('/adminapi/news/update'), // 修改文章
    publish: post('/adminapi/news/publish'), // 文章发布
    spiderList: post('/adminapi/news/spider/list'), // 爬虫新闻列表
    spiderDetail: post('/adminapi/news/spider/detail'), // 爬虫新闻详情
  },
  product: {
    add: post('/adminapi/product/add'), // 添加产品
    list: post('/adminapi/product/list'), // 产品列表
    delete: post('/adminapi/product/delete'), // 删除产品
    update: post('/adminapi/product/update'), // 修改产品
  }
};
