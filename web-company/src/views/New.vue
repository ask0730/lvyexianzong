<template>
    <el-row>
        <el-col :span="17" :offset="1">
            <div>
                <h2>{{ currentNews.title }}</h2>

                <div class="time">
                    {{ formatTime(currentNews.editTime) }}
                    <el-button v-if="currentNews._id" type="primary" size="small" @click="toggleCollect">
                        <el-icon>
                            <Star />
                        </el-icon>
                        {{ isCollected ? '已收藏' : '收藏' }}
                    </el-button>
                    <el-button v-if="currentNews._id" :type="isLiked ? 'danger' : 'default'" size="small" @click="toggleLike">
                        <el-icon>
                            <Pointer />
                        </el-icon>
                        {{ isLiked ? '已点赞' : '点赞' }} ({{ likeCount }})
                    </el-button>
                </div>

                <el-divider>
                    <el-icon>
                        <star-filled />
                    </el-icon>
                </el-divider>

                <div v-html="currentNews.content"></div>

                <!-- 评论区 -->
                <el-divider>评论区</el-divider>

                <!-- 评论输入框 -->
                <div class="comment-input" v-if="currentNews._id">
                    <el-input v-model="commentContent" type="textarea" :rows="3" placeholder="请输入您的评论" />
                    <el-button type="primary" @click="submitComment" style="margin-top: 10px">发表评论</el-button>
                </div>

                <!-- 评论列表 -->
                <div class="comment-list">
                    <div v-for="comment in comments" :key="comment._id" class="comment-item">
                        <el-avatar :src="comment.userId.avatar ? 'http://localhost:3000' + comment.userId.avatar : ''" :size="40">{{ comment.userId.username?.charAt(0) }}</el-avatar>
                        <div class="comment-content">
                            <div class="comment-header">
                                <span class="username">{{ comment.userId.username }}</span>
                                <span class="time">{{ formatTime(comment.createdTime) }}</span>
                            </div>
                            <div class="comment-text">{{ comment.content }}</div>
                        </div>
                    </div>
                    <el-empty v-if="!comments.length" description="暂无评论" />
                </div>
            </div>
        </el-col>
        <el-col :span="4" :offset="1" :pull="1">
            <el-card class="box-card">
                <template #header>
                    <div class="card-header">
                        <span style="font-size: 16px; font-weight: bold">最近文章</span>
                    </div>
                </template>
                <div v-for="item in topNews" :key="item._id" class="text item" style="padding: 14px" @click="handleChange(item._id)">
                    <span>{{ item.title }}</span>
                    <div class="bottom">
                        <time class="time">{{ formatTime(item.editTime) }}</time>
                    </div>
                </div>
            </el-card>
        </el-col>
    </el-row>
</template>

  <script setup>
import { ref, watchEffect, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { StarFilled, Star, Pointer } from '@element-plus/icons-vue'
import { formatTime } from '@/utils'
import API from '@/api'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const currentNews = ref({})
const topNews = ref([])
const isCollected = ref(false)
const isLiked = ref(false)
const likeCount = ref(0)
const commentContent = ref('')
const comments = ref([])

const stop = watchEffect(async () => {
    if (!route.params.id) return

    const res1 = await API.news.list({
        _id: route.params.id,
    })

    if (res1.code == 0) {
        currentNews.value = res1.data[0]
        checkCollectionStatus()
        checkLikeStatus()
        getLikeCount()
        getComments()
        // 记录文章浏览
        try {
            await axios.post('/webapi/view-record', {
                articleId: currentNews.value._id,
            })
        } catch (error) {
            console.error('记录浏览量失败:', error)
        }
    }

    const res2 = await API.news.toplist({
        limit: 4,
    })

    if (res2.code == 0) {
        topNews.value = res2.data
    }
})

onBeforeUnmount(() => {
    stop()
})

const checkCollectionStatus = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
        const response = await axios.get('/webapi/news/collection-status', {
            params: { articleId: currentNews.value._id },
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })

        if (response.data.code === 0) {
            isCollected.value = response.data.data
        }
    } catch (error) {
        console.error('获取收藏状态失败:', error)
    }
}

const checkLikeStatus = async () => {
    try {
        const response = await axios.get(`/webapi/like/status/${currentNews.value._id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        })
        if (response.data && response.data.code === 0) {
            isLiked.value = response.data.data
        } else {
            const errorMessage = response.data?.message || '获取点赞状态失败，未返回具体错误信息'
            console.error('获取点赞状态失败，错误信息：', errorMessage)
            ElMessage.warning(errorMessage)
        }
    } catch (error) {
        const errorMessage = error.message || '获取点赞状态失败，网络错误'
        console.error('获取点赞状态失败:', errorMessage)
        ElMessage.warning(errorMessage)
    }
}

const getLikeCount = async () => {
    try {
        const response = await axios.get(`/webapi/like/count/${currentNews.value._id}`)
        if (response.data && response.data.code === 0 && response.data.data) {
            likeCount.value = response.data.data.count || 0
        } else {
            const errorMessage = response.data?.message || '获取点赞数失败，未返回具体错误信息'
            console.error('获取点赞数失败，错误信息：', errorMessage)
            ElMessage.warning(errorMessage)
        }
    } catch (error) {
        const errorMessage = error.message || '获取点赞数失败，网络错误'
        console.error('获取点赞数量失败:', errorMessage)
        ElMessage.warning(errorMessage)
    }
}

const toggleLike = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
        router.push('/login')
        return
    }

    try {
        const url = isLiked.value ? '/webapi/like/remove' : '/webapi/like/add'
        const response = await axios.post(
            url,
            { newsId: currentNews.value._id },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        )

        // 根据后端返回的 success 字段判断操作是否成功
        if (response.data.success) {
            isLiked.value = !isLiked.value
            // 点赞成功后，前端直接更新点赞数
            likeCount.value = isLiked.value ? likeCount.value + 1 : likeCount.value - 1
            await getLikeCount() // 再次获取后端最新点赞数，校正可能的误差
            ElMessage.success(isLiked.value ? '点赞成功' : '取消点赞成功')
        } else {
            const errorMessage = response.data.message || '操作失败，未返回具体错误信息'
            ElMessage.error(errorMessage)
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || '操作失败，未返回具体错误信息'
        console.error('点赞操作失败:', errorMessage)
        ElMessage.error(errorMessage)
    }
}

const toggleCollect = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
        router.push('/login')
        return
    }

    try {
        const url = isCollected.value ? '/webapi/news/uncollect' : '/webapi/news/collect'

        const response = await axios.post(
            url,
            { articleId: currentNews.value._id },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        )

        if (response.data.code === 0) {
            isCollected.value = !isCollected.value
            ElMessage.success(isCollected.value ? '收藏成功' : '取消收藏成功')
        } else {
            const errorMessage = response.data.message || '操作失败，未返回具体错误信息'
            ElMessage.error(errorMessage)
        }
    } catch (error) {
        const errorMessage = error.message || '操作失败，网络错误'
        console.error('收藏操作失败:', errorMessage)
        ElMessage.error(errorMessage)
    }
}

const handleChange = (id) => {
    router.push(`/news/${id}`)
}

// 获取评论列表
const getComments = async () => {
    try {
        const response = await axios.get(`/webapi/comment/${currentNews.value._id}`)
        if (response.data.code === 0) {
            comments.value = response.data.data
        }
    } catch (error) {
        console.error('获取评论列表失败:', error)
        ElMessage.error('获取评论列表失败')
    }
}

// 提交评论
const submitComment = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
        router.push('/login')
        return
    }

    if (!commentContent.value.trim()) {
        ElMessage.warning('请输入评论内容')
        return
    }

    try {
        const response = await axios.post(
            '/webapi/comment/add',
            {
                newsId: currentNews.value._id,
                content: commentContent.value.trim(),
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        )

        if (response.data.code === 0) {
            ElMessage.success('评论成功')
            commentContent.value = ''
            await getComments()
        } else {
            ElMessage.error(response.data.message || '评论失败')
        }
    } catch (error) {
        console.error('提交评论失败:', error)
        ElMessage.error('提交评论失败')
    }
}
</script>

  <style scoped lang="scss">
.el-row {
    margin-top: 30px;
}

.time {
    font-size: 13px;
    color: gray;
    display: flex;
    align-items: center;
}

.el-button {
    margin-left: 10px;
}

.comment-input {
    margin: 20px 0;
}

.comment-list {
    margin-top: 20px;
}

.comment-item {
    display: flex;
    margin-bottom: 20px;
    padding: 10px;
    border-bottom: 1px solid #eee;
}

.comment-content {
    margin-left: 15px;
    flex: 1;
}

.comment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;

    .username {
        font-weight: bold;
        color: #333;
    }

    .time {
        font-size: 12px;
        color: #999;
    }
}

.comment-text {
    color: #666;
    line-height: 1.5;
}
</style>