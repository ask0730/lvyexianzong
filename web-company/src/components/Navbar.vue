<template>
    <nav class="navbar">
        <div class="nav-container">
            <router-link to="/" class="logo">
                <img src="@/assets/logo.png" alt="Logo">
                <span class="company-name">绿野仙踪</span>
            </router-link>

            <div class="nav-links">
                <router-link 
                    v-for="item in navItems" 
                    :key="item.path" 
                    :to="item.path"
                    class="nav-item"
                    :class="{ active: currentPath === item.path }"
                >
                    {{ item.name }}
                </router-link>
            </div>

            <div class="nav-right">
                <template v-if="!userStore.token">
                    <el-button 
                        type="primary" 
                        class="login-btn"
                        @click="$router.push('/login')"
                    >
                        登录
                    </el-button>
                </template>
                <template v-else>
                    <el-dropdown @command="handleCommand">
                        <div class="user-info">
                            <el-avatar 
                                :src="userStore.userInfo?.avatar || defaultAvatar" 
                                class="user-avatar"
                            />
                            <span class="username">{{ userStore.userInfo?.username }}</span>
                        </div>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </template>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import defaultAvatar from '@/assets/default-avatar.png'
import { User } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const navItems = [
    // { name: '首页', path: '/' },
    { name: '新闻中心', path: '/news' },
    { name: '产品中心', path: '/product' },
    { name: '关于我们', path: '/about' }
]

const currentPath = computed(() => route.path)

const handleCommand = async (command: string) => {
    switch (command) {
        case 'profile':
            // 跳转到个人中心页面
            router.push('/profile')
            break
        case 'logout':
            try {
                await ElMessageBox.confirm('确定要退出登录吗?', '退出登录', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                })
                
                const success = await userStore.logoutAction()
                if (success) {
                    ElMessage.success('已成功退出登录')
                    router.push('/login')
                }
            } catch (error) {
                console.error('退出登录失败:', error)
            }
            break
    }
}

const handleUserMenu = () => {
    // 可以添加用户菜单逻辑，如显示下拉菜单
    // 暂时先不实现
}
</script>

<style scoped lang="scss">
.navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
}

.nav-container {
    max-width: 1200px;
    height: 100%;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    display: flex;
    align-items: center;
    text-decoration: none;
    gap: 10px;
    
    img {
        height: 40px;
        width: auto;
    }
    
    .company-name {
        font-size: 20px;
        font-weight: bold;
        color: var(--el-color-primary);
        letter-spacing: 1px;
    }
}

.nav-links {
    display: flex;
    gap: 30px;
    
    .nav-item {
        position: relative;
        padding: 8px 0;
        color: #333;
        text-decoration: none;
        font-size: 16px;
        transition: all 0.3s ease;
        
        &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 0;
            height: 2px;
            background-color: var(--el-color-primary);
            transition: all 0.3s ease;
            transform: translateX(-50%);
        }
        
        &:hover, &.active {
            color: var(--el-color-primary);
            
            &::after {
                width: 100%;
            }
        }
    }
}

.nav-right {
    display: flex;
    align-items: center;
    
    .login-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 20px;
        border-radius: 20px;
        font-weight: 500;
        transition: all 0.3s ease;
        
        .icon {
            font-size: 16px;
        }
        
        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.3);
        }
        
        &:active {
            transform: translateY(0);
        }
    }
    
    .user-info {
        display: flex;
        align-items: center;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
            opacity: 0.8;
        }

        .user-avatar {
            margin-right: 10px;
        }

        .username {
            font-size: 16px;
            color: #333;
        }
    }
}

// 响应式设计
@media screen and (max-width: 768px) {
    .nav-container {
        padding: 0 15px;
    }
    
    .logo {
        img {
            height: 32px;
        }
        
        .company-name {
            font-size: 18px;
        }
    }
    
    .nav-links {
        gap: 15px;
        
        .nav-item {
            font-size: 14px;
        }
    }
    
    .nav-right {
        .login-btn {
            padding: 6px 16px;
            font-size: 14px;
            
            .icon {
                font-size: 14px;
            }
        }
    }
}

// 超小屏幕适配
@media screen and (max-width: 480px) {
    .company-name {
        display: none;
    }
    
    .nav-links {
        gap: 10px;
    }
    
    .nav-right {
        .login-btn {
            padding: 6px 12px;
            
            .icon {
                margin-right: 0;
            }
            
            span {
                display: none;
            }
        }
    }
}
</style>
