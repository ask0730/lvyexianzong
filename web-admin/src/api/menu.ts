import request from '@/utils/request';

// 菜单接口
export const menuApi = {
  // 获取菜单树
  getMenuTree() {
    return request({
      url: '/adminapi/menu/tree',
      method: 'get'
    });
  },

  // 获取所有菜单（平铺结构）
  getAllMenus() {
    return request({
      url: '/adminapi/menu/list',
      method: 'get'
    });
  },

  // 根据ID获取菜单
  getMenuById(id: string) {
    return request({
      url: `/adminapi/menu/${id}`,
      method: 'get'
    });
  },

  // 创建菜单
  createMenu(data: any) {
    return request({
      url: '/adminapi/menu',
      method: 'post',
      data
    });
  },

  // 更新菜单
  updateMenu(id: string, data: any) {
    return request({
      url: `/adminapi/menu/${id}`,
      method: 'put',
      data
    });
  },

  // 删除菜单
  deleteMenu(id: string) {
    return request({
      url: `/adminapi/menu/${id}`,
      method: 'delete'
    });
  },

  // 批量删除菜单
  deleteMenus(ids: string[]) {
    return request({
      url: '/adminapi/menu',
      method: 'delete',
      data: { ids }
    });
  },

  // 初始化默认菜单
  initDefaultMenus() {
    return request({
      url: '/adminapi/menu/init',
      method: 'post'
    });
  }
}; 