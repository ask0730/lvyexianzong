const express = require('express');
const router = express.Router();
const MenuController = require('../../controllers/admin/MenuController');

// 获取菜单树（根据用户权限）
router.get('/adminapi/menu/tree', MenuController.getMenuTree);

// 获取所有菜单（平铺结构，仅管理员）
router.get('/adminapi/menu/list', MenuController.getAllMenus);

// 根据ID获取菜单
router.get('/adminapi/menu/:id', MenuController.getMenuById);

// 创建菜单（仅管理员）
router.post('/adminapi/menu', MenuController.createMenu);

// 更新菜单（仅管理员）
router.put('/adminapi/menu/:id', MenuController.updateMenu);

// 删除菜单（仅管理员）
router.delete('/adminapi/menu/:id', MenuController.deleteMenu);

// 批量删除菜单（仅管理员）
router.delete('/adminapi/menu', MenuController.deleteMenus);

// 初始化默认菜单（仅管理员）
router.post('/adminapi/menu/init', MenuController.initDefaultMenus);

module.exports = router; 