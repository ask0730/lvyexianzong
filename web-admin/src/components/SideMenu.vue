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
    if (menuStore.getMenuTree.length === 0) {
        await menuStore.fetchMenuTree()
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