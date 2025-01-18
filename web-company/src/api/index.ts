import { queryPOST } from './config';

function post(url: string) {
  return function (data: any, config = {}) {
    return queryPOST(url, data, config);
  };
}

export default {
  news: {
    list: post('/webapi/news/list'),
    toplist: post('/webapi/news/toplist')
  },
  product: {
    list: post('/webapi/product/list')
  }
};
