<template>
    <el-aside :width="useTool.isCollapsed ? '64px' : '220px'">
        <el-menu active-text-color="#ffffff" :background-color="'var(--el-color-primary)'" text-color="#ffffff" :collapse="useTool.isCollapsed" :collapse-transition="false" :router="true" :default-active="route.fullPath">
            <!-- 加载状态 -->
            <div v-if="menuStore.isLoading" class="menu-loading">
                <el-skeleton :rows="5" animated />
            </div>

            <!-- 动态菜单 -->
            <RecursiveMenu v-else :menu-items="filteredMenuItems" />
        </el-menu>
    </el-aside>
</template>
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useToolStore, useMenuStore } from '@/store'
import { useRoute } from 'vue-router'
import RecursiveMenu from './RecursiveMenu.vue'

const useTool = useToolStore()
const menuStore = useMenuStore()
const route = useRoute()

// 根据用户权限过滤菜单
const filteredMenuItems = computed(() => {
    const userRole = useTool.userInfo.role
    return menuStore.getMenuTree.filter((menu) => {
        if (menu.requireAdmin && userRole !== 1) {
            return false
        }
        return true
    })
})

// 组件挂载时获取菜单数据
onMounted(async () => {
    // 临时使用静态菜单数据，避免API调用问题
    if (menuStore.getMenuTree.length === 0) {
        // 模拟菜单数据
        const mockMenuData = [
            {
                _id: '1',
                name: 'home',
                path: '/index',
                component: '@/views/home/Home.vue',
                icon: 'home-filled',
                title: '首页',
                order: 1,
                isVisible: true,
                requireAdmin: false,
            },
            {
                _id: '2',
                name: 'center',
                path: '/center',
                component: '@/views/center/Center.vue',
                icon: 'avatar',
                title: '个人中心',
                order: 2,
                isVisible: true,
                requireAdmin: false,
            },
            {
                _id: '3',
                name: 'user-manage',
                path: '/user-manage',
                component: 'Layout',
                icon: 'user-filled',
                title: '用户管理',
                order: 3,
                isVisible: true,
                requireAdmin: true,
                children: [
                    {
                        _id: '3-1',
                        name: 'adduser',
                        path: '/user-manage/adduser',
                        component: '@/views/user-manage/UserAdd.vue',
                        icon: '',
                        title: '添加用户',
                        order: 1,
                        isVisible: true,
                        requireAdmin: true,
                    },
                    {
                        _id: '3-2',
                        name: 'userlist',
                        path: '/user-manage/userlist',
                        component: '@/views/user-manage/UserList.vue',
                        icon: '',
                        title: '用户列表',
                        order: 2,
                        isVisible: true,
                        requireAdmin: true,
                    },
                ],
            },
            {
                _id: '4',
                name: 'news-manage',
                path: '/news-manage',
                component: 'Layout',
                icon: 'message-box',
                title: '文章管理',
                order: 4,
                isVisible: true,
                requireAdmin: false,
                children: [
                    {
                        _id: '4-1',
                        name: 'addnews',
                        path: '/news-manage/addnews',
                        component: '@/views/news-manage/NewsAdd.vue',
                        icon: '',
                        title: '创建文章',
                        order: 1,
                        isVisible: true,
                        requireAdmin: false,
                    },
                    {
                        _id: '4-2',
                        name: 'newslist',
                        path: '/news-manage/newslist',
                        component: '@/views/news-manage/NewsList.vue',
                        icon: '',
                        title: '文章列表',
                        order: 2,
                        isVisible: true,
                        requireAdmin: false,
                    },
                    {
                        _id: '4-3',
                        name: 'spiderlist',
                        path: '/news-manage/spiderlist',
                        component: '@/views/news-manage/SpiderNewsList.vue',
                        icon: '',
                        title: '爬虫列表',
                        order: 3,
                        isVisible: true,
                        requireAdmin: false,
                    },
                ],
            },
            {
                _id: '5',
                name: 'product-manage',
                path: '/product-manage',
                component: 'Layout',
                icon: 'reading',
                title: '产品管理',
                order: 5,
                isVisible: true,
                requireAdmin: false,
                children: [
                    {
                        _id: '5-1',
                        name: 'addproduct',
                        path: '/product-manage/addproduct',
                        component: '@/views/product-manage/ProductAdd.vue',
                        icon: '',
                        title: '添加产品',
                        order: 1,
                        isVisible: true,
                        requireAdmin: false,
                    },
                    {
                        _id: '5-2',
                        name: 'productlist',
                        path: '/product-manage/productlist',
                        component: '@/views/product-manage/ProductList.vue',
                        icon: '',
                        title: '产品列表',
                        order: 2,
                        isVisible: true,
                        requireAdmin: false,
                    },
                    {
                        _id: '5-3',
                        name: 'spiderlist',
                        path: '/product-manage/spiderlist',
                        component: '@/views/product-manage/Spiderlist.vue',
                        icon: '',
                        title: '爬虫列表',
                        order: 3,
                        isVisible: true,
                        requireAdmin: false,
                    },
                ],
            },
            {
                _id: '6',
                name: 'admin',
                path: '/admin',
                component: 'Layout',
                icon: 'setting',
                title: '系统管理',
                order: 6,
                isVisible: true,
                requireAdmin: true,
                children: [
                    {
                        _id: '6-1',
                        name: 'login-attempts',
                        path: '/admin/login-attempts',
                        component: '@/views/admin/LoginAttempts.vue',
                        icon: '',
                        title: '登录尝试管理',
                        order: 1,
                        isVisible: true,
                        requireAdmin: true,
                    },
                ],
            },
        ]

        // 直接设置菜单数据
        menuStore.menuTree = mockMenuData
    }
})
</script>

<style lang="scss" scoped>
.el-aside {
    height: 100%;
    transition: width 0.3s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);

    .el-menu {
        height: 100%;
        border-right: none;
        font-size: 15px;

        .menu-loading {
            padding: 20px;
        }

        .el-icon {
            font-size: 18px;
            margin-right: 5px;
            vertical-align: middle;
        }

        .el-menu-item {
            height: 56px;
            line-height: 56px;
            padding: 0 20px !important;
            transition: all 0.3s;

            &.is-active {
                background-color: var(--el-color-primary-dark-2) !important;
                font-weight: bold;
                &:hover {
                    background-color: var(--el-color-primary-dark-2) !important;
                }
            }

            &:hover {
                background-color: var(--el-color-primary-light-3) !important;
            }
        }

        :deep(.el-sub-menu) {
            .el-sub-menu__title {
                height: 56px;
                line-height: 56px;
                padding: 0 20px !important;
                transition: all 0.3s;

                &:hover {
                    background-color: var(--el-color-primary-light-3) !important;
                }
            }

            .el-menu {
                background-color: var(--el-color-primary-light-5) !important;
                padding: 5px 0;

                .el-menu-item {
                    height: 50px;
                    line-height: 50px;
                    background-color: var(--el-color-primary-light-5) !important;
                    margin: 4px 0;
                    border-radius: 4px;

                    &:hover {
                        background-color: var(--el-color-primary-light-3) !important;
                    }

                    &.is-active {
                        background-color: var(--el-color-primary-dark-2) !important;
                    }
                }
            }
        }
    }
}
</style>