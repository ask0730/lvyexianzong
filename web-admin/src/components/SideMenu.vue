<template>
    <el-aside :width="useTool.isCollapsed ? '64px' : '220px'">
        <el-menu active-text-color="#ffffff" :background-color="'var(--el-color-primary)'" text-color="#ffffff" :collapse="useTool.isCollapsed" :collapse-transition="false" :router="true" :default-active="route.fullPath">
            <el-menu-item index="/index">
                <el-icon>
                    <home-filled />
                </el-icon>
                <span>首页</span>
            </el-menu-item>
            <el-menu-item index="/center">
                <el-icon>
                    <avatar />
                </el-icon>
                <span>个人中心</span>
            </el-menu-item>

            <el-sub-menu index="/user-manage" v-admin>
                <template #title>
                    <el-icon>
                        <user-filled />
                    </el-icon>
                    <span>用户管理</span>
                </template>
                <el-menu-item index="/user-manage/adduser">添加用户</el-menu-item>
                <el-menu-item index="/user-manage/userlist">用户列表</el-menu-item>
            </el-sub-menu>

            <el-sub-menu index="/admin" v-admin>
                <template #title>
                    <el-icon>
                        <setting />
                    </el-icon>
                    <span>系统管理</span>
                </template>
                <el-menu-item index="/admin/login-attempts">登录尝试管理</el-menu-item>
            </el-sub-menu>

            <el-sub-menu index="/news-manage">
                <template #title>
                    <el-icon>
                        <message-box />
                    </el-icon>
                    <span>文章管理</span>
                </template>
                <el-menu-item index="/news-manage/addnews">创建文章</el-menu-item>
                <el-menu-item index="/news-manage/newslist">文章列表</el-menu-item>
                <el-menu-item index="/news-manage/spiderlist">爬虫列表</el-menu-item>
            </el-sub-menu>

            <el-sub-menu index="/product-manage">
                <template #title>
                    <el-icon>
                        <reading />
                    </el-icon>
                    <span>产品管理</span>
                </template>
                <el-menu-item index="/product-manage/addproduct">添加产品</el-menu-item>
                <el-menu-item index="/product-manage/productlist">产品列表</el-menu-item>
                <el-menu-item index="/product-manage/spiderlist">爬虫列表</el-menu-item>
            </el-sub-menu>
        </el-menu>
    </el-aside>
</template>
<script setup lang="ts">
import { useToolStore } from '@/store'
import { useRoute } from 'vue-router'
const useTool = useToolStore()
const route = useRoute()
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