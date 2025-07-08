<template>
    <div class="page-container">
        <div class="content">
            <el-button class="customer-service-btn" type="primary" size="large" round @click="$router.push('/chat')">
                <el-icon class="icon">
                    <Service />
                </el-icon>智能客服
            </el-button>
            <div class="hero-section">
                <el-carousel height="600px" indicator-position="outside" :interval="5000">
                    <el-carousel-item v-for="(img, index) in [img1, img2, img3]" :key="index">
                        <div class="carousel-slide" :style="{ backgroundImage: `url(${img})` }">
                            <div class="overlay"></div>
                        </div>
                    </el-carousel-item>
                </el-carousel>
                <div class="hero-content">
                    <h1 class="company-title">绿野仙踪</h1>
                    <p class="company-subtitle">专注于环保技术的创新与发展</p>
                    <el-button type="primary" size="large" class="cta-button" @click="$router.push('/about')">了解更多</el-button>
                </div>
            </div>
            <div class="features-section">
                <div class="feature-card">
                    <el-icon size="32">
                        <Sunny />
                    </el-icon>
                    <h3>环保科技</h3>
                    <p>致力于开发绿色环保技术</p>
                </div>
                <div class="feature-card">
                    <el-icon size="32">
                        <Aim />
                    </el-icon>
                    <h3>专业服务</h3>
                    <p>提供全方位环保解决方案</p>
                </div>
                <div class="feature-card">
                    <el-icon size="32">
                        <Trophy />
                    </el-icon>
                    <h3>优质品质</h3>
                    <p>坚持高标准服务理念</p>
                </div>
            </div>
        </div>
        <Footer />
    </div>
</template>

<script setup lang="ts">
import img1 from '@/assets/home1.jpg'
import img2 from '@/assets/home2.jpg'
import img3 from '@/assets/home3.jpg'
import Footer from '@/components/Footer.vue'
import { Sunny, Aim, Trophy, Service } from '@element-plus/icons-vue'
import { onMounted, onUnmounted } from 'vue'
import { throttle } from '@/utils/throttleAndDebounce'

const handleScroll = throttle(() => {
    // 这里可以添加滚动相关逻辑，比如懒加载、吸顶等
    // console.log('页面滚动事件（节流）');
}, 200)

onMounted(() => {
    window.addEventListener('scroll', handleScroll)
})
onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped lang="scss">
.page-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.content {
    flex: 1 0 auto;
}

.customer-service-btn {
    position: fixed;
    right: 30px;
    bottom: 30px;
    z-index: 999;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .icon {
        font-size: 20px;
    }
}
.hero-section {
    position: relative;
    height: 600px;
}

.carousel-slide {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    position: relative;
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5));
}

.hero-content {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    z-index: 1;
    width: 80%;
    max-width: 800px;
}

.company-title {
    font-size: 4rem;
    color: white;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    animation: fadeInDown 1s ease-out;
}

.company-subtitle {
    font-size: 1.5rem;
    color: #f0f0f0;
    margin-bottom: 2rem;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
    animation: fadeInUp 1s ease-out 0.5s both;
}

.cta-button {
    padding: 12px 30px;
    font-size: 1.2rem;
    border-radius: 30px;
    animation: fadeInUp 1s ease-out 1s both;
    transition: transform 0.3s ease;

    &:hover {
        transform: translateY(-3px);
    }
}

.features-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    padding: 4rem 2rem;
    background: #f8f9fa;
    max-width: 1200px;
    margin: 0 auto;
}

.feature-card {
    text-align: center;
    padding: 2rem;
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;

    &:hover {
        transform: translateY(-5px);
    }

    .el-icon {
        color: var(--el-color-primary);
        margin-bottom: 1rem;
    }

    h3 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
        color: #333;
    }

    p {
        color: #666;
        line-height: 1.6;
    }
}

@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .company-title {
        font-size: 2.5rem;
    }

    .company-subtitle {
        font-size: 1.2rem;
    }

    .features-section {
        padding: 2rem 1rem;
    }
}
</style>
