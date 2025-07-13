import request from '@/utils/request'

// 搜索接口
export const searchAPI = {
  // 基础搜索
  search: (params: {
    keyword: string
    type?: 'news' | 'product' | 'all'
    page?: number
    pageSize?: number
  }) => {
    return request({
      url: '/webapi/search',
      method: 'GET',
      params
    })
  },

  // 高级搜索
  advancedSearch: (params: {
    keyword: string
    category?: string
    dateRange?: [string, string]
    type?: 'news' | 'product' | 'all'
    page?: number
    pageSize?: number
  }) => {
    return request({
      url: '/webapi/search/advanced',
      method: 'POST',
      data: params
    })
  },

  // 获取搜索建议
  getSuggestions: (keyword: string) => {
    return request({
      url: '/webapi/search/suggestions',
      method: 'GET',
      params: { keyword }
    })
  },

  // 获取热门搜索
  getHotSearches: () => {
    return request({
      url: '/webapi/search/hot',
      method: 'GET'
    })
  },

  // 保存搜索记录
  saveSearchRecord: (data: {
    keyword: string
    type: 'news' | 'product' | 'all'
    userId?: string
  }) => {
    return request({
      url: '/webapi/search/record',
      method: 'POST',
      data
    })
  }
}

export default searchAPI 