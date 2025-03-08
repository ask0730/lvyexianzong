import request from '@/utils/request';

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