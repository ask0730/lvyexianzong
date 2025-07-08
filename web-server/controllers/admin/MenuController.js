const MenuService = require('../../services/admin/MenuService');

class MenuController {
  // 检查管理员权限的辅助方法
  checkAdminPermission(req, res) {
    if (!req.user || req.user.role !== 1) {
      res.status(403).json({
        code: 403,
        message: '需要管理员权限'
      });
      return false;
    }
    return true;
  }
  // 获取菜单树
  async getMenuTree(req, res) {
    try {
      const userRole = req.user?.role || 0;
      const menuTree = await MenuService.getMenuTree(userRole);
      
      res.json({
        code: 0,
        message: '获取菜单成功',
        data: menuTree
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: error.message
      });
    }
  }

  // 获取所有菜单（平铺结构）
  async getAllMenus(req, res) {
    try {
      const menus = await MenuService.getAllMenus();
      
      res.json({
        code: 0,
        message: '获取菜单列表成功',
        data: menus
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: error.message
      });
    }
  }

  // 根据ID获取菜单
  async getMenuById(req, res) {
    try {
      const { id } = req.params;
      const menu = await MenuService.getMenuById(id);
      
      if (!menu) {
        return res.status(404).json({
          code: 404,
          message: '菜单不存在'
        });
      }
      
      res.json({
        code: 0,
        message: '获取菜单成功',
        data: menu
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: error.message
      });
    }
  }

  // 创建菜单
  async createMenu(req, res) {
    try {
      const menuData = req.body;
      const menu = await MenuService.createMenu(menuData);
      
      res.status(201).json({
        code: 0,
        message: '创建菜单成功',
        data: menu
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: error.message
      });
    }
  }

  // 更新菜单
  async updateMenu(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const menu = await MenuService.updateMenu(id, updateData);
      
      if (!menu) {
        return res.status(404).json({
          code: 404,
          message: '菜单不存在'
        });
      }
      
      res.json({
        code: 0,
        message: '更新菜单成功',
        data: menu
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: error.message
      });
    }
  }

  // 删除菜单
  async deleteMenu(req, res) {
    try {
      const { id } = req.params;
      const menu = await MenuService.deleteMenu(id);
      
      if (!menu) {
        return res.status(404).json({
          code: 404,
          message: '菜单不存在'
        });
      }
      
      res.json({
        code: 0,
        message: '删除菜单成功',
        data: menu
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: error.message
      });
    }
  }

  // 批量删除菜单
  async deleteMenus(req, res) {
    try {
      const { ids } = req.body;
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '请选择要删除的菜单'
        });
      }
      
      const result = await MenuService.deleteMenus(ids);
      
      res.json({
        code: 0,
        message: '批量删除菜单成功',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: error.message
      });
    }
  }

  // 初始化默认菜单
  async initDefaultMenus(req, res) {
    try {
      const result = await MenuService.initDefaultMenus();
      
      res.json({
        code: 0,
        message: result.message,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: error.message
      });
    }
  }
}

module.exports = new MenuController(); 