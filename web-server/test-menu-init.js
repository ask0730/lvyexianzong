const mongoose = require('mongoose');
const MenuService = require('./services/admin/MenuService');

// 连接数据库
mongoose.connect('mongodb://localhost:27017/lvyexianzong', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testMenuInit() {
  try {
    console.log('开始初始化菜单...');
    
    const result = await MenuService.initDefaultMenus();
    console.log('初始化结果:', result);
    
    // 获取菜单树
    const menuTree = await MenuService.getMenuTree();
    console.log('菜单树结构:', JSON.stringify(menuTree, null, 2));
    
    console.log('菜单初始化完成！');
  } catch (error) {
    console.error('初始化失败:', error);
  } finally {
    mongoose.connection.close();
  }
}

testMenuInit(); 