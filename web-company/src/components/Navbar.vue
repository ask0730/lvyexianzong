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
        </div>
    </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentPath = computed(() => route.path)

const navItems = [
    // { name: '首页', path: '/' },
    { name: '新闻中心', path: '/news' },
    { name: '产品中心', path: '/product' },
    { name: '关于我们', path: '/about' }
]
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
}

// 超小屏幕适配
@media screen and (max-width: 480px) {
    .company-name {
        display: none;
    }
    
    .nav-links {
        gap: 10px;
    }
}
</style>
