import request from './config'

export default {
    // 获取新闻列表
    list: (params: any) => request.get('/api/news/list', { params }),
    // 获取新闻详情
    detail: (params: any) => request.get('/api/news/detail', { params }),
    // 删除新闻
    delete: (params: any) => request.post('/api/news/delete', params),
    // 发布/取消发布新闻
    publish: (params: any) => request.post('/api/news/publish', params),
    // 获取爬虫新闻列表
    spiderList: (params: any) => request.get('/api/news/spider/list', { params }),
    // 获取爬虫新闻详情
    spiderDetail: (params: any) => request.get('/api/news/spider/detail', { params })
}