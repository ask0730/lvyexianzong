<template>
    <nav class="navbar">
        <div class="nav-container">
            <router-link to="/" class="logo">
                <img src="@/assets/logo.png" alt="Logo" />
                <span class="company-name">绿野仙踪</span>
            </router-link>

            <div class="nav-links">
                <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="nav-item" :class="{ active: currentPath === item.path }">{{ item.name }}</router-link>
            </div>

            <div class="nav-right">
                <template v-if="!isLoggedIn">
                    <el-button type="primary" class="login-btn" @click="$router.push('/login')">
                        <el-icon class="icon">
                            <User />
                        </el-icon>登录
                    </el-button>
                </template>
                <template v-else>
                    <el-dropdown @command="handleUserCommand">
                        <div class="user-info">
                            <el-avatar :src="userAvatar" class="user-avatar" :icon="UserFilled" />
                            <span class="username">{{ userName }}</span>
                        </div>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="profile">
                                    <el-icon>
                                        <User />
                                    </el-icon>个人中心
                                </el-dropdown-item>
                                <el-dropdown-item command="logout">
                                    <el-icon>
                                        <SwitchButton />
                                    </el-icon>退出登录
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </template>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { User, UserFilled, SwitchButton } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const currentPath = computed(() => route.path)

const navItems = [
    { name: '文章中心', path: '/news' },
    { name: '产品中心', path: '/product' },
    { name: '关于我们', path: '/about' },
]

const isLoggedIn = ref(false)
const userAvatar = ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642ab5acc11d8d85.jpeg')
const userName = ref('用户')

const updateUserInfo = () => {
    const token = localStorage.getItem('token')
    const userInfo = localStorage.getItem('userInfo')

    isLoggedIn.value = !!token

    if (userInfo) {
        const parsedUserInfo = JSON.parse(userInfo)
        userName.value = parsedUserInfo.username || '用户'
        userAvatar.value = parsedUserInfo.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642ab5acc11d8d85.jpeg'
    }
}

onMounted(updateUserInfo)

// 监听路由变化，更新用户信息
watch(() => route.path, updateUserInfo)

const handleUserCommand = (command) => {
    switch (command) {
        case 'profile':
            router.push('/profile')
            break
        case 'logout':
            logout()
            break
    }
}

const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    isLoggedIn.value = false
    userName.value = '用户'
    userAvatar.value = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642ab5acc11d8d85.jpeg'
    ElMessage.success('已退出登录')
    router.push('/login')
}
</script>

<style scoped lang="scss">
.navbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    height: 64px;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

        &:hover,
        &.active {
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
    }

    .user-avatar {
        margin-right: 10px;
        transition: transform 0.3s ease;
    }

    .user-avatar:hover {
        transform: scale(1.1);
    }

    .username {
        font-size: 14px;
        color: #333;
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

:deep(#app) {
    padding-top: 64px;
}
</style>
