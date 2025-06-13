<template>
    <div class="page-container">
        <div class="content">
            <div class="search-section">
                <el-input v-model="searchQuery" placeholder="搜索农产品..." class="search-input" clearable @input="handleSearch">
                    <template #prefix>
                        <el-icon>
                            <Search />
                        </el-icon>
                    </template>
                </el-input>
            </div>
            <div class="product-section">
                <div v-if="filteredProducts.length">
                    <div v-for="item in filteredProducts" :key="item._id">
                        <div class="item">
                            <el-card class="box-card">
                                <template #header>
                                    <div class="card-header">
                                        <h2>{{ item.title }}</h2>
                                    </div>
                                </template>
                                <div class="introduction">{{ item.introduction }}</div>
                                <div class="detail">{{ item.detail }}</div>
                                <div class="imgs" :style="{ backgroundImage: `url(http://localhost:3000${item.cover})` }"></div>
                                <div class="like-section">
                                    <el-button :class="['like-button', { 'is-liked': item.isLiked }]" @click="handleLike(item)" :loading="item.likeLoading">
                                        <i class="el-icon-like" :class="{ 'is-liked': item.isLiked }"></i>
                                        <span class="like-count">{{ item.likes }}</span>
                                    </el-button>
                                </div>
                            </el-card>
                        </div>
                    </div>
                </div>
                <el-empty description="暂无产品" v-else />
            </div>
        </div>
        <Footer />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import API from '@/api'
import Footer from '@/components/Footer.vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const looplist: any = ref([])
const searchQuery = ref('')

// 生成随机点赞数
const generateRandomLikes = () => Math.floor(Math.random() * 1000)

// 处理点赞
const handleLike = async (item: any) => {
    if (item.likeLoading) return

    item.likeLoading = true
    try {
        // 模拟点赞请求
        await new Promise((resolve) => setTimeout(resolve, 500))
        item.isLiked = !item.isLiked
        item.likes = item.isLiked ? item.likes + 1 : item.likes - 1
        ElMessage.success(item.isLiked ? '点赞成功' : '取消点赞')
    } catch (error) {
        ElMessage.error('操作失败，请稍后重试')
    } finally {
        item.likeLoading = false
    }
}

// 搜索处理
const handleSearch = () => {
    // 可以在这里添加防抖逻辑
}

// 过滤产品列表
const filteredProducts = computed(() => {
    if (!searchQuery.value) return looplist.value

    const query = searchQuery.value.toLowerCase()
    return looplist.value.filter(
        (item: any) =>
            item.title.toLowerCase().includes(query) ||
            item.introduction.toLowerCase().includes(query) ||
            item.detail.toLowerCase().includes(query)
    )
})

onMounted(async () => {
    const res = await API.product.list({})
    if (res.code === 0) {
        looplist.value = res.data.map((item: any) => ({
            ...item,
            isLiked: false,
            likeLoading: false,
            likes: generateRandomLikes(),
        }))
    }
})
</script>

<style scoped lang="scss">
.search-section {
    padding: 20px;
    display: flex;
    justify-content: center;
    background-color: #f5f7fa;
    margin-bottom: 20px;
}

.search-input {
    width: 100%;
    max-width: 600px;

    :deep(.el-input__wrapper) {
        border-radius: 20px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

        &:hover {
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2);
        }

        &.is-focus {
            box-shadow: 0 0 0 1px var(--el-color-primary) inset;
        }
    }

    :deep(.el-input__prefix) {
        color: var(--el-text-color-secondary);
    }
}

.product-section {
    margin: 20px 0;
}

.item {
    width: 100%;
    height: 100%;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.box-card {
    width: 90%;
    height: 20%;
    overflow-y: auto;
    background-color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(15px);
    border: none;
    border-radius: 20px;
    margin-bottom: 20px;
    position: relative;
    z-index: 1;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    animation: slideIn 0.8s ease-out;

    @media (max-width: 992px) {
        width: 60%;
    }

    @media (max-width: 768px) {
        width: 80%;
        margin: 0 auto;
    }

    @media (max-width: 576px) {
        width: 90%;
        max-height: 70%;
    }

    &:hover {
        transform: translateX(-20px) scale(1.03);
        box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);

        @media (max-width: 768px) {
            transform: scale(1.03);
        }
    }

    .card-header h2 {
        margin: 0;
        //color: #2c3e50;
        font-size: 28px;
        font-weight: 700;
        letter-spacing: -0.5px;
        line-height: 1.3;
        transition: color 0.3s ease;

        @media (max-width: 576px) {
            font-size: 24px;
        }
    }

    .introduction {
        font-size: 17px;
        color: #34495e;
        line-height: 1.7;
        margin: 20px 0;
        font-weight: 500;
        animation: slideUp 0.6s ease-out 0.3s both;

        @media (max-width: 576px) {
            font-size: 15px;
            margin: 15px 0;
        }
    }

    .detail {
        font-size: 15px;
        color: #5d6d7e;
        line-height: 1.8;
        margin: 25px 0;
        letter-spacing: 0.2px;
        animation: slideUp 0.6s ease-out 0.6s both;

        @media (max-width: 576px) {
            font-size: 14px;
            margin: 15px 0;
        }
    }
    .imgs {
        width: 200px;
        height: 200px;
        //width: 100%;
        //height: 100%;
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 5%;
        animation: fadeIn 1s ease-out;
    }
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(50px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.page-container {
    display: flex;
    flex-direction: column;
    min-height: 100%;
}

.content {
    flex: 1 0 auto;
}

:deep(.el-carousel__indicators--vertical) {
    right: 2%;
}

:deep(.el-carousel__button) {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.7);
    transition: all 0.3s ease;

    &:hover {
        background-color: #fff;
        transform: scale(1.2);
    }
}

.like-section {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    padding: 0 20px;
}

.like-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 20px;
    transition: all 0.3s ease;
    background-color: #f5f7fa;
    border: 1px solid #e4e7ed;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }

    &.is-liked {
        color: #f56c6c;
        background-color: #fef0f0;
        border-color: #fbc4c4;
    }

    .el-icon-like {
        font-size: 18px;
        transition: all 0.3s ease;

        &:before {
            content: '👍';
        }

        &.is-liked {
            animation: likeAnimation 0.3s ease;
        }
    }

    .like-count {
        font-size: 14px;
        font-weight: 500;
    }
}

@keyframes likeAnimation {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.2);
    }
    100% {
        transform: scale(1);
    }
}
</style>
