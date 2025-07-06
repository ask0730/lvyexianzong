<template>
    <div class="recursive-menu">
        <template v-for="item in menuItems">
            <!-- 有子菜单的情况 -->
            <el-sub-menu v-if="item.children && item.children.length > 0" :key="item._id" :index="item.path" :class="{ 'admin-only': item.requireAdmin }">
                <template #title>
                    <el-icon v-if="item.icon">
                        <component :is="item.icon" />
                    </el-icon>
                    <span>{{ item.title }}</span>
                </template>

                <!-- 递归渲染子菜单 -->
                <RecursiveMenu :menu-items="item.children" :level="level + 1" />
            </el-sub-menu>

            <!-- 没有子菜单的情况 -->
            <el-menu-item v-else :key="item._id" :index="item.path" :class="{ 'admin-only': item.requireAdmin }">
                <el-icon v-if="item.icon">
                    <component :is="item.icon" />
                </el-icon>
                <span>{{ item.title }}</span>
            </el-menu-item>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MenuItem } from '@/types/menu'

interface Props {
    menuItems: MenuItem[]
    level?: number
}

const props = withDefaults(defineProps<Props>(), {
    level: 0,
})

// 根据用户权限过滤菜单
const filteredMenuItems = computed(() => {
    // 这里可以根据用户角色进行过滤
    // 暂时返回所有菜单，权限控制可以在父组件中处理
    return props.menuItems
})
</script>

<style lang="scss" scoped>
.recursive-menu {
    .admin-only {
        // 管理员专用菜单的样式
        &.el-menu-item {
            background-color: rgba(255, 193, 7, 0.1);

            &:hover {
                background-color: rgba(255, 193, 7, 0.2) !important;
            }

            &.is-active {
                background-color: rgba(255, 193, 7, 0.3) !important;
            }
        }

        &.el-sub-menu {
            .el-sub-menu__title {
                background-color: rgba(255, 193, 7, 0.1);

                &:hover {
                    background-color: rgba(255, 193, 7, 0.2) !important;
                }
            }
        }
    }
}
</style> 