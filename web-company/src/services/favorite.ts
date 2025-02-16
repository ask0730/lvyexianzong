import { http } from '@/utils/http';
import { getToken } from '@/utils/auth';

export const favoriteService = {
  async addFavorite(articleId: string) {
    if (!articleId) {
      throw new Error('文章ID不能为空');
    }

    const token = getToken();
    if (!token) {
      throw new Error('请先登录');
    }

    console.log('发送收藏请求:', {
      articleId,
      token
    });

    try {
      const response = await http.post(
        '/webapi/news/collect', 
        { articleId: articleId.toString() },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('收藏请求响应:', response);
      return response.data;
    } catch (error) {
      console.error('收藏请求失败:', {
        error,
        articleId,
        token: token ? '已设置' : '未设置'
      });
      throw error;
    }
  },

  removeFavorite(articleId: string) {
    if (!articleId) {
      throw new Error('文章ID不能为空');
    }
    const token = getToken();
    if (!token) {
      throw new Error('请先登录');
    }
    return http.delete(`/webapi/news/collect/${articleId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  getFavoriteStatus(articleId: string) {
    if (!articleId) {
      return Promise.reject(new Error('文章ID不能为空'));
    }
    return http.get(`/api/favorites/status/${articleId}`);
  }
}; 