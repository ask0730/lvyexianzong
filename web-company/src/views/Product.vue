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
                <div class="sort-section">
                    <el-radio-group v-model="sortType" size="default" @change="handleSortChange">
                        <el-radio-button label="publish">发布顺序</el-radio-button>
                        <el-radio-button label="likes">点赞量顺序</el-radio-button>
                    </el-radio-group>
                </div>
            </div>

            <div class="product-section">
                <div v-if="filteredProducts.length" class="products-grid">
                    <div v-for="item in filteredProducts" :key="item.id" class="product-item" @click="selectProduct(item)">
                        <el-card class="box-card" :class="{ 'selected': selectedProduct?.id === item.id }" shadow="hover">
                            <div class="product-img" :style="{ backgroundImage: `url(/images/${item.cover})` }"></div>
                            <div class="product-info">
                                <h2 class="product-title">{{ item.title }}</h2>
                                <div class="product-intro">{{ item.introduction }}</div>
                                <div class="product-detail">{{ item.detail }}</div>
                                <div class="product-meta">
                                    <span>产地：{{ item.origin }}</span>
                                    <span>价格：{{ item.price }}元</span>
                                </div>
                                <div class="like-section">
                                    <el-button :class="['like-button', { 'is-liked': item.isLiked }]" @click.stop="handleLike(item)" :loading="item.likeLoading">
                                        <i class="el-icon-like" :class="{ 'is-liked': item.isLiked }"></i>
                                        <span class="like-count">{{ item.likes }}</span>
                                    </el-button>
                                </div>
                            </div>
                        </el-card>
                    </div>
                </div>
                <el-empty description="暂无产品" v-else />
            </div>

            <!-- 推荐产品区域 -->
            <div class="recommendations-section">
                <h3>为您推荐</h3>
                <div v-if="recommendedProducts.length > 0" class="recommendations-grid">
                    <div v-for="item in recommendedProducts" :key="item.id" class="recommendation-item">
                        <el-card class="recommendation-card" shadow="hover">
                            <div class="recommendation-img" :style="{ backgroundImage: `url(/images/${item.cover})` }"></div>
                            <div class="recommendation-info">
                                <h4 class="recommendation-title">{{ item.title }}</h4>
                                <div class="recommendation-intro">{{ item.introduction }}</div>
                                <div class="recommendation-meta">
                                    <span>产地：{{ item.origin }}</span>
                                    <span>价格：{{ item.price }}元</span>
                                </div>
                                <div class="recommendation-likes">
                                    <i class="el-icon-like"></i>
                                    <span>{{ item.likes }}</span>
                                </div>
                            </div>
                        </el-card>
                    </div>
                </div>
                <el-empty v-else description="暂无推荐" />
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
import { Recommender } from '@/utils/recommender'
import Papa from 'papaparse'

const looplist: any = ref([])
const searchQuery = ref('')
const sortType = ref('publish')
const recommendedProducts = ref<any[]>([])
const selectedProduct = ref<any>(null)

// 加载CSV数据
const loadCSVData = async () => {
    try {
        const response = await fetch('/src/data/products.csv')
        const csvText = await response.text()
        const { data } = Papa.parse(csvText, { header: true })
        looplist.value = data.map((item: any) => ({
            ...item,
            id: parseInt(item.id),
            likes: parseInt(item.likes),
            isLiked: false,
            likeLoading: false,
        }))
    } catch (error) {
        console.error('Error loading CSV data:', error)
        ElMessage.error('加载数据失败')
    }
}

// 处理点赞
const handleLike = async (item: any) => {
    if (item.likeLoading) return

    item.likeLoading = true
    try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        item.isLiked = !item.isLiked
        item.likes = item.isLiked ? item.likes + 1 : item.likes - 1

        // 更新推荐
        if (selectedProduct.value) {
            updateRecommendations(selectedProduct.value)
        }

        ElMessage.success(item.isLiked ? '点赞成功' : '取消点赞')
    } catch (error) {
        ElMessage.error('操作失败，请稍后重试')
    } finally {
        item.likeLoading = false
    }
}

// 更新推荐
const updateRecommendations = (product: any) => {
    const recommender = new Recommender(looplist.value)
    recommendedProducts.value = recommender.getRecommendations(product.id)
}

// 选择产品
const selectProduct = (product: any) => {
    selectedProduct.value = product
    updateRecommendations(product)
}

// 处理排序变化
const handleSortChange = () => {
    if (sortType.value === 'likes') {
        looplist.value.sort((a: any, b: any) => b.likes - a.likes)
    } else {
        looplist.value.sort((a: any, b: any) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime())
    }
}

// 搜索处理
const handleSearch = () => {
    // 可以在这里添加防抖逻辑
}

// 过滤产品列表
const filteredProducts = computed(() => {
    let products = looplist.value
    if (sortType.value === 'likes') {
        products = [...products].sort((a: any, b: any) => b.likes - a.likes)
    } else {
        products = [...products].sort((a: any, b: any) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime())
    }

    if (!searchQuery.value) return products

    const query = searchQuery.value.toLowerCase()
    return products.filter(
        (item: any) =>
            item.title.toLowerCase().includes(query) ||
            item.introduction.toLowerCase().includes(query) ||
            item.detail.toLowerCase().includes(query)
    )
})

onMounted(async () => {
    await loadCSVData()
})
</script>

<style scoped lang="scss">
.page-container {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    background: #f5f7fa;
}

.content {
    flex: 1 0 auto;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
}

.search-section {
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    background-color: #f5f7fa;
    margin-bottom: 20px;
}

.sort-section {
    display: flex;
    justify-content: center;
    width: 100%;
    max-width: 600px;
}

:deep(.el-radio-group) {
    display: flex;
    gap: 10px;
}

:deep(.el-radio-button__inner) {
    border-radius: 20px;
    padding: 8px 20px;
    transition: all 0.3s ease;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background-color: var(--el-color-primary);
    border-color: var(--el-color-primary);
    box-shadow: -1px 0 0 0 var(--el-color-primary);
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

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 32px;
    padding: 32px 0 0 0;
}

.product-item {
    cursor: pointer;
    transition: transform 0.2s;
    &:hover {
        transform: translateY(-6px) scale(1.03);
    }
}

.box-card {
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.08);
    border: none;
    padding: 0;
    background: #fff;
    display: flex;
    flex-direction: column;
    min-height: 420px;
    &.selected {
        border: 2px solid var(--el-color-primary);
    }
}

.product-img {
    width: 100%;
    height: 180px;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-top-left-radius: 18px;
    border-top-right-radius: 18px;
}

.product-info {
    padding: 20px 18px 16px 18px;
    display: flex;
    flex-direction: column;
    flex: 1;
}

.product-title {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 8px;
    color: #222;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.product-intro {
    font-size: 15px;
    color: #666;
    margin-bottom: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.product-detail {
    font-size: 14px;
    color: #999;
    margin-bottom: 18px;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.product-meta {
    display: flex;
    gap: 18px;
    font-size: 14px;
    color: #888;
    margin-bottom: 10px;
}

.like-section {
    display: flex;
    justify-content: flex-end;
}

.like-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 18px;
    border-radius: 20px;
    background: #f8f8fa;
    border: 1px solid #e4e7ed;
    color: #666;
    font-size: 15px;
    transition: all 0.2s;
    &:hover {
        background: #fef6f6;
        color: #f56c6c;
        border-color: #fbc4c4;
    }
    &.is-liked {
        color: #f56c6c;
        background: #fef0f0;
        border-color: #fbc4c4;
    }
    .el-icon-like {
        font-size: 18px;
        &:before {
            content: '👍';
        }
        &.is-liked {
            animation: likeAnimation 0.3s ease;
        }
    }
    .like-count {
        font-size: 15px;
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

.recommendations-section {
    margin-top: 48px;
    padding: 32px 0 0 0;
    background: none;
    h3 {
        margin-bottom: 24px;
        color: #222;
        font-size: 22px;
        font-weight: 700;
    }
}

.recommendations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 24px;
}

.recommendation-card {
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
    border: none;
    background: #fff;
    display: flex;
    flex-direction: column;
    min-height: 260px;
    transition: all 0.2s;
    &:hover {
        transform: translateY(-4px) scale(1.02);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }
}

.recommendation-img {
    width: 100%;
    height: 120px;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-top-left-radius: 14px;
    border-top-right-radius: 14px;
}

.recommendation-info {
    padding: 16px 14px 12px 14px;
    display: flex;
    flex-direction: column;
    flex: 1;
}

.recommendation-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 6px;
    color: #222;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.recommendation-intro {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.recommendation-meta {
    display: flex;
    gap: 12px;
    font-size: 13px;
    color: #aaa;
    margin-bottom: 6px;
}

.recommendation-likes {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #f56c6c;
    font-size: 14px;
}

@media (max-width: 900px) {
    .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    }
    .recommendations-grid {
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    }
}
</style>
