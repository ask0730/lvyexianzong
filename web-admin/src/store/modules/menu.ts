import { defineStore } from 'pinia';
import { menuApi } from '@/api/menu';
import type { MenuItem } from '@/types/menu';

export const useMenuStore = defineStore('menu', {
  state: () => ({
    menuTree: [] as MenuItem[],
    menuList: [] as MenuItem[],
    loading: false,
    error: ''
  }),

  getters: {
    // 获取菜单树
    getMenuTree: (state) => state.menuTree,
    
    // 获取菜单列表
    getMenuList: (state) => state.menuList,
    
    // 检查是否正在加载
    isLoading: (state) => state.loading,
    
    // 获取错误信息
    getError: (state) => state.error
  },

  actions: {
    // 获取菜单树
    async fetchMenuTree() {
      this.loading = true;
      this.error = '';
      
      try {
        const response = await menuApi.getMenuTree();
        if (response.code === 200) {
          this.menuTree = response.data;
        } else {
          this.error = response.message || '获取菜单失败';
        }
      } catch (error: any) {
        this.error = error.message || '获取菜单失败';
        console.error('获取菜单树失败:', error);
      } finally {
        this.loading = false;
      }
    },

    // 获取菜单列表
    async fetchMenuList() {
      this.loading = true;
      this.error = '';
      
      try {
        const response = await menuApi.getAllMenus();
        if (response.code === 200) {
          this.menuList = response.data;
        } else {
          this.error = response.message || '获取菜单列表失败';
        }
      } catch (error: any) {
        this.error = error.message || '获取菜单列表失败';
        console.error('获取菜单列表失败:', error);
      } finally {
        this.loading = false;
      }
    },

    // 创建菜单
    async createMenu(menuData: any) {
      this.loading = true;
      this.error = '';
      
      try {
        const response = await menuApi.createMenu(menuData);
        if (response.code === 201) {
          // 重新获取菜单数据
          await this.fetchMenuTree();
          await this.fetchMenuList();
          return response.data;
        } else {
          this.error = response.message || '创建菜单失败';
          throw new Error(this.error);
        }
      } catch (error: any) {
        this.error = error.message || '创建菜单失败';
        console.error('创建菜单失败:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 更新菜单
    async updateMenu(id: string, menuData: any) {
      this.loading = true;
      this.error = '';
      
      try {
        const response = await menuApi.updateMenu(id, menuData);
        if (response.code === 200) {
          // 重新获取菜单数据
          await this.fetchMenuTree();
          await this.fetchMenuList();
          return response.data;
        } else {
          this.error = response.message || '更新菜单失败';
          throw new Error(this.error);
        }
      } catch (error: any) {
        this.error = error.message || '更新菜单失败';
        console.error('更新菜单失败:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 删除菜单
    async deleteMenu(id: string) {
      this.loading = true;
      this.error = '';
      
      try {
        const response = await menuApi.deleteMenu(id);
        if (response.code === 200) {
          // 重新获取菜单数据
          await this.fetchMenuTree();
          await this.fetchMenuList();
          return response.data;
        } else {
          this.error = response.message || '删除菜单失败';
          throw new Error(this.error);
        }
      } catch (error: any) {
        this.error = error.message || '删除菜单失败';
        console.error('删除菜单失败:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 批量删除菜单
    async deleteMenus(ids: string[]) {
      this.loading = true;
      this.error = '';
      
      try {
        const response = await menuApi.deleteMenus(ids);
        if (response.code === 200) {
          // 重新获取菜单数据
          await this.fetchMenuTree();
          await this.fetchMenuList();
          return response.data;
        } else {
          this.error = response.message || '批量删除菜单失败';
          throw new Error(this.error);
        }
      } catch (error: any) {
        this.error = error.message || '批量删除菜单失败';
        console.error('批量删除菜单失败:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 初始化默认菜单
    async initDefaultMenus() {
      this.loading = true;
      this.error = '';
      
      try {
        const response = await menuApi.initDefaultMenus();
        if (response.code === 200) {
          // 重新获取菜单数据
          await this.fetchMenuTree();
          await this.fetchMenuList();
          return response.data;
        } else {
          this.error = response.message || '初始化菜单失败';
          throw new Error(this.error);
        }
      } catch (error: any) {
        this.error = error.message || '初始化菜单失败';
        console.error('初始化菜单失败:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 清除错误信息
    clearError() {
      this.error = '';
    },

    // 重置状态
    reset() {
      this.menuTree = [];
      this.menuList = [];
      this.loading = false;
      this.error = '';
    }
  },

  persist: {
    key: 'menu',
    storage: localStorage,
    paths: ['menuTree']
  }
}); 