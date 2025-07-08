<template>
    <el-header class="header">
        <div class="left">
            <el-icon @click="handleCollapsed" class="menu-icon">
                <Menu />
            </el-icon>
            <span class="title" :class="{ 'mobile-title': isMobile }">绿野仙踪管理系统</span>
        </div>
        <div class="right">
            <el-icon @click="toggleFullscreen" class="fullscreen-icon" :title="isFullscreen ? '退出全屏' : '全屏'" style="margin-right: 18px;cursor:pointer;">
                <component :is="isFullscreen ? 'Close' : 'FullScreen'" />
            </el-icon>
            <el-dropdown>
                <span class="el-dropdown-link">
                    <el-avatar :size="isMobile ? 24 : 30" :src="avatar" />
                    <span v-if="!isMobile" class="username">{{ useTool.userInfo.username }}</span>
                    <el-icon class="el-icon--right">
                        <arrow-down />
                    </el-icon>
                </span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item @click="handleCenter">个人中心</el-dropdown-item>
                        <el-dropdown-item divided @click="handleLogout">退出</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </el-header>
</template>
<script setup lang="ts">
import { useToolStore } from '@/store'
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { FullScreen, Close } from '@element-plus/icons-vue'

const useTool = useToolStore()
const router = useRouter()
const isMobile = ref(false)
const isFullscreen = ref(false)

const avatar = computed(() =>
    useTool.userInfo.avatar
        ? 'http://localhost:3000' + useTool.userInfo.avatar
        : `https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png`
)

const handleCollapsed = () => {
    useTool.changeCollapsed()
}

const handleCenter = () => {
    router.push('/center')
}

const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
}

const toggleFullscreen = () => {
    if (!isFullscreen.value) {
        const el = document.documentElement
        if (el.requestFullscreen) {
            el.requestFullscreen()
        } else if ((el as any).webkitRequestFullScreen) {
            ;(el as any).webkitRequestFullScreen()
        } else if ((el as any).mozRequestFullScreen) {
            ;(el as any).mozRequestFullScreen()
        } else if ((el as any).msRequestFullscreen) {
            ;(el as any).msRequestFullscreen()
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen()
        } else if ((document as any).webkitCancelFullScreen) {
            ;(document as any).webkitCancelFullScreen()
        } else if ((document as any).mozCancelFullScreen) {
            ;(document as any).mozCancelFullScreen()
        } else if ((document as any).msExitFullscreen) {
            ;(document as any).msExitFullscreen()
        }
    }
}

const fullscreenChangeHandler = () => {
    isFullscreen.value = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
    )
}

const handleResize = () => {
    isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    document.addEventListener('fullscreenchange', fullscreenChangeHandler)
    document.addEventListener('webkitfullscreenchange', fullscreenChangeHandler)
    document.addEventListener('mozfullscreenchange', fullscreenChangeHandler)
    document.addEventListener('MSFullscreenChange', fullscreenChangeHandler)
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    document.removeEventListener('fullscreenchange', fullscreenChangeHandler)
    document.removeEventListener('webkitfullscreenchange', fullscreenChangeHandler)
    document.removeEventListener('mozfullscreenchange', fullscreenChangeHandler)
    document.removeEventListener('MSFullscreenChange', fullscreenChangeHandler)
})
</script>

<style lang="scss" scoped>
.header {
    width: 100%;
    height: 50px;
    line-height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f5f7f9;
    padding: 0 15px;
    background-color: #fff;

    @media screen and (max-width: 768px) {
        padding: 0 10px;
    }
}

.left {
    display: flex;
    align-items: center;

    .menu-icon {
        cursor: pointer;
        font-size: 20px;
        margin-right: 15px;
    }

    .title {
        font-size: 16px;

        &.mobile-title {
            font-size: 14px;
            max-width: 180px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
}

.right {
    display: flex;
    align-items: center;
    .fullscreen-icon {
        font-size: 22px;
        vertical-align: middle;
    }
    .el-dropdown {
        .el-dropdown-link {
            display: flex;
            align-items: center;
            padding: 3px 8px;
            border: 1px solid #d9d9d9;
            border-radius: 20px;
            cursor: pointer;

            .username {
                margin: 0 8px;
                max-width: 100px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
    }

    @media screen and (max-width: 768px) {
        .el-dropdown {
            .el-dropdown-link {
                padding: 2px 6px;
            }
        }
    }
}
</style>
