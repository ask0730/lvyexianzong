import request from '@/utils/request';

// 记录文章浏览
export const recordArticleView = (articleId: string) => {
  return request({
    url: '/webapi/view-record/record',
    method: 'post',
    data: { articleId }
  });
};

// 获取文章浏览量统计
export const getViewStatistics = () => {
  return request({
    url: '/webapi/view-record/statistics',
    method: 'get'
  });
};

// 获取24小时浏览量分布
export const getHourlyViewDistribution = () => {
  return request({
    url: '/webapi/view-record/hourly-distribution',
    method: 'get'
  });
};