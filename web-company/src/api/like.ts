import request from '@/utils/request';

// 添加点赞
export function addLike(newsId: string) {
  return request({
    url: '/webapi/like/add',
    method: 'post',
    data: { newsId }
  });
}

// 取消点赞
export function removeLike(newsId: string) {
  return request({
    url: '/webapi/like/remove',
    method: 'post',
    data: { newsId }
  });
}

// 获取点赞状态
export function getLikeStatus(newsId: string) {
  return request({
    url: `/webapi/like/status/${newsId}`,
    method: 'get'
  });
}

// 获取点赞数量
export function getLikeCount(newsId: string) {
  return request({
    url: `/webapi/like/count/${newsId}`,
    method: 'get'
  });
}

// 批量获取点赞数量
export function getBatchLikeCounts(newsIds: string[]) {
  return request({
    url: '/webapi/like/batch-counts',
    method: 'post',
    data: { newsIds }
  });
}