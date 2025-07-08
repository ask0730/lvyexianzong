const Menu = require('../../models/MenuModel');

class MenuService {
  // 获取所有菜单（树形结构）
  async getMenuTree(userRole = 0) {
    try {
      // 获取所有菜单
      const allMenus = await Menu.find({ isVisible: true })
        .sort({ order: 1, createdAt: 1 })
        .lean();

      // 过滤管理员权限菜单
      const filteredMenus = allMenus.filter(menu => {
        if (menu.requireAdmin && userRole !== 1) {
          return false;
        }
        return true;
      });
      console.log('allMenus:', allMenus.map(m => m.title));
      console.log('filteredMenus:', filteredMenus.map(m => m.title));

      // 构建树形结构
      return this.buildMenuTree(filteredMenus);
    } catch (error) {
      throw new Error(`获取菜单失败: ${error.message}`);
    }
  }

  // 构建菜单树
  buildMenuTree(menus, parentId = null) {
    const tree = [];
    
    for (const menu of menus) {
      if (menu.parentId === parentId || 
          (parentId === null && !menu.parentId) ||
          (parentId && menu.parentId && menu.parentId.toString() === parentId.toString())) {
        const children = this.buildMenuTree(menus, menu._id);
        if (children.length > 0) {
          menu.children = children;
        }
        tree.push(menu);
      }
    }
    
    return tree;
  }

  // 获取所有菜单（平铺结构）
  async getAllMenus() {
    try {
      return await Menu.find()
        .sort({ order: 1, createdAt: 1 })
        .lean();
    } catch (error) {
      throw new Error(`获取菜单列表失败: ${error.message}`);
    }
  }

  // 根据ID获取菜单
  async getMenuById(id) {
    try {
      return await Menu.findById(id);
    } catch (error) {
      throw new Error(`获取菜单失败: ${error.message}`);
    }
  }

  // 创建菜单
  async createMenu(menuData) {
    try {
      const menu = new Menu(menuData);
      return await menu.save();
    } catch (error) {
      throw new Error(`创建菜单失败: ${error.message}`);
    }
  }

  // 更新菜单
  async updateMenu(id, updateData) {
    try {
      return await Menu.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new Error(`更新菜单失败: ${error.message}`);
    }
  }

  // 删除菜单
  async deleteMenu(id) {
    try {
      // 检查是否有子菜单
      const children = await Menu.find({ parentId: id });
      if (children.length > 0) {
        throw new Error('该菜单下有子菜单，无法删除');
      }
      
      return await Menu.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`删除菜单失败: ${error.message}`);
    }
  }

  // 批量删除菜单
  async deleteMenus(ids) {
    try {
      // 检查是否有子菜单
      const children = await Menu.find({ parentId: { $in: ids } });
      if (children.length > 0) {
        throw new Error('选中的菜单中有子菜单，无法删除');
      }
      
      return await Menu.deleteMany({ _id: { $in: ids } });
    } catch (error) {
      throw new Error(`批量删除菜单失败: ${error.message}`);
    }
  }

  // 初始化默认菜单
  async initDefaultMenus() {
    try {
      const count = await Menu.countDocuments();
      console.log('当前菜单数量:', count);
      if (count > 0) {
        console.log('菜单已存在，跳过初始化');
        return { message: '菜单已存在，跳过初始化' };
      }

      const defaultMenus = [
        {
          name: 'home',
          path: '/index',
          component: '@/views/home/Home.vue',
          icon: 'home-filled',
          title: '首页1111111',
          order: 1
        },
        {
          name: 'center',
          path: '/center',
          component: '@/views/center/Center.vue',
          icon: 'avatar',
          title: '个人中心',
          order: 2
        },
        {
          name: 'user-manage',
          path: '/user-manage',
          component: 'Layout',
          icon: 'user-filled',
          title: '用户管理',
          order: 3,
          requireAdmin: true
        },
        {
          name: 'adduser',
          path: '/user-manage/adduser',
          component: '@/views/user-manage/UserAdd.vue',
          icon: '',
          title: '添加用户',
          order: 1,
          requireAdmin: true
        },
        {
          name: 'userlist',
          path: '/user-manage/userlist',
          component: '@/views/user-manage/UserList.vue',
          icon: '',
          title: '用户列表',
          order: 2,
          requireAdmin: true
        },
        {
          name: 'news-manage',
          path: '/news-manage',
          component: 'Layout',
          icon: 'message-box',
          title: '文章管理',
          order: 4
        },
        {
          name: 'addnews',
          path: '/news-manage/addnews',
          component: '@/views/news-manage/NewsAdd.vue',
          icon: '',
          title: '创建文章',
          order: 1
        },
        {
          name: 'newslist',
          path: '/news-manage/newslist',
          component: '@/views/news-manage/NewsList.vue',
          icon: '',
          title: '文章列表',
          order: 2
        },
        {
          name: 'spiderlist',
          path: '/news-manage/spiderlist',
          component: '@/views/news-manage/SpiderNewsList.vue',
          icon: '',
          title: '爬虫列表',
          order: 3
        },
        {
          name: 'product-manage',
          path: '/product-manage',
          component: 'Layout',
          icon: 'reading',
          title: '产品管理',
          order: 5
        },
        {
          name: 'addproduct',
          path: '/product-manage/addproduct',
          component: '@/views/product-manage/ProductAdd.vue',
          icon: '',
          title: '添加产品',
          order: 1
        },
        {
          name: 'productlist',
          path: '/product-manage/productlist',
          component: '@/views/product-manage/ProductList.vue',
          icon: '',
          title: '产品列表',
          order: 2
        },
        {
          name: 'product-spiderlist',
          path: '/product-manage/spiderlist',
          component: '@/views/product-manage/Spiderlist.vue',
          icon: '',
          title: '爬虫列表',
          order: 3
        },
        {
          name: 'admin',
          path: '/admin',
          component: 'Layout',
          icon: 'setting',
          title: '系统管理11',
          order: 6,
          requireAdmin: true
        },
        {
          name: 'login-attempts',
          path: '/admin/login-attempts',
          component: '@/views/admin/LoginAttempts.vue',
          icon: '',
          title: '登录尝试管理',
          order: 1,
          requireAdmin: true
        }
      ];

      // 先创建父菜单
      const parentMenus = defaultMenus.filter(menu => 
        !menu.path.includes('/') || menu.path.split('/').length === 2
      );
      console.log('准备插入父菜单:', parentMenus.map(m => m.name));

      const createdMenus = [];
      for (const menu of parentMenus) {
        const created = await Menu.create(menu);
        createdMenus.push(created);
        console.log('已插入父菜单:', created.name, created._id.toString());
      }

      // 创建子菜单
      const childMenus = defaultMenus.filter(menu => 
        menu.path.split('/').length > 2
      );
      console.log('准备插入子菜单:', childMenus.map(m => m.name));

      for (const menu of childMenus) {
        const parentPath = menu.path.split('/').slice(0, -1).join('/');
        const parent = createdMenus.find(m => m.path === parentPath);
        if (parent) {
          menu.parentId = parent._id;
          const created = await Menu.create(menu);
          console.log('已插入子菜单:', created.name, created._id.toString(), '父ID:', parent._id.toString());
        } else {
          console.log('未找到父菜单，跳过:', menu.name, '父路径:', parentPath);
        }
      }

      console.log('默认菜单初始化完成');
      return { message: '默认菜单初始化成功' };
    } catch (error) {
      console.error('初始化菜单失败:', error);
      throw new Error(`初始化菜单失败: ${error.message}`);
    }
  }
}

module.exports = new MenuService(); 